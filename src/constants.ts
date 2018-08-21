import * as escape from 'escape-string-regexp';
import { IKawkahOptions, IKawkahGroup, IKawkahCommandInternal, IKawkahOptionInternal, IKawkahTheme, IKawkahThemes, KawkahHelpScheme, IKawkahCommand } from './interfaces';
import { dirname } from 'path';
import { homedir } from 'os';

// CONSTANTS //

export const ROOT_DIR = dirname(module.parent.filename);
export const HOME_DIR = homedir();

export const DEFAULT_COMMAND_NAME = '@Default';

export const RESULT_NAME_KEY = '$0';
export const RESULT_ARGS_KEY = '_';
export const RESULT_ABORT_KEY = '__';
export const RESULT_COMMAND_KEY = '$command';

export const VARIADIC_TOKEN = '...';
export const NEGATE_TOKEN = 'no-';
export const ABORT_TOKEN = '--';
export const ALIAS_TOKEN = ':';
export const SEGMENT_TOKEN = '|';

const MESSAGE_ESCAPE_CHARS = escape(',;.*&%$#@!*-+=^|:<>()[]/\\~\'"');
export const MESSAGE_FORMAT_BASE_EXP = new RegExp('{{[\\d\\w' + MESSAGE_ESCAPE_CHARS + ']+}}');
export const MESSAGE_FORMAT_EXP = new RegExp(MESSAGE_FORMAT_BASE_EXP, 'g');
export const MESSAGE_BRACE_EXP = /({{|}})/g;
export const MESSAGE_KEY_EXP = /[\w\d-\$\.\|]+/;

export const DEFAULT_THEME: IKawkahTheme = {

  header: null,
  command: null,
  title: null,
  label: null,
  usage: null,
  alias: null,
  argument: null,
  flag: null,
  describe: null,
  type: null,
  variadic: null,
  required: null,
  footer: null

};

export const DEFAULT_THEMES: IKawkahThemes = {

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
    type: null,
    variadic: 'primary',
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
    type: 'magentaBright',
    variadic: 'blueBright',
    required: 'redBright',
    footer: 'magentaBright',
    example: null

  }

};

export const DEFAULT_OPTION: IKawkahOptionInternal = {

  type: 'string',                   // string or coerce action.
  alias: [],                        // aliases for the option. (flags only).
  describe: '',                     // option description.
  demand: [],                       // when option is called these are required.
  deny: [],                         // when option is present exclude those listed.
  default: undefined,               // a default value.
  required: false,                  // option is required.
  validate: undefined,              // RegExp or user defined validator function.
  variadic: false,                  // indicates option is variadic. (args only)
  help: true,                       // enables/disables item in help menu.
  completions: [],                  // array of custom completion values.
  extend: undefined,                // handles extending option with config values.
  skip: false,                      // when true skip validation for this option.
  action: undefined                // for use with option actions like help or version.

};

export const DEFAULT_GROUP: IKawkahGroup = {

  title: undefined,       // the title of the group displayed in help.
  items: [],              // array of items for the group.
  indent: 2,              // whether to indent the group items.
  enabled: true           // toggles visibility.

};

export const DEFAULT_COMMAND: IKawkahCommand = {

  usage: undefined,                  // usage map string.
  describe: '',                      // command description.
  alias: [],                         // command aliases.
  help: true,                        // enables/disables help for command.
  spread: false,                     // when true spread command args in action callback.
  minArgs: undefined,                // minimum args required for the command.
  maxArgs: undefined,                // max args allowed for the command.
  minFlags: undefined,               // mininum flags allowed for command.
  maxFlags: undefined,               // maximum flags allowd for command.
  options: undefined,                // object containing option configs.
  examples: {}                        // object of examples for the command.

};

export const DEFAULT_PARSER_OPTIONS = {

  charVariadic: VARIADIC_TOKEN,        // char denoting variadic argument.
  charAbort: ABORT_TOKEN,              // when seen all args/opts after are ignored.
  charNegate: NEGATE_TOKEN,            // the char to use to negate boolean flags.

  allowParseBooleans: true,            // allows auto parsing booleans.
  allowParseNumbers: true,             // allows auto parsing numbers.
  allowCamelcase: true,                // when true camelcase is used.
  allowShortExpand: true,              // converts -abc to -a, -b, -c.
  allowShortValues: true,              // when true "-f val" allowed otherwise is boolean.
  allowDuplicateOptions: true,         // allows -x 10 -x 20 to become x: [ 10, 20 ]
  allowDotNotation: true,              // allows user.name >> user: { name: value }
  allowBoolNegation: true,             // allows --no-force to set force flag as false.
  allowCountOptions: true,             // allows for -vvvvv to become { v: 5 }
  allowAnonymous: true,                // when true non configured args are allowed.
  allowVariadics: true,                // allows arg1... arg2 arg3 >> [arg1, arg2, arg3]

  allowAliases: false,                 // Kawkkah will handle aliases after middleware.
  allowPlaceholderArgs: false,         // when true indexed args set to null if undefined.
  allowPlaceholderOptions: false,      // when true options set to default if missing.
  allowExtendArgs: false,              // when true config'd index args added to result.
  onParserError: null

};

export const DEFAULT_OPTIONS: IKawkahOptions = {

  name: undefined,                   // app name if undefined will be generated.
  locale: 'en',                      // the i18n locale to use for messages.
  output: process.stderr,            // the output stream for log/error messages.
  scheme: KawkahHelpScheme.Default,  // scheme for displaying help.
  theme: 'default',                  // theme for help.
  header: undefined,                 // header text.
  footer: undefined,                 // footer text.
  commands: undefined,               // object containing defined commands.
  examples: undefined,               // object containing example usage.
  stacktrace: false,                 // when true full stack traces are show for errors.
  terminate: true,                   // when true process.exit is called on errors.
  throw: false,                      // when true errors are thrown instead of handled.
  colorize: true,                    // when true colorize console message.
  strict: false,

  // timestamp format to use.
  timestampFormat: 'MM-dd-yyyy hh:mm:ss',

  // Format/template for log messages.
  logFormat: '{{symbol}} {{message}}',

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
