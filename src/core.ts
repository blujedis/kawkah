import { EventEmitter } from 'events';
import * as readPkg from 'read-pkg-up';
import { readFileSync, lstatSync, readlinkSync } from 'fs';
import { join, basename } from 'path';
import { Tablur, TablurAlign, ITablurColumn } from 'tablur';
import * as spawn from 'cross-spawn';
import { ChildProcess, SpawnOptions } from 'child_process';

import { isString, toArray, isValue, isObject, isArray, toDefault, isBoolean, getType, isFunction, isPlainObject, last, isEmpty, keys, first, capitalize, get, isDebug, includes, isTruthy, isWindows, omit, pick, isUndefined, set, isError, noop } from 'chek';
import { parse, expandArgs, isFlag, IKawhakParserOptions, SUPPORTED_TYPES, hasOwn } from 'kawkah-parser';
import { nonenumerable } from './decorators';
import * as exec from './exec';
import { KawkahMiddleware, defaultMiddleware, KawkahMiddlewareGroup } from './middleware';
import { KawkahUtils } from './utils';

import { IKawkahOptions, IKawkahMap, IKawkahOptionsInternal, IKawkahCommand, IKawkahOption, IKawkahCommandInternal, KawkahEvent, KawkahHandler, KawkahHelpHandler, KawkahCompletionsHandler, KawkahAction, IKawkahResult, IKawkahGroup, IKawkahOptionInternal, IKawkahCompletionQuery, KawkahHelpScheme, KawkahCommandInternalKeys, KawkahOptionInternalKeys, KawkahLogHandler, KawkahResultAction, KawkahGroupKeys, IKawkahTheme, AnsiStyles, KawkahAnsiType, KawkahThemeKeys, KawkahThemeSytleKeys, IKawkahMiddlewareEventOption, KawkahOptionType, KawkahValidateHandler } from './interfaces';

import { DEFAULT_COMMAND_NAME, DEFAULT_OPTIONS, DEFAULT_GROUP, RESULT_NAME_KEY, MESSAGE_FORMAT_EXP, DEFAULT_THEMES, DEFAULT_THEME, RESULT_ARGS_KEY, RESULT_COMMAND_KEY, RESULT_ABORT_KEY, DEFAULT_PARSER_OPTIONS, DEFAULT_COMMAND } from './constants';
import { KawkahError } from './error';

// Ensure clean, not cached.
delete require.cache[__filename];

export class KawkahCore extends EventEmitter {

  // PRIVATE //

  @nonenumerable
  private _logHandler: KawkahLogHandler;

  @nonenumerable
  private _helpHandler: KawkahHelpHandler;

  @nonenumerable
  private _completionsHandler: KawkahCompletionsHandler;

  @nonenumerable
  private _catchHandler: KawkahAction;

  @nonenumerable
  private _completionsName: string = 'completions';

  @nonenumerable
  private _traceName: string;

  @nonenumerable
  private _aborting: boolean;

  // TABLE //

  @nonenumerable
  private _header: [string, TablurAlign];

  @nonenumerable
  private _footer: [string, TablurAlign];

  @nonenumerable
  private _events: { names: string[], max: number };

  // PUBLIC //

  $0: string;
  commands: IKawkahMap<IKawkahCommandInternal> = {};
  middleware: KawkahMiddleware;
  aliases: IKawkahMap<string> = {};
  examples: IKawkahMap<string> = {};
  groups: IKawkahMap<IKawkahGroup> = {};
  package: { pkg: IKawkahMap<any>, path: string };
  result: IKawkahResult;
  options: IKawkahOptionsInternal;
  symbols = {
    error: null,
    warning: null,
    notify: null,
    ok: null
  };

  @nonenumerable
  utils: KawkahUtils;

  @nonenumerable
  table: Tablur;

  constructor(options?: IKawkahOptions) {

    super();

    // Get all options keys.
    const optionKeys = keys(DEFAULT_OPTIONS).concat(keys(DEFAULT_PARSER_OPTIONS));

    // Get all command option keys.
    const commandOptionKeys = keys(DEFAULT_COMMAND);

    // Merge in all defaults.
    options = Object.assign({}, DEFAULT_OPTIONS, DEFAULT_PARSER_OPTIONS, DEFAULT_COMMAND, options);

    // This is easier than bunch of clones.
    options.options = options.options || {};
    options.commands = options.commands || {};
    options.examples = options.examples || {};

    // Enable stacktraces when debugging.
    if (isDebug() && !isValue(options.stacktrace))
      options.stacktrace = true;

    let commandOptions: IKawkahCommand = {},
      kawkahOptions: IKawkahOptionsInternal = {};

    kawkahOptions = pick(options, optionKeys);
    commandOptions = pick(options, commandOptionKeys);

    // Merge default command options with commands key.
    kawkahOptions.commands[DEFAULT_COMMAND_NAME] =
      Object.assign({}, commandOptions, kawkahOptions.commands[DEFAULT_COMMAND_NAME]);

    // Save the options.
    this.options = kawkahOptions;

    // Generate utils instance.
    this.utils = new KawkahUtils(this);

    // Load supported symbols.
    this.symbols = this.utils.getSymbols();

    // Store array of event keys.
    const eventNames = Object.keys(KawkahEvent);
    this._events = {
      names: eventNames.map(v => v.toLowerCase()),
      max: 0
    };
    this._events.max = this._events.names.reduce((a, c) => c.length > a ? c.length : a, 0);

    // Ensure colors are normalized to arrays.
    this.options.styles = this.normalizeStyles(this.options.styles);

    // Enable error and log handlers.
    this.setLogHandler();
    // this._errorHandler = this.handleError.bind(this);

    // wire up the parser error handler hook.
    this.options.onParserError = (err: Error, template: string, args: any[]) => {
      template = this.utils.__(template); // localize.
      const message = this.utils.formatMessage(template, ...args);
      err.message = message;
      this.error(err);
    };

    // Get the app name or use executed script.
    this.$0 = this.options.name || exec.name;

    // Read package.json.
    this.package = readPkg.sync();

    // Ensure parser.
    this.options.parser = this.options.parser || parse;

    // Iterate commands and add to collection.
    for (const k in this.options.commands) {
      const command = this.setCommand(k, <any>this.options.commands[k]);
      this.commands[command.name] = command;
    }

    // Parse examples add to help groups by scheme.
    for (const k in this.options.examples) {
      this.setExample(k, this.options.examples[k], false);
    }

    // Create Middleware instance.
    this.middleware = new KawkahMiddleware(this);

    // Iterate each group check if enabled.
    for (const k in defaultMiddleware) {
      const g = defaultMiddleware[k];
      for (const n in g) {
        const m = g[n];
        if (~this.options.middleware.indexOf(n))
          this.middleware.add(n, m);
      }
    }

    // Always enable commands group.
    this.setGroup(KawkahGroupKeys.Commands, {
      title: KawkahGroupKeys.Commands + ':',
      items: []
    });

    // Add commands and examples to groups.
    this.groupifyCommands();
    this.groupifyExamples();

    // Set the theme if any.
    this.setTheme(this.options.theme);

    // Enable default help.
    this.setHelp();

    // Enable version.k
    this.setVersion();

  }

  private get assert() {
    return this.utils.argsert.assert;
  }

  // INTERNAL HANDLERS //

  /**
   * Default log handler.
   *
   * @param type the type of message to log.
   * @param message the message to be logged.
   * @param args args used for formatting.
   */
  private handleLog(type: any, message: any, err?: Error) {

    // Normalize key for emitter.
    const knownType = !!~this._events.names.indexOf(type);

    let formatted;
    let padding = '';

    // Error was directly passed ensure is KawkahError.
    if (isError(message)) {
      err = <any>message;
      type = 'error';
      if (!(err instanceof KawkahError)) {
        const tmpErr = new KawkahError(err.message, err.name, 1, this);
        tmpErr.generateStacktrace(err.stack);
        err = tmpErr;
      }
      message = err.message;
    }

    // Use custom formatting for known types
    // ignore catch and help which should just
    // be output.
    if (isString(message) && knownType && !includes(['help', 'catch'], type)) {

      formatted = this.utils.formatMessage(this.options.logFormat, err);

      const eventIdx =
        this.options.logFormat.match(MESSAGE_FORMAT_EXP)
          .reduce((a, c, i) => {
            if (~c.indexOf('event'))
              return i;
            return a;
          }, -1);

      if (~eventIdx)
        padding = ' '.repeat(this._events.max - type.length);

    }

    if (err && this.options.stacktrace) {
      formatted = (err as KawkahError).stacktrace ? (err as KawkahError).stacktrace : err.stack;
    }

    // Ensure string.
    formatted = formatted || message || '';

    // Write the log message.
    this.write(padding + formatted);

    // Emit by both general log and by type.
    this.emit(`log`, message, err);

    // Might not have a log type.
    if (type)
      this.emit(`log:${type}`, message, err);

    // For errors call exit.
    if (type === 'error')
      this.exit(1);

  }

  /**
  * Dispatches an error.
  *
  * @param err an error to be dispatched.
  */
  private dispatch(err: Error | KawkahError);

  /**
   * Dispatches a notify event using formatted message.
   *
   * @param message a message to be dispatch.
   * @param args array of args for formatting the message.
   */
  private dispatch(message: string, ...args: any[]);

  /**
  * Dispatches an event using formatted message.
  *
  * @param event the event type to dispatch.
  * @param message the message or error to be dispatched.
  * @param args an array of arguments to use in formatting.
  */
  private dispatch(event: KawkahEvent, message: string, ...args: any[]);

  private dispatch(event: string | Error | KawkahError | KawkahEvent, message?: string | KawkahError | Error, ...args: any[]) {

    // Always ensure the error handler.
    if (!this._logHandler) this.setLogHandler();

    // Allow message as first arg.
    if (isString(event) && !KawkahEvent[<string>event]) {
      if (isValue(message))
        args.unshift(message);
      message = <string>event;
      event = KawkahEvent.Notify;
    }

    // Allow error as first arg.
    if (isError(event)) {
      message = event;
      event = KawkahEvent.Error;
    }

    let err: any = this.utils.formatMessage(<any>message, ...args);

    if (isString(err)) {
      err = new KawkahError(err, <any>event, 1, this);
    }

    // If not a KawkahError convert it.
    if (!(err instanceof KawkahError)) {
      const tmpErr = new KawkahError(err.message, err.name, 1, this);
      tmpErr.generateStacktrace(err.stack);
      err = tmpErr;
    }

    const type = (<string>event).toLowerCase();
    this.log(type, err.message, err);

  }

