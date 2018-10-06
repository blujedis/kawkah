
import { parse } from 'path';
import { KawkahEvent } from './interfaces';
import { KawkahCore } from './core';
import { toArray } from 'chek';

export class KawkahError extends Error {

  // Default props.
  name: string;
  message: string;
  stack: string;

  // Custom props.
  event: string;
  type: string; // just alias to name.
  stacktrace: string;
  ministack: string;
  filename: string;
  line: number;
  column: number;
  timestamp: string;
  symbol: string;

  constructor(message: string, core: KawkahCore);

  constructor(message: string, purge: number, core: KawkahCore);

  constructor(message: string, name: string | KawkahEvent, core: KawkahCore);

  constructor(message: string, name: string | KawkahEvent, purge: number, core: KawkahCore);

  constructor(message: string, name: string | KawkahEvent, purge: number, trim: number, core: KawkahCore);

  constructor(message: string, name?: string | KawkahEvent | KawkahCore | number, purge?: number | KawkahCore, trim?: number | KawkahCore, core?: KawkahCore) {

    super(message);

    if (typeof name === 'object') {
      core = <KawkahCore>name;
      name = undefined;
    }

    if (typeof name === 'number') {
      core = <KawkahCore>trim;
      trim = purge;
      purge = <number>name;
      name = undefined;
    }

    if (typeof purge === 'object') {
      core = <KawkahCore>purge;
      purge = undefined;
    }

    if (typeof trim === 'object') {
      core = <KawkahCore>trim;
      trim = undefined;
    }

    this.name = <string>name || this.name || 'Error';
    this.type = this.name;

    // If not known event type set to error.
    const eventNames = Object.keys(KawkahEvent);
    if (!~eventNames.indexOf(<string>name))
      name = 'Error';

    this.event = (<string>name).toLowerCase();
    this.symbol = core.symbols[this.event] || core.symbols.notify;
    this.timestamp = core.utils.datetime('MM-dd-yyyy hh:mm:ss');

    this.generateStacktrace(this.stack, <number>purge, <number>trim);

  }

  /**
   * Generates custom stacktrace and ministack.
   *
   * @param stack the current error stack
   * @param purge whether to purge the stack.
   * @param trim whether to trim the stack.
   */
  generateStacktrace(stack: string, purge?: number, trim?: number) {

    purge = purge || 0;
    const exp = /\(\S+\)/;

    // Update the stack may be merging custom stack.
    this.stack = stack;


    // Check if message contains line returns.
    const msgLines = this.message.match(/\n/g);

    let start = undefined;

    // Split stack to array.
    let stacktrace = stack.split('\n');

    stacktrace.forEach((s, i) => {
      if (/^\s+at/.test(s) && typeof start === 'undefined')
        start = i - 1;
    });

    start = start || 0;

    let row;

    if (start !== 0 && /\.js/.test(stacktrace[0]))
      row = stacktrace[0];

    stacktrace = stacktrace.slice(start);

    let message;

    // let message;
    if (!msgLines) {
      message = stacktrace.shift();
    }
    else {
      message = stacktrace.slice(0, msgLines.length + 1).join('\n');
      stacktrace = stacktrace.slice(msgLines.length + 1);
    }

    // Purge rows from top of stack.
    if (purge > 0)
      stacktrace = stacktrace.slice((<number>purge));

    if (!row) {
      let match = stacktrace[0].match(exp);
      row = match[0];
    }

    row = row.replace(/\(|\)/g, '').split(':');

    this.filename = parse(row[0]).base;
    this.line = parseInt(row[1]);
    this.column = parseInt(row[2] || 0);

    // Ministack trace with offending file, line and column.
    this.ministack = `${this.filename}:${this.line}:${this.column}`;

    stacktrace.unshift(message);

    if (trim)
      stacktrace = stacktrace.slice(0, <number>trim);

    this.stacktrace = stacktrace.join('\n');

  }

}