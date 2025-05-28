import path from 'path';
import { executeTasksWithMaxConcurrency } from '../common/concurrentUtil.ts';
import { endGroup, fatalError, finalSuccess, getGithubCommitHash, getInput, getProjectLocalPath, getRepoOwner, info, runningInGithubCI, startGroup, warning } from '../common/githubUtil.ts';
import { doesDirectoryExist, findFilesAtPath, writeAppVersionFile } from '../common/localFileUtil.ts';
import { putFile, putStageIndex } from '../common/partnerServiceClient.ts';
import { findAppVersions } from '../common/stageIndexUtil.ts';

async function deployAction() {
  try {
    startGroup('Collecting inputs')
      // These throw if not set or are invalid.
      info('commit hash');
      const stageVersion = getGithubCommitHash(); // Env var GITHUB_SHA - can be a 7-character or 40-character alphanumeric. For testing purposes, "9999999" is good.
      info('repo owner');
      const repoOwner = getRepoOwner(); // Env var GITHUB_REPOSITORY_OWNER - repo owner that must match provisioning on the partner service.
      info('Decent API key');
      const apiKey = getInput('api-key', true); // Env var INPUT_API_KEY - partner API key that must match provisioning on the partner service.
      info('app name');
      const appName = getInput('app-name', true); // Env var INPUT_APP_NAME - name of the app that must match provisioning on the partner service.
      info('project local path');
      const projectLocalPath = getProjectLocalPath();
    endGroup();

    // Write version.txt file to the local dist path. This file will be uploaded with other files and can be used to verify the deployment.
    startGroup('Preparing local dist path and version file');
      info('check for dist directory');  
      const localDistPath = path.join(projectLocalPath, 'dist');
      if (!await doesDirectoryExist(localDistPath)) fatalError(`Local dist directory missing. Your Github workflow (e.g., .github/workflows/deploy.yml) should check out your project and build/copy to the ./dist folder all files meant for deployment.`);
      info('write version file');
      await writeAppVersionFile(stageVersion, localDistPath);
    endGroup();
    
    // Create a set of task functions to upload files concurrently.
    startGroup('Preparing files for upload');
      async function _uploadOneFileTask(localFilepathI:number):Promise<void> {
        const localFilepath = localFilepaths[localFilepathI];
        if (localFilepath === '') return; // Skip if already uploaded (marked as empty string).
        try {
          info(`upload ${localFilepath}`);
          await putFile(repoOwner, apiKey, appName, stageVersion, localDistPath, localFilepath);
          localFilepaths[localFilepathI] = ''; // Mark as uploaded by setting to empty string.
          ++uploadCount;
        } catch (error) { // Failing to upload is treated as non-fatal.
          console.warn(`Failed to upload file ${localFilepath}: ${error.message}.`);
        }
      }
      info('find files at local dist path');
      const localFilepaths = await findFilesAtPath(localDistPath);
      if (localFilepaths.length === 1) warning('No files found in ./dist directory besides version.txt. Is your project building to ./dist?');
      info('prepare upload tasks');
      const uploadTasks = localFilepaths.map((_, index) => () => _uploadOneFileTask(index));
    endGroup();

    // Upload files concurrently with retries on failure.
    startGroup(`Uploading ${uploadTasks.length} files`);
      let uploadCount = 0;
      const MAX_FAIL_COUNT = 3;
      const MAX_CONCURRENT_UPLOADS = 10; // Seems generous enough. We can tweak it if we get rate-limited.
      for (let failCount = 0; failCount < MAX_FAIL_COUNT; ++failCount) {
        if (failCount > 0) console.warn(`Retrying after failed uploads... (${failCount + 1}/${MAX_FAIL_COUNT})`);
        try {
          await executeTasksWithMaxConcurrency(uploadTasks, MAX_CONCURRENT_UPLOADS);
          if (uploadCount === localFilepaths.length) break; // If all files were uploaded successfully, exit the loop.
        } catch (error) {
          error(`Unexpected error while uploading files: ${error.message}.`); // The task function should have caught exception.
        }
      }
      if (uploadCount < localFilepaths.length) {
        if (uploadCount === 0) fatalError('Failed to upload any files. See previous warnings for details.');
        fatalError(`Failed to upload all files. Only ${uploadCount} of ${localFilepaths.length} files were uploaded successfully. See previous warnings for details.`);
      }
    endGroup();

    // Update the stage index.
    startGroup('Updating stage index');
      info('fetch app versions');
      const { productionVersion, rollbackVersion } = await findAppVersions(appName);
      info(`uploading new stage index - stage version=${stageVersion}, production version=${productionVersion}, rollback version=${rollbackVersion}`);
      await putStageIndex(repoOwner, apiKey, appName, stageVersion, productionVersion, rollbackVersion, false);
    endGroup();
    
    const stageUrl = `https://decentapps.net/_${appName}/${stageVersion}/`;
    finalSuccess(`Successfully deployed ${uploadCount} files to ${stageUrl}.`);
  } catch (error) {
    // For security reasons, don't show unexpected error details in Github CI output.
    const showErrorDetails = !runningInGithubCI() || error.name === 'ExpectedError';
    const errorMessage = showErrorDetails ? error.message : 'An unexpected error occurred.';
    fatalError(errorMessage);
  }
}

deployAction();