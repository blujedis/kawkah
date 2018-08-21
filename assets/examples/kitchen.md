# Kitchen Sink

[Back to Menu](../../README.md/#table-of-contents) | [Back to Examples](../examples.md)

Please note if you are not using **Typescript** you can ignore the typing imports.

```ts
import { Kawkah } from 'kawkah';
import { normalize } from 'path';
import { existsSync } from 'fs';

// OR
const { Kawkah } = require('kawkah');
const { normalize } = require('path');
const { existsSync } = require('fs');
```

Create the configuration

```ts
const config = {

  commands: {

    // Creates two argument options and
    // a boolean flag option with an alias of "f".
    copy: '<src> <dest> --force:f',

    // Breakout a command it to object.
    concat: {

      spread: true,

      options: {
        dir: '<string>', // creates arg of type string.
        files: {
          index: 1,
          variadic: true
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

kk.command('concat')
  .aliasFor('force', 'f')
  .requiredFor('files')
  .coerceFor('files', (val) => {
    return val.map(v => normalize(v));
  })
  .validateFor('files', (val) => {
    // Return a bool, custom error message or Error.
    return val.reduce((a, c) => {
      if (a)
        a = existsSync(c);
      return a;
    }, true);
  });

// Listen for args in this case we're
// statically passing an example.
let result =
  kk
    .header('My CLI Application')           // help header text.
    .footer('copyright My Company 2018')    // help footer text.
    .configCompletions()                    // enables tab completions.
    .catch()                                // shows help on fail.
    .listen('concat /some/dir file1.json file2.json -f');
```

Here would be the result:

```ts
result = {
  _: ['/some/dir', ['file1.json', 'file2.json']],
  __: [],
  '$0': 'temp',
  '$command': 'concat',
  force: true,
  f: true
};
```