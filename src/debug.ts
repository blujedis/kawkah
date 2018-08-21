import { Kawkah, KawkahHelpScheme } from '.';
import * as path from 'path';
import * as fs from 'fs';

const config = {

  commands: {

    // Creates two argument options and
    // a boolean flag option with an alias of "f".
    copy: '<src> <dest> --force:f',

    // Breakout a command it to object.
    concat: {

      describe: 'Concats files in directory',
      spread: true,

      options: {
        dir: '<string>', // creates arg of type string.
        files: {
          index: 1,
          variadic: 1
        },

        force: 'boolean' // creates a bool flag basically --force.

      },

      // Spread injects args in order before result.
      action: (dir, files, result) => {
        // do something check if result.force etc.
      }

    }

  }

};

const kk = new Kawkah(config);

kk.command('copy')
  .describe('Copies a file to destination');

kk.command('concat')
  .aliasFor('force', 'f')
  .requiredFor('files')
  .example('test', '$0 some example')
  .coerceFor('files', (val) => {
    return val.map(v => path.normalize(v));
  })
  .validateFor('files', (val) => {
    // Return a bool, custom error message or Error.
    return true;
    // return val.reduce((a, c) => {
    //   if (a)
    //     a = fs.existsSync(c);
    //   return a;
    // }, true);
  });


// kk.listen('concat /some/dir file1.json file2.json -f', true);
kk
  .example('test', '$0 /some/path --force')
  .listen();

const x = {
  _: ['/some/dir', ['file1.json', 'file2.json']],
  __: [],
  '$0': 'temp',
  '$command': 'concat',
  force: true,
  f: true
};

const t = 'test';

// kk.command('copy', 'Copies a file.')
//   .flag('status', 'My status');

// kk
//   .arg('arg', 'My argument')
//   .alias('def')
//   // .arg('other')
//   .flag('toppings', {
//     type: 'array',
//     validate: /(cheese|mushroom|ham)/,
//     describe: 'Toppings for pizza',
//     alias: 't'
//   })
//   .flag('deep-dish', 'Do you want deep dish')
//   .listen();
