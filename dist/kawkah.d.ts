import { IKawkahResult, IKawkahGroup, KawkahHelpHandler, KawkahCompletionsHandler, IKawkahCommand, IKawkahOptions, KawkahResultAction, IKawkahCommandInternal, KawkahLogHandler, KawkahThemeKeys, IKawkahTheme, IKawkahOptionInternal, KawkahAction } from './interfaces';
import { KawkahCommandBase } from './base';
import { KawkahCommand } from './command';
export declare class Kawkah extends KawkahCommandBase<Kawkah> {
    constructor();
    constructor(options: IKawkahOptions);
    constructor(usage: string, options?: IKawkahOptions);
    readonly middleware: import("../../../../../../Volumes/DATA/Projects/Apps/kawkah/src/middleware").KawkahMiddleware;
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
    /**
    * Sets a custom log/event handler.
    *
    * @param fn a log/event handler function.
    */
    configLogger(fn?: KawkahLogHandler): this;
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
    /**
     * Creates command with usage tokens or gets existing by name.
     *
     * @param nameOrUsage usage tokens to be parsed.
     */
    command(nameOrUsage: string): KawkahCommand;
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
    /**
     * Gets a group by name.
     *
     * @param name the name of the group to get.
     */
    group(name: any): IKawkahGroup;
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
    /**
     * Adds action for option flag, only available on default command.
     * Command actions when present supersede these callbacks.
     *
     * @example .actionFor('version', (result) => { // do something });
     *
     * @param option the option name to add action to.
     * @param fn the action handler.
     */
    actionFor(option: string, fn: KawkahResultAction): this;
    /**
     * Enables --trace option to enable stacktrace for errors on the fly.
     *
     * @param option the name of the trace option.
     */
    trace(option?: string | boolean): Kawkah;
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
    /**
     * Logs an Error message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    error(message: any, ...args: any[]): Kawkah;
    /**
     * Logs a Warning message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    warning(message: any, ...args: any[]): Kawkah;
    /**
     * Logs a Notify message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    notify(message: any, ...args: any[]): Kawkah;
    /**
     * Logs an OK message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    ok(message: any, ...args: any[]): Kawkah;
    /**
     * Sets a header for help.
     *
     * @param header a string to display as help header.
     * @param align the alignment for the above string.
     */
    header(header: string, align?: 'left' | 'center' | 'right'): this;
    /**
     * Sets a footer for help.
     *
     * @param footer a string to display as help footer.
     * @param align the alignment for the above string.
     */
    footer(footer: string, align?: 'left' | 'center' | 'right'): this;
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
    /**
     * Enforces option descriptions, requires command or option on input and also outputs error on anonymous values.
     *
     * @param eanbled enables/disables strict.
     */
    strict(enabled?: boolean): Kawkah;
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
    /**
     * Returns the parsed result generated from .listen();
     */
    result(): IKawkahResult;
    /**
     * Shows all help or by group name.
     *
     * @param groups optionally specify help groups to be shown.
     */
    showHelp(...groups: string[]): void;
    /**
     * Sets terminate to exit process on help, version and errors.
     *
     * @param eanbled enables/disables terminate.
     */
    terminate(enabled?: boolean): Kawkah;
}
