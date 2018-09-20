import { isBoolean, isString, isObject, isValue, isFunction } from 'chek';

import { IKawkahResult, IKawkahGroup, KawkahHelpHandler, KawkahCompletionsHandler, IKawkahCommand, IKawkahOptions, KawkahResultAction, IKawkahCommandInternal, KawkahLogHandler, KawkahThemeKeys, IKawkahTheme, IKawkahOptionInternal, KawkahAction, KawkahOptionType, IKawkahOption } from './interfaces';

import { DEFAULT_COMMAND_NAME } from './constants';
import { KawkahCommandBase } from './base';
import { KawkahCommand } from './command';

export class Kawkah extends KawkahCommandBase<Kawkah> {

  constructor();

  constructor(options: IKawkahOptions);

  constructor(usage: string, options?: IKawkahOptions);

  constructor(usage?: string | IKawkahOptions, options?: IKawkahOptions) {
    super(DEFAULT_COMMAND_NAME, <string>usage, options);
  }

  // GETTERS //

  get middleware() {
    return this.core.middleware;
  }

  // CONFIGURATION & CONTEXT //

  /**
   * Gets the current command's context.
   */
  context(): IKawkahCommandInternal;

  /**
  * Gets the specified command's context.
  *
  * @param name the command name to get config object for.
  */
  context(name: string): IKawkahCommandInternal;

  context(name?: string) {
    if (name)
      return this.core.getCommand(name);
    return this._command;
  }

  /**
   * Gets an option context on the current command.
   *
   * @param name the name of the flag or arg option.
   */
  contextFor(name: string): IKawkahOptionInternal;

  /**
   * Gets an option context on the specified command.
   *
   * @param name the name of the flag or arg option.
   * @param command the option's command name.
   */
  contextFor(name: string, command: string): IKawkahOptionInternal;

  contextFor(name: string, command?: string) {
    name = this.utils.stripTokens(name);
    return this.core.getOption(command || this._name, name);
  }

  /**
   * Sets version option with all defaults.
   */
  configVersion(): Kawkah;

  /**
   * Sets version with custom version value.
   *
   * @example .setVersion('1.2.6-alpha');
   *
   * @param version the value to set version to.
   */
  configVersion(version: string): Kawkah;

  /**
   * Enables or disables version.
   *
   * @example .setVersion(false);
   *
   * @param enabled bool value to enable/disable version.
   */
  configVersion(enabled: boolean): Kawkah;

  /**
   * Sets version with custom option keys with description and custom version.
   *
   * @param name the option keys to use for version.
   * @param describe the description for help.
   * @param version a custom value to set version to.
   */
  configVersion(name: string[], describe?: string, version?: string): Kawkah;

  configVersion(name: string | string[] | boolean = true, describe?: string, version?: string) {
    this.assert('.configVersion()', '<string|array|boolean> [string] [string]', [name, describe, version]);
    this.core.setVersion(<any>name, describe, version);
    return this;
  }

  /**
  * Enables help with defaults.
  */
  configHelp(): Kawkah;

  /**
  * Toggles help option enabled or disabled.
  *
  * @param enabled bool value to enable/disable help.
  */
  configHelp(enabled: boolean): Kawkah;

  /**
   * Enables help with default option using custom help handler.
   *
   * @param fn help handler callback function.
   */
  configHelp(fn: KawkahHelpHandler): Kawkah;

  /**
   * Enables help with custom option(s) names with optional help handler.
   *
   * @param name a string or array of string option names.
   * @param fn optional help handler method for displaying help.
   */
  configHelp(name: string | string[], fn?: KawkahHelpHandler): Kawkah;

  /**
   * Enables help with custom option(s) names with optional help handler.
   *
   * @param name a string or array of string option names.
   * @param describe the description for help option.
   * @param fn optional help handler method for displaying help.
   */
  configHelp(name: string | string[], describe: string, fn?: KawkahHelpHandler): Kawkah;

  configHelp(name: string | string[] | boolean | KawkahHelpHandler = true, describe?: string | KawkahHelpHandler, fn?: KawkahHelpHandler) {
    this.assert('.configHelp()', '<string|array|boolean|function> [string|function] [function]', [name, describe, fn]);
    this.core.setHelp(<any>name, <any>describe, fn);
    return this;
  }

  /**
   * Adds tab completions to your app using all defaults.
   */
  configCompletions(): Kawkah;

  /**
   * Adds tab completions with defaults or disables.
   *
   * @example .completions(false);
   *
   * @param enabled enables with defaults or disables completions.
   */
  configCompletions(enabled: boolean): Kawkah;

