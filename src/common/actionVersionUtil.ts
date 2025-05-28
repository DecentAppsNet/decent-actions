import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const actionScriptUrl = fileURLToPath(import.meta.url);
const actionPath = path.dirname(actionScriptUrl);

export async function fetchLatestActionVersion(actionName:string):Promise<string> {
  const response = await fetch(`https://raw.githubusercontent.com/DecentAppsNet/${actionName}/refs/heads/main/version.txt`);
  if (!response.ok) throw new Error(`Failed to fetch action version: ${response.statusText}`);
  return (await response.text()).trim();
}

export async function fetchLocalActionVersion():Promise<string> {
  try {
    const localFilepath = path.join(actionPath, 'version.txt');
    console.log(`Reading local action version from ${localFilepath}`); // TODO delete
    const versionContent = await readFile(localFilepath, 'utf8');
    return versionContent.trim();
  } catch (error) {
    throw new Error(`Failed to read local action version: ${(error as Error).message}`);
  }
}