  /**
   * Handles displaying help.
   *
   * @param groups groups to display help for.
   */
  private handleHelp(groups?: string[]) {
    let help: any = this.getHelp(groups) || [];
    if (help.length)
      help = ['', ...help, ''];
    help = help.join('\n');
    this.log(KawkahEvent.Help, help);
    this.exit(0);
  }

  // HELPERS //

  /**
   * Normalizes object of AnsiStyles.
   *
   * @param styles an object map of styles.
   */
  protected normalizeStyles(styles: IKawkahMap<KawkahAnsiType>): IKawkahMap<AnsiStyles[]>;

  /**
   * Normalizes to an AnsiStyles.
   *
   * @param style the style to normalize.
   */
  protected normalizeStyles(style: KawkahAnsiType): AnsiStyles[];

  protected normalizeStyles(styles: KawkahAnsiType | IKawkahMap<KawkahAnsiType>) {

    const toAnsiStyle = (val: any) => {
      if (isString(val)) {
        if (this.options.styles[val])
          return this.options.styles[val];
        return val.split('.');
      }
      return toArray(val);
    };

    if (isPlainObject(styles)) {
      for (const k in styles as IKawkahMap<KawkahAnsiType>) {
        styles[k] = toAnsiStyle(styles[k]);
      }
      return styles;
    }

    return toAnsiStyle(styles);

  }

  /**
   * Adds examples to Examples help group.
   *
   * @param examples the collection of examples to be added to help.
   */
  protected groupifyExamples(examples?: string | IKawkahMap<string>) {

    examples = examples || this.examples;
    if (this.options.scheme === KawkahHelpScheme.None || isEmpty(examples))
      return;

    let exampleKeys: any = isString(examples) ? [examples] : keys
      (<IKawkahMap<string>>examples);

    if (exampleKeys.length) {
      const groupKey = this.utils.__(KawkahGroupKeys.Examples);
      this.setGroup(groupKey, {
        title: groupKey + ':',
        items: exampleKeys
      });
    }

  }

  /**
   * Adds options to help groups by scheme set in options.
   *
   * @param options the options object to add to help groups.
   */
  protected groupifyOptions(options: IKawkahMap<IKawkahOption>) {

    if (this.options.scheme !== KawkahHelpScheme.Default)
      return;

    const optKeys = keys(options);
    const flags = optKeys.filter(o => options[o].help && !isValue((options[o]).index));
    const args = optKeys.filter(o => options[o].help && isValue((options[o]).index));

    if (flags.length) {
      const groupKey = this.utils.__(KawkahGroupKeys.Flags);
      this.setGroup(groupKey, {
        title: groupKey + ':',
        items: flags,
        sort: true
      });
    }

    if (args.length) {
      const groupKey = this.utils.__(KawkahGroupKeys.Arguments);
      this.setGroup(groupKey, {
        title: groupKey + ':',
        items: args,
        sort: true
      });
    }

  }

  /**
   * Adds command and options to help groups by scheme.
   *
   * @param command the command to be parsed/added to groups.
   */
  protected groupifyCommand(command: IKawkahCommandInternal) {

    // user will define help groups manually.
    if (this.options.scheme === KawkahHelpScheme.None || !command.help)
      return;

    // If default command and there are no aliases or args
    // no need to list in Commands group.
    if (command.name === DEFAULT_COMMAND_NAME) {
      const optionTypes = this.commandToOptionTypes(command);
      if (!optionTypes.argKeys.length && !command.alias.length)
        return;
    }

    // Add command to Commands group also add options to default groups.
    if (this.options.scheme === KawkahHelpScheme.Default) {
      const groupKey = this.utils.__(KawkahGroupKeys.Commands);
      this.setGroup(groupKey, {
        title: groupKey + ':',
        items: [command.name],
        sort: true
      });
      this.groupifyOptions(command.options);
    }

    let name = command.name === DEFAULT_COMMAND_NAME ? command.alias[0] || 'Default' : command.name;

    // Help is grouped by commands.
    this.setGroup(command.name, {
      title: capitalize(name + ':'),
      isCommand: true,
      sort: true
    });

  }

  /**
   * Adds collection of commands and options to help groups by scheme.
   *
   * @param commands the commands to iterate and add to help groups.
   */
  protected groupifyCommands(commands?: IKawkahMap<IKawkahCommandInternal>) {

    commands = commands || this.commands;

    // More clear this way but is an extra loop
    // maybe revisit this in the future.

    for (const name in commands) {
      const command = commands[name];
      if (!command.help) continue; // skip.
      this.groupifyCommand(command);
    }

  }

  /**
   * Gets actionable options for a command.
   * Currently only supports default command.
   *
   * @param command the command name or command.
   */
  protected actionKeys(command?: string | IKawkahCommand) {

    command = command || DEFAULT_COMMAND_NAME;

    if (isString(command))
      command = this.getCommand(<string>command);

    const cmd = <IKawkahCommandInternal>command;

    return keys(cmd.options).reduce((a, c) => {
      const opt = cmd.options[c];
      if (!opt.action)
        return a;
      return [...a, c, ...cmd.options[c].alias];
    }, []);

  }

  /**
   * Breaks out options into args verses stand options/flags.
   *
   * @param command the command or command name.
   */
  protected commandToOptionTypes(command: string | IKawkahCommandInternal) {

    const cmd = isString(command) ? this.getCommand(<string>command) : command as IKawkahCommandInternal;

    if (!cmd) {
      this.warning(this.utils.__`${this.utils.__`Command`} ${command} could not be found`);
      return;
    }

    const argKeys = [];
    const optKeys = [];
    const args = {};
    const opts = {};

    for (const k in cmd.options) {
      const opt = cmd.options[k];
      if (isValue(opt.index)) {
        argKeys.push(k);
        args[k] = opt;
      }
      else {
        optKeys.push(k);
        opts[k] = opt;
      }
    }

    return {
      keys: argKeys.concat(optKeys),
      argKeys: argKeys,
      optionKeys: optKeys,
      args: args,
      options: opts
    };

  }

  /**
   * Verifies the option and it's properties are valid.
   *
   * @param option the option to verify as valid.
   * @param command the option's command.
   */
  protected verifyOption(option: IKawkahOptionInternal, command: IKawkahCommandInternal) {

    let name = toDefault(option.name, 'undefined');
    const optType = isValue(option.index) ? this.utils.__`Argument` : this.utils.__`Flag`;

    if (option.type === 'boolean') {

      if (option.required) {
        this.error(this.utils.__`${optType} ${name} cannot set type boolean with property required`);
        return;
      }

    }

    if (option.variadic) {

      if (option.extend) {
        this.error(this.utils.__`${optType} ${name} cannot set as variadic with property extend`);
        return;
      }

      if (option.required) {
        this.error(this.utils.__`${optType} ${name} cannot set as variadic with property required`);
        return;
      }


    }

    if (isValue(option.default) && !this.utils.isType(option.type, option.default)) {

      const castVal = this.utils.toType(option.type, option.default);
      const validType = this.utils.isType(option.type, option.default);
      if (!validType) {
        this.error(this.utils.__`${optType} ${name} is type ${option.type} but has default of ${option.default} (${getType(option.default)})`);
      }

    }


  }

  /**
   * Normalizes option when option is passed as a
   * string name or type.
   *
   * @param option a string or option object.
   */
  protected toOptionNormalize(option: string | IKawkahOptionInternal): IKawkahOptionInternal {

    if (!isString(option))
      return (option || {}) as IKawkahOptionInternal;

    if (~SUPPORTED_TYPES.indexOf(<string>option)) {
      option = {
        type: <string>option
      } as IKawkahOptionInternal;
    }

    else {
      option = {
        name: <string>option
      };
    }

    return option;

  }

  /**
   * Normalize option ensuring correct values and defaults.
   *
   * @param option the option or name of new option to normalize.
   * @param command the command the option belongs to.
   */
  protected toOption(option: string | IKawkahOptionInternal, command?: IKawkahCommandInternal) {

    option = this.toOptionNormalize(option);

    option.name = toDefault(option.name, '');
    option.type = toDefault(option.type, 'string');
    option.describe = toDefault(option.describe, '');

    // Ensure bools have a default value of false.
    const defVal = option.type === 'boolean' ? false : null;
    option.default = toDefault(option.default, defVal);

    // Ensure arrays.
    option.alias = toArray(option.alias).map(this.utils.stripFlag, this);
    option.demand = toArray(option.demand).map(this.utils.stripTokens, this);
    option.deny = toArray(option.deny).map(this.utils.stripTokens, this);
    option.completions = toArray(option.completions);
    option.required = toDefault(option.required, false);
    option.skip = toDefault(option.skip, false);
    option.help = toDefault(option.help, true);

    // If extend is string ensure array.
    if (option.extend && !isObject(option.extend))
      option.extend = toArray(option.extend);

    return option;

  }

  /**
   * Normalizes command ensuring correct values and defaults.
   *
   * @param command the command to normalize.
   */
  protected toCommand(command: string | IKawkahCommandInternal) {

    if (!command || isString(command)) {
      command = {
        name: <string>command
      };
    }

    command = command as IKawkahCommandInternal;

    const usage = command.name !== DEFAULT_COMMAND_NAME
      ? `${RESULT_NAME_KEY} ` + command.name
      : `${RESULT_NAME_KEY}`;
    command.usage = toDefault(command.usage, usage);
    command.options = command.options || {};
    command.describe = toDefault(command.describe, '');
    command.help = toDefault(command.help, true);

    // Normalize arrays.
    command.args = toArray(command.args).map(this.utils.stripTokens, this);
    command.alias = toArray(command.alias).map(this.utils.stripTokens, this);
    command.spread = toDefault(command.spread, this.options.spread);
    command.external = toDefault(command.external, null);

    return command;

  }