  /**
   * Adds tab completions to app with custom name.
   *
   * @example .completions('completions');
   *
   * @param name the name of the completions command.
   */
  configCompletions(name: string): Kawkah;

  /**
  * Adds tab completions to app with name and custom handler function for generating completions.
  *
  * @example .completions('completions', HandlerFunction);
  *
  * @param name the name of the completions command.
  * @param fn optional custom handler for building completions.
  */
  configCompletions(name: string, fn: KawkahCompletionsHandler): Kawkah;

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
  configCompletions(name: string, describe: string, fn?: KawkahCompletionsHandler, template?: string): Kawkah;

  configCompletions(name?: string | boolean, describe?: string | KawkahCompletionsHandler, fn?: KawkahCompletionsHandler, template?: string) {
    this.assert('.configCompletions()', '[string|boolean] [string|function] [function] [string]', arguments);
    this.core.setCompletions(<any>name, <any>describe, fn, template);
    return this;
  }

  /**
  * Sets a custom log/event handler.
  *
  * @param fn a log/event handler function.
  */
  configLogger(fn?: KawkahLogHandler) {
    this.assert('.configLogger()', '[function]', arguments);
    this.core.setLogHandler(fn);
    return this;
  }

  configMemo(name: string | string[] | boolean = true, describe?: string) {
    this.assert('.configMemo()', '<string|array|boolean> [string]', [name, describe]);
    this.core.setMemo(<any>name, describe);
  }

  // API //

  /**
   * Sets the name of your cli app.
   */
  name(): string;

  /**
   * Sets the name of your cli app.
   *
   * @param name the app name.
   */
  name(name: string): Kawkah;

  name(name?: string): Kawkah | string {
    this.assert('.name()', '[string]', arguments);
    if (!name)
      return this.core.$0;
    this.core.name(name);
    return this;
  }

  /**
   * Creates command with usage tokens or gets existing by name.
   *
   * @param nameOrUsage usage tokens to be parsed.
   */
  command(nameOrUsage: string): KawkahCommand;

  /**
  * Creates a new command from name & description.
  *
  * @param name the command name.
  * @param desribe the description for the command.
  */
  command(name: string, describe: string): KawkahCommand;

  /**
   * Creates a new command as external command.
   *
   * @param name the command name.
   * @param external the executable path or true to use name.
   */
  command(name: string, external: boolean): KawkahCommand;

  /**
   * Creates a new command with action.
   *
   * @param name the command name.
   * @param action the action to call on command matched.
   */
  command(name: string, action: KawkahAction): KawkahCommand;

  /**
   * Creates a new command using config object.
   *
   * @param name the command name.
   * @param config the command's configuration object.
   */
  command(name: string, config: IKawkahCommand): KawkahCommand;

  /**
   * Creates a new command from name and action.
   *
   * @param name the command name.
   * @param action the action to execute on matched command.
   */
  command(name: string, describe: string, action: KawkahAction): KawkahCommand;

  /**
   * Creates a new command from name, description as external command.
   *
   * @param name the command name.
   * @param desribe the description for the command.
   * @param external external command, executable path or true to use name.
   */
  command(name: string, describe: string, external: string | boolean): KawkahCommand;

  /**
   * Creates a new command from name, description and action.
   *
   * @param name the command name.
   * @param desribe the description for the command.
   * @param action the action to execute on matched command.
   */
  command(name: string, describe: string, external: string | boolean, action: KawkahAction): KawkahCommand;

  command(name: string, describe?: string | IKawkahCommand | boolean | KawkahAction, external?: string | boolean | KawkahAction, action?: KawkahAction) {

    this.assert('.command()', '<string> [string|object|boolean|function] [string|boolean|function]', arguments);

    // If just name was passed try to load existing command.
    // Otherwise continue and create the command.
    if (arguments.length === 1 && !this.utils.hasTokens(name)) {
      if (this.core.hasCommand(name))
        return new KawkahCommand(name, this.core);
    }

    let config: IKawkahCommandInternal;


    if (isFunction(describe)) {
      action = <KawkahAction>describe;
      describe = undefined;
    }

    if (isFunction(external)) {
      action = <KawkahAction>external;
      external = undefined;
    }

    if (isBoolean(describe)) {
      external = <boolean>describe;
      describe = undefined;
    }

    // User passed usage tokens.
    else if (isString(describe)) {

      config = {
        describe: <string>describe
      };

    }

    else if (isObject(describe)) {
      config = <IKawkahCommandInternal>describe;
    }

    config = config || {};
    config.external = <any>external;

    if (action)
      config.action = action;

    // Set the command.
    const cmd = this.core.setCommand(name, <IKawkahCommandInternal>config);

    // Return command instance.
    return new KawkahCommand(cmd.name, this.core);

  }

