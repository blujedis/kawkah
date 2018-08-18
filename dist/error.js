"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const interfaces_1 = require("./interfaces");
class KawkahError extends Error {
    constructor(message, name, purge, trim, core) {
        super(message);
        if (typeof name === 'object') {
            core = name;
            name = undefined;
        }
        if (typeof name === 'number') {
            core = trim;
            trim = purge;
            purge = name;
            name = undefined;
        }
        if (typeof purge === 'object') {
            core = purge;
            purge = undefined;
        }
        if (typeof trim === 'object') {
            core = trim;
            trim = undefined;
        }
        this.name = name || this.name || 'Error';
        this.type = this.name;
        // If not known event type set to error.
        const eventNames = Object.keys(interfaces_1.KawkahEvent);
        if (!~eventNames.indexOf(name))
            name = 'Error';
        this.event = name.toLowerCase();
        this.symbol = core.symbols[this.event] || core.symbols.notify;
        this.timestamp = core.utils.datetime('MM-dd-yyyy hh:mm:ss');
        this.generateStacktrace(this.stack, purge, trim);
    }
    /**
     * Generates custom stacktrace and ministack.
     *
     * @param stack the current error stack
     * @param purge whether to purge the stack.
     * @param trim whether to trim the stack.
     */
    generateStacktrace(stack, purge, trim) {
        purge = purge || 0;
        const exp = /\(\S+\)/;
        // Update the stack may be merging custom stack.
        this.stack = stack;
        // Split stack to array.
        let stacktrace = stack.split('\n');
        const message = stacktrace.shift();
        // Purge rows from top of stack.
        if (purge > 0)
            stacktrace = stacktrace.slice(purge);
        const m = stacktrace[0].match(exp);
        let row = stacktrace[0].match(exp)[0];
        row = row.replace(/\(|\)/g, '').split(':');
        this.filename = path_1.parse(row[0]).base;
        this.line = parseInt(row[1]);
        this.column = parseInt(row[2]);
        // Ministack trace with offending file, line and column.
        this.ministack = `${this.filename}:${this.line}:${this.column}`;
        stacktrace.unshift(message);
        if (trim)
            stacktrace = stacktrace.slice(0, trim);
        this.stacktrace = stacktrace.join('\n');
    }
}
exports.KawkahError = KawkahError;
//# sourceMappingURL=error.js.map