// I don't need no stinking @actions/core import.

import { isValidCommitHash, shortCommitHash } from "./commitHashUtil.ts";
import ExpectedError from "./ExpectedError.ts";

export function error(message:string):void {
  console.error(`::error::${message}`);
}

export function warning(message:string):void {
  console.warn(`::warning::${message}`);
}

export function notice(message:string):void {
  console.log(`::notice::${message}`);
}

export function finalSuccess(message:string):void {
  notice(`\u2705 ${message}`);
}

export function info(message:string):void {
  console.log(message);
}

export function fatalError(message:string):never {
  error(message);
  process.exit(1);
}

export function startGroup(name:string):void {
  console.log(`::group::${name}`);
}

export function endGroup():void {
  console.log(`::endgroup::`);
}

export function getInput(name: string, required: boolean = false):string {
  const key = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`; // e.g. "api-key" -> "INPUT_API_KEY"
  const value = process.env[key];
  if (required && !value) fatalError(`Input ${name} is required.`);
  return value || '';
}

export function getGithubCommitHash():string {
  const commitSha = process.env.GITHUB_SHA;
  if (!commitSha) throw new ExpectedError('GITHUB_SHA environment variable is not set.')
  if (!isValidCommitHash(commitSha)) throw new ExpectedError('GITHUB_SHA environment variable is invalid.');
  return shortCommitHash(commitSha);
}

export function getRepoOwner():string {
  const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
  if (!repoOwner) throw new ExpectedError('GITHUB_REPOSITORY_OWNER environment variable is not set.');
  return repoOwner;
}

export function getProjectLocalPath():string {
  const localPath = process.env.GITHUB_WORKSPACE;
  if (!localPath) throw new ExpectedError('GITHUB_WORKSPACE environment variable is not set.');
  return localPath;
}

export function runningInGithubCI():boolean {
  return process.env.GITHUB_ACTIONS === 'true';
}