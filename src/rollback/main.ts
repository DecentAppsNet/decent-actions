import { fatalError, finalSuccess, getGithubCommitHash, getInput, getProjectLocalPath, getRepoOwner, runningInGithubCI } from '../common/githubUtil.ts';
import { putStageIndex } from '../common/partnerServiceClient.ts';
import { findAppVersions } from '../common/stageIndexUtil.ts';

async function rollbackAction() {
  try {
    // Get all params. These throw if not set or are invalid.
    const repoOwner = getRepoOwner(); // Env var GITHUB_REPOSITORY_OWNER - repo owner that must match provisioning on the partner service.
    const apiKey = getInput('api-key', true); // Env var INPUT_API_KEY - partner API key that must match provisioning on the partner service.
    const appName = getInput('app-name', true); // Env var INPUT_APP_NAME - name of the app that must match provisioning on the partner service.

    // Update the stage index.
    let { stageVersion, productionVersion, rollbackVersion } = await findAppVersions(appName);
    if (!rollbackVersion || rollbackVersion === productionVersion) fatalError(`No rollback version available for app ${appName}.`);
    productionVersion = rollbackVersion;
    rollbackVersion = '';
    await putStageIndex(repoOwner, apiKey, appName, stageVersion, productionVersion, rollbackVersion, true);
    
    const productionUrl = `https://decentapps.net/${appName}/`;
    finalSuccess(`Successfully rolled back production URL "${productionUrl}" to v${productionVersion}. Staging remains at v${stageVersion}.`);
  } catch (error) {
    // For security reasons, don't show unexpected error details in Github CI output.
    const showErrorDetails = !runningInGithubCI() || error.name === 'ExpectedError';
    const errorMessage = showErrorDetails ? error.message : 'An unexpected error occurred.';
    fatalError(errorMessage);
  }
}

rollbackAction();