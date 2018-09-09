
import { KawkahCore } from './core';
import { existsSync, statSync, readFileSync } from 'fs';
import { Colurs } from 'colurs';
import { Lokales } from 'lokales';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import * as formatr from 'formatr';
import { configure as argsert, IArgsert } from 'argsert';

import { isError, isString, isFunction, toArray, isValue, flatten, decamelcase, isArray, split, isObject, isWindows, isNumber, } from 'chek';

import { isFlag, expandOptions, expandArgs, isArg, isArgDotNotation, isArgRequired, isFlagPrev, stripFlag, stripTokens, isArgVariadic, isArgVariadicRequired, isNegateFlag, isType, toType, isArgAny, isFlagAny, toCamelcase } from 'kawkah-parser';

import { KawkahStyleKeys, AnsiStyles, IKawkahMap, KawkahReduceCallback } from './interfaces';

import { nonenumerable } from './decorators';
import { DEFAULT_COMMAND_NAME, ALIAS_TOKEN, RESULT_NAME_KEY, DEFAULT_OPTION, SEGMENT_TOKEN } from './constants';

const ANSI_PATTERN = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
].join('|');

const ANSI_EXP = new RegExp(ANSI_PATTERN, 'g');
const colurs = new Colurs();

export class KawkahUtils {

  @nonenumerable
  private core: KawkahCore;

  @nonenumerable
  lokales: Lokales;

  @nonenumerable
  argsert: IArgsert;

  constructor(core: KawkahCore) {

    this.core = core;
    this.lokales = new Lokales({ locale: core.options.locale });

    // Set colorize enabled/disabled.
    colurs.enabled(core.options.colorize);

    this.argsert = argsert({

      templates: {
        unmet: this.__`Expected at least %s arguments but got %s.`,
        extra: this.__`Expected no more than %s arguments but got %s.`,
        mismatch: this.__`%s arg has type %s but only %s is allowed.`,
        unknown: this.__`Validator %s could not be found.`,
        or: this.__`or`
      },

      onError: (err: Error) => {
        this.core.error(err);
      }

    });

    const styles = this.options.styles;



    const logTransforms = {

      bracket: (v) => {
        return `[${v}]`;
      },

      parens: (v) => {
        return `(${v})`;
      },

      event: (v, k) => {
        const key = v;
        if (styles[key])
          v = colurs.applyAnsi(v, styles[key]);
        return v;
      },

      symbol: (v, k, o) => {
        if (!isObject(o) || !o.event)
          return v;
        if (styles[o.event])
          v = colurs.applyAnsi(v, styles[o.event]);
        return v;
      },

      // ministack: (v) => colurs.applyAnsi(`(${v})`, 'gray')

    };

    // Extend transforms with Kawkah styles.
    for (const s in styles) {
      logTransforms[s] = (v, k) => {
        return colurs.applyAnsi(v, styles[s]);
      };
    }

    formatr.setOption('transform', (v, k, o) => {
      if (logTransforms[k])
        return logTransforms[k](v, k, o);
      return v;
    });

    formatr.setOption('transforms', logTransforms);

  }

  // PRIVATE //

  private get options() {
    return this.core.options;
  }

  /**
   * Ensures that required args do not follow optional ones.
   *
   * @example .checkInvalidSequence('install <dir> [filename] <invalid>') >> true;
   *
   * @param tokens array of matching arg types.
   */
  private checkInvalidSequence(tokens: string[]) {
    if (!tokens || !tokens.length)
      return false;
    return !tokens
      .filter(v => isArg(v))
      .reduce((a, c) => {
        const isReq = !!~c.indexOf('<');
        if (!a.v) return a;
        a.v = !(a.p && a.c) && isReq ? false : true;
        a.c = a.v ? isReq : a.c;
        return a;
      }, { p: true, c: true, v: true }).v;
  }

  /**
   * Checks if tokens contain multiple command args.
   *
   * @example .checkMultipleCommand('command1 command2 [arg]');
   *
   * @param tokens the tokens expanded into an array.
   */
  private checkMultipleCommand(tokens: string[]) {
    return tokens.filter(t => !isArg(t) && !isFlag(t)).length > 1;
  }