  /**
   * Gets a group by name.
   *
   * @param name the name of the group to get.
   */
  group(name): IKawkahGroup;

  /**
   * Sets a group to enabled or disabled.
   *
   * @example .group('My Group', false);
   *
   * @param name the name of the group.
   * @param enabled enable/disable the group.
   */
  group(name: string, enabled: boolean): Kawkah;

  /**
  * Assigns items to a group.
  *
  * @param name the name of the group.
  * @param items list of items for the group.
  */
  group(name: string, ...items: string[]): Kawkah;

  /**
   * Sets a group using config object.
   *
   * @example .group('My Group', { // group options here });
   *
   * @param name the name of the group.
   * @param config a configuration object for the group.
   */
  group(name: string, config: IKawkahGroup): Kawkah;

  /**
   * Sets group by command binding options or filtered options.
   *
   * @param name the name of the group to be set.
   * @param items array of items to bind to the group.
   * @param include true or array of option keys to include.
   */
  group(name: string, command: string, include: true | string[]): IKawkahGroup;

  group(name: string, config?: string | boolean | IKawkahGroup, all?: string | boolean | string[], ...items: string[]): Kawkah | IKawkahGroup {
    this.assert('.group()', '<string> [string|boolean|object] [string|boolean|array] [string...]', arguments);
    if (!isValue(config))
      return this.core.getGroup(name);
    this.core.setGroup(name, <any>config, <any>all, ...items);
    return this;
  }

  /**
   * Adds action for option flag, only available on default command.
   * Command actions when present supersede these callbacks.
   *
   * @example .actionFor('version', (result) => { // do something });
   *
   * @param option the option name to add action to.
   * @param fn the action handler.
   */
  actionFor(option: string, fn: KawkahResultAction) {
    this.assert('.actionFor()', '<string> [function]', arguments);
    this.core.setOption(this._name, option, 'action', fn);
    return this;
  }

  /**
   * Enables --trace option to enable stacktrace for errors on the fly.
   *
   * @param option the name of the trace option.
   */
  trace(option?: string | boolean): Kawkah {
    this.core.setTrace(option);
    return this;
  }

  /**
   * Logs an empty line.
   */
  log(): Kawkah;

  /**
   * Logs an error.
   *
   * @param err the error to be logged.
   */
  log(err: Error): Kawkah;

  /**
   * Logs a message with optional formatting.
   *
   * @param message a message to be logged.
   * @param args rest param of arguments used in formatting.
   */
  log(message: any, ...args: any[]): Kawkah;

  log(message?: any, ...args: any[]): Kawkah {
    this.core.log(message, ...args);
    return this;
  }

  /**
   * Logs an Error message.
   *
   * @param message a message to be logged.
   * @param args optional format arguments.
   */
  error(message: any, ...args: any[]): Kawkah {
    this.core.error(message, ...args);
    return this;
  }

  /**
   * Logs a Warning message.
   *
   * @param message a message to be logged.
   * @param args optional format arguments.
   */
  warning(message: any, ...args: any[]): Kawkah {
    this.core.warning(message, ...args);
    return this;
  }

  /**
   * Logs a Notify message.
   *
   * @param message a message to be logged.
   * @param args optional format arguments.
   */
  notify(message: any, ...args: any[]): Kawkah {
    this.core.notify(message, ...args);
    return this;
  }

  /**
   * Logs an OK message.
   *
   * @param message a message to be logged.
   * @param args optional format arguments.
   */
  ok(message: any, ...args: any[]): Kawkah {
    this.core.ok(message, ...args);
    return this;
  }

  /**
   * Sets a header for help.
   *
   * @param header a string to display as help header.
   * @param align the alignment for the above string.
   */
  header(header: string, align?: 'left' | 'center' | 'right') {
    this.assert('.header()', '<string> [string]', arguments);
    this.core.setHeader(header, align);
    return this;
  }

  /**
   * Sets a footer for help.
   *
   * @param footer a string to display as help footer.
   * @param align the alignment for the above string.
   */
  footer(footer: string, align?: 'left' | 'center' | 'right') {
    this.assert('.footer()', '<string> [string]', arguments);
    this.core.setFooter(footer, align);
    return this;
  }

  /**
   * Gets a theme for help.
   */
  theme(): IKawkahTheme;

  /**
   * Sets the theme for help.
   *
   * @param theme the theme name or object containing styles.
   */
  theme(theme: KawkahThemeKeys | IKawkahTheme): Kawkah;

  theme(theme?: KawkahThemeKeys | IKawkahTheme): Kawkah | IKawkahTheme {
    if (!theme)
      return this.core.getTheme();
    this.assert('.theme()', '<string|object>', arguments);
    this.core.setTheme(theme);
    return this;
  }

