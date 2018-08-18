import { KawkahCore } from './core';
import { IKawkahMiddleware, KawkahMiddlwareHandler, IKawkahMiddlewareEventOption, IKawkahMiddlewareEventGlobal, IKawkahResult } from './interfaces';
import { KawkahError } from './error';
export declare enum KawkahMiddlewareGroup {
    AfterParse = "AfterParse",
    BeforeValidate = "BeforeValidate",
    Validate = "Validate",
    AfterValidate = "AfterValidate",
    Finished = "Finished"
}
declare function minmax(result: IKawkahResult, event?: IKawkahMiddlewareEventGlobal, context?: KawkahCore): IKawkahResult | KawkahError;
/**
 * Coerces value to a type.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
declare function coerce(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore): any;
/**
 * Load config from file or static value.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
declare function extend(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore): any;
/**
 * Checks if arg/option is required but missing.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
declare function required(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore): any;
/**
 * Runs validation against coerced value.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
declare function validator(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore): any;
/**
 * Checks if result is missing a demanded argument.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
declare function demand(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore): any;
/**
 * Checks if result includes a denied or excluded argument.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
declare function deny(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore): any;
/**
 * Extends all aliases for present objects on to the result object.
 *
 * @param val the current value.
 * @param key the current key.
 * @param event object of event context objects (result, source, option keys etc..).
 * @param context the core context.
 */
declare function aliases(val: any, key: string, event: IKawkahMiddlewareEventOption, context: KawkahCore): any;
export declare const defaultMiddleware: {
    AfterParse: {
        minmax: {
            handler: typeof minmax;
            group: KawkahMiddlewareGroup;
        };
    };
    BeforeValidate: {
        coerce: {
            handler: typeof coerce;
            group: KawkahMiddlewareGroup;
        };
        extend: {
            handler: typeof extend;
            group: KawkahMiddlewareGroup;
        };
    };
    Validate: {
        required: {
            handler: typeof required;
            group: KawkahMiddlewareGroup;
        };
        validator: {
            handler: typeof validator;
            group: KawkahMiddlewareGroup;
        };
        demand: {
            handler: typeof demand;
            group: KawkahMiddlewareGroup;
        };
        deny: {
            handler: typeof deny;
            group: KawkahMiddlewareGroup;
        };
    };
    AfterValidate: {
        aliases: {
            handler: typeof aliases;
            group: KawkahMiddlewareGroup;
        };
    };
    Finished: {};
};
export declare class KawkahMiddleware {
    private _middleware;
    private _groups;
    private core;
    constructor(core: KawkahCore);
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
    /**
     * Remove a group.
     *
     * @param group the group to be removed.
     */
    removeGroup(group: string): this;
    /**
     * Remove middleware from collection.
     *
     * @param names the names of middlware to be removed.
     */
    removeMiddleware(...names: string[]): this;
    /**
     * Enables middleware by name in the collection.
     *
     * @param names the names of middleware to be disabled.
     */
    enable(...names: string[]): this;
    /**
     * Disables middleware by name in the collection.
     *
     * @param names the names of middleware to be disabled.
     */
    disable(...names: string[]): this;
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
    /**
     * Runs collection of middleware breaking on errors.
     *
     * @param collection the collection of middleware to run.
     * @param args the arguments to pass to middleware handlers.
     */
    run(collection: IKawkahMiddleware[], ...args: any[]): any;
    /**
     * Runs middleware for the specified group.
     *
     * @param name the name of the group.
     * @param args the arguments to pass to middleware.
     */
    runGroup(name: KawkahMiddlewareGroup, ...args: any[]): {
        command: (name: string) => any;
        force: (enabled: boolean) => any;
        run: <T>(...args: any[]) => T;
    };
    /**
     * Runs middleware for the specified name(s).
     * @param name the name or names to be run.
     * @param args the arguments to pass to middleware.
     */
    runName(name: string | string[], ...args: any[]): {
        command: (name: string) => any;
        force: (enabled: boolean) => any;
        run: <T>(...args: any[]) => T;
    };
}
export {};
