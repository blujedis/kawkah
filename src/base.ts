import { nonenumerable } from './decorators';
import { KawkahCore } from './core';
import { KawkahHandler, IKawkahOption, KawkahOptionType, IKawkahOptionInternal, KawkahValidate, IKawkahValidateConfig, KawkahValidateHandler, KawkahAction, IKawkahResult, IKawkahMap, IKawkahOptions } from './interfaces';
import { isObject, isPlainObject, isValue } from 'chek';

export class KawkahCommandBase<T> {

  @nonenumerable
  protected _name: string;

  @nonenumerable
  core: KawkahCore;

  constructor(name: string, core?: KawkahCore);

  constructor(name: string, options?: IKawkahOptions);

  constructor(name: string, usage: string, core?: KawkahCore);

  constructor(name: string, usage: string, options?: IKawkahOptions);

  constructor(name: string, usage: string | IKawkahOptions | KawkahCore, core?: KawkahCore | IKawkahOptions) {

    this._name = name;

    if (isObject(usage) && !core) {
      core = <KawkahCore>usage;
      usage = undefined;
    }

    // If not an instance options were passed create core instance.
    if (!(core instanceof KawkahCore)) {
      const opts = <IKawkahOptions>core || {};
      if (usage)
        opts.usage = <string>usage;
      core = new KawkahCore(opts);
    }

    this.core = <KawkahCore>core;

  }

  protected get _command() {
    return this.core.getCommand(this._name);
  }

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
  protected _option(name: string, describe: string | IKawkahOption, type: KawkahOptionType, def: any, arg?: boolean): T & KawkahCommandBase<T> {

    let config = <IKawkahOptionInternal>describe;

    const optType = arg ? this.utils.__`argument` : this.utils.__`flag`;

    if (!this.utils.hasTokens(name)) {

      if (this.core.options.allowCamelcase)
        name = this.utils.toCamelcase(name);

      const opt = this.core.getOption(this._name, name);

      if (opt) {
        this.core.error(this.utils.__`Duplicate ${optType} ${name} could not be created`);
        return <any>this;
      }

      if (isPlainObject(config)) {

        if (arg) {
          config.index = -1; // placeholder index.
        }

        // Set the option on the command.
        this.core.setOption(this._name, name, config);
        return <any>this;

      }

      else {

        config = {
          type: type,
          describe: <string>describe,
          default: def
        };

        if (arg)
          config.index = -1; // placeholder index.

        this.core.setOption(this._name, name, config);
        return <any>this;

      }

    }

    const parsed = this.utils.parseTokens(name, false);

    if (parsed._error) {
      this.core.error(parsed._error);
      return <any>this;
    }

    let key = parsed._keys.shift();

    // Tokens may have been passed with a config object.
    config = Object.assign({}, parsed[key], config);

    config.default = def || config.default;
    config.describe = <string>describe || config.describe;
    config.type = type || config.type;

    if (arg) config.index = -1;

    const opt = this.core.getOption(this._name, key);

    if (opt) {
      this.core.error(this.utils.__`Duplicate ${optType} ${key} could not be created`);
      return <any>this;
    }

    this.core.setOption(this._name, key, config);

    // Iterate any remaining keys.
    for (const k of parsed._keys) {

      const opt = this.core.getOption(this._name, k);
      if (opt) {
        this.core.error(this.utils.__`Duplicate ${optType} ${key} could not be created`);
        return <any>this;
      }

      this.core.setOption(this._name, k, parsed[k]);

    }

    return <any>this;

  }

  protected get utils() {
    return this.core.utils;
  }

  protected get assert() {
    return this.utils.argsert.assert;
  }

  /**
   * Gets the command config object.
   */
  context() {
    return this._command;
  }

  /**
   * Gets a configuration for a flag or arg option on this command.
   *
   * @param name the name of the flag or arg option.
   */
  contextFor(name: string) {
    name = this.utils.stripTokens(name);
    return this.core.getOption(this._name, name);
  }

  // COMMAND OPTIONS //

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

  arg(name: string, describe?: string | IKawkahOption, type?: KawkahOptionType, def?: any): T & KawkahCommandBase<T> {
    this.assert('.arg()', '<string> [string|object] [string|function] [any]', arguments);
    if (name.startsWith('-'))
      this.core.error(this.utils.__`${'Argument'} cannot begin with ${'-'}, did you mean to call ${'.flag(' + name + ')'}`);
    return this._option(name, describe, type, def, true);
  }

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

