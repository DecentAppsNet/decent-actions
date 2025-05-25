import * as https from 'node:https';
import type { RequestOptions } from 'node:https';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

import ExpectedError from './ExpectedError.ts';

type RequestResult = { statusCode: number; body: string;};

export async function httpsRequestWithBodyFromFile(options:RequestOptions, filePath:string):Promise<RequestResult> {
  const fileStats = await stat(filePath);
  return new Promise<RequestResult>((resolve, reject) => {
    // Write HTTP request headers, wait for the request body to be piped, and close the connection.
    if (!options.headers) options.headers = {};
    options.headers['Content-Length'] = fileStats.size;
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', async () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: responseData });
        } else {
          reject(new ExpectedError(`Request to ${options.hostname} failed with status code: ${res.statusCode}. Response: ${responseData}`));
        }
      });
    });
    req.on('error', (err) => reject(err));

    // Pipe the file stream to the request, writing it after HTTP headers are sent.
    const inputReadStream = createReadStream(filePath);
    inputReadStream.pipe(req);
    inputReadStream.on('end', () => req.end());
    inputReadStream.on('error', (err) => { req.destroy(); reject(err); });
  }).catch((err) => { throw err; });
}

export async function httpsRequestWithBodyFromText(options:RequestOptions, text:string):Promise<RequestResult> {
  return new Promise<RequestResult>((resolve, reject) => {
    // Write HTTP request headers, wait for the request body to be written, and close the connection.
    if (!options.headers) options.headers = {};
    options.headers['Content-Length'] = Buffer.byteLength(text);
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', async () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: responseData });
        } else {
          reject(new ExpectedError(`Request to ${options.hostname} failed with status code: ${res.statusCode}. Response: ${responseData}`));
        }
      });
    });
    req.on('error', (err) => reject(err));

    // Write text to body of request.
    req.write(text);
    req.end();
  }).catch((err) => { throw err; });
}