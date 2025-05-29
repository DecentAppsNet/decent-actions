import type { RequestOptions } from "node:https";

import { httpsRequestWithBodyFromFile, httpsRequestWithBodyFromText } from "./httpUtil.ts";
import { createStageIndex } from "./stageIndexUtil.ts";
import ExpectedError from "./ExpectedError.ts";

const API_HOSTNAME = 'partner.decentapps.net';

export async function putFile(repoOwner:string, partnerApiKey:string, appName:string, version:string, localRootPath:string, localFilepath:string) {
  const filePath = localFilepath.replace(localRootPath, '');
  const options:RequestOptions = {
    hostname: API_HOSTNAME,
    path: `/api/deployment/${appName}/${version}/${filePath}`,
    port: 443,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${partnerApiKey}`,
      'x-repo-owner': repoOwner,
      'Accept': 'application/json'
    }
  };
  const result = await httpsRequestWithBodyFromFile(options, localFilepath);
  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new ExpectedError(`Failed to upload file to partner service. Status code: ${result.statusCode}. Response: ${result.body}`);
  }
}

export async function putStageIndex(repoOwner:string, partnerApiKey:string, appName:string, stageVersion:string, 
    productionVersion:string, rollbackVersion:string, updateRoute:boolean) {
  const path = updateRoute 
    ? `/api/deployment/${appName}/index.html?updateRoute=true`
    : `/api/deployment/${appName}/index.html`;
  const options:RequestOptions = {
    hostname: API_HOSTNAME,
    path,
    port: 443,
    method: 'PUT',
    headers: {
      'Content-Type': 'text/html',
      'Authorization': `Bearer ${partnerApiKey}`,
      'x-repo-owner': repoOwner,
      'Accept': 'application/json'
    }
  };
  const stageIndexText = createStageIndex(appName, stageVersion, productionVersion, rollbackVersion);
  const result = await httpsRequestWithBodyFromText(options, stageIndexText);
  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`Failed to upload file to partner service. Status code: ${result.statusCode}. Response: ${result.body}`);
  }
}