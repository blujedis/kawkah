"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const path = require("path");
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
                dir: '<string>',
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
const kk = new _1.Kawkah(config);
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
    .listen('--help');
const x = {
    _: ['/some/dir', ['file1.json', 'file2.json']],
    __: [],
    '$0': 'temp',
    '$command': 'concat',
    force: true,
    f: true
};
const t = 'test';
//# sourceMappingURL=debug.js.map