  /**
   * Merge an and option with existing target.
   *
   * @param oldVal the old options object.
   * @param newVal the new options object.
   * @param command the associated command.
   */
  protected mergeOption(oldVal: IKawkahOptionInternal, newVal: IKawkahOptionInternal, command: IKawkahCommandInternal) {

    oldVal = oldVal || {};
    newVal = newVal || {};

    for (const k in newVal) {

      if (command && k === 'variadic' && newVal[k] === true) {
        const oldIdx = (oldVal as any).index;
        const newIdx = (newVal as any).index;
        if (!isValue(oldIdx) && !isValue(newIdx))
          (newVal as any).index = command.args.length;
      }

      // Extend arrays ensuring no duplicates.
      else if (includes(['alias', 'demand', 'deny', 'completions'], k) || (k === 'extend' && isArray(newVal.extend))) {
        // Ensure old val is an array if extend.
        if (k === 'extend')
          oldVal.extend = toArray(oldVal.extend);
        newVal[k] = this.utils.arrayExtend(toArray(oldVal[k]).slice(0), newVal[k], this.utils.stripTokens.bind(this.utils));
      }

      else if (k === 'validate') {
        if (!isPlainObject(newVal.validate)) {
          newVal.validate = {
            message: undefined,
            handler: newVal.validate as (RegExp | KawkahValidateHandler)
          };
        }
      }

      else if (k === 'index') {

        command.args = command.args || [];

        // New arg.
        if (newVal.index === -1)
          command.args.push(newVal.name);

        if (!~command.args.indexOf(newVal.name))
          command.args.push(newVal.name);

        // Get the new index.
        newVal.index = command.args.indexOf(newVal.name);

      }

      else if (k === 'type') {
        if (!isValue(newVal.type)) {
          if (!isValue(newVal.variadic) && !isValue(newVal.index))
            newVal.type = 'boolean';
          else
            newVal.type = 'string';
        }
      }

      // Ensure default is of same type as option.type.
      // if not try to convert.
      else if (k === 'default' && isValue(newVal.default)) {
        newVal.default = this.utils.toType(newVal.type || oldVal.type || 'string', newVal.default);
      }

      else {

        // Otherwise merge values.
        newVal[k] = toDefault(newVal[k], oldVal[k]);

      }

    }

    for (const k in <IKawkahOptionInternal>oldVal) {

      // Ensure values not already processed from target.
      if (!hasOwn(newVal, k))
        newVal[k] = oldVal[k];

    }

    this.verifyOption(newVal, command);

    return newVal;

  }

  /**
   * Merge command with update source.
   *
   * @param oldVal the old command to merge from.
   * @param newVal the new command to merge to.
   */
  protected mergeCommand(oldVal: IKawkahCommandInternal, newVal: IKawkahCommandInternal) {

    this.aliases[oldVal.name] = oldVal.name;

    for (const k in newVal) {

      if (this.abort()) break;

      if (includes(['args', 'alias'], k)) {

        newVal[k] = this.utils.arrayExtend(toArray(oldVal[k]).slice(0), newVal[k], this.utils.stripTokens.bind(this));

        // update aliases.
        if (k === 'alias')
          newVal.alias.forEach(a => {
            this.aliases[a] = (oldVal as IKawkahCommandInternal).name;
          });

      }

      // Can't use spread args when calling external spawn.
      // when current action create wrapper call spawn command
      // pass action callback.
      if (k === 'external' && isValue(newVal.external)) {
        newVal.spread = false;
        const action = newVal.action || noop;
        newVal.action = (result) => {
          return this.spawnCommand(result, action);
        };
      }

      if (k === 'options') {

        const oldOpts = oldVal[k] || {};
        let newOpts = newVal[k] || {};

        for (const n in newOpts) {

          if (this.abort()) break;

          const oldOpt = this.toOption(oldOpts[n]);
          let newOpt = this.toOptionNormalize(newOpts[n]);

          newOpts[n] = this.mergeOption(oldOpt, newOpt, oldVal);
          newOpts[n].name = toDefault(newOpts[n].name, n);

        }

      }

    }

    for (const k in oldVal) {
      if (!hasOwn(newVal, k))
        newVal[k] = oldVal[k];
    }

    return newVal;

  }

  // API //

  /**
   * Command to key finds a corresponding pirmary key from alias.
   *
   * @example .commandToKey('in') returns >> 'install'.
   *
   * @param alias the alias to be mapped to primary command name.
   * @param def a default value if alias is not defined.
   */
  commandAliasToKey(alias: string, def?: string) {
    this.assert('.commandAliasToKey()', '[string] [string]', arguments);
    return toDefault(this.aliases[alias], this.aliases[def]);
  }

  /**
   * Iterates a collection of options mapping an alias to the primary key.
   *
   * @param coll the collection of options to inspect.
   * @param key the key or alias to find.
   */
  optionAliasToKey(key: string, coll?: IKawkahMap<IKawkahOptionInternal>) {

    this.assert('.optionAliasToKey()', '[string] [object]', arguments);

    // If no collection use default options.
    coll = coll || this.getCommand(DEFAULT_COMMAND_NAME).options;

    // Already is primary key.
    if (coll[key])
      return key;

    for (const k in coll) {
      if (~coll[k].alias.indexOf(key))
        return k;
    }

    return null;

  }

  /**
   * Gets array of keys used to exclude result keys leaving only option keys.
   */
  resultExcludeKeys() {
    return [RESULT_ARGS_KEY, RESULT_ABORT_KEY, RESULT_NAME_KEY, RESULT_COMMAND_KEY];
  }

  /**
  * Exits the process.
  *
  * @param code the exit code if any.
  */
  exit(code: number = 0) {

    this.assert('.exit()', '<number>', arguments);

    if (this._aborting) return;

    this._aborting = true;

    // Check if should exit the process.
    if (this.options.terminate) {

      if (!isDebug())
        process.exit(code);

      // If debugging exit gracefully
      // so we don't clobber locales.
      else
        this.utils.lokales.onQueueEmpty(() => {
          process.exit(code);
        });

    }

  }

  /**
   * Writes message to output stream with optional wrap.
   *
   * @param message the message to be output.
   * @param wrap when true message is wrapped in new lines.
   */
  write(message?: string, wrap?: boolean) {

    this.assert('.write()', '[string] [boolean]', arguments);

    message = message || '';

    message += '\n';

    if (wrap)
      message = '\n' + message + '\n';

    this.options.output.write(message);

    return this;

  }

  /**
   * Logs an empty line.
   */
  log(): KawkahCore;

  /**
   * Logs an error.
   *
   * @param err the error to be logged.
   */
  log(err: Error): KawkahCore;

  /**
   * Logs a message with optional formatting.
   *
   * @param message a message to be logged.
   * @param args rest param of arguments used in formatting.
   */
  log(message: any, ...args: any[]): KawkahCore;

  /**
   * Logs a message by type.
   *
   * @param type a log event type.
   * @param message a message to be logged.
   * @param args rest param of arguments used in formatting.
   */
  log(type: string | KawkahEvent, message: any, ...args: any[]): KawkahCore;

  log(type?: any, message?: any, ...args: any[]) {

    this.assert('.log()', '[string|object] [any] [any...]', arguments);

    if (!this._logHandler) this.setLogHandler();

    // Check if known type.
    let _type = isString(type) ? (type || '').toLowerCase() : '';
    const knownType = !!~this._events.names.indexOf(_type);

    // No type was passed normalize it.
    if (isError(type)) {
      if (isValue(message))
        args.unshift(message);
      message = type;
      _type = 'error';
    }

    // If is a string ensure the type.
    else {

      if (!knownType) {
        if (isValue(message))
          args.unshift(message);
        message = type;
        _type = '';
      }

    }

    // If not a known event type format.
    if (!knownType)
      message = this.utils.formatMessage(message, ...args);

    // Ensure empty string for message.
    message = message || '';

    // If error or help signal abort.
    if (includes(['error', 'help'], _type))
      this.abort();

    // If an error check if catch hanlder is enabled.
    if (_type === 'error')
      this.showCatch();

    this._logHandler(_type, message, ...args);

    return this;

  }

  /**
   * Dispatches an error.
   *
   * @param err the error to dispatch.
   */
  error(err: Error | KawkahError);

  /**
   * Dispatches an error using a formatted message.
   *
   * @param message the message to be formatted.
   * @param args an array of arguments for formatting.
   */
  error(message: string, ...args: any[]);

  error(message: string | Error | KawkahError, ...args: any[]) {
    this.assert('.error()', '<string|object> [any...]', arguments);
    this.dispatch(KawkahEvent.Error, message, ...args);
  }

  /**
   * Dispatches a warning using a formatted message.
   *
   * @param message the message to be formatted.
   * @param args an array of arguments for formatting.
   */
  warning(message: string, ...args: any[]) {
    this.assert('.warning()', '<string> [any...]', arguments);
    this.dispatch(KawkahEvent.Warning, message, ...args);
  }

  /**
   * Dispatches a notification using a formatted message.
   *
   * @param message the message to be formatted.
   * @param args an array of arguments for formatting.
   */
  notify(message: string, ...args: any[]) {
    this.assert('.notify()', '<string> [any...]', arguments);
    this.dispatch(KawkahEvent.Notify, message, ...args);
  }

  /**
  * Dispatches an ok formatted message.
  *
  * @param message the message to be formatted.
  * @param args an array of arguments for formatting.
  */
  ok(message: string, ...args: any[]) {
    this.assert('.ok()', '<string> [any...]', arguments);
    this.dispatch(KawkahEvent.Ok, message, ...args);
  }

  /**
   * Gets or sets the application name overwriting generated value.
   *
   * @param name the name of the application.
   */
  name(name?: string) {
    this.assert('.name()', '[string]', arguments);
    if (!name)
      return this.$0;
    this.$0 = name;
  }

