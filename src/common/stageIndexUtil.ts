import { warning } from "./githubUtil.ts";
import { DECENT_TOOLS_VERSION, VERSION } from "./toolVersionUtil.ts";

export type AppVersions = {
  productionVersion:string;
  rollbackVersion:string;
  stageVersion:string;
};

function _parseStageIndexFormat(htmlText:string):string|null {
  const versionPrefix = `<!-- v`;
  const versionPrefixStartPos = htmlText.indexOf(versionPrefix);
  if (versionPrefixStartPos === -1) return null;
  const versionStartPos = versionPrefixStartPos + versionPrefix.length;
  const versionEndPos = htmlText.indexOf(' ', versionStartPos);
  if (versionEndPos === -1) return null;
  return htmlText.substring(versionStartPos, versionEndPos);
}

function _parseVariableValue(html:string, variableName:string):string|null {
  const variablePrefix = ` ${variableName}='`;
  const variablePrefixStartPos = html.indexOf(variablePrefix);
  if (variablePrefixStartPos === -1) return null;
  const valueStartPos = variablePrefixStartPos + variablePrefix.length;
  const valueEndPos = html.indexOf(`'`, valueStartPos);
  if (valueEndPos === -1) return null;
  return html.substring(valueStartPos, valueEndPos);
}

function _findSupportedStageIndexFormat(htmlText:string):string {
  const version = _parseStageIndexFormat(htmlText);
  if (!version) throw Error(`Failed to parse stage index format version.`);
  if (version !== VERSION) throw Error(`Unsupported stage index format version ${version}.`);
  return version;
}

function _createEmptyVarsObject():AppVersions {
  return { productionVersion:'', rollbackVersion:'', stageVersion:'' };
}

export function createStageIndex(appName:string, stageVersion:string, productionVersion:string, rollbackVersion:string):string {
  const stageIndexUrl = `/_${appName}/${stageVersion}/`;
  return `` +
    `<!DOCTYPE html><html><head><title>Stage Index for ${appName}</title><script>\n` +
    `<!-- ${DECENT_TOOLS_VERSION}. Hand-edit at your own risk! -->\n` +
    `const productionVersion='${productionVersion}';\n` +
    `const rollbackVersion='${rollbackVersion}';\n` +
    `const stageVersion='${stageVersion}';\n` +
    `window.location.href='${stageIndexUrl}';\n` +
    `</script></head><body></body></html>`;
}

export async function findAppVersions(appName:string):Promise<AppVersions> {
  const url = `https://decentapps.net/_${appName}/index.html`;
  const response = await fetch(url);
  if (!response.ok) return _createEmptyVarsObject(); // Expected that sometimes a stage index has not been written yet.
  const htmlText = await response.text();
  try {
    _findSupportedStageIndexFormat(htmlText); // If you need to support more than one version, check return value here.
  } catch(error) {
    warning(`Could not retrieve app versions from existing stage index at ${url}: ${error.message}.`);
    return _createEmptyVarsObject();
  }
  const productionVersion = _parseVariableValue(htmlText, 'productionVersion') ?? '';
  const rollbackVersion = _parseVariableValue(htmlText, 'rollbackVersion') ?? '';
  const stageVersion = _parseVariableValue(htmlText, 'stageVersion') ?? '';
  return { stageVersion, productionVersion, rollbackVersion };
}