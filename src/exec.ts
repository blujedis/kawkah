
import { relative, dirname } from 'path';

// Based on Yargs.
// see: https://github.com/yargs/yargs/blob/master/yargs.js#L40

function getExec(cwd?: string) {

  cwd = cwd || process.cwd();

  let execPath =
    process.argv
      .slice(0, 2)
      .map((x, i) => {
        // ignore the node bin, specify this in your
        // bin file with #!/usr/bin/env node
        if (i === 0 && /\b(node|iojs)(\.exe)?$/.test(x)) return;
        const b = relative(cwd, x);
        return x.match(/^(\/|([a-zA-Z]:)?\\)/) && b.length < x.length ? b : x;
      })
      .join(' ').trim();

  if (process.env._ !== undefined && process.argv[1] === process.env._) {
    execPath = process.env._.replace(
      `${dirname(process.execPath)}/`, ''
    );
  }

  return execPath;

}

const name = getExec();

export {
  name,
  getExec as get
};

