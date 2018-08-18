import { KawkahCore } from './core';
import { hasOwn } from 'kawkah-parser';
import { IKawkahMap, KawkahValidateHandler, IKawkahMiddleware, KawkahMiddlwareHandler, IKawkahMiddlewareEventOption, IKawkahMiddlewareEventGlobal, IKawkahResult, KawkahModifyMiddlewareHandler } from './interfaces';
import { nonenumerable } from './decorators';
import { keys, toArray, isString, isValue, set, get, omit, isBoolean, isPlainObject, isObject } from 'chek';
import { isFunction, isError, isRegExp, isArray, isUndefined } from 'util';
import { KawkahError } from './error';
import { RESULT_ARGS_KEY } from './constants';

export enum KawkahMiddlewareGroup {
  AfterParse = 'AfterParse',
  BeforeValidate = 'BeforeValidate',
  Validate = 'Validate',
  AfterValidate = 'AfterValidate',
  Finished = 'Finished'
}

/////////////////////////
// DEFAULT MIDDLEWARE //
/////////////////////////

// HELPERS //

function isPresent(key: string, event: IKawkahMiddlewareEventOption) {

  const option = event.option;
  const result = event.result;

  const args = result[RESULT_ARGS_KEY];

  if (event.isArg && isValue(args[option.index]))
    return true;

  if (hasOwn(result, key))
    return true;

  return false;


}

function checkDemandDeny(val: any, key: string, type: 'demand' | 'deny', event: IKawkahMiddlewareEventOption, context: KawkahCore) {

  const command = event.command;
  const option = event.option;

  const args = event.result[RESULT_ARGS_KEY];

  const arr = option[type] as string[];

  if (!arr.length || !isPresent(key, event))
    return val;

  const u = context.utils;
  const argLabel = u.__`Argument`;
  const flagLabel = u.__`Flag`;

  let invalid = null;

  for (const k of arr) {

    const isOption = !isValue(option.index);
    const label = isOption ? flagLabel : argLabel;

    // Handle missing demands.
    if (type === 'demand') {

      // If matching option or arg doesn't exist set error.
      if (
        (!isOption && !isValue(args[option.index])) ||
        (isOption && !hasOwn(event.result, k))) {
        invalid = new KawkahError(u.__`${label} ${key} failed: ${'invalidated by demand'} (missing: ${k})`, context);
        break;
      }

    }

    // Handle existing must denies.
    else {

      // If matching option or arg does exist set error.
      if ((!isOption && isValue(args[option.index])) || (isOption && hasOwn(event.result, k))) {
        invalid = new KawkahError(u.__`${label} ${key} failed: ${'invalidated by deny'} (exists: ${k})`, context);
        break;
      }

    }

  }

  if (!invalid)
    return val;

  return invalid;

}

// BEFORE MIDDLEWARE //

