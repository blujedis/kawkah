import { KawkahCore } from './core';
import { isBoolean, isString, isObject, isValue } from 'chek';

import { IKawkahResult, IKawkahGroup, KawkahHelpHandler, KawkahCompletionsHandler, IKawkahCommand, IKawkahOptions, KawkahEvent, KawkahResultAction, IKawkahCommandInternal, KawkahLogHandler, KawkahThemeKeys, IKawkahTheme, IKawkahOptionInternal, KawkahAction, KawkahMiddlewareGroup, KawkahMiddlwareHandler, IKawkahMiddleware } from './interfaces';

import { DEFAULT_COMMAND_NAME } from './constants';
import { KawkahCommandBase } from './base';
import { KawkahCommand } from './command';

export class Kawkah extends KawkahCommandBase<Kawkah> {

  constructor(options?: IKawkahOptions);

  constructor(usage: string, options?: IKawkahOptions);

  constructor(usage: string | IKawkahOptions, options?: IKawkahOptions) {
    super(DEFAULT_COMMAND_NAME, <string>usage, options);
  }

  // GETTERS //

  get configureHelp() {
    return this.configHelp;
  }

  get configureVersion() {
    return this.configVersion;
  }

  get configureCompletions() {
    return this.configCompletions;
  }

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
   * Enables help with default options.
   *
   * @example .helpConfig() disables help.
   */
  configHelp(): Kawkah;

  /**
   * Provide a custom callback function to be called on help.
   *
   * @example .helpConfig((result, context) => { // handle help here. });
   *
   * @param fn the help handler called to display help.
   */
  configHelp(fn: KawkahHelpHandler): Kawkah;

  /**
   * Enables/disables help.
   *
   * @example .helpConfig(false) disables help.
   *
   * @param enabled bool indicating if help is enabled.
   */
  configHelp(enabled: boolean): Kawkah;

  /**
   * Provide the option(s) to be used for displaying help.
   *
   * @example .helpConfig('--help').
   * @example .helpConfig(['--help', '--other']).
   *
   * @param options the option(s) to be used for help.
   * @param fn optional custom help handler.
   */
  configHelp(options: string | string[], fn?: KawkahHelpHandler): Kawkah;

  configHelp(options?: string | string[] | boolean | KawkahHelpHandler, fn?: KawkahHelpHandler) {
    this.assert('.configHelp()', '[string|array|boolean|function] [function]', arguments);
    this.core.setHelp(<any>options, fn);
    return this;
  }

  /**
  * Enables version option displaying version from package.json
  */
  configVersion(): Kawkah;

  /**
   * Enables version with custom value.
   *
   * @example .version(1.0.0-alpha);
   *
   * @param version the custom value to display for version option.
   */
  configVersion(version: string): Kawkah;

  /**
   * Enables or disables version option.
   *
   * @example .version(false);
   *
   * @param enabled bool to enable/disable.
   */
  configVersion(enabled: boolean): Kawkah;

  /**
   * Enables version option with custom option names and description.
   *
   * @example .version('ver', 'Display application version.', '1.2.0');
   *
   * @param options the custom option name or names.
   * @param describe a description to be displayed in help.
   * @param version a custom value to be displayed for version.
   */
  configVersion(options: string | string[], describe: string, version?: string);

  configVersion(options?: string | string[] | boolean, describe?: string, version?: string) {
    this.assert('.configVersion()', '[string|array|boolean] [string] [string]', arguments);
    this.core.setVersion(<any>options, describe, version);
    return this;
  }

  /**
   * Adds tab completions to your app using all defaults.
   */
  configCompletions(): Kawkah;

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
  * @example .completions('completions', Function);
  *
  * @param name the name of the completions command.
  * @param handler optional custom handler for building completions.
  */
  configCompletions(name: string, handler: KawkahCompletionsHandler): Kawkah;

  /**
   * Adds tab completions to your app with named completions command, custom description, custom handler and bash script template.
   *
   * @example
   * Function: a custom completions handler function.
   * Template: a custom template for generating completions script.
   * .completions('completions', 'Some description', Function, 'Template')
   *
   * @param name the name of the completions command.
   * @param describe the help description for completions.
   * @param handler optional custom handler for building completions.
   * @param template a custom template for generating completions script.
   */
  configCompletions(name: string, describe: string, handler?: KawkahCompletionsHandler, template?: string): Kawkah;

