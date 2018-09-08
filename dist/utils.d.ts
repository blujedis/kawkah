import { KawkahCore } from './core';
import { Lokales } from 'lokales';
import { IArgsert } from 'argsert';
import { KawkahStyleKeys, AnsiStyles, IKawkahMap, KawkahReduceCallback } from './interfaces';
export declare class KawkahUtils {
    private core;
    lokales: Lokales;
    argsert: IArgsert;
    constructor(core: KawkahCore);
    private readonly options;
    /**
     * Ensures that required args do not follow optional ones.
     *
     * @example .checkInvalidSequence('install <dir> [filename] <invalid>') >> true;
     *
     * @param tokens array of matching arg types.
     */
    private checkInvalidSequence;
    /**
     * Checks if tokens contain multiple command args.
     *
     * @example .checkMultipleCommand('command1 command2 [arg]');
     *
     * @param tokens the tokens expanded into an array.
     */
    private checkMultipleCommand;
    /**
     * Checks if required variadic arg was erroneously specified.
     *
     * @example .checkArgVariadicRequired('<tags...>);
     *
     * @param tokens the expanded tokens.
     */
    private checkArgVariadicRequired;
    /**
     * Checks if has dot notation arg.
     *
     * @param tokens the tokens to be inspected.
     */
    private checkDotnotationArg;
    /**
     * Validate tokens iterates checks ensuring the tokens are valid format and sequencing.
     *
     * @example
     * .isInvalidTokens('<required...>') >> false (no required variadic args)
     * .isInvalidTokens('<arg.a>') >> false (no arg dot notation)
     * .isInvalidTokens('[optional] <required>') >> false (required arg after optional)
     * .isInvalidTokens('blog [tags...] [authors...]) >> false dupe variadic args.
     * .isInvalidTokens('blog [tags...] [name]) >> variadic not last arg.
     *
     * @param tokens the string or array of tokens to validate.
     */
    validateTokens(tokens: string[], command?: string): any;
    readonly __: any;
    readonly __n: any;
    readonly assert: {
        (map: string, values?: object | any[], validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
        (name: string, map: string, values?: object | any[], validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
        (map: string, values?: object | any[], len?: number, validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
        (name: string, map: string, values?: object | any[], len?: number, validator?: string | import("argsert/dist/interfaces").ArgsertValidator): import("argsert/dist/interfaces").IArgsertResult;
    };
    /**
     * Pluralizes a string.
     *
     * @param val the value to pluralize.
     * @param count the count to be inspected.
     */
    pluralize(val: string, count: number): string;
    /**
     * Pluralizes a string with custom pluralizer.
     *
     * @param val the value to pluralize.
     * @param pluralizer the string to use to pluralize.
     * @param count the count to be inspected.
     */
    pluralize(val: string, pluralizer: string, count: number): string;
    /**
     * Gets log symbols.
     */
    getSymbols(): {
        error: string;
        warning: string;
        notify: string;
        ok: string;
    };
    getStyle(key: KawkahStyleKeys): AnsiStyles[];
    /**
     * Colorize with ansi styles.
     *
     * @param val the value to apply styles to.
     * @param styles the ansi styles to be applied.
     */
    colorize(val: string, ...styles: AnsiStyles[]): string;
    /**
     * Strips colurs from string.
     *
     * @param val the value to strip.
     */
    stripColors(val: string): any;
    /**
     * Loads/reads a yaml or json configuration file.
     *
     * @param path the path to the config file.
     * @param type forces a specific file type.
     */
    loadConfig(path: string, type?: 'json' | 'yaml'): any;
    /**
     * Simple method to copy properties to new object (no deep).
     * For ex: an Error object where stack/message aren't cloned.
     *
     * @example .copy({ name: 'Joe', email: 'joe@mail.com' }, 'name');
     *
     * @param obj an object which you want to copy properties of.
     * @param filter an array of keys to filter if any.
     */
    copy(obj: any, ...filter: string[]): {};
    /**
     * Generates a date then formats.
     *
     * @see https://gist.github.com/cstipkovic/3983879
     *
     * @param format the format for the date.
     * @param utc when true UTC is used.
     */
    datetime(format: string, utc?: boolean): string;
    /**
    * Formats specified date with optional UTC.
    *
    * @see https://gist.github.com/cstipkovic/3983879
    *
    * @param date a string to convert or Date.
    * @param format a string to format the date with.
    * @param utc whether to use utc.
    */
    datetime(date: Date, format?: string, utc?: boolean): string;
    /**
     * Formats message with string format tokens, objects or templates strings.
     *
     * @param message the string or object to be formatted.
     * @param args arguments used for format strings or templates.
     */
    formatMessage(message: any, ...args: any[]): any;
    /**
     * Extends target array with source values if not already exists.
     *
     * @param target the target array.
     * @param source the source array.
     * @param filter optional array of filters.
     * @param fn optional function called to normalize values.
     */
    arrayExtend(target: any, source: any, filter?: any[] | KawkahReduceCallback, fn?: KawkahReduceCallback): any;
    /**
     * Removes items from an array in a nested object.
     *
     * @param map an object to remove/purge from.
     * @param key the key of the array to purge items from.
     * @param items a list of keys to be removed.
     */
    arrayPurge(map: IKawkahMap<any>, key: string, ...items: string[]): any[];
    /**
     * Compares two arrays returning matches.
     *
     * @param source the source array to find matches from.
     * @param compare the array to compare for matches.
     */
    arrayMatch(source: any, compare: any): any[];
    /**
     * Inspects two arrays finding elements that are missing
     * that are matches and those excluded from source.
     *
     * @param source the source array.
     * @param compare the array to compare.
     */
    arrayCompare(source: any, compare: any): {
        missing: any;
        matched: any[];
        excluded: any;
    };
    /**
     * Array equals compares two arrays for matches then ensures same length.
     *
     * @param values the array containing matchable values.
     * @param compare the comparator array containing actual values.
     */
    arrayEquals(values: string[], compare: string[]): number;
    /**
     * Inspects array removing duplicates.
     *
     * @param arr an array to inspect.
     */
    arrayUnique(arr: any): any;
    /**
     * Checks if value is a given type.
     *
     * @param type the type key for inspecting.
     * @param val the value to inspect.
     * @param loose whether to inspect strict or check floats, integers etc.
     */
    isType(type: string, val: any): any;
    /**
     * Casts value to type.
     *
     * @param type the type key to get.
     * @param val the value to be cast to type.
     */
    toType(type: any, val: any): any;
    /**
     * Ensures a function has a callback.
     *
     * @param fn the function to normalize.
     */
    toNodeCallback(fn: Function): Function;
    /**
    * Converts to arg token.
    *
    * @param val the value to convert to arg token.
    * @param required when true wraps arg as required token.
    */
    toArg(val: string, required?: boolean, variadic?: number | boolean): string;
    /**
     * Converts a string to a flag token.
     *
     * @param val the value to convert to flag token.
     */
    toFlag(val: string): string;
    /**
     * Camelize string, ignore dot notation strings when strict.
     *
     * @param val the value to camelize
     * @param strict when true dot notation values ignored.
     */
    toCamelcase(val: string, strict?: boolean): string;
    /**
     * Strips all tokens from string.
     *
     * @param val the value to strip.
     */
    stripTokens(val: any): string;
    /**
     * Removes flag tokens from value.
     *
     * @param val the value to strip.
     */
    stripFlag(val: any): any;
    /**
     * Checks if a path is executable.
     *
     * @param path the path to be inspected.
     */
    isExecutable(path: string): boolean;
    /**
     * Checks if token is an arg and has variadic tokens ([arg...]).
     *
     * @param val the value to inspect.
     */
    isArgVariadic(val: any): any;
    /**
     * Checks if token is an arg and has required variadic tokens (<arg...>).
     *
     * @param val the value to inspect.
     */
    isArgVariadicRequired(val: any): any;
    /**
     * Checks if flag is negated (--no-flag).
     *
     * @param val the value to inspect.
     */
    isNegateFlag(val: any): boolean;
    /**
     * Strips ansi characters.
     *
     * @param str the value to be stripped.
     */
    stripAnsi(str: any): any;
    /**
     * Takes and array and inspects if flag is boolean or has a value.
     *
     * @param arr the array of values to inspect.
     * @param index the index of the flag to inspect.
     */
    flagHasValue(arr: string[], index: number): string;
    expandArgs(tokens: string | string[]): string[];
    /**
     * Normalize array expands args to an array and spreads single flag options.
     *
     * @example .normalizeTokens('<arg> -abc') >> ['<arg>', '-a', '-b', '-c']
     *
     * @param tokens the token string to be normalized.
     * @param filter an array of items to filter out.
     */
    expandTokens(tokens: string | string[], ...filter: any[]): any[];
    /**
     * Splits usage string or tokens array separating the
     * prefix from the actual usage string.
     *
     * @param tokens the tokens containing usage.
     */
    splitUsage(tokens: string): {
        prefix: any;
        usage: any;
    };
    /**
     * Checks if a string contains tokens used in commands or options.
     *
     * @example .hasTokens('--flag:f [value]') >> true
     *
     * @param val the value to inspect.
     */
    hasTokens(val: string): boolean;
    /**
     * Strips tokens and ensures camelcase.
     *
     * @param name the name to be normalized.
     */
    parseName(name: string): string;
    /**
     * Parses arg into options arguments.
     *
     * @param arg the argument to be parsed.
     * @param key the argument's key.
     */
    parseArg(arg: string, key?: string): {
        name?: undefined;
        token?: undefined;
        type?: undefined;
        default?: undefined;
        describe?: undefined;
        alias?: undefined;
        variadic?: undefined;
        required?: undefined;
    } | {
        name: any;
        token: string;
        type: string;
        default: string;
        describe: string;
        alias: any;
        variadic: any;
        required: boolean;
    };
    /**
     * Parses an option into a configuration object.
     *
     * @param opt the option to be parsed.
     */
    parseOption(opt: string): {
        name: string;
        type: any;
        default: any;
        describe: any;
        token: any;
        alias: string[];
        variadic: boolean;
        required: boolean;
        value: {
            name?: undefined;
            token?: undefined;
            type?: undefined;
            default?: undefined;
            describe?: undefined;
            alias?: undefined;
            variadic?: undefined;
            required?: undefined;
        } | {
            name: any;
            token: string;
            type: string;
            default: string;
            describe: string;
            alias: any;
            variadic: any;
            required: boolean;
        };
    };
    /**
    * Parses all tokens in string or array expanding into
    * configurable options objects.
    *
    * @param tokens the token string or array to be parsed.
    * @param command the token command name.
    */
    parseTokens(tokens: string | string[], command?: string | boolean): {
        _name: any;
        _aliases: any[];
        _args: any[];
        _targs: any[];
        _error: any;
        _keys: any[];
    };
}
