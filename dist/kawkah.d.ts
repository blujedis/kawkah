import { IKawkahResult, IKawkahGroup, KawkahHelpHandler, KawkahCompletionsHandler, IKawkahCommand, IKawkahOptions, KawkahResultAction, IKawkahCommandInternal, KawkahLogHandler, KawkahThemeKeys, IKawkahTheme, IKawkahOptionInternal, KawkahAction } from './interfaces';
import { KawkahCommandBase } from './base';
import { KawkahCommand } from './command';
export declare class Kawkah extends KawkahCommandBase<Kawkah> {
    constructor(options?: IKawkahOptions);
    constructor(usage: string, options?: IKawkahOptions);
    readonly middleware: import("../../../../../../Volumes/DATA/Projects/Apps/kawkah/src/middleware").KawkahMiddleware;
    readonly configHelp: {
        (): IKawkahOptionInternal;
        (enabled: boolean): IKawkahOptionInternal;
        (fn: KawkahHelpHandler): IKawkahOptionInternal;
        (name: string | string[], fn?: KawkahHelpHandler): IKawkahOptionInternal;
        (name: string | string[], describe: string, fn?: KawkahHelpHandler): IKawkahOptionInternal;
    };
    readonly configVersion: {
        (): IKawkahOptionInternal;
        (version: string): IKawkahOptionInternal;
        (enabled: boolean): IKawkahOptionInternal;
        (options: string[], describe?: string, version?: string): IKawkahOptionInternal;
    };
    readonly configCompletions: {
        (): IKawkahCommandInternal;
        (enabled: boolean): IKawkahCommandInternal;
        (name: string): IKawkahCommandInternal;
        (name: string, fn: KawkahCompletionsHandler): IKawkahCommandInternal;
        (name: string, describe: string, fn?: KawkahCompletionsHandler, template?: string): IKawkahCommandInternal;
    };
    readonly ok: (message: string, ...args: any[]) => void;
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