  /**
   * Spawns a child process.
   *
   * @param command the command to spawn.
   * @param args the arguments to apply to command.
   * @param options the spawn options for the child process.
   */
  spawn(command: string, args?: any[], options?: SpawnOptions): ChildProcess {

    this.assert('.spawn()', '<string> [array] [object]', arguments);

    let proc: ChildProcess;

    const hasExt = /\.[a-z0-9]{2,}$/i.test(command); // is path with extension.

    if (hasExt) {

      // Check if is symlink get real path.
      command = lstatSync(command).isSymbolicLink() ? readlinkSync(command) : command;

      // If is .js file and NOT executable shift to args and execute with Node.
      // When is windows always execute with Node.
      if (/\.js$/.test(command) && !this.utils.isExecutable(command) || isWindows()) {
        args.unshift(command);
        command = process.execPath;
      }

      // If we hit here we can't execute the file dispatch error to user.
      else if (!this.utils.isExecutable(command)) {
        this.error(this.utils.__`Command ${command} could not be executed, you could try chmod +x ${command}`);
        return;
      }

    }

    options = options || {};

    const bindEvents = (child: ChildProcess) => {

      if (!child || !child.on) return;

      const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];

      // Listen for signals to kill process.
      signals.forEach(function (signal: any) {
        process.on(signal, function () {
          if ((child.killed === false) && (child['exitCode'] === null))
            child.kill(signal);
        });
      });

      child.on('error', (err) => {

        if (err['code'] === 'ENOENT')
          this.error(this.utils.__`Command ${command} does not exist, try --${this.utils.__`help`}`);

        else if (err['code'] === 'EACCES')
          this.error(this.utils.__`Command ${command} could not be executed, check permissions or run as root`);

        else
          this.error(err);

      });

    };

    proc = spawn(command, args, options as SpawnOptions);

    bindEvents(proc);

