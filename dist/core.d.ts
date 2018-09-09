/// <reference types="node" />
import { EventEmitter } from 'events';
import { Tablur, TablurAlign } from 'tablur';
import { ChildProcess, SpawnOptions } from 'child_process';
import { KawkahMiddleware } from './middleware';
import { KawkahUtils } from './utils';
import { IKawkahOptions, IKawkahMap, IKawkahOptionsInternal, IKawkahCommand, IKawkahCommandInternal, KawkahEvent, KawkahHelpHandler, KawkahCompletionsHandler, KawkahAction, IKawkahResult, IKawkahGroup, IKawkahOptionInternal, IKawkahCompletionQuery, KawkahCommandInternalKeys, KawkahOptionInternalKeys, KawkahLogHandler, IKawkahTheme, AnsiStyles, KawkahAnsiType, KawkahThemeKeys, IKawkahMiddlewareEventOption } from './interfaces';
import { KawkahError } from './error';
export declare class KawkahCore extends EventEmitter {
    private _logHandler;
    private _helpHandler;
    private _completionsHandler;
    private _catchHandler;
    private _completionsName;
    private _traceName;
    private _aborting;
    private _header;
    private _footer;
    private _events;
    $0: string;
    commands: IKawkahMap<IKawkahCommandInternal>;
    examples: IKawkahMap<string>;
    middleware: KawkahMiddleware;
    aliases: IKawkahMap<string>;
    groups: IKawkahMap<IKawkahGroup>;
    package: {
        pkg: IKawkahMap<any>;
        path: string;
    };
    result: IKawkahResult;
    options: IKawkahOptionsInternal;
    symbols: {
        error: any;
        warning: any;
        notify: any;
        ok: any;
    };
    utils: KawkahUtils;
    table: Tablur;
    constructor(options?: IKawkahOptions);
    private readonly assert;
    /**
     * Default log handler.
     *
     * @param type the type of message to log.
     * @param message the message to be logged.
     * @param args args used for formatting.
     */
    private handleLog;
    /**
    * Dispatches an error.
    *
    * @param err an error to be dispatched.
    */
    private dispatch;
    /**
     * Handles displaying help.
     *
     * @param groups groups to display help for.
     */
    private handleHelp;
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
    /**
     * Groupify example.
     *
     * @param name the name of the example.
     */
    protected groupifyExamples(command: string, name: string): void;
    /**
     * Adds options to help groups by scheme set in options.
     *
     * @param options the options object to add to help groups.
     */
    protected groupifyChildren(command: IKawkahCommandInternal): void;
    /**
     * Adds command and options to help groups by scheme.
     *
     * @param command the command to be parsed/added to groups.
     */
    protected groupifyCommand(command: IKawkahCommandInternal): void;
    /**
     * Adds collection of commands and options to help groups by scheme.
     *
     * @param commands the commands to iterate and add to help groups.
     */
    protected groupifyCommands(commands?: IKawkahMap<IKawkahCommandInternal>): void;
    /**
     * Gets array of argument option keys.
     *
     * @param command the command name.
     */
    protected argKeys(command: string): string[];
    /**
     * Gets array of flag option keys.
     *
     * @param command the command name.
     */
    protected flagKeys(command: string): string[];
    /**
     * Checks if flag name conflicts with global flag.
     *
     * @param name the name of the flag option.
     */
    protected isDuplicateFlag(command: string, name: string): boolean;
    /**
     * Gets actionable options for a command.
     * Currently only supports default command.
     *
     * @param command the command name or command.
     */
    protected actionKeys(command?: string | IKawkahCommand): any[];
    /**
     * Verifies the option and it's properties are valid.
     *
     * @param option the option to verify as valid.
     * @param command the option's command.
     */
    protected verifyOption(option: IKawkahOptionInternal, command: IKawkahCommandInternal): void;
    /**
     * Normalizes option when option is passed as a
     * string name or type.
     *
     * @param option a string or option object.
     */
    protected toOptionNormalize(option: string | IKawkahOptionInternal, name?: string): IKawkahOptionInternal;
    /**
     * Normalize option ensuring correct values and defaults.
     *
     * @param option the option or name of new option to normalize.
     * @param command the command the option belongs to.
     */
    protected toOption(option: string | IKawkahOptionInternal, command?: IKawkahCommandInternal): IKawkahOptionInternal;
    /**
     * Normalizes command ensuring correct values and defaults.
     *
     * @param command the command to normalize.
     */
    protected toCommand(command: string | IKawkahCommandInternal): IKawkahCommandInternal;
    /**
     * Merge an and option with existing target.
     *
     * @param oldVal the old options object.
     * @param newVal the new options object.
     * @param command the associated command.
     */
    protected mergeOption(oldVal: IKawkahOptionInternal, newVal: IKawkahOptionInternal, command: IKawkahCommandInternal): IKawkahOptionInternal;
    /**
     * Merge command with update source.
     *
     * @param oldVal the old command to merge from.
     * @param newVal the new command to merge to.
     */
    protected mergeCommand(oldVal: IKawkahCommandInternal, newVal: IKawkahCommandInternal): IKawkahCommandInternal;
    /**
     * Command to key finds a corresponding pirmary key from alias.
     *
     * @example .commandToKey('in') returns >> 'install'.
     *
     * @param alias the alias to be mapped to primary command name.
     * @param def a default value if alias is not defined.
     */
    commandAliasToKey(alias: string, def?: string): any;
    /**
     * Iterates a collection of options mapping an alias to the primary key.
     *
     * @param coll the collection of options to inspect.
     * @param key the key or alias to find.
     */
    optionAliasToKey(key: string, coll?: IKawkahMap<IKawkahOptionInternal>): string;
    /**
     * Gets array of keys used to exclude result keys leaving only option keys.
     */
    resultExcludeKeys(): string[];
    /**
    * Exits the process.
    *
    * @param code the exit code if any.
    */
    exit(code?: number): void;
    /**
     * Writes message to output stream with optional wrap.
     *
     * @param message the message to be output.
     * @param wrap when true message is wrapped in new lines.
     */
    write(message?: string, wrap?: boolean): this;
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
    /**
     * Dispatches an error.
     *
     * @param err the error to dispatch.
     */
    error(err: Error | KawkahError): any;
    /**
     * Dispatches an error using a formatted message.
     *
     * @param message the message to be formatted.
     * @param args an array of arguments for formatting.
     */
    error(message: string, ...args: any[]): any;
    /**
     * Dispatches a warning using a formatted message.
     *
     * @param message the message to be formatted.
     * @param args an array of arguments for formatting.
     */
    warning(message: string, ...args: any[]): void;
    /**
     * Dispatches a notification using a formatted message.
     *
     * @param message the message to be formatted.
     * @param args an array of arguments for formatting.
     */
    notify(message: string, ...args: any[]): void;
    /**
    * Dispatches an ok formatted message.
    *
    * @param message the message to be formatted.
    * @param args an array of arguments for formatting.
    */
    ok(message: string, ...args: any[]): void;
    /**
     * Gets or sets the application name overwriting generated value.
     *
     * @param name the name of the application.
     */
    name(name?: string): string;
    /**
     * Spawns a child process.
     *
     * @param command the command to spawn.
     * @param args the arguments to apply to command.
     * @param options the spawn options for the child process.
     */
    spawn(command: string, args?: any[], options?: SpawnOptions): ChildProcess;
    /**
     * Takes a parsed result containing a command and then calls spawn.
     *
     * @param parsed the parsed result.
     * @param close an action callback on child close.
     */
    spawnCommand(parsed: IKawkahResult, close?: KawkahAction): ChildProcess;
    /**
     * Sets the log handler or uses default.
     *
     * @param fn a log handler function.
     */
    setLogHandler(fn?: KawkahLogHandler): void;
    /**
     * Sets the catch handler when no command is found.
     *
     * @param fn the function to use for handling catch.
     */
    setCatchHandler(fn?: string | boolean | KawkahAction, isCommand?: boolean): void;
    /**
     * Calls the catch handler which shows help.
     */
    showCatch(): void;
    /**
     * Gets example for default command.
     *
     * @param name the example name to lookup.
     */
    getExample(name: string): string;
    /**
     * Stores example text.
     *
     * @param name the name of the example.
     * @param text the example text.
     */
    setExample(name: string, text: string): void;
    /**
     * Removes an example from the collection.
     *
     * @param name the name of the example to be removed.
     */
    removeExample(name: string): void;
    /**
     * Reindexes command args setting correct "index" for arg's config.
     *
     * @param command the command to reindex.
     */
    reindexArgs(command: IKawkahCommandInternal): IKawkahCommandInternal;
    /**
     * Gets/builds the usage string.
     *
     * @param command the command to build usage for.
     */
    getUsage(command: IKawkahCommandInternal): string;
    /**
     * Gets a command using it's name or alias.
     *
     * @param name the name of the command or command alias to get.
     * @param def a default command if fails to find primary.
     */
    getCommand(name: string, def?: string): IKawkahCommandInternal;
    /**
     * Sets command using only usage tokens.
     *
     * @param usage the usage tokens for the command.
     */
    setCommand(usage: string): any;
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
    setCommand(command: string, key?: KawkahCommandInternalKeys, val?: any): IKawkahCommandInternal;
    /**
     * Removes a command from the collection.
     *
     * @param command the command to be removed.
     */
    removeCommand(command: string): void;
    /**
     * Checks if command exists in collection.
     *
     * @param command the command name to check.
     */
    hasCommand(command: string): boolean;
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
    setOption(command: string, name: string, key: KawkahOptionInternalKeys, val: any): IKawkahOptionInternal;
    /**
     * Remove an option from a command.
     *
     * @param command the command name.
     * @param name the name of the option to remove.
     */
    removeOption(command: string, name: string): void;
    /**
     * Normalizes namespaces for groups.
     *
     * @description A bit convoluted but makes it much easier for users to create groups.
     *
     * @param name the name to lookup and normalize.
     */
    getGroupNamespace(name: any): {
        ns: any;
        item: any;
    };
    getGroup(name: any, def?: IKawkahGroup): IKawkahGroup;
    /**
     * Sets a group's visibility.
     *
     * @param name the name of the group to be set.
     * @param enabled toggles visibility for the group.
     */
    setGroup(name: string, enabled: boolean): IKawkahGroup;
    /**
     * Sets a group using configuration file.
     *
     * @param name the name of the group to be set.
     * @param config the group's configuration.
     */
    setGroup(name: string, config: IKawkahGroup): IKawkahGroup;
    /**
     * Sets a group's items.
     *
     * @param name the name of the group to be set.
     * @param items array of items to bind to the group.
     */
    setGroup(name: string, ...items: string[]): IKawkahGroup;
    /**
     * Sets group by command binding options or filtered options.
     *
     * @param name the name of the group to be set.
     * @param items array of items to bind to the group.
     * @param include true or array of option keys to include.
     */
    setGroup(name: string, command: string, include: true | string[]): IKawkahGroup;
    /**
     * Removes key from a group's items or all instances of key in any group.
     *
     * @param key the key to be removed from group item(s).
     * @param group the optional group to remove key from.
     */
    removeGroupItem(name: string, group?: string): void;
    /**
     * Removes a group from the collection.
     *
     * @param name the name of the group to be removed.
     */
    removeGroup(name: string): void;
    /**
     * Purges any groups by name and cleans any groups which contain key in items.
     *
     * @param name the name of the group to be removed.
     */
    removeGroupPurge(name: string): void;
    /**
     * Lists groups and their contents.
     *
     * @param names the group names to be listed.
     */
    listGroup(...names: string[]): void;
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
     * @param name the option keys to use for version.
     * @param describe the description for help.
     * @param version a custom value to set version to.
     */
    setVersion(name: string[], describe?: string, version?: string): IKawkahOptionInternal;
    /**
     * When true and --trace is present in args
     * enabled/disable stack tracing for errors.
     *
     * @param trace enables/disables tracing.
     */
    setTrace(option?: string | boolean): void;
    /**
     * Builds help menu by groups, when no groups specified builds default.
     *
     * @param groups the groups to build help for.
     */
    buildHelp(groups: string[]): string[];
    /**
     * Gets help if enabled.
     *
     * @param groups a group or array of group strings.
     */
    getHelp(groups?: string | string[]): string[];
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
     * @param name a string or array of string option names.
     * @param fn optional help handler method for displaying help.
     */
    setHelp(name: string | string[], fn?: KawkahHelpHandler): IKawkahOptionInternal;
    /**
     * Enables help with custom option(s) names with optional help handler.
     *
     * @param name a string or array of string option names.
     * @param describe the description for help option.
     * @param fn optional help handler method for displaying help.
     */
    setHelp(name: string | string[], describe: string, fn?: KawkahHelpHandler): IKawkahOptionInternal;
    /**
     * Calls help handler if enabled.
     *
     * @param groups optional group or groups to show help for.
     */
    showHelp(...groups: string[]): void;
    /**
     * Gets the header.
     */
    getHeader(): [string, TablurAlign];
    /**
     * Sets the header.
     *
     * @param header the header text.
     */
    setHeader(header: string, align?: 'left' | 'center' | 'right'): void;
    /**
     * Gets the footer.
     */
    getFooter(): [string, TablurAlign];
    /**
     * Sets the footer.
     *
     * @param footer the footer text.
     */
    setFooter(footer: string, align?: 'left' | 'center' | 'right'): void;
    /**
     * Sets a theme for styling help.
     *
     * @param theme the theme name or object containing styles.
     */
    setTheme(theme: KawkahThemeKeys | IKawkahTheme): void;
    /**
     * Gets the current help theme object.
     */
    getTheme(): {
        header?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        label?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        title?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        usage?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        alias?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        argument?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        option?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        describe?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        type?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        variadic?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        required?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
        footer?: ("reset" | "bold" | "italic" | "underline" | "inverse" | "dim" | "hidden" | "strikethrough" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright")[];
    };
    /**
     * Gets a completions query from env vars or generated from line.
     *
     * @param line the optional line to build query from.
     */
    getCompletionsQuery(line?: string | string[]): IKawkahCompletionQuery;
    /**
     * Resolves completions returning matches.
     *
     * @param query an object containing the word, point and current line.
     */
    getCompletions(query: IKawkahCompletionQuery): any;
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
    /**
     * Runs validation middleware.
     *
     * @param val the current processed value.
     * @param key the current key.
     * @param event the active event.
     */
    private validateMiddleware;
    /**
     * Validates the event running middleware on the result.
     *
     * @param event the event containing result and command objects.
     */
    validate(event: IKawkahMiddlewareEventOption): IKawkahResult;
    /**
     * Parses arguments using specified args
     * or uses process.argv.
     *
     * @param argv string or arguments to parse.
     */
    parse(argv?: string | string[]): IKawkahResult;
    /**
     * Listens for commands, parses specified
     * args or uses process.argv.
     *
     * @param argv string or array of args.
     */
    listen(argv?: string | string[]): IKawkahResult;
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
}