  /**
   * Checks if required variadic arg was erroneously specified.
   *
   * @example .checkArgVariadicRequired('<tags...>);
   *
   * @param tokens the expanded tokens.
   */
  private checkArgVariadicRequired(tokens: string[]) {
    return tokens.filter(t => this.isArgVariadicRequired(t)).length > 0;
  }

  /**
   * Checks if has dot notation arg.
   *
   * @param tokens the tokens to be inspected.
   */
  private checkDotnotationArg(tokens: string[]) {
    return tokens.filter(v => isArgDotNotation(v)).length > 0;
  }

  /**
   * Validate tokens iterates checks ensuring the tokens are valid format and sequencing.
   *
   * @example
   * .isInvalidTokens('<required...>') >> false (no required variadic args)
   * .isInvalidTokens('<arg.a>') >> false (no arg dot notation)
   * .isInvalidTokens('[optional] <required>') >> false (required arg after optional)
   * .isInvalidTokens('blog [tags...] [authors...]) >> false dupe variadic args.
   * .isInvalidTokens('blog [tags...] [name]) >> variadic not last arg.
   *
   * @param tokens the string or array of tokens to validate.
   */
  validateTokens(tokens: string[], command?: string) {

    const checks = {
      'no-undefined-tokens': (v) => command === DEFAULT_COMMAND_NAME ? false : !v,
      'no-multiple-commands': this.checkMultipleCommand.bind(this),
      'no-optional-preceeding-required-args': this.checkInvalidSequence.bind(this),
      // 'no-required-variadic-args': this.checkArgVariadicRequired.bind(this),
      'no-dot-notation-args': this.checkDotnotationArg.bind(this)
    };

    const tokenStr = tokens.join(' ');

    for (const k in checks) {
      const failed = checks[k](tokens, command);
      if (failed)
        return this.__`${tokenStr || 'undefined'} failed: invalidated by ${k}.`;
    }

    return null;

  }

  // GETTERS //

  get __() {
    return this.lokales.__.bind(this.lokales);
  }

  get __n() {
    return this.lokales.__n.bind(this.lokales);
  }

  get assert() {
    return this.argsert.assert;
  }

  // MISC HELPERS //

  /**
   * Pluralizes a string.
   *
   * @param val the value to pluralize.
   * @param count the count to be inspected.
   */
  pluralize(val: string, count: number): string;

  /**
   * Pluralizes a string with custom pluralizer.
   *
   * @param val the value to pluralize.
   * @param pluralizer the string to use to pluralize.
   * @param count the count to be inspected.
   */
  pluralize(val: string, pluralizer: string, count: number): string;

  pluralize(val: string, pluralizer: number | string, count?: number) {

    // NOTE: this method is crude, suits purpose for here.

    if (isNumber(pluralizer)) {
      count = <number>pluralizer;
      pluralizer = undefined;
    }

    pluralizer = pluralizer || 's';
    count = count || 0;

    if (count <= 1)
      return val;

    return `${val}${pluralizer}`;

  }

  /**
   * Gets log symbols.
   */
  getSymbols() {

    const isSupported = process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color';

    const supported = {
      error: this.colorize('✖'),
      warning: this.colorize('⚠'),
      notify: this.colorize('ℹ', 'blue'),
      ok: this.colorize('✔'),
    };

    const fallback = {
      error: this.colorize('×'),
      warning: this.colorize('‼'),
      notify: this.colorize('i'),
      ok: this.colorize('√'),
    };

    return isSupported ? supported : fallback;

  }

  getStyle(key: KawkahStyleKeys): AnsiStyles[] {
    return this.options.styles[key] as AnsiStyles[];
  }