function minmax(result: IKawkahResult, event?: IKawkahMiddlewareEventGlobal, context?: KawkahCore) {

  const command = event.command;
  const minArgs = command.minArgs;
  const maxArgs = command.maxArgs;
  const minFlags = command.minFlags;
  const maxFlags = command.maxFlags;

  if (!isValue(minArgs) && !isValue(maxArgs) && !isValue(minFlags) && !isValue(maxFlags))
    return result;

  // Get the lengths.
  const argsLen = event.result[RESULT_ARGS_KEY].length;
  const flagsLen = keys(omit(event.result, context.resultExcludeKeys()) || {}).length;

  const u = context.utils;
  const argLabel = u.__`arguments`;
  const flagLabel = u.__`flags`;

  if (isValue(minArgs) && argsLen < minArgs)
    return new KawkahError(u.__`Not enough ${argLabel} got: ${argsLen} expected: ${minArgs}`, context);

  if (isValue(maxArgs) && argsLen > maxArgs)
    return new KawkahError(u.__`Too many ${argLabel} got: ${argsLen} expected: ${maxArgs}`, context);

  if (isValue(minFlags) && flagsLen < minFlags)
    return new KawkahError(u.__`Not enough ${flagLabel} got: ${flagsLen} expected: ${minFlags}`, context);

  if (isValue(maxFlags) && flagsLen > maxFlags)
    return new KawkahError(u.__`Too many ${flagLabel} got: ${flagsLen} expected: ${maxFlags}`, context);


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
function coerce(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore) {

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
function extend(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore) {

  const option = event.option;

  if (!option.extend)
    return val;

  // Nothing to do skip.
  if (val !== true && !isString(val))
    return val;

  let extended: any;

  // Extending static value.
  if (val === true) {
    extended = option.extend;
  }

  // Otherwise load the config
  else {

    const tmp = context.utils.loadConfig(<string>val);

    if (!isArray(option.extend)) {
      extended = tmp;
    }

    else {
      extended = (option.extend as string[]).reduce((a, c) => {
        set(a, c, get(tmp, c));
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
function required(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore) {

  const option = event.option;

  // Option should skip validation middleware.
  if (option.skip) return val;

  const u = context.utils;

  const label = event.isArg ? u.__`Argument` : u.__`Flag`;
  const isOption = !event.isArg;

  // If required and option by none specified or
  // is argument but no arg at index return error.
  if (option.required &&
    ((isOption && !hasOwn(event.result, key)) ||
      (!isOption && !event.result[RESULT_ARGS_KEY][option.index]))) {
    return new KawkahError(u.__`${label} ${key} failed: ${'invalidated by required'} (value: ${'undefined'})`, context);
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
function validator(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore) {

  const option = event.option;

  if (!isValue(option.validate) || option.skip || !isPresent(key, event)) return val;

  let invalid: string | boolean | Error = null;
  let exp: string;

  const u = context.utils;
  const argLabel = u.__`Argument`;
  const optLabel = u.__`Flag`;

  let label = event.isArg ? argLabel : optLabel;

  function handleRegExp() {

    const handler = option.validate.handler as RegExp;
    exp = handler.toString();

    let valid = true;

    if (Array.isArray(val)) {
      valid = (val as any[]).reduce((a, c) => {
        if (a)
          a = handler.test(c);
        return a;
      }, true);
    }

    else {
      valid = handler.test(val);
    }

    if (!valid)
      invalid = new KawkahError(option.validate.message || u.__`${label} ${key} failed: ${'invalidated by ' + exp} (value: ${val})`, context);

  }

  function handleFunc() {

    exp = `user function`;

    const validity = (option.validate.handler as KawkahValidateHandler)(val, key, option, context);
    // If string is returned create error.
    if (isString(validity))
      invalid = new KawkahError(<string>invalid, 1, context);

    if (validity === false)
      invalid = new KawkahError(option.validate.message || u.__`${label} ${key} failed: ${'invalidated by ' + exp} (value: ${val})`, context);

  }

  function handleUknown() {
    exp = `unknown validator`;
    invalid = new KawkahError(option.validate.message || u.__`${label} ${key} failed: ${'invalidated by ' + exp} (value: ${val})`, context);
  }

  if (isRegExp(option.validate.handler)) {
    handleRegExp();
  }

  else if (isFunction(option.validate.handler)) {
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
function demand(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore) {
  if (event.option.skip) return val;
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
function deny(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore) {
  if (event.option.skip) return val;
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
function aliases(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore) {

  const option = event.option;

  // If no aliases just return value.
  if (!option.alias || !option.alias.length)
    return val;

  // Otherwise add for each alias key.
  if (!event.isArg)
    option.alias.forEach(k => set(event.result, k, val));

  // Always return the value for chaining.
  return val;

}

export const defaultMiddleware = {

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

export class KawkahMiddleware {

  @nonenumerable
  private _middleware: IKawkahMap<IKawkahMiddleware> = {};

  @nonenumerable
  private _groups: IKawkahMap<string[]> = {};

  @nonenumerable
  private core: KawkahCore;

  constructor(core: KawkahCore) {
    this.core = core;
  }

  /**
  * Add middleware to the collection.
  *
  * @param name the name of the middlware.
  * @param config middleware configuration object.
  */
  add(name: string, config: IKawkahMiddleware): KawkahMiddleware;

  /**
   * Add middleware to the collection.
   *
   * @param group a group to assign the middleware to.
   * @param name the name of the middlware.
   * @param config middleware configuration object.
   */
  add(group: string | KawkahMiddlewareGroup, name: string, config: IKawkahMiddleware): KawkahMiddleware;

  /**
   * Add middleware to the collection.
   *
   * @param name the name of the middlware.
   * @param handler the middleware handler to be called.
   * @param extend indicates result should be merged with current value.
   */
  add(name: string, handler: KawkahMiddlwareHandler, extend?: boolean): KawkahMiddleware;

  /**
   * Add middleware to the collection.
   *
   * @param name the name of the middlware.
   * @param commands command names the middlware may be run against.
   * @param handler the middleware handler to be called.
   * @param extend indicates result should be merged with current value.
   */
  add(name: string, commands: string | string[], handler: KawkahMiddlwareHandler, extend?: boolean): KawkahMiddleware;

  /**
   * Add middleware to the collection.
   *
   * @param group a group to assign the middleware to.
   * @param name the name of the middlware.
   * @param handler the middleware handler to be called.
   * @param extend indicates result should be merged with current value.
   */
  add(group: string | KawkahMiddlewareGroup, name: string, handler: KawkahMiddlwareHandler, extend?: boolean): KawkahMiddleware;

  /**
   * Add middleware to the collection.
   *
   * @param group a group to assign the middleware to.
   * @param name the name of the middlware.
   * @param commands command names the middlware may be run against.
   * @param handler the middleware handler to be called.
   * @param extend indicates result should be merged with current value.
   */
  add(group: string | KawkahMiddlewareGroup, name: string, commands: string | string[], handler: KawkahMiddlwareHandler, extend: boolean): KawkahMiddleware;

  add(group: KawkahMiddlewareGroup | string, name: string | string[] | IKawkahMiddleware | KawkahMiddlwareHandler, commands?: string | string[] | KawkahMiddlwareHandler | IKawkahMiddleware | boolean | IKawkahMiddleware, handler?: KawkahMiddlwareHandler | boolean, extend?: boolean) {

    let obj: IKawkahMiddleware;

    // no group passed first arg is name.
    if (!KawkahMiddlewareGroup[group]) {
      extend = <boolean>handler;
      handler = <KawkahMiddlwareHandler>commands;
      commands = name;
      name = <string>group;
    }

    if (isPlainObject(commands)) {
      obj = <IKawkahMiddleware>commands;
      commands = undefined;
    }

    else {

      if (isFunction(commands)) {
        extend = <boolean>handler;
        handler = <KawkahMiddlwareHandler>commands;
        commands = undefined;
      }

      // Define the middleware object.
      obj = {
        name: <string>name,
        commands: <any>commands,
        extend: <boolean>extend,
        handler: <KawkahMiddlwareHandler>handler
      };

    }

    obj = Object.assign({
      commands: [],
      enabled: true,
      merge: false
    }, obj);

    obj.name = obj.name || <string>name;
    obj.commands = toArray(commands);
    obj.group = obj.group || <KawkahMiddlewareGroup>group;

    this._middleware[obj.name] = obj;

    // Add to group if present.
    if (obj.group)
      this.group(obj.group, obj.name);

    return this;

  }

  /**
   * Gets list of middleware groups.
   *
   * @param group the group to add.
   */
  group(group: string | KawkahMiddlewareGroup): string[];

  /**
   * Adds/updates middleware group.
   *
   * @param group the group to add.
   * @param names the middleware to assign to the group.
   */
  group(group: string | KawkahMiddlewareGroup, ...names: string[]): KawkahMiddleware;

  group(group: KawkahMiddlewareGroup, ...names: string[]): string[] | KawkahMiddleware {
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
  removeGroup(group: string) {
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
  removeMiddleware(...names: string[]) {
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
  enable(...names: string[]) {
    const __ = this.core.utils.__;
    if (!names.length)
      names = keys(this._middleware);
    for (const k of names) {
      if (!this._middleware[k]) {
        this.core.warning(__`${__`Middleware`} ${k} could not be found.`);
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
  disable(...names: string[]) {
    const __ = this.core.utils.__;
    if (!names.length)
      names = keys(this._middleware);
    for (const k of names) {
      if (!this._middleware[k]) {
        this.core.warning(__`${__`Middleware`} ${k} could not be found.`);
        continue;
      }
      this._middleware[k].enabled = false;
    }
    return this;
  }

  /**
   * Returns all enabled middleware.
   */
  enabled(): string[];

  /**
   * Returns name if middlware is enabled.
   *
   * @param name the name of the middleware to inspect.
   */
  enabled(name: string): string;

  /**
   * Returns matching enabled middleware.
   *
   * @param names the names of middlware to inspect.
   */
  enabled(...names: string[]): string[];

  enabled(...names: string[]) {
    const arr = keys(this._middleware);
    if (!names.length)
      return arr.filter(k => this._middleware[k].enabled);
    let enabled: any = arr.filter(k => ~names.indexOf(k));
    if (names.length === 1)
      return enabled[0];
    return enabled;
  }

  /**
   * Returns all disabled middleware.
   */
  disabled(): string[];

  /**
   * Returns name if middlware is disabled.
   *
   * @param name the name of the middleware to inspect.
   */
  disabled(name: string): string;

  /**
   * Returns matching disabled middleware.
   *
   * @param names the names of middlware to inspect.
   */
  disabled(...names: string[]): string[];

  disabled(...names: string[]) {
    const arr = keys(this._middleware);
    if (!names.length)
      return arr.filter(k => !this._middleware[k].enabled);
    let disabled: any = arr.filter(k => ~names.indexOf(k));
    if (names.length === 1)
      return disabled[0];
    return disabled;
  }

  /**
   * Runs collection of middleware breaking on errors.
   *
   * @param collection the collection of middleware to run.
   * @param args the arguments to pass to middleware handlers.
   */
  run(collection: IKawkahMiddleware[], ...args: any[]): any;

  run(collection: IKawkahMiddleware[], val: any, ...args: any[]) {

    // If an error simply return
    // to end the series.
    if (isError(val))
      return val;

    for (const m of collection) {

      let prev = val;

      // Clone the arguments push the middleware
      const clone = args.slice(0);
      clone.push(m);

      const result = (m.handler as any)(val, ...clone);

      // If an error we break and return.
      if (isError(result))
        return result;

      // For merge we keep extending the result.
      if (m.extend && isObject(result))
        val = Object.assign(val, result);
      else
        val = result;

      // User falied to return from middleware.
      if (isUndefined(val) && !isUndefined(prev))
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
  runGroup(name: KawkahMiddlewareGroup, ...args: any[]) {

    let middleware: IKawkahMiddleware[] = [];
    const names = this._groups[name] || [];
    let command = undefined;
    let force = false;
    let _args = args;

    const methods = {

      command: (name: string) => {
        command = name;
        return methods;
      },

      force: (enabled: boolean) => {
        force = enabled;
        return methods;
      },

      run: <T>(...args): T => {

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
  runName(name: string | string[], ...args: any[]) {

    let middleware: IKawkahMiddleware[] = [];
    let command = undefined;
    let force = false;
    let _args = args;

    let names = toArray<string>(name);

    const methods = {

      command: (name: string) => {
        command = name;
        return methods;
      },

      force: (enabled: boolean) => {
        force = enabled;
        return methods;
      },

      run: <T>(...args): T => {

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
