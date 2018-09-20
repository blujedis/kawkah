"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const escape = require("escape-string-regexp");
const interfaces_1 = require("./interfaces");
const path_1 = require("path");
const os_1 = require("os");
// CONSTANTS //
exports.ROOT_DIR = path_1.dirname(module.parent.filename);
exports.HOME_DIR = os_1.homedir();
exports.DEFAULT_COMMAND_NAME = '@Default';
exports.RESULT_NAME_KEY = '$0';
exports.RESULT_ARGS_KEY = '_';
exports.RESULT_ABORT_KEY = '__';
exports.RESULT_COMMAND_KEY = '$command';
exports.VARIADIC_TOKEN = '...';
exports.NEGATE_TOKEN = 'no-';
exports.ABORT_TOKEN = '--';
exports.ALIAS_TOKEN = ':';
exports.SEGMENT_TOKEN = '|';
const MESSAGE_ESCAPE_CHARS = escape(',;.*&%$#@!*-+=^|:<>()[]/\\~\'"');
exports.MESSAGE_FORMAT_BASE_EXP = new RegExp('{{[\\d\\w' + MESSAGE_ESCAPE_CHARS + ']+}}');
exports.MESSAGE_FORMAT_EXP = new RegExp(exports.MESSAGE_FORMAT_BASE_EXP, 'g');
exports.MESSAGE_BRACE_EXP = /({{|}})/g;
exports.MESSAGE_KEY_EXP = /[\w\d-\$\.\|]+/;
exports.DEFAULT_THEME = {
    header: null,
    command: null,
    title: null,
    label: null,
    usage: null,
    alias: null,
    argument: null,
    flag: null,
    describe: null,
    describeCommand: null,
    memo: null,
    type: null,
    variadic: null,
    required: null,
    footer: null
};
exports.DEFAULT_THEMES = {
    default: {
        header: null,
        command: 'primary',
        title: 'accent',
        label: 'accent',
        usage: null,
        alias: null,
        argument: null,
        flag: null,
        describe: null,
        describeCommand: 'muted',
        memo: null,
        type: null,
        variadic: 'warning',
        required: 'error',
        footer: 'muted',
        example: null
    },
    dim: {
        header: 'cyan.dim',
        command: 'blue.dim',
        title: 'cyan.dim',
        label: 'cyan.dim',
        usage: 'white.dim',
        alias: 'white.dim',
        argument: 'white.dim',
        flag: 'white.dim',
        describe: 'white.dim',
        describeCommand: 'white.dim',
        memo: 'gray',
        type: 'white.dim',
        variadic: 'yellow.dim',
        required: 'redBright.dim',
        footer: 'gray',
        example: 'gray'
    },
    bright: {
        header: 'greenBright',
        command: 'greenBright',
        title: 'greenBright',
        label: 'greenBright',
        usage: 'magentaBright',
        alias: 'blueBright',
        argument: 'magentaBright',
        flag: 'magentaBright',
        describe: 'blueBright',
        describeCommand: 'blueBright',
        memo: 'cyanBright',
        type: 'magentaBright',
        variadic: 'blueBright',
        required: 'redBright',
        footer: 'magentaBright',
        example: null
    }
};
exports.DEFAULT_OPTION = {
    type: 'string',
    alias: [],
    describe: '',
    demand: { keys: [], match: 0 },
    deny: { keys: [], match: 0 },
    default: undefined,
    required: false,
    validate: undefined,
    variadic: false,
    help: true,
    completions: [],
    extend: undefined,
    skip: false,
    action: undefined // for use with option actions like help or version.
};
exports.DEFAULT_GROUP = {
    title: undefined,
    items: [],
    indent: 2,
    enabled: true,
    sort: undefined,
    children: [] // array of child groups to display.
};
exports.DEFAULT_COMMAND = {
    usage: undefined,
    describe: '',
    alias: [],
    help: true,
    spread: false,
    minArgs: undefined,
    maxArgs: undefined,
    minFlags: undefined,
    maxFlags: undefined,
    options: undefined // object containing option configs.
};
exports.DEFAULT_PARSER_OPTIONS = {
    charVariadic: exports.VARIADIC_TOKEN,
    charAbort: exports.ABORT_TOKEN,
    charNegate: exports.NEGATE_TOKEN,
    allowParseBooleans: true,
    allowParseNumbers: true,
    allowCamelcase: true,
    allowShortExpand: true,
    allowShortValues: true,
    allowDuplicateOptions: true,
    allowDotNotation: true,
    allowBoolNegation: true,
    allowCountOptions: true,
    allowAnonymous: true,
    allowVariadics: true,
    allowAliases: false,
    allowPlaceholderArgs: false,
    allowPlaceholderOptions: false,
    allowExtendArgs: false,
    onParserError: null
};
exports.DEFAULT_OPTIONS = {
    name: undefined,
    locale: 'en',
    output: process.stderr,
    scheme: interfaces_1.KawkahHelpScheme.Default,
    theme: 'default',
    header: undefined,
    footer: undefined,
    width: undefined,
    sortGroups: undefined,
    commands: undefined,
    examples: undefined,
    stacktrace: false,
    terminate: true,
    throw: false,
    colorize: true,
    strict: false,
    // timestamp format to use.
    timestampFormat: 'MM-dd-yyyy hh:mm:ss',
    // Format/template for log messages.
    logFormat: '{{event}} {{message}} {{ministack|parens|muted}}',
    // Array of enabled middleware.
    middleware: ['minmax', 'coerce', 'extend', 'required', 'validator', 'demand', 'deny', 'aliases'],
    // map of colors used when outputting to console.
    styles: {
        primary: 'blueBright',
        accent: 'cyan',
        muted: 'gray',
        error: 'redBright',
        warning: 'yellow',
        notify: 'blue',
        ok: 'green'
    }
};
//# sourceMappingURL=constants.js.map