  /**
   * Colorize with ansi styles.
   *
   * @param val the value to apply styles to.
   * @param styles the ansi styles to be applied.
   */
  colorize(val: string, ...styles: AnsiStyles[]) {
    // hack some issue with colorize
    // and tests false need to fix.
    if (!this.options.colorize || !styles.length)
      return val;
    styles = flatten(styles);
    // Use try here colorizing can fail if parsed styles aren't valid.
    try {
      return colurs.applyAnsi(val, styles);
    }
    catch (_) {
      // display warning don't use log
      // or dispatch here could cause loop.
      console.warn(this.__`Colorize failed for ${val} using styles ${styles.join(', ')}`);
      return val;
    }
  }

  /**
   * Strips colurs from string.
   *
   * @param val the value to strip.
   */
  stripColors(val: string) {
    return colurs.strip(val);
  }

  /**
   * Loads/reads a yaml or json configuration file.
   *
   * @param path the path to the config file.
   * @param type forces a specific file type.
   */
  loadConfig(path: string, type?: 'json' | 'yaml') {

    // Ensure path extension, default to .json.
    if (!type) {
      path = !/\.(yml|yaml|json)$/.test(<string>path) ? path + '.json' : path;
      if (/\.json$/.test(<string>path)) type = 'json';
      if (/\.(yml|yaml)$/.test(<string>path)) type = 'yaml';
    }

    path = resolve(<string>path);

    try {

      // Read the file.
      const data: any = readFileSync(resolve(<string>path), 'utf8');

      // Parse JSON.
      if (type === 'json')
        return JSON.parse(data);

      // Parse YAML.
      return yaml.safeLoad(data);

    }
    catch (ex) {

      this.core.warning(ex.message);

      return undefined;

    }

  }

  /**
   * Simple method to copy properties to new object (no deep).
   * For ex: an Error object where stack/message aren't cloned.
   *
   * @example .copy({ name: 'Joe', email: 'joe@mail.com' }, 'name');
   *
   * @param obj an object which you want to copy properties of.
   * @param filter an array of keys to filter if any.
   */
  copy(obj: any, ...filter: string[]) {
    return Object.getOwnPropertyNames(obj || {}).reduce((a, c) => {
      if (!~filter.indexOf(c))
        a[c] = obj[c];
      return a;
    }, {});
  }

  /**
   * Generates a date then formats.
   *
   * @see https://gist.github.com/cstipkovic/3983879
   *
   * @param format the format for the date.
   * @param utc when true UTC is used.
   */
  datetime(format: string, utc?: boolean): string;

  /**
  * Formats specified date with optional UTC.
  *
  * @see https://gist.github.com/cstipkovic/3983879
  *
  * @param date a string to convert or Date.
  * @param format a string to format the date with.
  * @param utc whether to use utc.
  */
  datetime(date: Date, format?: string, utc?: boolean): string;

  datetime(date: string | Date, format?: string | boolean, utc?: boolean) {

    if (isString(date)) {
      utc = <boolean>format;
      format = <string>date;
      date = undefined;
    }

    date = (date || new Date()) as Date;

    let day = utc ? date.getUTCDate() : date.getDate(),
      month = (utc ? date.getUTCMonth() : date.getMonth()) + 1,
      year = utc ? date.getUTCFullYear() : date.getFullYear(),
      hours = utc ? date.getUTCHours() : date.getHours(),
      minutes = utc ? date.getUTCMinutes() : date.getMinutes(),
      seconds = utc ? date.getUTCSeconds() : date.getSeconds();

    if (!format)
      format = 'MM/dd/yyyy';

    format = (format as string).replace('MM', month.toString().replace(/^(\d)$/, '0$1'));

    if (format.indexOf('yyyy') > -1) {
      format = format.replace('yyyy', year.toString());
    } else if (format.indexOf('yy') > -1) {
      format = format.replace('yy', year.toString().substr(2, 2));
    }

    format = format.replace('dd', day.toString().replace(/^(\d)$/, '0$1'));

    if (format.indexOf('t') > -1) {
      if (hours > 11)
        format = format.replace('t', 'pm');
      else
        format = format.replace('t', 'am');

    }

    if (format.indexOf('HH') > -1)
      format = format.replace('HH', hours.toString().replace(/^(\d)$/, '0$1'));


    if (format.indexOf('hh') > -1) {

      if (hours > 12)
        hours -= 12;


      if (hours === 0)
        hours = 12;

      format = format.replace('hh', hours.toString().replace(/^(\d)$/, '0$1'));

    }

    if (format.indexOf('mm') > -1)
      format = format.replace('mm', minutes.toString().replace(/^(\d)$/, '0$1'));


    if (format.indexOf('ss') > -1)
      format = format.replace('ss', seconds.toString().replace(/^(\d)$/, '0$1'));


    return format;

  }