    return proc;

  }

  /**
   * Takes a parsed result containing a command and then calls spawn.
   *
   * @param parsed the parsed result.
   * @param close an action callback on child close.
   */
  spawnCommand(parsed: IKawkahResult, close?: KawkahAction): ChildProcess {

    if (!parsed) return;

    let name = <string>parsed[RESULT_COMMAND_KEY];

    const cmd = this.getCommand(name);

    if (!cmd) {
      this.error(this.utils.__`${this.utils.__`Command`} ${name || 'unknown'} could not be found`);
      return;
    }

    // argv0?: string;
    // cwd?: string;
    // env?: any;
    // stdio?: any;
    // detached?: boolean;
    // uid?: number;
    // gid?: number;
    // shell?: boolean | string;
    // windowsVerbatimArguments?: boolean;
    // windowsHide?: boolean;

    let spawnOptKeys;

    spawnOptKeys = ['argv0', 'cwd', 'env', 'stdio', 'detached', 'uid', 'gid', 'shell', 'windowsVerbatimArguments', 'windowsHide'];

    // Concat result args.
    let args = (parsed as IKawkahResult)[RESULT_ARGS_KEY].concat(parsed[RESULT_ABORT_KEY]);

    // Pick spawn options.
    let options = pick(parsed, spawnOptKeys);

    // Get all command options.
    const cmdOpts = omit(<IKawkahResult>parsed, spawnOptKeys.concat(this.resultExcludeKeys()));

    // Convert all command options to an array.
    const cmdOptsArr = keys(cmdOpts).reduce((a, c) => a.concat([c, parsed[c]]), []);

    // Concat all args to an array.
    args = args.concat(cmdOptsArr);

    let child = this.spawn(cmd.external, args, options);

    // If command action call it on close.
    close = close || noop;

    if (child)
      child.on('close', (code) => {
        close(parsed, this);
      });

    return child;

  }

  /**
   * Sets the log handler or uses default.
   *
   * @param fn a log handler function.
   */
  setLogHandler(fn?: KawkahLogHandler) {
    this.assert('.setLogHandler()', '[function]', arguments);
    this._logHandler = fn || this.handleLog.bind(this);
  }

  /**
   * Sets the catch handler when no command is found.
   *
   * @param fn the function to use for handling catch.
   */
  setCatchHandler(fn: string | boolean | KawkahAction = true, isCommand: boolean = false) {

    this.assert('.setCatchHandler()', '<string|boolean|function> <boolean>', [fn, isCommand]);

    if (fn === false) {
      this._catchHandler = undefined;
      return;
    }

    // Find a matching command to be called.
    if (isString(fn)) {

      if (isCommand) {

        const cmd = this.getCommand(<string>fn);

        if (!cmd) {
          this.error(this.utils.__`${this.utils.__`Command`} ${<string>fn} could not be found.`);
          return;
        }

        fn = cmd.action;

      }

      else {
        const text = <string>fn;
        fn = () => {
          this.log(KawkahEvent.Catch, text);
        };
      }

    }

    if (fn === true)
      fn = undefined;

    this._catchHandler = <KawkahAction>fn || this.showHelp.bind(this);

  }

  /**
   * Calls the catch handler which shows help.
   */
  showCatch() {
    if (!this._catchHandler) return;
    this._catchHandler(this);
  }

  /**
   * Gets example text.
   *
   * @param name the name of the example.
   * @param text the example text.
   */
  getExample(name: string, def?: string) {
    this.assert('.getExample()', '<string> [string]', arguments);
    const cur = this.examples[name];
    if (!isValue(cur) && isValue(def))
      this.examples[name] = def;
    return this.examples[name];
  }

  /**
   * Stores example text.
   *
   * @param name the name of the example.
   * @param text the example text.
   */
  setExample(name: string, text: string, groupify: boolean = true) {

    this.assert('.setExample()', '<string> <string> [boolean]', [name, text, groupify]);

    const example = this.getExample(name, text);

    // Groupify the examples for usage in help.
    if (groupify)
      this.groupifyExamples(example);

    return example;

  }

  /**
   * Removes an example from the collection.
   *
   * @param name the name of the example to be removed.
   */
  removeExample(name: string) {
    this.assert('.removeExample()', '<string>', arguments);
    delete this.examples[name];
  }

  /**
   * Reindexes command args setting correct "index" for arg's config.
   *
   * @param command the command to reindex.
   */
  reindexArgs(command: IKawkahCommandInternal) {

    this.assert('.reindexArgs()', '<object>', arguments);

    // Iterate the args and set the correct index.
    command.args.forEach((a, i) => {
      let opt = command.options[a];
      if (!opt)
        opt = this.toOption({ type: 'string', index: i }, command);
      opt.index = i;
    });

    return command;

  }

  /**
   * Gets/builds the usage string.
   *
   * @param command the command to build usage for.
   */
  getUsage(command: IKawkahCommandInternal) {

    this.assert('.getUsage()', '<object>', arguments);

    let _args = command.args.slice(0);

    const base = [RESULT_NAME_KEY];

    if (command.name !== DEFAULT_COMMAND_NAME)
      base.push(command.name);
    else if (command.alias.length)
      base.push(command.alias[0]);

    return [...base, ..._args.map((a, i) => {

      let opt = command.options[a];
      if (!opt)
        opt = this.toOption({ type: 'string', index: i }, command);

      return this.utils.toArg(a, opt.required, opt.variadic);

    })].join(' ');

  }

  /**
   * Gets a command using it's name or alias.
   *
   * @param name the name of the command or command alias to get.
   * @param def a default command if fails to find primary.
   */
  getCommand(name: string, def?: string) {
    this.assert('.getCommand()', '[string] [string]', arguments);
    name = this.commandAliasToKey(name, def);
    return this.commands[name];
  }

  /**
   * Sets command using only usage tokens.
   *
   * @param usage the usage tokens for the command.
   */
  setCommand(usage: string);

  /**
   * Sets a command by configuration.
   *
   * @param command the name of the command to be updated.
   * @param config a command configuration object.
   */
  setCommand(command: string, config?: IKawkahCommand): IKawkahCommandInternal;

  /**
   * Sets command by command name and usage string.
   *
   * @param command the name of the command.
   * @param usage the usage string.
   */
  setCommand(command: string, usage?: string): IKawkahCommandInternal;

  /**
    * Sets a value by key in command.
    *
    * @param command the name of the command setting to be updated.
    * @param key the key in the command object to be updated.
    * @param val the value to be updated.
    */
  setCommand(command: string, key?: KawkahCommandInternalKeys, val?: any, groupify?: boolean): IKawkahCommandInternal;

  setCommand(command: string, key?: string | IKawkahCommand | IKawkahCommandInternal | KawkahCommandInternalKeys, val?: any, groupify: boolean = true) {

    this.assert('.setCommand()', '<string> [string|object] [any] [boolean]', [command, key, val, groupify]);

    let cmd = this.getCommand(command);

    let config: IKawkahCommandInternal;

    // No command create it.
    if (!cmd) {

      let usage;

      // A command name with usage val was passed.
      if (isString(key)) {
        usage = <string>key;
      }

      // Command name and config object passed.
      else if (isObject(key)) {
        config = <IKawkahCommandInternal>key;
        usage = config.usage || command;
        if (this.utils.hasTokens(command))
          command = undefined;
      }

      // Only a usage string was passed.
      else {
        usage = command;
        command = undefined;
      }

      const parsed = this.utils.parseTokens(usage, command || true);

      if (parsed._error) {
        this.error(parsed._error);
        return;
      }

      // Clone default command.
      config = this.toCommand(config);

      // Update the command values.
      config.name = parsed._name;
      config.args = parsed._args;
      config.alias = parsed._aliases;

      // If external is set to true update it
      // to the parsed command name.
      if (config.external as any === true)
        config.external = config.name;

      // Merge options with assign we'll normalize in next step.
      parsed._keys.forEach(k => {
        config.options[k] = Object.assign({}, parsed[k], config.options[k]);
      });

      // Merge the command and normalize its options.
      cmd = this.mergeCommand({ name: config.name }, config);

    }

    else {

      // Updating key value.
      if (!isObject(key)) {
        config = {};
        config[<string>key] = val;
      }

      // If external is set to true update it
      // to the parsed command name.
      if (config.external as any === true)
        config.external = cmd.name;

      cmd = this.mergeCommand(cmd, config);

    }

    // Usage may have changed update it.
    cmd.usage = this.getUsage(cmd);

    this.commands[cmd.name] = cmd;

    // Update groups.
    if (groupify)
      this.groupifyCommand(cmd);

    return cmd;

  }

  /**
   * Removes a command from the collection.
   *
   * @param command the command to be removed.
   */
  removeCommand(command: string) {

    this.assert('.removeCommand()', '<string>', arguments);

    const cmd = this.getCommand(command);

    // Nothing to do.
    if (!cmd) {
      this.warning(this.utils.__`${this.utils.__`Command`} ${command} could not be found`);
      return;
    }

    // Delete command aliases.
    delete this.aliases[command];
    cmd.alias.forEach(a => delete this.aliases[a]);

    // Purge groups.
    this.removeGroupPurge(command);

    // Delete the command instance.
    delete this.commands[command];

  }

  /**
   * Gets options by dot notation or lookup.
   *
   * @param name the name, alias or command.option key.
   */
  getOption(name: string): IKawkahOptionInternal;

  /**
   * Gets an option from a command options.
   *
   * @param command the command the option belongs to if known.
   * @param name the name or alias of the option to get.
   */
  getOption(command: string, name: string): IKawkahOptionInternal;

  getOption(command: string, name?: string): IKawkahOptionInternal {

    this.assert('.getOption()', '[string] [string]', arguments);

    if (!command && !name)
      return;

    // Lookup the option.
    if (arguments.length === 1) {

      command = this.utils.stripTokens(command);

      if (~command.indexOf('.'))
        return get(this.commands, command);

      for (const k in this.commands) {

        const cmd = this.commands[k];

        const primaryKey = this.optionAliasToKey(command, cmd.options);

        if (primaryKey)
          return cmd.options[primaryKey];

      }

      return null;

    }

    // Get option from command options.
    else {

      const cmd = this.getCommand(command);

      name = this.utils.stripTokens(name);

      name = this.optionAliasToKey(name, cmd.options);

      return cmd.options[name];

    }

  }

  /**
   * Sets an option by usage.
   *
   * @param command the command which contains the option.
   * @param name the name of the option to update.
   */
  setOption(command: string, usage: string): IKawkahMap<IKawkahOptionInternal>;

  /**
   * Sets an option by config object..
   *
   * @param command the command which contains the option.
   * @param name the name of the option to update.
   * @param config the configuration object to extend with.
   */
  setOption(command: string, name: string, config: IKawkahOptionInternal): IKawkahOptionInternal;

  /**
   * Sets an option by using name and simple transform type.
   *
   * @param command the command which contains the option.
   * @param name the name of the option to update.
   * @param type the transform type to create the option with.
   */
  setOption(command: string, name: string, type: string): IKawkahOptionInternal;

  /**
   * Sets an option value by key.
   *
   * @param command the command which contains the option.
   * @param name the name of the option to update.
   * @param key the key within the option to be updated.
   * @param val the key's value to be updated.
   */
  setOption(command: string, name: string, key: KawkahOptionInternalKeys, val: any, groupify?: boolean): IKawkahOptionInternal;

  setOption(command: string, name: string, key?: string | IKawkahOptionInternal | KawkahOptionInternalKeys, val?: any, groupify: boolean = true) {

    this.assert('.setOption()', '<string> <string> [string|object] [any] [boolean]', [command, name, key, val, groupify]);

    let cmd = this.getCommand(command);

    if (!cmd) {
      this.warning(this.utils.__`${this.utils.__`Command`} ${command} could not be found`);
      return;
    }

    // Only global command can have actionable options.
    if (command !== DEFAULT_COMMAND_NAME && (isFunction(val) || (isObject(key) && (key as any).action))) {
      this.error(this.utils.__`${this.utils.__`Option`} ${name} contains action, actionable actions only valid for default command`);
      return;
    }

    let opt = this.getOption(command, name);

    let config: IKawkahOptionInternal;

    let result: any;

    // No option create it.
    if (!opt) {

      let usage;
      let shouldParse = false;

      // Option with simple transform type passed.
      if (~SUPPORTED_TYPES.indexOf(<string>key)) {
        config = {
          type: <KawkahOptionType>key
        };
      }

      else if (isString(key) && isValue(val)) {
        config = {};
        config[<string>key] = val;
      }

      // Command name and config object passed.
      else if (isObject(key)) {
        config = <IKawkahOptionInternal>key;
      }

      // Only a usage string was passed.
      else {
        usage = name;
        name = undefined;
        shouldParse = true;
      }

      // A parsable usage string was passed.
      // parse and then add each option.
      if (shouldParse) {

        const parsed = this.utils.parseTokens(usage, name);

        if (parsed._error) {
          this.error(parsed._error);
          return;
        }

        const opts: IKawkahMap<IKawkahOptionInternal> = {};

        // Normalize and add each parsed option.
        parsed._keys.forEach(k => {
          cmd.options[k] = this.mergeOption(this.toOption(k, cmd), parsed[k], cmd);
          opts[k] = cmd.options[k];
        });

        result = opts;

      }

      else {
        config.name = toDefault(config.name, name);
        cmd.options[name] = this.mergeOption(this.toOption(name, cmd), config, cmd);
        result = cmd.options[name];
      }

    }

    // Update existing option.
    else {

      // Updating key value.
      if (!isObject(key)) {
        config = {};
        config[<string>key] = val;
      }
      else {
        config = key as IKawkahOptionInternal;
      }

      const optIsArg = hasOwn(opt, 'index');
      const configIsArg = hasOwn(config, 'index');

      config.name = toDefault(config.name, name);

      // Check type mismatch.
      if (optIsArg !== configIsArg) {
        this.error(this.utils.__`Argument option ${config.name} cannot be merged with existing flag option ${config.name}`);
        return;
      }

      result = cmd.options[name] = this.mergeOption(opt, config, cmd);

    }

    // Arg options may have been udpated
    // reindex and rebuild usage.
    cmd = this.reindexArgs(cmd);
    cmd.usage = this.getUsage(cmd);

    // Ensure options are added to groups if needed.
    if (groupify)
      this.groupifyOptions(cmd.options);

    // return cmd.options[name];
    return result;

  }

  /**
   * Remove an option from a command.
   *
   * @param command the command name.
   * @param name the name of the option to remove.
   */
  removeOption(command: string, name: string) {

    this.assert('.removeOption()', '<string> <string>', arguments);

    const cmd = this.getCommand(command);

    if (!cmd) {
      this.warning(this.utils.__`${this.utils.__`Command`} ${command} could not be found`);
      return;
    }

    // Purge groups.
    this.removeGroupPurge(name);

    const opt = this.getOption(command, name);

    if (opt) {

      const hasArg = hasOwn(opt, 'index');

      delete cmd.options[name];

      if (hasArg && ~cmd.args.indexOf(name)) {
        cmd.args.splice(cmd.args.indexOf(name), 1);
        this.reindexArgs(cmd);
        cmd.usage = this.getUsage(cmd);
      }

    }

  }

  /**
   * Gets a group configuration from the store.
   *
   * @param name the name of the group to get.
   * @param def a default value if any.
   */
  getGroup(name: string, def?: any): IKawkahGroup {
    this.assert('.getGroup()', '[string] [any]', arguments);
    return this.groups[name] || def;
  }

  /**
   * Assigns a group to a known command, includes all enabled options as items.
   *
   * @example .setGroup('My Group', 'some_command_name');
   *
   * @param name the name of the group.
   * @param command a known command.
   * @param isCommand set to true to enable group as a command group.
   */
  setGroup(name: string, command: string, isCommand: true): IKawkahGroup;

  /**
  * Assigns items to a group, use dot notation when multple options of same name exit.
  *
  * @example .setGroup('My Group:', 'option1', 'option2');
  * @example .setGroup('My Group:', 'commandName.option1', 'commandName.option2');
  *
  * @param name the name of the group.
  * @param items list of items for the group.
  */
  setGroup(name: string, ...items: string[]): IKawkahGroup;

  /**
   * Sets a group to enabled or disabled.
   *
   * @example .setGroup('My Group', false);
   *
   * @param name the name of the group.
   * @param enabled a configuration object for the group.
   */
  setGroup(name: string, enabled: boolean): IKawkahGroup;

  /**
   * Sets a group using config object.
   *
   * @example .setGroup('My Group', { // options here });
   *
   * @param name the name of the group.
   * @param config a configuration object for the group.
   */
  setGroup(name: string, config: IKawkahGroup): IKawkahGroup;

  setGroup(name: string, config?: string | boolean | IKawkahGroup, isCommand?: string | boolean, ...items: string[]) {

    this.assert('.setGroup()', '<string> [string|boolean|object] [string|boolean] [string...]', arguments);

    if (!name) {
      this.error(this.utils.__`${this.utils.__`Group`} ${name} has invalid or missing ${this.utils.__`configuration`}`);
      return this;
    }

    // Get group or create with defaults.
    let group: IKawkahGroup = this.getGroup(name);

    // Cast to type.
    config = <IKawkahGroup>config;

    const origConfig = config;

    if (isBoolean(config)) {
      group.enabled = <boolean>config;
      return group;
    }

    // Not a config object.
    if (!isObject(config)) {

      if (isString(isCommand)) {
        items.unshift(<string>isCommand);
        isCommand = false;
      }

      if (isValue(config))
        items.unshift(<string>config);

      config = { items: items };

      // Existing group don't overwrite items or title.
      if (group) {
        config.title = group.title;
        config.items = group.items;
      }

    }

    // Ensure items array.
    config.items = config.items || [];

    // This group is a command will build help for
    // the command and all options.
    if (isCommand === true || config.isCommand) {
      const commandName = isObject(origConfig) ? name : <string>origConfig;
      const cmd = this.getCommand(commandName);
      if (!cmd) {
        this.warning(this.utils.__`${this.utils.__`Command`} ${config.items[0] || 'unknown'} could not be found`);
        return;
      }
      config.isCommand = true;
      config.items = keys(cmd.options).filter(k => cmd.options[k].help);
    }
    // Otherwise merge items.
    else {
      config.items = this.utils.arrayExtend((group && group.items || []), config.items);
    }

    // Extend group with current.
    group = Object.assign({}, DEFAULT_GROUP, group, config);
    group.title = group.title || name;

    this.groups[name] = group;

    return group;

  }

  /**
   * Removes a group from the collection.
   *
   * @param name the name of the group to be removed.
   */
  removeGroup(name: string) {

    this.assert('.removeGroup()', '<string>', arguments);

    if (!this.groups[name])
      return;

    delete this.groups[name];

  }

  /**
   * Purges any groups by name and cleans any groups which contain key in items.
   *
   * @param name the name of the group to be removed.
   */
  removeGroupPurge(name: string) {
    this.assert('.removeGroupPurge()', '<string>', arguments);
    this.removeGroup(name);
    this.removeGroupItem(name);
  }

  /**
   * Removes key from a group's items or all instances of key in any group.
   *
   * @param key the key to be removed from group item(s).
   * @param group the optional group to remove key from.
   * @param removeParent if key in items remove entire group instead of clean.
   */
  removeGroupItem(key: string, group?: string | boolean, removeParent?: boolean) {

    this.assert('.removeGroupItem()', '<string> [string|boolean] [boolean]', arguments);

    if (isBoolean(group)) {
      removeParent = <boolean>group;
      group = undefined;
    }

    const groupKey = <string>group;

    const modified = [];

    if (group && ~this.groups[groupKey].items.indexOf(key)) {

      modified.push(group);
      this.groups[groupKey].items = (this.groups[groupKey].items as string[]).filter(k => k !== key);

    }

    else {

      for (const k in this.groups) {

        const group = this.groups[k];
        const hasItem = ~group.items.indexOf(key);

        // Nothing to do.
        if (!hasItem)
          continue;

        modified.push(k);

        if (removeParent)
          this.removeGroup(k);
        else
          this.groups[k].items = (group.items as string[]).filter(k => k !== key);

      }

    }

  }

  /**
   * Sets version option with all defaults.
   */
  setVersion(): IKawkahOptionInternal;

  /**
   * Sets version with custom version value.
   *
   * @example .setVersion('1.2.6-alpha');
   *
   * @param version the value to set version to.
   */
  setVersion(version: string): IKawkahOptionInternal;

  /**
   * Enables or disables version.
   *
   * @example .setVersion(false);
   *
   * @param enabled bool value to enable/disable version.
   */
  setVersion(enabled: boolean): IKawkahOptionInternal;

  /**
   * Sets version with custom option keys with description and custom version.
   *
   * @param options the option keys to use for version.
   * @param describe the description for help.
   * @param version a custom value to set version to.
   */
  setVersion(options: string[], describe?: string, version?: string): IKawkahOptionInternal;

  setVersion(option: string | string[] | boolean = true, describe?: string, version?: string) {

    this.assert('.setVersion()', '<string|array|boolean> [string] [string]', [option, describe, version]);

    let key = this.utils.__`version`;

    // Disable version.
    if (option === false)
      return this.removeOption(DEFAULT_COMMAND_NAME, key);

    let aliases = isArray(option) || (arguments.length > 1 && isString(option)) ? option : undefined;
    let ver = arguments.length === 1 && isString(option) ? option : version;

    describe = describe || this.utils.__`Displays ${this.$0} ${key}`;

    let displayStr = this.package.pkg.version;

    // Default action handler for version.
    const action = (result) => {
      if (this._aborting) return;
      const opt = this.getOption(DEFAULT_COMMAND_NAME, 'version');
      this.log(opt.static);
    };

    // Enable to version option.
    return this.setOption(DEFAULT_COMMAND_NAME, key, {
      type: 'boolean',
      describe: describe,
      alias: <string[]>aliases,
      static: ver || displayStr,
      action: action
    });

  }

  /**
   * When true and --trace is present in args
   * enabled/disable stack tracing for errors.
   *
   * @param trace enables/disables tracing.
   */
  setTrace(option?: string | boolean) {
    this.assert('.setTrace()', '[string|boolean]', arguments);
    if (isBoolean(option)) {
      if (!option)
        this._traceName = undefined;
      else
        this._traceName = this.utils.__`trace`;
    }
    else {
      this._traceName = this.utils.stripFlag(<string>option) || this.utils.__`trace`;
    }
  }

  /**
   * Builds help menu by groups, when no groups specified builds default.
   *
   * @param groups the groups to build help for.
   */
  buildHelp(groups: string[]) {

    this.assert('.buildHelp()', '<array>', arguments);

    const table = this.table = this.table || new Tablur({
      colorize: this.options.colorize,
      width: 90,
      padding: 0,
      sizes: [25, 30, 20],
      aligns: [null, null, TablurAlign.right]
    });

    // Clear ensure empty rows.
    table.clear();

    const theme = this.options.theme;

    // HELPERS //

    const applyTheme = (key: KawkahThemeSytleKeys, val: any) => {
      if (!theme || !theme[key])
        return val;
      return this.utils.colorize(val, ...theme[key]);
    };

    function indentValue(count: number) {
      if (!count)
        return '';
      return ' '.repeat(count);
    }

    function wrapValue(val: string, prefix?: string, suffix?: string) {

      // Probably an empty string.
      if (!val) return '';

      // Otherwise if value add prefix if present.
      prefix = prefix || '';
      suffix = suffix || '';

      return (`${prefix}${val}${suffix}`).trim();

    }

    function wrapBracket(val) {
      return wrapValue(val, '[', ']');
    }

    function validGroupItem(obj: any, name: string, key: string, type: string) {
      if (obj) return true;
      this.error(this.utils.__`${this.utils.__`Help group`} ${name} has invlaid or missing ${type}`);
      return false;
    }

    // BUILD HELPER //

    const buildCommand = (cmd: IKawkahCommandInternal, group: IKawkahGroup, indent?: number) => {

      // Custom help string.
      if (isString(cmd.help))
        return [<string>cmd.help];

      if (isFunction(cmd.help))
        return [(cmd.help as KawkahHandler)(cmd, this)];

      let aliases: any = !cmd.alias.length ? '' : (cmd.alias as string[]).join(', ');
      indent = toDefault(indent, group.indent);

      let usage = applyTheme('usage', cmd.usage.replace(RESULT_NAME_KEY, this.$0));
      let describe = applyTheme('describe', cmd.describe || '');

      if (aliases.length) {
        aliases = applyTheme('alias', aliases);
        aliases = applyTheme('label', 'Alias: ') + aliases;
      }

      usage = indentValue(indent) + usage;

      return [usage, describe, aliases];

    };

    const buildOption = (opt: IKawkahOptionInternal, group: IKawkahGroup, indent?: number) => {

      indent = toDefault(indent, group.indent);

      // Bit of a hack match length of array otherwise
      // we end up with unwanted space need to look into this.
      if (isString(opt.help))
        return [indentValue(indent) + <string>opt.help, '', ''];

      if (isFunction(opt.help))
        return [indentValue(indent) + (opt.help as KawkahHandler)(opt, this), '', ''];

      const isOpt = !isValue(opt.index);

      // Convert keys to flags.
      let names: any = !isValue(opt.index)
        ? [opt.name].concat(opt.alias).map(v => this.utils.toFlag(v), this)
        : [opt.name];

      names = names.join(', ');
      let type = !isString(opt.type) ? getType(opt.type) : opt.type;
      let required = opt.required ? 'required' : '';
      let variadic = opt.variadic ? 'variadic' : '';
      if (variadic) required = ''; // just in case.

      let describe = applyTheme('describe', opt.describe || '');
      type = applyTheme('type', wrapBracket(type));
      required = applyTheme('required', wrapBracket(required));
      variadic = applyTheme('variadic', wrapBracket(variadic));

      if (!isOpt)
        names = applyTheme('argument', names);
      else
        names = applyTheme('flag', names);

      // Indent the option name.
      names = indentValue(indent) + names;

      return [names, describe, `${type}${variadic}${required}`.trim()];


    };

    const buildStatic = (name: string, group: IKawkahGroup, indent?: number) => {

      indent = toDefault(indent, group.indent);

      // Colorize the static element.
      if (theme) {

      }

      return [indentValue(indent) + name];

    };

    // BUILD BY GROUP //

    const buildGroup = (name: string, group: IKawkahGroup) => {

      if (group.sort)
        (group.items as string[]).sort();

      // We're building a command and it's options.
      if (group.isCommand) {

        const cmd = this.getCommand(name);

        if (!validGroupItem(cmd, name, name, 'command') || !(cmd && cmd.help))
          return;

        // Build the command.
        const row = buildCommand(cmd, group, 2);

        table.section(applyTheme('title', group.title));
        table.row(...row);

        const args = (group.items as string[]).filter(k => hasOwn(cmd.options, 'index') && cmd.options[k].help);

        const flags = (group.items as string[]).filter(k => !hasOwn(cmd.options, 'index') && cmd.options[k].help);

        if (args.length || flags.length)
          table.break();

        if (args.length) {
          table.section(applyTheme('title', KawkahGroupKeys.Arguments + ':'));
          args.forEach(a => {
            const opt = this.getOption(name, a);
            if (!validGroupItem(opt, name, a, 'argument'))
              return;
            table.row(...buildOption(opt, group));
          });
        }

        if (args.length && flags.length)
          table.break();

        if (flags.length) {
          table.section(applyTheme('title', KawkahGroupKeys.Flags + ':'));
          flags.forEach(f => {
            const opt = this.getOption(name, f);
            if (!validGroupItem(opt, name, f, 'option'))
              return;
            table.row(...buildOption(opt, group));
          });
        }


      }

      // Otherwise detect type and build.
      else {

        let title = applyTheme('title', group.title);
        let none = this.utils.__`none`;
        const indent = ' '.repeat(group.indent);

        table.section(title);

        if (!group.items.length) {

          table.section(indent + none);

        }

        else {

          for (const k of group.items) {

            if (this.aliases[k]) { // this is a command.

              const cmd = this.getCommand(k);

              if (!validGroupItem(cmd, name, k, 'command') || !(cmd && cmd.help))
                continue;

              table.row(...buildCommand(cmd, group));

            }

            else { // building an option or static.

              const opt = this.getOption(k);

              if (opt) { // building an option.

                if (!validGroupItem(opt, name, k, 'option') || !(opt && opt.help))
                  continue;

                table.row(...buildOption(opt, group));

              }

              else { // building a static item.

                table.row(...buildStatic(k, group));

              }

            }

          }

        }



      }

    };

    groups.forEach((k, i) => {

      const group = this.groups[k];

      if (!group || !group.enabled)
        return;

      buildGroup(k, group);

      if (groups[i + 2])
        table.break(); // add a break if another group.

    });

    // Add header if any.
    if (this._header)
      table.header(applyTheme('header', this._header[0]), this._header[1]);

    // Add footer if any.
    if (this._footer)
      table.footer(applyTheme('footer', this._footer[0]), this._footer[1]);

    return table.render();

  }

  /**
   * Gets help if enabled.
   *
   * @param groups a group or array of group strings.
   */
  getHelp(groups?: string | string[]) {

    this.assert('.getHelp()', '[string|array]', arguments);

    if (!this._helpHandler) {
      this.error(this.utils.__`${this.utils.__`Help`} ${this.utils.__`handler`} could not be found`);
      return null;
    }

    // No groups specified get all groups.
    if (!groups || !groups.length) {

      // Build groups using default help groups.
      if (KawkahHelpScheme.Default)
        groups = Object.keys(KawkahGroupKeys);

      // Display help by each command.
      else if (KawkahHelpScheme.Commands)
        groups = Object.keys(this.groups).filter(k => this.groups[k].isCommand);

    }

    // Ensure groups is array.
    groups = toArray(groups);

    return this.buildHelp(<string[]>groups);

  }

  /**
   * Enables help with defaults.
   */
  setHelp(): IKawkahOptionInternal;

  /**
  * Toggles help option enabled or disabled.
  *
  * @param enabled bool value to enable/disable help.
  */
  setHelp(enabled: boolean): IKawkahOptionInternal;

  /**
   * Enables help with default option using custom help handler.
   *
   * @param fn help handler callback function.
   */
  setHelp(fn: KawkahHelpHandler): IKawkahOptionInternal;

  /**
   * Enables help with custom option(s) names with optional help handler.
   *
   * @param options a string or array of string option names.
   * @param fn optional help handler method for displaying help.
   */
  setHelp(options: string | string[], fn?: KawkahHelpHandler): IKawkahOptionInternal;

  /**
   * Enables help with custom option(s) names with optional help handler.
   *
   * @param options a string or array of string option names.
   * @param describe the description for help option.
   * @param fn optional help handler method for displaying help.
   */
  setHelp(options: string | string[], describe: string, fn?: KawkahHelpHandler): IKawkahOptionInternal;

  setHelp(options: string | string[] | boolean | KawkahHelpHandler = true, describe?: string | KawkahHelpHandler, fn?: KawkahHelpHandler) {

    this.assert('.setHelp()', '<string|array|boolean|function> [string|function] [function]', [options, describe, fn]);

    const key = this.utils.__`help`;
    const defHelpHandler = this.handleHelp.bind(this);

    // If false ensure option doesn't exist.
    if (options === false) {
      this.removeOption(DEFAULT_COMMAND_NAME, key);
      this._helpHandler = undefined;
      return this;
    }

    else if (options === true) {
      fn = defHelpHandler.bind(this);
      options = undefined;
    }

    // If function shift args.
    else if (isFunction(options)) {
      fn = <KawkahHelpHandler>options;
      options = undefined;
    }

    if (isFunction(describe)) {
      fn = <KawkahHelpHandler>describe;
      describe = undefined;
    }

    // Set the help handler function.
    this._helpHandler = fn || defHelpHandler.bind(this);

    describe = describe || this.utils.__`Displays ${this.$0} ${key}`;

    const action: KawkahResultAction = (result) => {

      if (this._aborting)
        return;

      // Get help, if value returned output.
      let help;

      if (result[RESULT_COMMAND_KEY])
        help = this._helpHandler([result[RESULT_COMMAND_KEY]], this);
      else
        help = this._helpHandler(null, this);

      if (!help) {
        this.warning(this.utils.__`${this.utils.__`Help`} returned empty result`);
        return;
      }

      this.write(help, true);

    };

    return this.setOption(DEFAULT_COMMAND_NAME, key, {
      type: 'boolean',
      alias: <string[]>options,
      describe: <string>describe,
      action: action.bind(this)
    });

  }

  /**
   * Calls help handler if enabled.
   *
   * @param groups optional group or groups to show help for.
   */
  showHelp(...groups: string[]) {
    this.assert('.showHelp()', '[string...]', arguments);
    if (!this._helpHandler) return;
    this._helpHandler(groups, this);
  }

  /**
   * Gets the header.
   */
  getHeader(): [string, TablurAlign] {
    return this._footer;
  }

  /**
   * Sets the header.
   *
   * @param header the header text.
   */
  setHeader(header: string, align?: 'left' | 'center' | 'right') {
    this.assert('.setHeader()', '<string> [string]', arguments);
    this._header = [header, <any>align || TablurAlign.left];
  }

  /**
   * Gets the footer.
   */
  getFooter(): [string, TablurAlign] {
    return this._footer;
  }

  /**
   * Sets the footer.
   *
   * @param footer the footer text.
   */
  setFooter(footer: string, align?: 'left' | 'center' | 'right') {
    this.assert('.setFooter()', '<string> [string]', arguments);
    this._footer = [footer, <any>align || TablurAlign.left];
  }

  /**
   * Sets a theme for styling help.
   *
   * @param theme the theme name or object containing styles.
   */
  setTheme(theme: KawkahThemeKeys | IKawkahTheme) {

    this.assert('.setTheme()', '<string|object>', arguments);

    let _theme: IKawkahMap<KawkahAnsiType>;

    // If string lookup the theme.
    if (isString(this.options.theme)) {

      _theme = DEFAULT_THEMES[<string>this.options.theme];

      if (!theme) {
        this.warning(this.utils.__`${this.utils.__`Theme`} ${this.options.theme} could not be found`);
        return;
      }

    }

    else {
      _theme = Object.assign({}, DEFAULT_THEME, theme as IKawkahMap<KawkahAnsiType>);
    }

    if (_theme)
      this.options.theme = this.normalizeStyles(_theme);

  }

  /**
   * Gets the current help theme object.
   */
  getTheme() {
    return this.options.theme;
  }

  /**
   * Gets a completions query from env vars or generated from line.
   *
   * @param line the optional line to build query from.
   */
  getCompletionsQuery(line?: string | string[]) {

    this.assert('.getCompletionsQuery()', '[string|array]', arguments);

    const query: IKawkahCompletionQuery = {
      words: parseInt(process.env.COMP_CWORD || '0'),
      point: parseInt(process.env.COMP_POINT || '0'),
      line: expandArgs(line || process.env.COMP_LINE || [])
    };

    if (query.line[0] === this.$0)
      query.line = query.line.slice(1);

    if (last(query.line) === '')
      query.line.pop();

    // If line was provided calculate point/word.
    if (line) {
      query.point = line.length;
      query.words = query.line.length;
    }

    return query;

  }

  /**
   * Resolves completions returning matches.
   *
   * @param query an object containing the word, point and current line.
   */
  getCompletions(query: IKawkahCompletionQuery) {

    this.assert('.getCompletions()', '<object>', arguments);

    // Filter out flag options get only args.
    const args = query.line.filter(v => !isFlag(v));

    if (last(args) === '--')
      args.pop();

    // the last non --flag arg index.
    // this way if you type "arg" --flag --flag2
    // we are still getting custom completes
    // for "arg"
    const argIdx = args.length - 1;

    let completions = [];

    const load = (command: any) => {

      let found = [];

      command = this.getCommand(command);

      if (!command)
        return found;

      for (const k in command.options) {

        const opt = command.options[k] as IKawkahOptionInternal;

        // Process non index options, flags basically.
        if (!isValue(opt.index)) {
          found = found.concat([k, ...opt.alias.sort()].map(v => this.utils.toFlag(v)));
        }

        // If an indexed option check for match.
        // then get any custom completions.
        else if (opt.index === argIdx) {
          found = found.concat(opt.completions.sort());
        }

      }

      return found;


    };

    // Command key will always be the first arg.
    const commandKey = this.commandAliasToKey(first(query.line));
    const defOpts = load(DEFAULT_COMMAND_NAME);

    // Get all commands and their aliases
    // also get all default options/aliases.
    if (!commandKey) {

      const commands =
        this.utils.arrayUnique([...keys(this.commands).sort(), ...keys(this.aliases).sort()]).filter(v => v !== DEFAULT_COMMAND_NAME);

      completions = [...commands, ...defOpts];

    }

    // Otherwise get found command's options
    // and global options if allowed.
    else {

      completions = load(commandKey); // [...load(commandKey), ...defOpts];

    }

    return this.utils.arrayUnique(completions).filter(v => {
      return v !== '' && !~query.line.indexOf(v);
    });

  }

  /**
   * Adds tab completions to your app using all defaults.
   */
  setCompletions(): IKawkahCommandInternal;

  /**
   * Adds tab completions with defaults or disables.
   *
   * @example .completions(false);
   *
   * @param enabled enables with defaults or disables completions.
   */
  setCompletions(enabled: boolean): IKawkahCommandInternal;

  /**
   * Adds tab completions to app with custom name.
   *
   * @example .completions('completions');
   *
   * @param name the name of the completions command.
   */
  setCompletions(name: string): IKawkahCommandInternal;

  /**
  * Adds tab completions to app with name and custom handler function for generating completions.
  *
  * @example .completions('completions', HandlerFunction);
  *
  * @param name the name of the completions command.
  * @param fn optional custom handler for building completions.
  */
  setCompletions(name: string, fn: KawkahCompletionsHandler): IKawkahCommandInternal;

  /**
   * Adds tab completions to your app with named completions command, custom description, custom handler and bash script template.
   *
   * @example
   * Function: a custom completions handler function.
   * Template: a custom template for generating completions script.
   * .completions('completions', 'Some description', HandlerFunction, 'Template')
   *
   * @param name the name of the completions command.
   * @param describe the help description for completions.
   * @param fn optional custom handler for building completions.
   * @param template a custom template for generating completions script.
   */
  setCompletions(name: string, describe: string, fn?: KawkahCompletionsHandler, template?: string): IKawkahCommandInternal;

  setCompletions(name?: string | boolean, describe?: string | KawkahCompletionsHandler, fn?: KawkahCompletionsHandler, template?: string) {

    this.assert('.setCompletions()', '[string|boolean] [string|function] [function] [string]', arguments);

    if (isBoolean(name)) {

      // If false remove the command.
      if (!name) {
        this.removeCommand(this._completionsName);
        this._completionsName = undefined;
        return;
      }

      // if true set to undefined accept all defaults.
      name = undefined;

    }

    if (isFunction(describe)) {
      fn = <KawkahCompletionsHandler>describe;
      describe = undefined;
    }

    const replyFlagName = 'compreply'; // never called by user no localization.
    const testFlagName = this.utils.__('test');
    const scriptFlagName = this.utils.__('script');

    const testFlag = this.utils.toFlag(testFlagName);

    name = name || this.utils.__`completions`;
    this._completionsName = <string>name;
    describe = describe || this.utils.__(`Tab completions`);

    let handler;

    // Create action for handling the completions command.
    const action: KawkahAction = (parsed: IKawkahResult) => {

      // Get the original array and remove test, script or compreply flags.

      // Reply with completions.
      if (parsed[replyFlagName]) {

        handler(this.getCompletionsQuery(), (err, comps) => {
          (comps || []).forEach(c => console.log(c));
          this.exit(0);
        });

      }

      // Show the completion script.
      else if (parsed[scriptFlagName]) {

        if (isWindows()) {
          this.warning(this.utils.__`${this.utils.__`Completions`} is not supported on windows`);
          return;
        }

        let path = this.$0.match(/\.js$/) ? `./${this.$0}` : this.$0;
        let script = template || readFileSync(join(__dirname, 'completions.sh.tpl'), 'utf8');

        script = script.replace(/{{app_name}}/g, basename(this.$0));
        script = script.replace(/{{app_path}}/g, path);
        script = script.replace(/{{app_command}}/g, <string>name);
        script = script.replace(/{{app_script}}/g, '--' + scriptFlagName);
        script = script.replace(/{{app_reply}}/, '--' + replyFlagName);

        this.log(script);

      }

      // Test completions.
      else if (parsed[testFlagName]) {

        // without the completions command or test flag.
        // For testing just grab the original argv
        const argv = process.argv.slice(2).filter(k => k !== testFlag && k !== this._completionsName);

        handler(this.getCompletionsQuery(argv), (err, comps) => {
          this.log(comps.join(', '));
        });

      }

      return parsed;

    };

    // Define the completions command.
    const command: IKawkahCommand = {
      usage: `${RESULT_NAME_KEY} ${name}`,
      describe: <string>describe,
      options: {
        comreply: {
          describe: this.utils.__`Outputs ${name} to stream`,
          help: false
        }
      },
      spread: false,
      action: action
    };

    if (name !== 'completions')
      command.alias = 'completions';

    // Add options here using localized flag/option names.
    command.options[testFlagName] = { describe: this.utils.__`Tests ${name} input`, type: 'boolean' };

    command.options[scriptFlagName] = { describe: this.utils.__`Shows ${name} script`, type: 'boolean' };

    // Store custom or default handler for parsing completions.
    this._completionsHandler = <KawkahCompletionsHandler>(fn || this.getCompletions.bind(this));

    // Ensure the handler for generating completions is normalized
    // simplifies calling as now we have same signature.
    handler = this.utils.toNodeCallback(this._completionsHandler);

    return this.setCommand('completions', <IKawkahCommandInternal>command);

  }

  /**
   * Runs validation middleware.
   *
   * @param val the current processed value.
   * @param key the current key.
   * @param event the active event.
   */
  private validateMiddleware(val: any, key: string, event: IKawkahMiddlewareEventOption) {

    const command = event.command;

    // Apply before validate.
    val = this.middleware
      .runGroup(KawkahMiddlewareGroup.BeforeValidate)
      .command(command.name)
      .run(val, key, event, this);

    if (!event.option.skip && !command.skip) {

      // Apply validation.
      val = this.middleware
        .runGroup(KawkahMiddlewareGroup.Validate)
        .command(command.name)
        .run(val, key, event, this);

    }

    // Apply middleware.
    val = this.middleware
      .runGroup(KawkahMiddlewareGroup.AfterValidate)
      .command(command.name)
      .run(val, key, event, this);

    return val;

  }

  /**
   * Validates the event running middleware on the result.
   *
   * @param event the event containing result and command objects.
   */
  validate(event: IKawkahMiddlewareEventOption) {

    if (isError(event.result))
      return event.result;

    this.assert('.validate()', '<object>', arguments);

    const defaultCommand = this.getCommand(DEFAULT_COMMAND_NAME);
    event.command = event.command || defaultCommand;
    let command = event.command;

    // Merge in default option configs with command options.
    let configs = Object.assign({}, defaultCommand.options, command.options);

    // Iterate each command option configuration.
    for (const k in configs) {

      // Set the current configuration.
      const config = event.option = configs[k];

      // Check if is an argument or option.
      const isArgument = event.isArg = hasOwn(config, 'index');

      // Set the initial value.
      let val = isArgument ? event.result[RESULT_ARGS_KEY][config.index] : get(event.result, k);

      // Run all validation middleware.
      val = this.validateMiddleware(val, k, event);

      if (isError(val)) {
        event.result = val;
        break;
      }

      // Update argument at index.
      if (isArgument && !isUndefined(val))
        event.result[RESULT_ARGS_KEY][config.index] = val;

      // Otherwise update option on object also
      // arguments when extend args is enabled.
      else if (!isArgument && !isUndefined(val))
        set(event.result, k, val);

    }

    return event.result;

  }

  /**
   * Parses arguments using specified args
   * or uses process.argv.
   *
   * @param argv string or arguments to parse.
   */
  parse(argv?: string | string[]): IKawkahResult {

    if (argv)
      this.assert('.parse()', '[string|array]', arguments);

    this.result = {};

    // Update the normalized args.
    argv = expandArgs((argv || process.argv.slice(2)) as any[]);

    // If has trace enabled stacktracing.
    const hasTrace = !!~argv.indexOf(`--${this._traceName}`);
    if (hasTrace)
      this.options.stacktrace = true;

    // Store the current command if any and
    // set default command.
    const command = this.getCommand(argv[0]);
    const defaultCommand = this.getCommand(DEFAULT_COMMAND_NAME);
    const commandName = command ? command.name : null;

    // Known command remove from args.
    if (command)
      argv.shift();

    // Pick the options to pass to the parser.
    let parserOptions: IKawhakParserOptions = pick(this.options, keys(DEFAULT_PARSER_OPTIONS));

    // Add in command and default command
    // options to parser.options.
    parserOptions.options = Object.assign({}, command && command.options) as any;

    // If not default command merge in
    // default options that are not args.
    // for example "help", "version" etc.
    if (commandName !== DEFAULT_COMMAND_NAME) {
      const defOpts = defaultCommand.options;
      for (const k in defOpts) {
        if (!hasOwn(defOpts, 'index'))
          parserOptions.options[k] = defOpts[k] as any;
      }
    }

    // If spread args enabled must have
    // placeholder args enabled.
    if (command && command.spread)
      parserOptions.allowPlaceholderArgs = true;

    // Forces all args to be ignored.
    // Then args can be passed to spawn.
    if (command && command.abort)
      argv.unshift('--');

    // Ensure aliases are disabled in kawkah-parser.
    parserOptions.allowAliases = false;

    // Parse the arguments using kawkah-parser.
    let parsed = this.options.parser(argv, parserOptions);

    // Extend result with app name and
    // found command name if any.
    parsed[RESULT_NAME_KEY] = this.$0;
    parsed[RESULT_COMMAND_KEY] = commandName;

    return parsed;

  }

  /**
   * Listens for commands, parses specified
   * args or uses process.argv.
   *
   * @param argv string or array of args.
   */
  listen(argv?: string | string[]): IKawkahResult {

    this.abort(false); // reset abort.

    if (argv)
      this.assert('.listen()', '[string|array]', arguments);

    // Parse the arguments.
    const parsed = this.parse(argv);

    const command = this.getCommand(parsed.$command);
    const defaultCommand = this.getCommand(DEFAULT_COMMAND_NAME);
    const commandName = command ? command.name : null;

    // Omit keys so we're left with only options.
    const options = omit(parsed, this.resultExcludeKeys(), true);

    // Array of parsed options with truthy values.
    const truthyOptions = keys(options).filter(k => isTruthy(options[k]));

    // Get actionable keys.
    const actionKeys = this.actionKeys();
    const matches = this.utils.arrayMatch(actionKeys, truthyOptions);

    // Check if actionable global option was passed.
    let actionOption = matches[0] ? this.getOption(matches[0]) : null;

    const event = { result: parsed, command: command || defaultCommand };

    let result = parsed;

    // Run before middleware.
    event.result =
      this.middleware
        .runGroup(KawkahMiddlewareGroup.AfterParse)
        .run(parsed, event, this);

    // If not calling for example help, version etc
    // then we need to validate the parsed result.
    if (!actionOption)
      event.result = this.validate(event);


    event.result =
      this.middleware
        .runGroup(KawkahMiddlewareGroup.Finished)
        .run(event.result, event, this);

    if (isError(event.result)) {
      this.error(<KawkahError>event.result);
      return;
    }

    // Middlware/validation done set
    // result to tmpResult.
    result = event.result;

    if (commandName) {

      let actionArgs = [result, this];

      if (command.spread)
        actionArgs = [...result[RESULT_ARGS_KEY], ...actionArgs];

      // Have command but user wants help.
      if (result.help)
        this.showHelp(result[RESULT_COMMAND_KEY]);

      // If command action call it.
      else if (command.action)
        command.action(...actionArgs);

    }

    // An actionable option was passed.
    else if (actionOption) {
      actionOption.action(result, this);
    }

    this.result = result;

    return result;

  }

  /**
   * Gets abort status
   *
   * @param abort bool indicating aborting/exiting.
   */
  abort(): boolean;

  /**
   * Sets abort status.
   *
   * @param abort bool indicating aborting/exiting.
   */
  abort(abort?: boolean): void;

  abort(abort?: boolean) {
    if (!isValue(abort))
      return this._aborting;
    this.assert('.abort()', '<boolean>', [abort]);
    this._aborting = abort;
  }


}
