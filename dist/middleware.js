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
const core_1 = require("./core");
const kawkah_parser_1 = require("kawkah-parser");
const decorators_1 = require("./decorators");
const chek_1 = require("chek");
const util_1 = require("util");
const error_1 = require("./error");
const constants_1 = require("./constants");
var KawkahMiddlewareGroup;
(function (KawkahMiddlewareGroup) {
    KawkahMiddlewareGroup["AfterParse"] = "AfterParse";
    KawkahMiddlewareGroup["BeforeValidate"] = "BeforeValidate";
    KawkahMiddlewareGroup["Validate"] = "Validate";
    KawkahMiddlewareGroup["AfterValidate"] = "AfterValidate";
    KawkahMiddlewareGroup["Finished"] = "Finished";
})(KawkahMiddlewareGroup = exports.KawkahMiddlewareGroup || (exports.KawkahMiddlewareGroup = {}));
/////////////////////////
// DEFAULT MIDDLEWARE //
/////////////////////////
// HELPERS //
function isPresent(key, event) {
    const option = event.option;
    const result = event.result;
    const args = result[constants_1.RESULT_ARGS_KEY];
    if (event.isArg && chek_1.isValue(args[option.index]))
        return true;
    if (kawkah_parser_1.hasOwn(result, key))
        return true;
    return false;
}
function checkDemandDeny(val, key, type, event, context) {
    const command = event.command;
    const option = event.option;
    const args = event.result[constants_1.RESULT_ARGS_KEY];
    const arr = option[type];
    if (!arr.length || !isPresent(key, event))
        return val;
    const u = context.utils;
    const argLabel = u.__ `Argument`;
    const flagLabel = u.__ `Flag`;
    let invalid = null;
    for (const k of arr) {
        const isOption = !chek_1.isValue(option.index);
        const label = isOption ? flagLabel : argLabel;
        // Handle missing demands.
        if (type === 'demand') {
            // If matching option or arg doesn't exist set error.
            if ((!isOption && !chek_1.isValue(args[option.index])) ||
                (isOption && !kawkah_parser_1.hasOwn(event.result, k))) {
                invalid = new error_1.KawkahError(u.__ `${label} ${key} failed: ${'invalidated by demand'} (missing: ${k})`, context);
                break;
            }
        }
        // Handle existing must denies.
        else {
            // If matching option or arg does exist set error.
            if ((!isOption && chek_1.isValue(args[option.index])) || (isOption && kawkah_parser_1.hasOwn(event.result, k))) {
                invalid = new error_1.KawkahError(u.__ `${label} ${key} failed: ${'invalidated by deny'} (exists: ${k})`, context);
                break;
            }
        }
    }
    if (!invalid)
        return val;
    return invalid;
}
// BEFORE MIDDLEWARE //
function minmax(result, event, context) {
    const command = event.command;
    const minArgs = command.minArgs;
    const maxArgs = command.maxArgs;
    const minFlags = command.minFlags;
    const maxFlags = command.maxFlags;
    if (!chek_1.isValue(minArgs) && !chek_1.isValue(maxArgs) && !chek_1.isValue(minFlags) && !chek_1.isValue(maxFlags))
        return result;
    // Get the lengths.
    const argsLen = event.result[constants_1.RESULT_ARGS_KEY].length;
    const flagsLen = chek_1.keys(chek_1.omit(event.result, context.resultExcludeKeys()) || {}).length;
    const u = context.utils;
    const argLabel = u.__ `arguments`;
    const flagLabel = u.__ `flags`;
    if (chek_1.isValue(minArgs) && argsLen < minArgs)
        return new error_1.KawkahError(u.__ `Not enough ${argLabel} got: ${argsLen} expected: ${minArgs}`, context);
    if (chek_1.isValue(maxArgs) && argsLen > maxArgs)
        return new error_1.KawkahError(u.__ `Too many ${argLabel} got: ${argsLen} expected: ${maxArgs}`, context);
    if (chek_1.isValue(minFlags) && flagsLen < minFlags)
        return new error_1.KawkahError(u.__ `Not enough ${flagLabel} got: ${flagsLen} expected: ${minFlags}`, context);
    if (chek_1.isValue(maxFlags) && flagsLen > maxFlags)
        return new error_1.KawkahError(u.__ `Too many ${flagLabel} got: ${flagsLen} expected: ${maxFlags}`, context);
    return result;
}
// MODIFICATION MIDDLEWARE //
/**
 * Coerces value to a type.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
function coerce(val, key, event, context) {
    const option = event.option;
    if (!option.coerce)
        return val;
    return option.coerce(val, context);
}
/**
 * Load config from file or static value.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
function extend(val, key, event, context) {
    const option = event.option;
    if (!option.extend)
        return val;
    // Nothing to do skip.
    if (val !== true && !chek_1.isString(val))
        return val;
    let extended;
    // Extending static value.
    if (val === true) {
        extended = option.extend;
    }
    // Otherwise load the config
    else {
        const tmp = context.utils.loadConfig(val);
        if (!util_1.isArray(option.extend)) {
            extended = tmp;
        }
        else {
            extended = option.extend.reduce((a, c) => {
                chek_1.set(a, c, chek_1.get(tmp, c));
                return a;
            }, {});
        }
    }
    return extended;
}
// VALIDATION MIDDLEWARE //
/**
 * Checks if arg/option is required but missing.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
function required(val, key, event, context) {
    const option = event.option;
    // Option should skip validation middleware.
    if (option.skip)
        return val;
    const u = context.utils;
    const label = event.isArg ? u.__ `Argument` : u.__ `Flag`;
    const isOption = !event.isArg;
    // If required and option by none specified or
    // is argument but no arg at index return error.
    if (option.required &&
        ((isOption && !kawkah_parser_1.hasOwn(event.result, key)) ||
            (!isOption && !event.result[constants_1.RESULT_ARGS_KEY][option.index]))) {
        return new error_1.KawkahError(u.__ `${label} ${key} failed: ${'invalidated by required'} (value: ${'undefined'})`, context);
    }
    return val;
}
/**
 * Runs validation against coerced value.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
function validator(val, key, event, context) {
    const option = event.option;
    if (!chek_1.isValue(option.validate) || option.skip || !isPresent(key, event))
        return val;
    let invalid = null;
    let exp;
    const u = context.utils;
    const argLabel = u.__ `Argument`;
    const optLabel = u.__ `Flag`;
    let label = event.isArg ? argLabel : optLabel;
    function handleRegExp() {
        const handler = option.validate.handler;
        exp = handler.toString();
        let valid = true;
        if (Array.isArray(val)) {
            valid = val.reduce((a, c) => {
                if (a)
                    a = handler.test(c);
                return a;
            }, true);
        }
        else {
            valid = handler.test(val);
        }
        if (!valid)
            invalid = new error_1.KawkahError(option.validate.message || u.__ `${label} ${key} failed: ${'invalidated by ' + exp} (value: ${val})`, context);
    }
    function handleFunc() {
        exp = `user function`;
        const validity = option.validate.handler(val, key, option, context);
        // If string is returned create error.
        if (chek_1.isString(validity))
            invalid = new error_1.KawkahError(invalid, 1, context);
        if (validity === false)
            invalid = new error_1.KawkahError(option.validate.message || u.__ `${label} ${key} failed: ${'invalidated by ' + exp} (value: ${val})`, context);
    }
    function handleUknown() {
        exp = `unknown validator`;
        invalid = new error_1.KawkahError(option.validate.message || u.__ `${label} ${key} failed: ${'invalidated by ' + exp} (value: ${val})`, context);
    }
    if (util_1.isRegExp(option.validate.handler)) {
        handleRegExp();
    }
    else if (util_1.isFunction(option.validate.handler)) {
        handleFunc();
    }
    else {
        handleUknown();
    }
    if (!invalid)
        return val;
    return invalid;
}
/**
 * Checks if result is missing a demanded argument.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
function demand(val, key, event, context) {
    if (event.option.skip)
        return val;
    return checkDemandDeny(val, key, 'demand', event, context);
}
/**
 * Checks if result includes a denied or excluded argument.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
function deny(val, key, event, context) {
    if (event.option.skip)
        return val;
    return checkDemandDeny(val, key, 'deny', event, context);
}
/**
 * Extends all aliases for present objects on to the result object.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
function aliases(val, key, event, context) {
    const option = event.option;
    // If no aliases just return value.
    if (!option.alias || !option.alias.length)
        return val;
    // Otherwise add for each alias key.
    if (!event.isArg)
        option.alias.forEach(k => chek_1.set(event.result, k, val));
    // Always return the value for chaining.
    return val;
}
exports.defaultMiddleware = {
    // Runs before option configs are validated.
    AfterParse: {
        minmax: { handler: minmax, group: KawkahMiddlewareGroup.AfterParse }
    },
    // The below three groups all run on each
    // option passing the key, val, event and context.
    BeforeValidate: {
        coerce: { handler: coerce, group: KawkahMiddlewareGroup.BeforeValidate },
        extend: { handler: extend, group: KawkahMiddlewareGroup.BeforeValidate }
    },
    Validate: {
        required: { handler: required, group: KawkahMiddlewareGroup.Validate },
        validator: { handler: validator, group: KawkahMiddlewareGroup.Validate },
        demand: { handler: demand, group: KawkahMiddlewareGroup.Validate },
        deny: { handler: deny, group: KawkahMiddlewareGroup.Validate },
    },
    AfterValidate: {
        aliases: { handler: aliases, group: KawkahMiddlewareGroup.AfterValidate }
    },
    // Below group runs after each
    // option config has been validated.
    Finished: {}
};
class KawkahMiddleware {
    constructor(core) {
        this._middleware = {};
        this._groups = {};
        this.core = core;
    }
    add(group, name, commands, handler, extend) {
        let obj;
        // no group passed first arg is name.
        if (!KawkahMiddlewareGroup[group]) {
            extend = handler;
            handler = commands;
            commands = name;
            name = group;
        }
        if (chek_1.isPlainObject(commands)) {
            obj = commands;
            commands = undefined;
        }
        else {
            if (util_1.isFunction(commands)) {
                extend = handler;
                handler = commands;
                commands = undefined;
            }
            // Define the middleware object.
            obj = {
                name: name,
                commands: commands,
                extend: extend,
                handler: handler
            };
        }
        obj = Object.assign({
            commands: [],
            enabled: true,
            merge: false
        }, obj);
        obj.name = obj.name || name;
        obj.commands = chek_1.toArray(commands);
        obj.group = obj.group || group;
        this._middleware[obj.name] = obj;
        // Add to group if present.
        if (obj.group)
            this.group(obj.group, obj.name);
        return this;
    }
    group(group, ...names) {
        if (!names.length)
            return this._groups[group] || [];
        this._groups[group] = this._groups[group] || [];
        this._groups[group] = this.core.utils.arrayExtend(this._groups[group], names);
        return this;
    }
    /**
     * Remove a group.
     *
     * @param group the group to be removed.
     */
    removeGroup(group) {
        if (!group)
            return this;
        delete this._groups[group];
        return this;
    }
    /**
     * Remove middleware from collection.
     *
     * @param names the names of middlware to be removed.
     */
    removeMiddleware(...names) {
        names.forEach(k => {
            delete this._middleware[k];
            for (const n in this._groups) {
                this._groups[n] = this._groups[n].filter(v => v !== k);
            }
        });
        return this;
    }
    /**
     * Enables middleware by name in the collection.
     *
     * @param names the names of middleware to be disabled.
     */
    enable(...names) {
        const __ = this.core.utils.__;
        if (!names.length)
            names = chek_1.keys(this._middleware);
        for (const k of names) {
            if (!this._middleware[k]) {
                this.core.warning(__ `${__ `Middleware`} ${k} could not be found.`);
                continue;
            }
            this._middleware[k].enabled = true;
        }
        return this;
    }
    /**
     * Disables middleware by name in the collection.
     *
     * @param names the names of middleware to be disabled.
     */
    disable(...names) {
        const __ = this.core.utils.__;
        if (!names.length)
            names = chek_1.keys(this._middleware);
        for (const k of names) {
            if (!this._middleware[k]) {
                this.core.warning(__ `${__ `Middleware`} ${k} could not be found.`);
                continue;
            }
            this._middleware[k].enabled = false;
        }
        return this;
    }
    enabled(...names) {
        const arr = chek_1.keys(this._middleware);
        if (!names.length)
            return arr.filter(k => this._middleware[k].enabled);
        let enabled = arr.filter(k => ~names.indexOf(k));
        if (names.length === 1)
            return enabled[0];
        return enabled;
    }
    disabled(...names) {
        const arr = chek_1.keys(this._middleware);
        if (!names.length)
            return arr.filter(k => !this._middleware[k].enabled);
        let disabled = arr.filter(k => ~names.indexOf(k));
        if (names.length === 1)
            return disabled[0];
        return disabled;
    }
    run(collection, val, ...args) {
        // If an error simply return
        // to end the series.
        if (util_1.isError(val))
            return val;
        for (const m of collection) {
            let prev = val;
            // Clone the arguments push the middleware
            const clone = args.slice(0);
            clone.push(m);
            const result = m.handler(val, ...clone);
            // If an error we break and return.
            if (util_1.isError(result))
                return result;
            // For merge we keep extending the result.
            if (m.extend && chek_1.isObject(result))
                val = Object.assign(val, result);
            else
                val = result;
            // User falied to return from middleware.
            if (util_1.isUndefined(val) && !util_1.isUndefined(prev))
                val = prev;
        }
        return val;
    }
    /**
     * Runs middleware for the specified group.
     *
     * @param name the name of the group.
     * @param args the arguments to pass to middleware.
     */
    runGroup(name, ...args) {
        let middleware = [];
        const names = this._groups[name] || [];
        let command = undefined;
        let force = false;
        let _args = args;
        const methods = {
            command: (name) => {
                command = name;
                return methods;
            },
            force: (enabled) => {
                force = enabled;
                return methods;
            },
            run: (...args) => {
                names.forEach(k => {
                    const m = this._middleware[k];
                    if (m && (m.enabled || force)) {
                        const isValid = command && (!m.commands.length || ~m.commands.indexOf(command));
                        if (!command || isValid)
                            middleware.push(m);
                    }
                });
                _args = args.length ? args : _args;
                // Nothing to do first arg is
                // the value just return it.
                if (!_args.length)
                    return _args[0];
                return this.run(middleware, ..._args);
            }
        };
        return methods;
    }
    /**
     * Runs middleware for the specified name(s).
     * @param name the name or names to be run.
     * @param args the arguments to pass to middleware.
     */
    runName(name, ...args) {
        let middleware = [];
        let command = undefined;
        let force = false;
        let _args = args;
        let names = chek_1.toArray(name);
        const methods = {
            command: (name) => {
                command = name;
                return methods;
            },
            force: (enabled) => {
                force = enabled;
                return methods;
            },
            run: (...args) => {
                names.forEach(k => {
                    const m = this._middleware[k];
                    if (m && (m.enabled || force)) {
                        const isValid = command && (!m.commands.length || ~m.commands.indexOf(command));
                        if (!command || isValid)
                            middleware.push(m);
                    }
                });
                _args = args.length ? args : _args;
                // Nothing to do first arg is
                // the value just return it.
                if (!_args.length)
                    return _args[0];
                return this.run(middleware, ..._args);
            }
        };
        return methods;
    }
}
__decorate([
    decorators_1.nonenumerable,
    __metadata("design:type", Object)
], KawkahMiddleware.prototype, "_middleware", void 0);
__decorate([
    decorators_1.nonenumerable,
    __metadata("design:type", Object)
], KawkahMiddleware.prototype, "_groups", void 0);
__decorate([
    decorators_1.nonenumerable,
    __metadata("design:type", core_1.KawkahCore)
], KawkahMiddleware.prototype, "core", void 0);
exports.KawkahMiddleware = KawkahMiddleware;
//# sourceMappingURL=middleware.js.map