  /**
   * Formats message with string format tokens, objects or templates strings.
   *
   * @param message the string or object to be formatted.
   * @param args arguments used for format strings or templates.
   */
  formatMessage(message: any, ...args: any[]) {
    if (isError(message))
      return message;
    message = formatr.format(message, ...args);
    // Ensure $0 in usage strings are replaced.
    message = message.replace('$0', this.core.$0);
    return message;
  }

  // ARRAYS & MAPS //

  /**
   * Extends target array with source values if not already exists.
   *
   * @param target the target array.
   * @param source the source array.
   * @param filter optional array of filters.
   * @param fn optional function called to normalize values.
   */
  arrayExtend(target: any, source: any, filter?: any[] | KawkahReduceCallback, fn?: KawkahReduceCallback) {
    if (!target) return [];
    target = toArray(target);
    source = toArray(source);
    if (isFunction(filter)) {
      fn = <KawkahReduceCallback>filter;
      filter = undefined;
    }
    let _filter = <any[]>filter || [];
    if (!target.length)
      return source.filter(f => !~_filter.indexOf(f));
    return source.reduce((a, c, i, arr) => {
      if (fn)
        c = fn(c, a, i, arr);
      if (~_filter.indexOf(c))
        return a;
      if (!~a.indexOf(c))
        a = [...a, c];
      return a;
    }, target);
  }

  /**
   * Removes items from an array in a nested object.
   *
   * @param map an object to remove/purge from.
   * @param key the key of the array to purge items from.
   * @param items a list of keys to be removed.
   */
  arrayPurge(map: IKawkahMap<any>, key: string, ...items: string[]) {

    if (!isObject(map) || !items.length)
      return [];

    const modified = [];

    for (const k in map) {

      const o = map[k];

      if (!o[key] || !isArray(o[key]))
        continue;

      const matches = this.arrayMatch(o[key], items);

      if (!matches.length)
        continue;

      map[k][key] = o[key].filter(k => !~matches.indexOf(k));

      modified.push(k + '.' + key);

    }

    return modified;

  }

  /**
   * Compares two arrays returning matches.
   *
   * @param source the source array to find matches from.
   * @param compare the array to compare for matches.
   */
  arrayMatch(source, compare) {
    const ret = [];
    for (const item of source) {
      if (compare.indexOf(item) > -1)
        ret.push(item);
    }
    return ret;
  }

  /**
   * Inspects two arrays finding elements that are missing
   * that are matches and those excluded from source.
   *
   * @param source the source array.
   * @param compare the array to compare.
   */
  arrayCompare(source, compare) {
    const matched = [];
    const missing = compare.reduce((a, c) => {
      if (!~source.indexOf(c))
        return a.concat(c);
      else
        matched.push(c);
      return a;
    }, []);
    const excluded = source.filter(v => !~matched.indexOf(v));
    return {
      missing,
      matched,
      excluded
    };
  }

  /**
   * Array equals compares two arrays for matches then ensures same length.
   *
   * @param values the array containing matchable values.
   * @param compare the comparator array containing actual values.
   */
  arrayEquals(values: string[], compare: string[]) {
    return this.arrayMatch(values, compare).length = compare.length;
  }

  /**
   * Inspects array removing duplicates.
   *
   * @param arr an array to inspect.
   */
  arrayUnique(arr: any) {
    arr = toArray(arr);
    return arr.filter((item, i, ar) => {
      return ar.indexOf(item) === i;
    });
  }

  // TYPES & CONVERSION //

