"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("./decorators");
const core_1 = require("./core");
const chek_1 = require("chek");
const constants_1 = require("./constants");
class KawkahCommandBase {
    constructor(name, usage, core) {
        this._name = name;
        if (chek_1.isObject(usage) && !core) {
            core = usage;
            usage = undefined;
        }
        // If not an instance options were passed create core instance.
        if (!(core instanceof core_1.KawkahCore)) {
            const opts = core || {};
            if (usage)
                opts.usage = usage;
            core = new core_1.KawkahCore(opts);
        }
        this.core = core;
    }
    get _command() {
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
    _option(name, describe, type, def, argOrAction) {
        let config = describe;
        let arg;
        let action;
        if (chek_1.isBoolean(argOrAction))
            arg = argOrAction;
        if (chek_1.isFunction(argOrAction))
            action = argOrAction;
        const optType = arg ? this.utils.__ `argument` : this.utils.__ `flag`;
        if (action && this._name !== constants_1.DEFAULT_COMMAND_NAME) {
            this.core.error(this.utils.__ `Action ${optType} ${name} invalid for not default command.`);
            return this;
        }
        if (!this.utils.hasTokens(name)) {
            let aliases = [];
            if (!!~name.indexOf(constants_1.ALIAS_TOKEN)) {
                aliases = name.split(constants_1.ALIAS_TOKEN);
                name = aliases.shift();
            }
            if (this.core.options.allowCamelcase)
                name = this.utils.toCamelcase(name);
            const opt = this.core.getOption(this._name, name);
            if (opt) {
                this.core.error(this.utils.__ `Duplicate ${optType} ${name} could not be created`);
                return this;
            }
            if (chek_1.isPlainObject(config)) {
                if (arg) {
                    config.index = -1; // placeholder index.
                }
            }
            else {
                config = {
                    type: type,
                    describe: describe,
                    default: def
                };
                if (arg)
                    config.index = -1; // placeholder index.
                if (action)
                    config.action = action;
            }
            config.alias = chek_1.toArray(config.alias);
            config.alias = this.utils.arrayExtend(config.alias, aliases);
            this.core.setOption(this._name, name, config);
            return this;
        }
        const parsed = this.utils.parseTokens(name, false);
        if (parsed._error) {
            this.core.error(parsed._error);
            return this;
        }
        let key = parsed._keys.shift();
        // Tokens may have been passed with a config object.
        config = Object.assign({}, parsed[key], config);
        config.describe = describe || config.describe;
        config.type = type || config.type;
        config.default = def || config.default;
        if (arg)
            config.index = -1;
        if (action)
            config.action = action;
        const opt = this.core.getOption(this._name, key);
        if (opt) {
            this.core.error(this.utils.__ `Duplicate ${optType} ${key} could not be created`);
            return this;
        }
        this.core.setOption(this._name, key, config);
        // Iterate any remaining keys.
        for (const k of parsed._keys) {
            const opt = this.core.getOption(this._name, k);
            if (opt) {
                this.core.error(this.utils.__ `Duplicate ${optType} ${key} could not be created`);
                return this;
            }
            this.core.setOption(this._name, k, parsed[k]);
        }
        return this;
    }
    get utils() {
        return this.core.utils;
    }
    get assert() {
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
    contextFor(name) {
        name = this.utils.stripTokens(name);
        return this.core.getOption(this._name, name);
    }
    arg(name, describe, type, def) {
        this.assert('.arg()', '<string> [string|object] [string|function] [any]', arguments);
        if (name.startsWith('-'))
            this.core.error(this.utils.__ `${'Argument'} cannot begin with ${'-'}, did you mean to call ${'.flag(' + name + ')'}`);
        return this._option(name, describe, type, def, true);
    }
    args(...args) {
        this.assert('.args()', '<string...>', arguments);
        // Tokenize args.
        this.arg(args.map(a => {
            if (~a.indexOf('<') || ~a.indexOf('['))
                return a;
            return `[${a}]`;
        }).join(' '));
        return this;
    }
    flag(name, describe, type, def, action) {
        if (chek_1.isFunction(type)) {
            action = type;
            type = undefined;
            def = undefined;
        }
        if (chek_1.isFunction(def)) {
            action = def;
            def = undefined;
        }
        this.assert('.flag()', '<string> [string|object] [string|function] [any] [function]', arguments);
        if (name.startsWith('<') || name.startsWith('[')) {
            this.core.error(this.utils.__ `Flag cannot begin with ${'< or ['}, did you mean to call ${'.arg(' + name + ')'}`);
            return;
        }
        return this._option(name, describe, type, def, action);
    }
    /**
     * Adds multiple args to command from an array.
     *
     * @
     * .flags('force', 'status', ...);
     * .flags('--tags [string]', '--age [number]');
     *
     * @param args array of args to add for command.
     */
    flags(...flags) {
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
        return this;
    }
    /**
     * Adds multiple options using map of key and KawkahOption objects.
     * To specify an argument option set "index" to -1.
     *
     * @
     * .options({ name: { type: 'string' } });
     * .options({ path: { type: 'string', index: true } });
     *
     * @param options object of KawkahOptions.
     */
    options(options) {
        this.assert('.options()', '<object>', arguments);
        options = options || {};
        for (const k in options) {
            const opt = options[k];
            if (opt.index === true)
                opt.index = -1; // kawkah will reorder.
            this._option(k, opt, null, null, chek_1.isValue(opt.index));
        }
        return this;
    }
    /**
     * Adds or updates the command's description.
     *
     * @param describe the command description.
     */
    describe(describe) {
        this.assert('.describe()', '<string>', arguments);
        this.core.setCommand(this._name, 'describe', describe);
        return this;
    }
    /**
     * Adds alias to command.
     *
     * @param alias string or array of string aliases.
     */
    alias(...alias) {
        this.assert('.alias()', '<string...>', arguments);
        this.core.setCommand(this._name, 'alias', alias);
        return this;
    }
    /**
     * Toggles spreading action args in positional order, missing args are null.
     *
     * @ { _: ['file', 'dir', null ]} >> .action(file, dir, null, result) {}
     *
     * @param spread bool value indicating if should spread args.
     */
    spread(spread = true) {
        this.assert('.spread()', '<boolean>', [spread]);
        this.core.setCommand(this._name, 'spread', spread);
        return this;
    }
    /**
     * The minimum args allowed for the command.
     *
     * @example .minArgs(2);
     *
     * @param count the count number.
     */
    minArgs(count) {
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
    maxArgs(count) {
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
    minFlags(count) {
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
    maxFlags(count) {
        this.assert('.maxFlags()', '<number>', arguments);
        this.core.setCommand(this._name, 'maxFlags', count);
        return this;
    }
    skip(enabled = true) {
        this.assert('.skip()', '<boolean>', [enabled]);
        this.core.setCommand(this._name, 'skip', enabled);
        return this;
    }
    help(val) {
        this.assert('.help()', '[string|boolean|function]', arguments);
        this.core.setCommand(this._name, 'help', val);
        return this;
    }
    /**
     * When true injects -- abort arg resulting in all
     * arguments being added to result.__
     *
     * @param enabled enables/disables abort for command.
     */
    abort(enabled = true) {
        this.assert('.abort()', '[boolean]', [enabled]);
        this.core.setCommand(this._name, 'abort', enabled);
        return this;
    }
    external(command, options) {
        this.assert('.external()', '[string|object] [object]', [command]);
        const config = {};
        if (chek_1.isObject(command)) {
            options = command;
            command = undefined;
        }
        config.external = command || this._command.external || this._name;
        config.externalOptions = options || {};
        this.core.setCommand(this._name, config);
        return this;
    }
    /**
     * Binds an action to be called when parsed command or alias is matched.
     *
     * @example .action((result, context) => { do something });
     * @example .action((arg1..., result, context) => { do something }); (spread enabled)
     *
     * @param fn the callback action.
     */
    action(fn) {
        this.assert('.action()', '<function>', arguments);
        this.core.setCommand(this._name, 'action', fn);
        return this;
    }
    /**
     * Executes a command's action handler manually.
     *
     * @param command the command to execute.
     * @param result a parsed result to pass to command action.
     */
    exec(result) {
        this.assert('.exec()', '[object]', arguments);
        const cmd = this.core.getCommand(this._name);
        // Ensure a default object.
        result = Object.assign({}, { _: [], __: [], $0: this.core.$0, $command: this._name }, result);
        return cmd.action(result, this.core);
    }
    example(name, text) {
        this.assert('.example()', '<string> [string]', arguments);
        if (arguments.length === 1) {
            text = name;
            name = undefined;
        }
        // Create namespace if none provided.
        if (!name)
            name = this._name + '.' + chek_1.uuid();
        this.core.setExample(name, text);
        return this;
    }
    /**
    * Creates long description about the command.
    *
    * @param text the text to be displayed about the command.
    */
    about(text) {
        this.assert('.about()', '<string>', arguments);
        this.core.setCommand(this._name, 'about', text);
        return this;
    }
    // OPTION METHODS //
    /**
     * Sets the type for an option.
     *
     * @param name the option name to be set.
     * @param type the type to be set.
     */
    typeFor(name, type) {
        this.assert('.typeFor()', '<string> <string>', arguments);
        name = this.utils.stripTokens(name);
        this.core.setOption(this._name, name, 'type', type);
        return this;
    }
    /**
     * Assigns option keys as type of string.
     *
     * @param names the option keys to assign.
     */
    stringFor(...names) {
        this.assert('.stringFor()', '<string...>', arguments);
        names.forEach(n => {
            this.typeFor(n, 'string');
        });
        return this;
    }
    /**
     * Assigns option keys as type of boolean.
     *
     * @param names the option keys to assign.
     */
    booleanFor(...names) {
        this.assert('.booleanFor()', '<string...>', arguments);
        names.forEach(n => {
            this.typeFor(n, 'boolean');
        });
        return this;
    }
    /**
     * Assigns option keys as type of number.
     *
     * @param names the option keys to assign.
     */
    numberFor(...names) {
        this.assert('.numberFor()', '<string...>', arguments);
        names.forEach(n => {
            this.typeFor(n, 'number');
        });
        return this;
    }
    /**
     * Assigns option keys as type of array.
     *
     * @param names the option keys to assign.
     */
    arrayFor(...names) {
        this.assert('.arrayFor()', '<string...>', arguments);
        names.forEach(n => {
            this.typeFor(n, 'array');
        });
        return this;
    }
    /**
     * Adds alias(s) option by key.
     *
     * @param name the option key name.
     * @param alias the aliases to be added.
     */
    aliasFor(name, ...alias) {
        this.assert('.aliasFor()', '<string> <string...>', arguments);
        this.core.setOption(this._name, name, 'alias', alias);
        return this;
    }
    /**
    * Sets a description for the specified option.
    *
    * @param name the option key name.
    * @param describe the option's description
    */
    describeFor(name, describe) {
        this.assert('.describeFor()', '<string> <string>', arguments);
        this.core.setOption(this._name, name, 'describe', describe);
        return this;
    }
    demandFor(name, keys, match, handler, ...demand) {
        this.assert('.demandFor()', '<string> <string|array> [string|regexp|number|function] [string|regexp|function]  [string...]', arguments);
        if (chek_1.isString(keys)) {
            if (chek_1.isString(handler)) {
                demand.unshift(handler);
                handler = undefined;
            }
            if (chek_1.isString(match)) {
                demand.unshift(match);
                match = undefined;
            }
            demand.unshift(keys);
            keys = undefined;
        }
        if (chek_1.isFunction(match) || chek_1.isRegExp(match)) {
            handler = match;
            match = undefined;
        }
        if (Array.isArray(keys)) {
            demand = keys;
            keys = undefined;
        }
        const config = {
            handler: handler,
            match: match || 0,
            keys: demand
        };
        this.core.setOption(this._name, name, 'demand', config);
        return this;
    }
    denyFor(name, keys, match, handler, ...deny) {
        this.assert('.denyFor()', '<string> <string|array> [string|regexp|number|function] [string|regexp|function]  [string...]', arguments);
        if (chek_1.isString(keys)) {
            if (chek_1.isString(handler)) {
                deny.unshift(handler);
                handler = undefined;
            }
            if (chek_1.isString(match)) {
                deny.unshift(match);
                match = undefined;
            }
            deny.unshift(keys);
            keys = undefined;
        }
        if (chek_1.isFunction(match) || chek_1.isRegExp(match)) {
            handler = match;
            match = undefined;
        }
        if (Array.isArray(keys)) {
            deny = keys;
            keys = undefined;
        }
        const config = {
            handler: handler,
            match: match || 0,
            keys: deny
        };
        this.core.setOption(this._name, name, 'deny', config);
        return this;
    }
    /**
     * Sets a default value for the specified option.
     *
     * @example .default('theme', 'dark');
     *
     * @param name the option key name.
     * @param def a default value.
     */
    defaultFor(name, def) {
        this.assert('.defaultFor()', '<string> <any>', arguments);
        this.core.setOption(this._name, name, 'default', def);
        return this;
    }
    /**
     * Sets specified option as required.
     *
     * @example .required('password', true);
     *
     * @param name the option key name.
     * @param required enable/disable required option.
     */
    requiredFor(name, required = true) {
        this.assert('.requiredFor()', '<string> <boolean>', [name, required]);
        this.core.setOption(this._name, name, 'required', required);
        return this;
    }
    /**
     * Adds coercion method for option.
     *
     * @param name the name of the option.
     * @param fn a coerce handler function.
     */
    coerceFor(name, fn) {
        this.assert('.coerceFor()', '<string> <function>', [name, fn]);
        this.core.setOption(this._name, name, 'coerce', fn);
        return this;
    }
    validateFor(name, fn) {
        this.assert('.validateFor()', '<string> <object|regexp|function>', arguments);
        this.core.setOption(this._name, name, 'validate', fn);
        return this;
    }
    /**
     * Sets argument as variadic allowing multiple args to result in an array.
     *
     * @example .variadic('tags');
     *
     * @param name the option key name.
     * @param variadic enables/disables as variadic arg.
     */
    variadicFor(name, variadic = true) {
        this.assert('.variadicFor()', '<string> <number|boolean>', [name, variadic]);
        this.core.setOption(this._name, name, 'variadic', variadic);
        return this;
    }
    helpFor(name, val) {
        this.assert('.helpFor()', '<string> <string|boolean|function>', arguments);
        this.core.setOption(this._name, name, 'help', val);
        return this;
    }
    /**
     * Sets custom completions for the specified option.
     *
     * @example .completions('theme', 'light', 'dark', 'contrast');
     *
     * @param name the option key name.
     * @param completions array of completion values.
     */
    completionsFor(name, ...completions) {
        this.assert('.completionsFor()', '<string> <string...>', arguments);
        this.core.setOption(this._name, name, 'completions', completions);
        return this;
    }
    extendFor(option, value) {
        this.assert('.extendFor()', '<string> [any]', arguments);
        const config = {
            type: 'string',
            extend: value
        };
        if (!value) {
            config.extend = true;
        }
        this.core.setOption(this._name, option, config);
        return this;
    }
    skipFor(name, skip = true) {
        this.assert('.skipFor()', '<string> <boolean>', [name, skip]);
        this.core.setOption(this._name, name, 'skip', skip);
        return this;
    }
}
__decorate([
    decorators_1.nonenumerable,
    __metadata("design:type", String)
], KawkahCommandBase.prototype, "_name", void 0);
__decorate([
    decorators_1.nonenumerable,
    __metadata("design:type", core_1.KawkahCore)
], KawkahCommandBase.prototype, "core", void 0);
exports.KawkahCommandBase = KawkahCommandBase;
//# sourceMappingURL=base.js.map