  /**
   * Gets the current locale.
   */
  locale(): string;

  /**
   * Sets the locale.
   *
   * @param locale the locale used for messaging.
   */
  locale(locale: string): Kawkah;

  locale(locale?: string): string | Kawkah {
    if (!locale)
      return this.core.options.locale;
    this.assert('.locale()', '[string]', arguments);
    this.core.options.locale = locale;
    return this;
  }

  /**
   * Enforces option descriptions, requires command or option on input and also outputs error on anonymous values.
   *
   * @param eanbled enables/disables strict.
   */
  strict(enabled: boolean = true): Kawkah {
    this.assert('.strict()', '<boolean>', [enabled]);
    this.core.options.strict = enabled;
    return this;
  }

  /**
   * Enables catch handler called showing help on errors.
   *
   * @example .catch();
   */
  catch(): Kawkah;

  /**
   * Enables/Disables catch handler called showing help on errors.
   *
   * @example
   * .catch(false);
   *
   * @param enabled boolean value to enable or disable handler.›
   */
  catch(enabled: boolean): Kawkah;

  /**
   * Enables catch handler with custom string on errors.
   *
   * @param text the string to be displayed.
   */
  catch(text: string): Kawkah;

  /**
   * A Kawkah callback action to be called when no command is found.
   *
   * @example .catch((result, context) => { // do something on no command/option });
   *
   * @param fn an action method to be called.
   */
  catch(fn: KawkahAction): Kawkah;

  /**
   * Enables catch handler on errors calling an existing command.
   *
   * @example .catch('some_known_command_name', true);
   *
   * @param command an existing command name.
   * @param isCommand indicates should lookup as a command name.
   */
  catch(command: string, isCommand: boolean): Kawkah;

  catch(fn: string | boolean | KawkahAction = true, isCommand: boolean = false): Kawkah {
    this.assert('.catch()', '<string|boolean|function> <boolean>', [fn, isCommand]);
    this.core.setCatchHandler(fn, isCommand);
    return this;
  }

  /**
   * Parses process.argv arguments with validation enabled.
   *
   * @example .parse();
   */
  parse(): IKawkahResult;

  /**
   * Parses specified arguments optionally enabling or disabling validation.
   *
   * @example
   * .parse(['command', '--dir', '/some/dir']);
   * .parse(['command', '--dir', '/some/dir'], false);
   *
   *
   * @param argv the arguments to be parsed.
   * @param validate whether to validate the parsed arguments.
   */
  parse(argv: string | string[]): IKawkahResult;

  parse(argv?: string | string[]): IKawkahResult {
    this.assert('.parse()', '[string|array]', arguments);
    return this.core.parse(<any>argv);
  }

  /**
   * Parse arguments and listen for known command actions.
   *
   * @example
   * .listen();
   */
  listen(): IKawkahResult;

  /**
   * Parse arguments and listen for known command actions, show result.
   *
   * @example
   * .listen(true);
   *
   * @param show when true result is output to console helpful when testing.
   */
  listen(show: boolean): IKawkahResult;

  /**
   * Listens for matching commands after parsing arguments.
   *
   * @example
   * .listen(['command', '--dir', '/some/dir']);
   * .listen(['command', '--dir', '/some/dir'], true);
   *
   * @param argv the optional arguments to be parsed.
   * @param show when true result is output to console helpful when testing.
   */
  listen(argv: string | string[], show?: boolean): IKawkahResult;

  listen(argv?: string | string[] | boolean, show?: boolean) {
    this.assert('.listen()', '[string|array|boolean] [boolean]', arguments);
    if (isBoolean(argv)) {
      show = <boolean>argv;
      argv = undefined;
    }
    const result = this.core.listen(<any>argv);
    if (this.core.abort())
      return;
    if (show)
      this.log(result);
    return result;
  }

  /**
   * Returns the parsed result generated from .listen();
   */
  result() {
    return this.core.result;
  }

  /**
   * Shows all help or by group name.
   *
   * @param groups optionally specify help groups to be shown.
   */
  showHelp(...groups: string[]) {
    this.core.showHelp(...groups);
  }

  /**
   * Sets terminate to exit process on help, version and errors.
   *
   * @param eanbled enables/disables terminate.
   */
  terminate(enabled: boolean = true): Kawkah {
    this.assert('.terminate()', '<boolean>', [enabled]);
    this.core.options.terminate = enabled;
    return this;
  }

  /**
   * Exits Kawkah.
   * 
   * @param code the process exit code.
   */
  exit(code: number = 0) {
    this.core.exit(code);
  }

}