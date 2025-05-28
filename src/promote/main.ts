import { fetchLatestActionVersion, fetchLocalActionVersion } from '../common/actionVersionUtil.ts';
import { endGroup, fatalError, finalSuccess, getInput, getRepoOwner, info, runningInGithubCI, startGroup, warning } from '../common/githubUtil.ts';
import { putStageIndex } from '../common/partnerServiceClient.ts';
import { findAppVersions } from '../common/stageIndexUtil.ts';

async function promoteAction() {
  try {
    startGroup('Checking action version');
      info(`fetch local action version`);
      const localActionVersion = await fetchLocalActionVersion();
      info('fetch latest action version');
      const latestActionVersion = await fetchLatestActionVersion('promote');
      if (localActionVersion !== latestActionVersion) {
        warning(`Local action version ${localActionVersion} does not match latest action version ${latestActionVersion}. Consider updating your action.`);
      } else {
        info(`Local action version ${localActionVersion} matches latest action version.`);
      }
    endGroup();

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
      if (!stageVersion) fatalError(`No stage version found for app ${appName}. Please deploy first.`);
      rollbackVersion = productionVersion;
      productionVersion = stageVersion;
      info(`uploading new stage index - stage version=${stageVersion}, production version=${productionVersion}, rollback version=${rollbackVersion}`);
      await putStageIndex(repoOwner, apiKey, appName, stageVersion, productionVersion, rollbackVersion, true);
    endGroup();
    
    const productionUrl = `https://decentapps.net/${appName}/`;
    const rollbackDescription = rollbackVersion !== '' && rollbackVersion !== productionVersion ? `Rollback available to ${rollbackVersion} version.` : 'No rollback available.';
    finalSuccess(`Successfully pointed production URL "${productionUrl}" to ${stageVersion} version. ${rollbackDescription}`);
  } catch (error) {
    // For security reasons, don't show unexpected error details in Github CI output.
    const showErrorDetails = true; // !runningInGithubCI() || error.name === 'ExpectedError'; TODO put it back
    const errorMessage = showErrorDetails ? error.message : 'An unexpected error occurred.';
    fatalError(errorMessage);
  }
}

promoteAction();