  args(...args: string[]): T & KawkahCommandBase<T> {
    this.assert('.args()', '<string...>', arguments);
    // Tokenize args.
    this.arg(args.map(a => {
      if (~a.indexOf('<') || ~a.indexOf('['))
        return a;
      return `[${a}]`;
    }).join(' '));
    return <any>this;
  }

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
   * @param type the option's type.
   * @param def a default value.
   */
  flag(name: string, describe: string, type?: KawkahOptionType, def?: any): T & KawkahCommandBase<T>;

  flag(name: string, describe?: string | IKawkahOption, type?: KawkahOptionType, def?: any): T & KawkahCommandBase<T> {
    this.assert('.flag()', '<string> [string|object] [string|function] [any]', arguments);
    if (name.startsWith('<') || name.startsWith('[')) {
      this.core.error(this.utils.__`Flag cannot begin with ${'< or ['}, did you mean to call ${'.arg(' + name + ')'}`);
      return;
    }
    return this._option(name, describe, type, def);
  }

  /**
   * Adds multiple args to command from an array.
   *
   * @example
   * .flags('force', 'status', ...);
   * .flags('--tags [string]', '--age [number]');
   *
   * @param args array of args to add for command.
   */
  flags(...flags: string[]): T & KawkahCommandBase<T> {
    this.assert('.flags()', '<string...>', arguments);
    flags.forEach(v => {
      const firstSpace = v.indexOf(' ');
      if (!~firstSpace)
        return this.flag(v);
      let key = this.utils.toFlag(v.slice(0, firstSpace).trim());
      let val = v.slice(firstSpace + 1);
      if (!~val.indexOf('<') && !~val.indexOf('['))
        val = `[${val}]`;
      return this.flag(`${key} ${val}`);
    });
    return <any>this;
  }

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
  options(options: IKawkahMap<IKawkahOption>): T & KawkahCommandBase<T> {
    this.assert('.options()', '<object>', arguments);
    options = options || {};
    for (const k in options) {
      const opt = options[k];
      if (opt.index === true)
        opt.index = -1; // kawkah will reorder.
      this._option(k, opt, null, null, isValue(opt.index));
    }
    return <any>this;
  }

  /**
   * Adds or updates the command's description.
   *
   * @param describe the command description.
   */
  describe(describe: string): T & KawkahCommandBase<T> {
    this.assert('.describe()', '<string>', arguments);
    this.core.setCommand(this._name, 'describe', describe);
    return <any>this;
  }

  /**
   * Adds alias to command.
   *
   * @param alias string or array of string aliases.
   */
  alias(...alias: string[]): T & KawkahCommandBase<T> {
    this.assert('.alias()', '<string...>', arguments);
    this.core.setCommand(this._name, 'alias', alias);
    return <any>this;
  }

  /**
   * Toggles spreading action args in positional order, missing args are null.
   *
   * @example { _: ['file', 'dir', null ]} >> .action(file, dir, null, result) {}
   *
   * @param spread bool value indicating if should spread args.
   */
  spread(spread: boolean = true): T & KawkahCommandBase<T> {
    this.assert('.spread()', '<boolean>', [spread]);
    this.core.setCommand(this._name, 'spread', spread);
    return <any>this;
  }

  /**
   * The minimum args allowed for the command.
   *
   * @example .minArgs(2);
   *
   * @param count the count number.
   */
  minArgs(count: number) {
    this.assert('.minArgs()', '<number>', arguments);
    this.core.setCommand(this._name, 'minArgs', count);
    return this;
  }

  /**
   * The maximum args allowed for the command.
   *
   * @example .maxArgs(2);
   *
   * @param count the count number.
   */
  maxArgs(count: number) {
    this.assert('.maxArgs()', '<number>', arguments);
    this.core.setCommand(this._name, 'maxArgs', count);
    return this;
  }

  /**
    * The minimum flags allowed for the command.
    *
    * @example .minFlags(2);
    *
    * @param count the count number.
    */
  minFlags(count: number) {
    this.assert('.minFlags()', '<number>', arguments);
    this.core.setCommand(this._name, 'minFlags', count);
    return this;
  }

