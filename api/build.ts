/**
 * Remove old files, copy front-end ones.
 */

import * as fs from 'fs-extra';
import Logger from 'jet-logger';
import * as childProcess from 'child_process';

// Setup logger
const logger = new Logger();
logger.timestamp = false;


(async () => {
  try {
    // Remove current build
    await remove('./dist/');
    await exec('tsc --build tsconfig.prod.json', './');
  } catch (err) {
    logger.err(err);
  }
})();


function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, (err) => {
      return (!!err ? rej(err) : res());
    });
  });
}

function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, {cwd: loc}, (err, stdout, stderr) => {
      if (!!stdout) {
        logger.info(stdout);
      }
      if (!!stderr) {
        logger.warn(stderr);
      }
      return (!!err ? rej(err) : res());
    });
  });
}
