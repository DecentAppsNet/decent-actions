import { readFile } from 'fs/promises';
import path from 'path';

export async function fetchLatestActionVersion(actionName:string):Promise<string> {
  const response = await fetch(`https://raw.githubusercontent.com/DecentAppsNet/${actionName}/refs/heads/main/version.txt`);
  if (!response.ok) throw new Error(`Failed to fetch action version: ${response.statusText}`);
  return (await response.text()).trim();
}

export async function fetchLocalActionVersion(): Promise<string> {
  try {
    const versionContent = await readFile(path.join(__dirname, 'version.txt'), 'utf8');
    return versionContent.trim();
  } catch (error) {
    throw new Error(`Failed to read local action version: ${(error as Error).message}`);
  }
}