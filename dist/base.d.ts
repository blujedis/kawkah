/// <reference types="node" />
import { KawkahCore } from './core';
import { SpawnOptions } from 'child_process';
import { KawkahHandler, IKawkahOption, KawkahOptionType, IKawkahOptionInternal, IKawkahValidateConfig, KawkahValidateHandler, KawkahAction, IKawkahResult, IKawkahMap, IKawkahOptions, KawkahResultAction, IKawkahCommandInternal } from './interfaces';
export declare class KawkahCommandBase<T> {
    protected _name: string;
    core: KawkahCore;
    constructor(name: string, core?: KawkahCore);
    constructor(name: string, options?: IKawkahOptions);
    constructor(name: string, usage: string, core?: KawkahCore);
    constructor(name: string, usage: string, options?: IKawkahOptions);
    protected readonly _command: IKawkahCommandInternal;
    /**
     * Creates option flag or option arg.
     *
     * NOTE: if tokens are passed the name is parsed in this
     * case --user.name will be seen as user with alias name
     * when not using tokens e.g. user.name it is seen as a
     * named config for a nested property.
     *
     * @param name the flag/arg name or tokens.
     * @param describe the description or config object.
     * @param type the option's type.
     * @param def the option's default value.
     * @param arg indicates we are creating an arg.
     */
    protected _option(name: string, describe: string | IKawkahOption, type: KawkahOptionType, def: any, argOrAction?: boolean | KawkahResultAction): T & KawkahCommandBase<T>;
    protected readonly utils: import("./utils").KawkahUtils;
    protected readonly assert: {
        (map: string, values?: object | any[], validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
        (name: string, map: string, values?: object | any[], validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
        (map: string, values?: object | any[], len?: number, validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
        (name: string, map: string, values?: object | any[], len?: number, validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
    };
    /**
     * Gets the command config object.
     */
    context(): IKawkahCommandInternal;
    /**
     * Gets a configuration for a flag or arg option on this command.
     *
     * @param name the name of the flag or arg option.
     */
    contextFor(name: string): IKawkahOptionInternal;
    /**
     * Adds an argument by parsable tokens.
     *
     * @param tokens the token to be parsed as an argument.
     */
    arg(tokens: string): T & KawkahCommandBase<T>;
    /**
     * Adds an argument to command using config object.
     *
     * @param name the name of the argument to create.
     * @param config the option configuration object.
     */
    arg(name: string, config: IKawkahOption): T & KawkahCommandBase<T>;
    /**
     * Adds an argument to the command.
     *
     * @param name the argument name.
     * @param describe the description for the argument.
     * @param type the argument's type.
     * @param def a default value.
     */
    arg(name: string, describe: string, type?: KawkahOptionType, def?: any): T & KawkahCommandBase<T>;
    /**
     * Adds multiple args to command from a string of arguments.
     *
     * @example .args('<name> [directory] [other]');
     *
     * @param args array of args to add for command.
     */
    args(arg: string): T & KawkahCommandBase<T>;
    /**
     * Adds multiple args to command from an array.
     *
     * @example .args('<name>', '[directory]', ...);
     *
     * @param args array of args to add for command.
     */
    args(...args: string[]): T & KawkahCommandBase<T>;
    /**
     * Adds a flag by parsable tokens.
     *
     * @param tokens the token to be parsed as flag option.
     */
    flag(tokens: string): T & KawkahCommandBase<T>;
    /**
     * Adds a flag to command using config object.
     *
     * @param name the name of the option to create.
     * @param config the option configuration object.
     */
    flag(name: string, config: IKawkahOption): T & KawkahCommandBase<T>;
    /**
    * Adds a flag to the command.
    *
    * @param name the name of the option.
    * @param describe the description for the option.
    */
    flag(name: string, describe: string): T & KawkahCommandBase<T>;
    /**
    * Adds a flag to the command.
    *
    * @param name the name of the option.
    * @param describe the description for the option.
    * @param action an action to call on flag option. (Default Command ONlY)
    */
    flag(name: string, describe: string, action: KawkahResultAction): T & KawkahCommandBase<T>;
    /**
     * Adds a flag to the command.
     *
     * @param name the name of the option.
     * @param describe the description for the option.
     * @param type the option's type.
     * @param action an action to call on flag option. (Default Command ONlY)
     */
    flag(name: string, describe: string, type: KawkahOptionType, action?: KawkahResultAction): T & KawkahCommandBase<T>;
    /**
     * Adds a flag to the command.
     *
     * @param name the name of the option.
     * @param describe the description for the option.
     * @param type the option's type.
     * @param def a default value.
     * @param action an action to call on flag option. (Default Command ONlY)
     */
    flag(name: string, describe: string, type: KawkahOptionType, def?: any, action?: KawkahResultAction): T & KawkahCommandBase<T>;
    /**
     * Adds multiple args to command from an array.
     *
     * @example
     * .flags('force', 'status', ...);
     * .flags('--tags [string]', '--age [number]');
     *
     * @param args array of args to add for command.
     */
    flags(...flags: string[]): T & KawkahCommandBase<T>;
    /**
     * Adds multiple options using map of key and KawkahOption objects.
     * To specify an argument option set "index" to -1.
     *
     * @example
     * .options({ name: { type: 'string' } });
     * .options({ path: { type: 'string', index: true } });
     *
     * @param options object of KawkahOptions.
     */
    options(options: IKawkahMap<IKawkahOption>): T & KawkahCommandBase<T>;
    /**
     * Adds or updates the command's description.
     *
     * @param describe the command description.
     */
    describe(describe: string): T & KawkahCommandBase<T>;
    /**
     * Adds alias to command.
     *
     * @param alias string or array of string aliases.
     */
    alias(...alias: string[]): T & KawkahCommandBase<T>;
    /**
     * Toggles spreading action args in positional order, missing args are null.
     *
     * @example { _: ['file', 'dir', null ]} >> .action(file, dir, null, result) {}
     *
     * @param spread bool value indicating if should spread args.
     */
    spread(spread?: boolean): T & KawkahCommandBase<T>;
    /**
     * The minimum args allowed for the command.
     *
     * @example .minArgs(2);
     *
     * @param count the count number.
     */
    minArgs(count: number): this;
    /**
     * The maximum args allowed for the command.
     *
     * @example .maxArgs(2);
     *
     * @param count the count number.
     */
    maxArgs(count: number): this;
    /**
      * The minimum flags allowed for the command.
      *
      * @example .minFlags(2);
      *
      * @param count the count number.
      */
    minFlags(count: number): this;
    /**
      * The maximum flags allowed for the command.
      *
      * @example .maxFlags(2);
      *
      * @param count the count number.
      */
    maxFlags(count: number): this;
    /**
     * Enables validation skip for this command.
     */
    skip(): T & KawkahCommandBase<T>;
    /**
     * Skips all validation for this command.
     *
     * @param enabled bool value to enable/disable.
     */
    skip(enabled: boolean): T & KawkahCommandBase<T>;
    /**
      * Enables help for this command using defaults.
      *
      * @example .commandHelp();
      */
    help(): T & KawkahCommandBase<T>;
    /**
     * Enables command help by specifying custom help text overrides child help.
     *
     * @example .commandHelp('my custom help text.');
     *
     * @param text a custom help string to display for this command.
     */
    help(text: string): T & KawkahCommandBase<T>;
    /**
     * Enables or disables command help overrides child help.
     *
     * @example .help(false);
     *
     * @param enabled enables/disables help for this option.
     */
    help(enabled: boolean): T & KawkahCommandBase<T>;
    /**
     * Enables help by specifying custom help text, optionally sets help for option.
     * Passes the current command and instance, overrides child help.
     *
     * @example .help((cmd, instance) => { return 'my custom help text.' }));
     *
     * @param fn synchronous function for generating help.
     */
    help(fn: KawkahHandler): T & KawkahCommandBase<T>;
    /**
     * When true injects -- abort arg resulting in all
     * arguments being added to result.__
     *
     * @param enabled enables/disables abort for command.
     */
    abort(enabled?: boolean): T & KawkahCommandBase<T>;
    /**
     * Sets command as an external command using existing command name.
     */
    external(): T & KawkahCommandBase<T>;
    /**
     * Sets command in path as an external command.
     *
     * @example .external('ls');
     *
     * @param command an external command to assign this command to.
     */
    external(command: string): T & KawkahCommandBase<T>;
    /**
     * Sets command using existing command name as an external command with spawn options.
     *
     * @param options spawn options to use when spawning command.
     */
    external(options: SpawnOptions): T & KawkahCommandBase<T>;
    /**
     * Sets command as an external command using specified command in path with options.
     *
     * @param command an external command in path to assign this command to.
     * @param options spawn options to use when spawning command.
     */
    external(command: string, options: SpawnOptions): T & KawkahCommandBase<T>;
    /**
     * Binds an action to be called when parsed command or alias is matched.
     *
     * @example .action((result, context) => { do something });
     * @example .action((arg1..., result, context) => { do something }); (spread enabled)
     *
     * @param fn the callback action.
     */
    action(fn: KawkahAction): T & KawkahCommandBase<T>;
    /**
     * Executes a command's action handler manually.
     *
     * @param command the command to execute.
     * @param result a parsed result to pass to command action.
     */
    exec(result?: IKawkahResult): any;
    /**
    * Creates example for command.
    *
    * @example
    * kawkah.example('My global example');
    * kawkah.command('mycommand').example('My command specific example');
    *
    * @param text the example text.
    */
    example(text: string): T & KawkahCommandBase<T>;
    /**
    * Creates example using namespace.
    *
    * @example
    * kawkah.example('commandName.exampleName', 'My example');
    * kawkah.example('anyName.exampleName', 'My example');
    *
    * @param name assign namespace to example.
    * @param text the example text.
    */
    example(name: string, text: string): T & KawkahCommandBase<T>;
    /**
    * Creates long description memo for the command.
    *
    * @param text the text to be displayed for the memo.
    */
    memo(text: string): T & KawkahCommandBase<T>;
    /**
     * Sets the type for an option.
     *
     * @param name the option name to be set.
     * @param type the type to be set.
     */
    typeFor(name: string, type: KawkahOptionType): T & KawkahCommandBase<T>;
    /**
     * Assigns option keys as type of string.
     *
     * @param names the option keys to assign.
     */
    stringFor(...names: string[]): T & KawkahCommandBase<T>;
    /**
     * Assigns option keys as type of boolean.
     *
     * @param names the option keys to assign.
     */
    booleanFor(...names: string[]): T & KawkahCommandBase<T>;
    /**
     * Assigns option keys as type of number.
     *
     * @param names the option keys to assign.
     */
    numberFor(...names: string[]): T & KawkahCommandBase<T>;
    /**
     * Assigns option keys as type of array.
     *
     * @param names the option keys to assign.
     */
    arrayFor(...names: string[]): T & KawkahCommandBase<T>;
    /**
     * Adds alias(s) option by key.
     *
     * @param name the option key name.
     * @param alias the aliases to be added.
     */
    aliasFor(name: string, ...alias: string[]): T & KawkahCommandBase<T>;
    /**
    * Sets a description for the specified option.
    *
    * @param name the option key name.
    * @param describe the option's description
    */
    describeFor(name: string, describe: string): T & KawkahCommandBase<T>;
    /**
    * Sets demands for the specified option.
    *
    * @example .demand('username', 'password', ...);
    *
    * @param name the option key name.
    * @param demand rest array of keys to demand.
    */
    demandFor(name: string, ...demand: string[]): T & KawkahCommandBase<T>;
    /**
     * Sets demands when matches handler criteria
     *
     * @example .demand('username', ['password', 'email'], function validator(v) { return true });
     *
     * @param name the option key name.
     * @param demand array of keys to demand.
     * @param handler handler that returns if should demand keys.
     */
    demandFor(name: string, demand: string[], handler: RegExp | KawkahValidateHandler): T & KawkahCommandBase<T>;
    /**
     * Sets demands when matches handler criteria
     *
     * @example .demand('username', ['password', 'email'], 1, function validator(v) { return true });
     *
     * @param name the option key name.
     * @param demand array of keys to demand.
     * @param match indicates how many keys should be demanded, 0 for all.
     * @param handler handler that returns if should demand keys.
     */
    demandFor(name: string, demand: string[], match: number, handler: RegExp | KawkahValidateHandler): T & KawkahCommandBase<T>;
    /**
    * Sets deny for the specified option.
    *
    * @example .deny('username', 'password', ...);
    *
    * @param name the option key name.
    * @param deny rest array of keys to deny.
    */
    denyFor(name: string, ...deny: string[]): T & KawkahCommandBase<T>;
    /**
     * Sets deny when matches handler criteria
     *
     * @example .demand('username', ['password', 'email'], function validator(v) { return true });
     *
     * @param name the option key name.
     * @param deny array of keys to deny.
     * @param handler handler that returns if should deny keys.
     */
    denyFor(name: string, deny: string[], handler: RegExp | KawkahValidateHandler): T & KawkahCommandBase<T>;
    /**
     * Sets deny when matches handler criteria
     *
     * @example .deny('username', ['password', 'email'], 1, function validator(v) { return true });
     *
     * @param name the option key name.
     * @param deny array of keys to deny.
     * @param match indicates how many keys should be denied, 0 for all.
     * @param handler handler that returns if should deny keys.
     */
    denyFor(name: string, deny: string[], match: number, handler: RegExp | KawkahValidateHandler): T & KawkahCommandBase<T>;
    /**
     * Sets a default value for the specified option.
     *
     * @example .default('theme', 'dark');
     *
     * @param name the option key name.
     * @param def a default value.
     */
    defaultFor(name: string, def: any): T & KawkahCommandBase<T>;
    /**
     * Sets specified option as required.
     *
     * @example .required('password', true);
     *
     * @param name the option key name.
     * @param required enable/disable required option.
     */
    requiredFor(name: string, required?: boolean): T & KawkahCommandBase<T>;
    /**
     * Adds coercion method for option.
     *
     * @param name the name of the option.
     * @param fn a coerce handler function.
     */
    coerceFor(name: string, fn: KawkahHandler): T & KawkahCommandBase<T>;
    /**
     * Sets validation for option using RegExp.
     *
     * @example .validate('value', /^value$/);
     *
     * @param name the option key name.
     * @param exp regular expression to validate with.
     */
    validateFor(name: string, exp: RegExp): T & KawkahCommandBase<T>;
    /**
     * Sets validation for option using config object.
     *
     * @example
     * .validate('value', { message: 'error message', handler: RegExp or Function });
     *
     * @param name the option key name.
     * @param exp regular expression to validate with.
     */
    validateFor(name: string, obj: IKawkahValidateConfig): T & KawkahCommandBase<T>;
    /**
    * Sets validation for option using function.
    *
    * @example
    * .validate('value', (val) => { // return if valid } );
    *
    * @param name the option key name.
    * @param fn function used to validate result.
    */
    validateFor(name: string, fn: KawkahValidateHandler): T & KawkahCommandBase<T>;
    /**
     * Sets argument as variadic.
     *
     * @example .variadic('tags');
     *
     * @param name the option key name.
     */
    variadicFor(name: string): T & KawkahCommandBase<T>;
    /**
     * Sets argument as variadic by boolean or count of args.
     *
     * @example .variadic('tags', 2);
     *
     * @param name the option key name.
     * @param value boolean or a count of args.
     */
    variadicFor(name: string, value: boolean | number): T & KawkahCommandBase<T>;
    /**
     * Enables help by specifying custom help text.
     *
     * @example .help('my_key', my custom help text.');
     *
     * @param name the option key to bind to.
     * @param text a custom help string to display for this option.
     */
    helpFor(name: string, text: string): T & KawkahCommandBase<T>;
    /**
     * Enables or disables help for the specifed option.
     *
     * @example .help('my_key', false);
     *
     * @param name the option key to bind to.
     * @param enabled enables/disables help for this option.
     */
    helpFor(name: string, enabled: boolean): T & KawkahCommandBase<T>;
    /**
     * Enables help by specifying custom help text, optionally sets help for option.
     *
     * @example .help('my_key', () => { return 'my custom help text.' }));
     *
     * @param name the option key to bind to.
     * @param fn synchronous function for generating help.
     */
    helpFor(name: string, fn: KawkahHandler): T & KawkahCommandBase<T>;
    /**
     * Sets custom completions for the specified option.
     *
     * @example .completions('theme', 'light', 'dark', 'contrast');
     *
     * @param name the option key name.
     * @param completions array of completion values.
     */
    completionsFor(name: string, ...completions: string[]): T & KawkahCommandBase<T>;
    /**
     * Loads a config at the parsed path specified in arguments.
     *
     * @param option the name of the option key.
     */
    extendFor(option: string): T & KawkahCommandBase<T>;
    /**
     * Gets specific keys from loaded config.
     *
     * @example .extendFor('conf', ['name', 'version', 'author']);
     *
     * @param option the name of the option key.
     * @param keys specific keys to get on load.
     */
    extendFor(option: string, ...keys: string[]): T & KawkahCommandBase<T>;
    /**
     * Extends result with this static object at this option.
     *
     * @example .extendFor('conf', { // some object });
     *
     * @param option the name of the option key.
     * @param obj a static object to be extended to result.
     */
    extendFor(option: string, obj: object): T & KawkahCommandBase<T>;
    /**
     * Sets validation skip for the specified option.
     *
     * @example .skip('theme', true);
     *
     * @param name the option key name.
     */
    skipFor(name: string): T & KawkahCommandBase<T>;
    /**
     * Sets validation skip for the specified option.
     *
     * @example .skip('theme', true);
     *
     * @param name the option key name.
     * @param skip enable/disable skip.
     */
    skipFor(name: string, skip: boolean): T & KawkahCommandBase<T>;
}
