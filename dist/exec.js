"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
// Based on Yargs.
// see: https://github.com/yargs/yargs/blob/master/yargs.js#L40
function getExec(cwd) {
    cwd = cwd || process.cwd();
    let execPath = process.argv
        .slice(0, 2)
        .map((x, i) => {
        // ignore the node bin, specify this in your
        // bin file with #!/usr/bin/env node
        if (i === 0 && /\b(node|iojs)(\.exe)?$/.test(x))
            return;
        const b = path_1.relative(cwd, x);
        return x.match(/^(\/|([a-zA-Z]:)?\\)/) && b.length < x.length ? b : x;
    })
        .join(' ').trim();
    if (process.env._ !== undefined && process.argv[1] === process.env._) {
        execPath = process.env._.replace(`${path_1.dirname(process.execPath)}/`, '');
    }
    return execPath;
}
exports.get = getExec;
const name = getExec();
exports.name = name;
//# sourceMappingURL=exec.js.map