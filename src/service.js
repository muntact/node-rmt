import fs from 'fs';
import path from 'path';
import $ from 'cheerio';
import got from 'got';
import request from 'request';

import { stringify } from 'querystring';

export const get = (url, cacheFile = 'false') => {

  const cachedFilePath = path.join(__dirname, `../data/cache/${cacheFile}`);
  const data = {};
  const headers = {
    'accept-encoding' : 'gzip,deflate',
  };

  if (cacheFile && fs.existsSync(cachedFilePath)) {
    console.log('reading file?');
    // cache the raw file...
    return Promise.resolve($(fs.readFileSync((cachedFilePath), 'utf8')));
  } else {
    console.log('no cachefile specified or it doesn\'t exist');
    return got(url, { type: 'GET', headers, timeout: 2000 })
      .then((response) => response.body)
      .then((body) => $(body));
  }
};

export const get2 = (url, filename, cacheFile = 'false') => {
  request(url).pipe(fs.createWriteStream(filename)).on('close', () => { console.log('done'); });
};

export const post = (url, original_body, callback) => {
  const headers = {
    'content-type' : 'application/x-www-form-urlencoded'
  };
  const body = stringify(original_body);
  got(url, { type: 'POST', headers, body })
    .then((response) => $(response.body))
    .then(callback);
};