  /**
   * Checks if value is a given type.
   *
   * @param type the type key for inspecting.
   * @param val the value to inspect.
   * @param loose whether to inspect strict or check floats, integers etc.
   */
  isType(type: string, val: any) {
    return isType[type](val);
  }

  /**
   * Casts value to type.
   *
   * @param type the type key to get.
   * @param val the value to be cast to type.
   */
  toType(type: any, val: any) {
    try {
      if (isFunction(type))
        return type(val, this.core);
      if (val === null)
        return null;
      if (!type || this.isType(type, val))
        return val;
      return toType[type](val, this.core);
    }
    catch (ex) {
      // don't error just return orig. value and warn.
      this.core.warning(ex.message);
      return val;
    }
  }

  /**
   * Ensures a function has a callback.
   *
   * @param fn the function to normalize.
   */
  toNodeCallback(fn: Function) {
    if (fn.length > 1)
      return fn;
    return function (data, done) {
      const val = fn(data);
      if (isError(val))
        done(val);
      else
        done(null, val);
    };
  }

  /**
  * Converts to arg token.
  *
  * @param val the value to convert to arg token.
  * @param required when true wraps arg as required token.
  */
  toArg(val: string, required?: boolean, variadic?: number | boolean) {
    if (required)
      return `<${val}>`;
    if (variadic)
      return `[${val}${this.options.charVariadic}]`;
    return `[${val}]`;
  }

  /**
   * Converts a string to a flag token.
   *
   * @param val the value to convert to flag token.
   */
  toFlag(val: string) {
    const negChar = this.options.charNegate;
    const neg = this.isNegateFlag(val);
    val = decamelcase(this.stripFlag(val));
    if (neg)
      return `--${negChar}${val}`;
    if (val.length > 1)
      return `--${val}`;
    return `-${val}`;
  }

  /**
   * Camelize string, ignore dot notation strings when strict.
   *
   * @param val the value to camelize
   * @param strict when true dot notation values ignored.
   */
  toCamelcase(val: string, strict: boolean = true) {
    return toCamelcase(val, strict);
  }

  // TOKENS & PARSING //

  /**
   * Strips all tokens from string.
   *
   * @param val the value to strip.
   */
  stripTokens(val: any) {
    return stripTokens(val, this.options.charNegate, this.options.charVariadic);
  }

  /**
   * Removes flag tokens from value.
   *
   * @param val the value to strip.
   */
  stripFlag(val: any) {
    return stripFlag(val, this.options.charNegate);
  }

  /**
   * Checks if a path is executable.
   *
   * @param path the path to be inspected.
   */
  isExecutable(path: string) {

    if (!existsSync(path))
      return false;

    try {

      const stats = statSync(path);

      if (isWindows()) { // just return if is file, not ideal.
        return stats && stats.isFile();
      }

      else {

        const hasGroup = stats.gid
          ? process.getgid && stats.gid === process.getgid()
          : true;
        const hasUser = stats.uid
          ? process.getuid && stats.uid === process.getuid()
          : true;

        return Boolean(
          (stats.mode & parseInt('0001', 8)) ||
          ((stats.mode & parseInt('0010', 8)) && hasGroup) ||
          ((stats.mode & parseInt('0100', 8)) && hasUser)
        );

      }

    }
    catch (ex) {
      return false;
    }
  }

  /**
   * Checks if token is an arg and has variadic tokens ([arg...]).
   *
   * @param val the value to inspect.
   */
  isArgVariadic(val: any) {
    return isArgVariadic(val, this.options.charVariadic);
  }

  /**
   * Checks if token is an arg and has required variadic tokens (<arg...>).
   *
   * @param val the value to inspect.
   */
  isArgVariadicRequired(val: any) {
    return isArgVariadicRequired(val, this.options.charVariadic);
  }

  /**
   * Checks if flag is negated (--no-flag).
   *
   * @param val the value to inspect.
   */
  isNegateFlag(val: any) {
    return isNegateFlag(val, this.options.charNegate);
  }

  /**
   * Strips ansi characters.
   *
   * @param str the value to be stripped.
   */
  stripAnsi(str: any) {
    if (!isString(str))
      return str;
    return str.replace(ANSI_EXP, '');
  }

