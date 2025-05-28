import { fetchLatestActionVersion, fetchLocalActionVersion } from '../common/actionVersionUtil.ts';
import { endGroup, fatalError, finalSuccess, getInput, getRepoOwner, info, runningInGithubCI, startGroup, warning } from '../common/githubUtil.ts';
import { putStageIndex } from '../common/partnerServiceClient.ts';
import { findAppVersions } from '../common/stageIndexUtil.ts';

async function rollbackAction() {
  try {
    startGroup('Checking action version');
      info(`fetch local action version`);
      const localActionVersion = await fetchLocalActionVersion();
      info('fetch latest action version');
      const latestActionVersion = await fetchLatestActionVersion('rollback');
      if (localActionVersion !== latestActionVersion) {
        warning(`Local action version ${localActionVersion} does not match latest action version ${latestActionVersion}. Consider updating your action.`);
      } else {
        info(`Local action version ${localActionVersion} matches latest action version.`);
      }
    endGroup();

    // Get all params. These throw if not set or are invalid.
    startGroup('Collecting inputs');
      // These throw if not set or are invalid.
      info('repo owner');
      const repoOwner = getRepoOwner(); // Env var GITHUB_REPOSITORY_OWNER - repo owner that must match provisioning on the partner service.
      info('Decent API key');
      const apiKey = getInput('api-key', true); // Env var INPUT_API_KEY - partner API key that must match provisioning on the partner service.
      info('app name');
      const appName = getInput('app-name', true); // Env var INPUT_APP_NAME - name of the app that must match provisioning on the partner service.
    endGroup();

    // Update the stage index.
    startGroup('Updating stage index');
      info('fetch app versions');
      let { stageVersion, productionVersion, rollbackVersion } = await findAppVersions(appName);
      if (!rollbackVersion || rollbackVersion === productionVersion) fatalError(`No rollback version available for app ${appName}.`);
      productionVersion = rollbackVersion;
      rollbackVersion = '';
      info(`uploading new stage index - stage version=${stageVersion}, production version=${productionVersion}, rollback version=${rollbackVersion}`);
      await putStageIndex(repoOwner, apiKey, appName, stageVersion, productionVersion, rollbackVersion, true);
    endGroup();
    
    const productionUrl = `https://decentapps.net/${appName}/`;
    finalSuccess(`Successfully rolled back production URL "${productionUrl}" to ${productionVersion} version. Staging remains at ${stageVersion} version.`);
  } catch (error) {
    // For security reasons, don't show unexpected error details in Github CI output.
    const showErrorDetails = !runningInGithubCI() || error.name === 'ExpectedError';
    const errorMessage = showErrorDetails ? error.message : 'An unexpected error occurred.';
    fatalError(errorMessage);
  }
}

rollbackAction();