  /**
    * The maximum flags allowed for the command.
    *
    * @example .maxFlags(2);
    *
    * @param count the count number.
    */
  maxFlags(count: number) {
    this.assert('.maxFlags()', '<number>', arguments);
    this.core.setCommand(this._name, 'maxFlags', count);
    return this;
  }

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

  skip(enabled: boolean = true) {
    this.assert('.skip()', '<boolean>', [enabled]);
    this.core.setCommand(this._name, 'skip', enabled);
    return <any>this;
  }

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

  help(val?: string | boolean | KawkahHandler) {
    this.assert('.help()', '[string|boolean|function]', arguments);
    this.core.setCommand(this._name, 'help', val);
    return <any>this;
  }

  /**
   * Binds an action to be called when parsed command or alias is matched.
   *
   * @example .action((result, context) => { do something });
   * @example .action((arg1..., result, context) => { do something }); (spread enabled)
   *
   * @param fn the callback action.
   */
  action(fn: KawkahAction): T & KawkahCommandBase<T> {
    this.assert('.action()', '<function>', arguments);
    this.core.setCommand(this._name, 'action', fn);
    return <any>this;
  }

  /**
   * Executes a command's action handler manually.
   *
   * @param command the command to execute.
   * @param result a parsed result to pass to command action.
   */
  exec(result?: IKawkahResult): any {
    this.assert('.exec()', '[object]', arguments);
    const cmd = this.core.getCommand(this._name);
    // Ensure a default object.
    result = Object.assign({}, { _: [], __: [], $0: this.core.$0, $command: this._name }, result);
    return cmd.action(result, this.core);
  }

  /**
   * Stores example text for command.
   *
   * @param name the name of the example
   * @param text the example text.
   */
  example(name: string, text: string) {
    this.assert('.example()', '<string> <string>', arguments);
    this.core.setExample(name, text);
    return this;
  }

  // OPTION METHODS //

  /**
   * Sets the type for an option.
   *
   * @param name the option name to be set.
   * @param type the type to be set.
   */
  typeFor(name: string, type: KawkahOptionType): T & KawkahCommandBase<T> {
    this.assert('.typeFor()', '<string> <string>', arguments);
    name = this.utils.stripTokens(name);
    this.core.setOption(this._name, name, 'type', type);
    return <any>this;
  }

  /**
   * Assigns option keys as type of string.
   *
   * @param names the option keys to assign.
   */
  stringFor(...names: string[]): T & KawkahCommandBase<T> {
    this.assert('.stringFor()', '<string...>', arguments);
    names.forEach(n => {
      this.typeFor(n, 'string');
    });
    return <any>this;
  }

  /**
   * Assigns option keys as type of boolean.
   *
   * @param names the option keys to assign.
   */
  booleanFor(...names: string[]): T & KawkahCommandBase<T> {
    this.assert('.booleanFor()', '<string...>', arguments);
    names.forEach(n => {
      this.typeFor(n, 'boolean');
    });
    return <any>this;
  }

  /**
   * Assigns option keys as type of number.
   *
   * @param names the option keys to assign.
   */
  numberFor(...names: string[]): T & KawkahCommandBase<T> {
    this.assert('.numberFor()', '<string...>', arguments);
    names.forEach(n => {
      this.typeFor(n, 'number');
    });
    return <any>this;
  }

  /**
   * Assigns option keys as type of array.
   *
   * @param names the option keys to assign.
   */
  arrayFor(...names: string[]): T & KawkahCommandBase<T> {
    this.assert('.arrayFor()', '<string...>', arguments);
    names.forEach(n => {
      this.typeFor(n, 'array');
    });
    return <any>this;
  }

  /**
   * Adds alias(s) option by key.
   *
   * @param name the option key name.
   * @param alias the aliases to be added.
   */
  aliasFor(name: string, ...alias: string[]): T & KawkahCommandBase<T> {
    this.assert('.aliasFor()', '<string> <string...>', arguments);
    this.core.setOption(this._name, name, 'alias', alias);
    return <any>this;
  }

  /**
  * Sets a description for the specified option.
  *
  * @param name the option key name.
  * @param describe the option's description
  */
  describeFor(name: string, describe: string): T & KawkahCommandBase<T> {
    this.assert('.describeFor()', '<string> <string>', arguments);
    this.core.setOption(this._name, name, 'describe', describe);
    return <any>this;
  }