  /**
   * Takes and array and inspects if flag is boolean or has a value.
   *
   * @param arr the array of values to inspect.
   * @param index the index of the flag to inspect.
   */
  flagHasValue(arr: string[], index: number) {
    return isFlag(arr[index]) && arr[index + 1];
  }

  expandArgs(tokens: string | string[]) {
    return expandArgs(tokens);
  }

  /**
   * Normalize array expands args to an array and spreads single flag options.
   *
   * @example .normalizeTokens('<arg> -abc') >> ['<arg>', '-a', '-b', '-c']
   *
   * @param tokens the token string to be normalized.
   * @param filter an array of items to filter out.
   */
  expandTokens(tokens: string | string[], ...filter: any[]) {
    filter = ['', ...(filter || [])];
    if (isArray(tokens))
      return (tokens as string[]).filter(t => !~filter.indexOf(t));
    return expandOptions(
      expandArgs((tokens as string).trim()
        .replace(/('|")/g, '')))
      .filter(t => !~filter.indexOf(t));
  }

  /**
   * Splits usage string or tokens array separating the
   * prefix from the actual usage string.
   *
   * @param tokens the tokens containing usage.
   */
  splitUsage(tokens: string) {

    let prefix = undefined;
    let usage;

    if (!~tokens.indexOf(RESULT_NAME_KEY))
      return { prefix, usage: tokens };

    const tmp = (tokens as string).split(RESULT_NAME_KEY);
    usage = (tmp[0] || '').trim();
    if (tmp.length && tmp.length > 1) {
      prefix = tmp[0].trim();
      usage = tmp[1].trim();
    }

    return { prefix, usage };

  }

  /**
   * Checks if a string contains tokens used in commands or options.
   *
   * @example .hasTokens('--flag:f [value]') >> true
   *
   * @param val the value to inspect.
   */
  hasTokens(val: string) {
    return isArgAny(val) || isFlagAny(val);
  }

  /**
   * Strips tokens and ensures camelcase.
   *
   * @param name the name to be normalized.
   */
  parseName(name: string) {
    if (!name) return name;
    name = this.stripTokens(name);
    if (!this.options.allowCamelcase)
      return name;
    return this.toCamelcase(name);
  }

  /**
   * Parses arg into options arguments.
   *
   * @param arg the argument to be parsed.
   * @param key the argument's key.
   */
  parseArg(arg: string, key?: string) {

    if (!arg) return {};

    const _isRequired = isArgRequired(arg);
    const _isVariadic = this.isArgVariadic(arg);
    const _types = isType;

    arg = this.stripTokens(arg.trim());

    const parts = arg.split(SEGMENT_TOKEN).map(v => v.trim());
    let name: any = parts.shift();

    // Check if name is actually the type.
    if (key && name !== key && _types[name])
      parts.unshift(name);

    // Aliases not needed for args disregard get first element as name.
    const aliases = split(name, ALIAS_TOKEN);
    name = aliases.shift();

    const type = _types[parts[0]] ? parts[0] : undefined;

    // If not type maintain the order
    // arg after first pipe is the default.
    if (!type)
      parts.unshift('string');

    let def: any = parts[1];

    if (def === 'null')
      def = null;

    if (def === 'undefined')
      def = undefined;

    if (type === 'array' && def)
      def = split(def, [',']);

    if (type && isValue(def))
      def = this.toType(type, def);

    return {
      name: name,
      token: _isRequired ? `<${name}>` : _isVariadic ? `[${name}...]` : `[${name}]`,
      type: type,
      default: parts[1],
      describe: parts[2],
      alias: undefined,
      variadic: _isVariadic,
      required: _isRequired
    };

  }

  /**
   * Parses an option into a configuration object.
   *
   * @param opt the option to be parsed.
   */
  parseFlag(opt: string) {
    opt = this.stripFlag(opt);
    const parts = opt.split(' ');
    const aliases = parts.shift().split(ALIAS_TOKEN);
    const val = parts.shift();
    let name = aliases.shift();
    if (this.options.allowCamelcase)
      name = this.toCamelcase(name);
    return {
      name: name,
      type: undefined,
      default: undefined,
      describe: undefined,
      token: undefined,
      alias: aliases,
      variadic: false,
      required: false,
      value: (val && this.parseArg(val)) || undefined
    };
  }

  /**
  * Parses all tokens in string or array expanding into
  * configurable options objects.
  *
  * @param tokens the token string or array to be parsed.
  * @param command the token command name.
  */
  parseTokens(tokens: string | string[], command?: string | boolean) {

    const obj = {
      _name: undefined,
      _aliases: [],
      _args: [],
      _targs: [],
      _error: null,
      _keys: []
    };

    if (command && isString(command))
      obj._name = command;

    const origTokens = tokens;

    // Check if tokens are usage string.
    const isUsage = !!~tokens.indexOf(RESULT_NAME_KEY);

    // Break out tokens to an array.
    tokens = this.expandTokens(<string>tokens, RESULT_NAME_KEY);

    // Validate the tokens.
    obj._error = this.validateTokens(tokens, (isString(<string>command) && <string>command) || '');

    if (!tokens.length || obj._error)
      return obj;

    // Is command if matches passed command name
    // or default command or not an arg or flag.
    let isCmd = command && ((tokens[0] === command) || (tokens[0] === DEFAULT_COMMAND_NAME) || (!isArg(tokens[0]) && !isFlag(tokens[0])));

    if (isCmd) {

      // We'll set the name below.
      if (command === true) command = undefined;

      // Breakout into aliases.
      obj._aliases = tokens.shift().split(ALIAS_TOKEN);

      if (!isArg(obj._aliases[0]) && !isFlag(obj._aliases[0])) {

        // Command in usage is same as passed command,
        // or is default command, remove it.
        if ((command !== DEFAULT_COMMAND_NAME && obj._aliases[0] === command) || (obj._aliases[0] === DEFAULT_COMMAND_NAME))
          obj._aliases.shift();

        else if (!command)
          obj._name = obj._aliases.shift();

      }

    }

    // If parsing usage but no command
    // name here return invalid.
    if (!obj._name && isUsage) {
      obj._error = this.__`${origTokens} failed: invalidated by invalid-command'`;
      return obj;
    }

    let ctr = 0;
    let i = 0;

    for (let t of tokens) {

      let _isArg = isArg(t);
      const _isFlag = isFlag(t);
      const _isFlagPrev = isFlagPrev(tokens, i);

      // arg passed without tokenization
      // default to [optional] arg.
      if (!_isArg && !_isFlag) {
        _isArg = true;
        t = `[${t}]`;
      }

      ctr = _isArg && i !== 0 ? ctr + 1 : ctr;

      if (_isArg && _isFlagPrev) {
        i++;
        continue;
      }

      const _flagValue = this.flagHasValue(tokens, i);
      let parsed = !_isFlag ? this.parseArg(t) : this.parseFlag(t);

      if (!parsed.name) {
        i++;
        continue;
      }

      obj[parsed.name] = obj[parsed.name] || {};

      let c = obj[parsed.name];
      c.name = parsed.name;
      obj._keys.push(parsed.name);

      if (_isArg) {
        c.type = parsed.type || 'string';
        c.index = ctr;
        c.default = parsed.default;
        c.describe = parsed.describe;
        c.variadic = parsed.variadic;
        c.required = parsed.required;
        obj._args.push(parsed.name);
        obj._targs.push(parsed.token);
      }

      else {

        c.type = 'boolean';
        c.alias = parsed.alias;
        c.required = false; // flags can't be required use min options.

        if (_flagValue) {

          const parsedVal = this.parseArg(_flagValue, parsed.name);
          c.type = parsedVal.type || c.type;

          // flag with value can't be boolean.
          c.type = parsedVal.type || 'string';

          // flags can't be required.
          c.required = false;

          c.default = parsedVal.default;
          c.describe = parsedVal.describe;

        }

      }

      c = Object.assign({}, DEFAULT_OPTION, c);

      i++;

    }

    return obj;

  }

}