  configCompletions(name?: string, describe?: string | KawkahCompletionsHandler, fn?: KawkahCompletionsHandler, template?: string) {
    this.assert('.configCompletions()', '[string] [string|function] [function] [string]', arguments);
    this.core.setCompletions(name, <string>describe, fn, template);
    return this;
  }

  /**
  * Sets a custom log/event handler.
  *
  * @param fn a log/event handler function.
  */
  configLogger(fn?: KawkahLogHandler) {
    this.assert('.logger()', '[function]', arguments);
    this.core.setLogHandler(fn);
    return this;
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
   * Creates command with usage tokens.
   *
   * @param usage usage tokens to be parsed.
   */
  command(usage: string): KawkahCommand;

  /**
   * Creates a new command using config object.
   *
   * @param name the command name.
   * @param external the executable path or none to use name.
   */
  command(name: string, external?: boolean): KawkahCommand;

  /**
   * Creates a new command using config object.
   *
   * @param name the command name.
   * @param config the command's configuration object.
   * @param external executable path or none to use name.
   */
  command(name: string, config: IKawkahCommand, external?: string | boolean): KawkahCommand;

  /**
   * Creates a new command from usage tokens & description.
   *
   * @param usage the command usage string to be parsed.
   * @param desribe the description for the command.
   * @param external external command, executable path or true to use name.
   */
  command(usage: string, describe: string, external?: string | boolean): KawkahCommand;

  command(name: string, describe?: string | IKawkahCommand | boolean, external?: string | boolean) {

    this.assert('.command()', '<string> [string|object|boolean] [string|boolean]', arguments);

    let config: IKawkahCommandInternal;

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

    // Set the command.
    const cmd = this.core.setCommand(name, <IKawkahCommandInternal>config);

    // Return command instance.
    return new KawkahCommand(cmd.name, this.core);

  }

  /**
   * Assigns a group to a known command, includes all enabled options as items.
   *
   * @example .group('My Group', 'some_command_name');
   *
   * @param name the name of the group.
   * @param command a known command name.
   * @param isCommand set to true to enable group as a command group.
   */
  group(name: string, command: string, isCommand: true): Kawkah;

  /**
   * Sets a group to enabled or disabled.
   *
   * @example .group('My Group', false);
   *
   * @param name the name of the group.
   * @param enabled a configuration object for the group.
   */
  group(name: string, enabled: boolean): Kawkah;

  /**
  * Assigns items to a group, use dot notation when multple options of same name exit.
  *
  * @example .group('My Group:', 'option1', 'option2');
  * @example .group('My Group:', 'commandName.option1', 'commandName.option2');
  *
  * @param name the name of the group.
  * @param items list of items for the group.
  */
  group(name: string, ...items: string[]): Kawkah;

  /**
   * Sets a group using config object.
   *
   * @example .group('My Group', { //options here });
   *
   * @param name the name of the group.
   * @param config a configuration object for the group.
   */
  group(name: string, config: IKawkahGroup): Kawkah;

  group(name: string, config: string | boolean | IKawkahGroup, isCommand?: string | boolean, ...items: string[]) {
    this.assert('.group()', '<string> <string|boolean|object> [string|boolean] [string...]', arguments);
    this.core.setGroup(name, <any>config, <any>isCommand, ...items);
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
   * Enables catch handler called showing help on errors.
   *
   * @example .catch();
   */
  catch(): Kawkah;

  /**
   * Enables/Disables catch handler called showing help on errors.
   *
   * @example .catch(false);
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
   * @example .parse(['command', '--dir', '/some/dir']);
   * @example .parse(['command', '--dir', '/some/dir'], false);
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
   * @example .listen();
   */
  listen(): IKawkahResult;

  /**
   * Parse arguments and listen for known command actions, show result.
   *
   * @example .listen(true);
   *
   * @param show when true result is output to console helpful when testing.
   */
  listen(show: boolean): IKawkahResult;

  /**
   * Listens for matching commands after parsing arguments.
   *
   * @example .listen(['command', '--dir', '/some/dir']);
   * @example .listen(['command', '--dir', '/some/dir'], true);
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
    this.assert('.exit()', '[boolean]', [enabled]);
    this.core.options.terminate = enabled;
    return this;
  }

}