  /**
   * Sets a demand for the specified option.
   *
   * @example .demand('username', 'password', ...);
   *
   * @param name the option key name.
   * @param demand array of keys to demand.
   */
  demandFor(name: string, ...demand: string[]): T & KawkahCommandBase<T> {
    this.assert('.demandFor()', '<string> <string...>', arguments);
    this.core.setOption(this._name, name, 'demand', demand);
    return <any>this;
  }

  /**
   * Sets deny for the specified option.
   *
   * @example .deny('directory', 'filename', ...);
   *
   * @param name the option key name.
   * @param deny array of keys to deny.
   */
  denyFor(name: string, ...deny: string[]): T & KawkahCommandBase<T> {
    this.assert('.denyFor()', '<string> <string...>', arguments);
    this.core.setOption(this._name, name, 'deny', deny);
    return <any>this;
  }

  /**
   * Sets a default value for the specified option.
   *
   * @example .default('theme', 'dark');
   *
   * @param name the option key name.
   * @param def a default value.
   */
  defaultFor(name: string, def: any): T & KawkahCommandBase<T> {
    this.assert('.defaultFor()', '<string> <any>', arguments);
    this.core.setOption(this._name, name, 'default', def);
    return <any>this;
  }

  /**
   * Sets specified option as required.
   *
   * @example .required('password', true);
   *
   * @param name the option key name.
   * @param required enable/disable required option.
   */
  requiredFor(name: string, required: boolean = true): T & KawkahCommandBase<T> {
    this.assert('.requiredFor()', '<string> <boolean>', [name, required]);
    this.core.setOption(this._name, name, 'required', required);
    return <any>this;
  }

  /**
   * Adds coercion method for option.
   *
   * @param name the name of the option.
   * @param fn a coerce handler function.
   */
  coerceFor(name: string, fn: KawkahHandler): T & KawkahCommandBase<T> {
    this.assert('.coerceFor()', '<string> <function>', [name, fn]);
    this.core.setOption(this._name, name, 'coerce', fn);
    return <any>this;
  }

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

  validateFor(name: string, fn: KawkahValidate): T & KawkahCommandBase<T> {
    this.assert('.validateFor()', '<string> <function>', arguments);
    this.core.setOption(this._name, name, 'validate', fn);
    return <any>this;
  }

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
   * Sets argument as variadic allowing multiple args to result in an array.
   *
   * @example .variadic('tags');
   *
   * @param name the option key name.
   * @param variadic enables/disables as variadic arg.
   */
  variadicFor(name: string, variadic: number | boolean = true): T & KawkahCommandBase<T> {
    this.assert('.variadicFor()', '<string> <number|boolean>', [name, variadic]);
    this.core.setOption(this._name, name, 'variadic', variadic);
    return <any>this;
  }

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

  helpFor(name: string, val: string | boolean | KawkahHandler) {
    this.assert('.helpFor()', '<string> <string|boolean|function>', arguments);
    this.core.setOption(this._name, name, 'help', val);
    return <any>this;
  }

  /**
   * Sets custom completions for the specified option.
   *
   * @example .completions('theme', 'light', 'dark', 'contrast');
   *
   * @param name the option key name.
   * @param completions array of completion values.
   */
  completionsFor(name: string, ...completions: string[]): T & KawkahCommandBase<T> {
    this.assert('.completionsFor()', '<string> <string...>', arguments);
    this.core.setOption(this._name, name, 'completions', completions);
    return <any>this;
  }

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

  extendFor(option: string, value?: any): T & KawkahCommandBase<T> {
    this.assert('.extendFor()', '<string> [any]', arguments);
    const config: IKawkahOptionInternal = {
      type: 'string',
      extend: value
    };
    // If extend is enabled with
    // no keys or static value set
    // the type to boolean.
    if (!value) {
      config.type = 'boolean';
      config.extend = true;
    }
    this.core.setOption(this._name, option, config);
    return <any>this;
  }

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

  skipFor(name: string, skip: boolean = true): T & KawkahCommandBase<T> {
    this.assert('.skipFor()', '<string> <boolean>', [name, skip]);
    this.core.setOption(this._name, name, 'skip', skip);
    return <any>this;
  }

}