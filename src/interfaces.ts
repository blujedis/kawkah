import { KawkahCore } from './core';
import { IKawkahParserOptions, IKawkahParserResult, IKawhakParserBaseOptions, KawkahParserType } from 'kawkah-parser';
import { IAnsiStyles } from 'colurs';
import { ITablurColumn } from 'tablur';
import { SpawnOptions } from 'child_process';

export { IKawkahParserOptions, IKawkahParserResult };
export { IAnsiStyles } from 'colurs';

export type AnsiStyles = keyof IAnsiStyles;

// MAPS //

export type RecordMap<K extends string, T, U> = T & Record<K, U>;
export type JoinMap<T, U> = T & U;
export interface IKawkahMap<T> {
  [key: string]: T;
}

export interface ITest {

}

// ACTION & COERCION  //

export type KawkahHandler = (val: any, context?: KawkahCore) => any;
export type KawkahIsTypeHandler = (val: any) => boolean;
export type KawkahAction = (...args: any[]) => void;
export type KawkahResultAction = (result?: IKawkahResult, context?: KawkahCore) => void;
export type KawkahOptionType = KawkahParserType;
export type KawkahMiddlewareOld = (result?: IKawkahResult, command?: IKawkahCommandInternal, context?: KawkahCore) => any;

// HANDLERS //

export type KawkahCallback = (err?: Error, data?: any) => void;
export type KawkahHelpHandler = (groups?: string[], context?: KawkahCore) => void;
export type KawkahLogHandler = (type?: any, message?: any, ...args: any[]) => void;

// COMPLETION TYPE //

export type KawkahCompletionsCallback = (completions: any[]) => void;
export type KawkahCompletionsHandler =
  (query: IKawkahCompletionQuery, done?: KawkahCompletionsCallback) => any[];

// VALIDATION/PARSER TYPES //

export type KawkahValidateHandler = (val?: any, key?: string, event?: IKawkahMiddlewareEventOption, context?: KawkahCore) => string | boolean | Error;
export type KawkahValidate = RegExp | KawkahValidateHandler | IKawkahValidateConfig;
export type KawkahParser = (argv: string | string[], options?: IKawkahOptionsInternal) => IKawkahResult;
export type KawkahFormatMessageCallback = (key: string, data: IKawkahFormatMessage) => string;
export type KawkahReduceCallback = <T, U>(current: T, accumulator: U, index: number, array: T[]) => U;

// KEYOF TYPES //

export type KawkahCommandKeys = keyof IKawkahCommand;
export type KawkahCommandInternalKeys = keyof IKawkahCommandInternal;

export type KawkahOptionKeys = keyof IKawkahOption;
export type KawkahOptionInternalKeys = keyof IKawkahOptionInternal;

export type KawkahOptionsKeys = keyof IKawkahOptions;
export type KawkahOptionsInternalKeys = keyof IKawkahOptionsInternal;

export type KawkahHelpMetadataKeys = keyof IKawkahHelpMetadata;

export type KawkahStyleKeys = keyof IKawkahStyles;
export type KawkahThemeSytleKeys = keyof IKawkahTheme;
export type KawkahThemeKeys = keyof IKawkahThemes;

export type KawkahAnsiType = string | AnsiStyles | AnsiStyles[];

export type SpawnOptionKeys = keyof SpawnOptions;

////////////////
// MIDDLEWARE //
////////////////

export type KawkahResultMiddleware = (result: IKawkahResult, event?: IKawkahMiddlewareEventResult, context?: KawkahCore) => IKawkahResult | Error;

export type KawkahOptionMiddleware = (val: any, key?: string, event?: IKawkahMiddlewareEventOption, context?: KawkahCore) => any;

export type KawkahMiddleware = <T>(val: any, ...args: any[]) => T;

export type KawkahMiddlwareHandler = KawkahResultMiddleware | KawkahOptionMiddleware | KawkahMiddleware;

export enum KawkahMiddlewareGroup {
  AfterParsed = 'AfterParsed',
  BeforeValidate = 'BeforeValidate',
  Validate = 'Validate',
  AfterValidate = 'AfterValidate',
  BeforeAction = 'BeforeAction'
}

export interface IKawkahMiddleware {
  readonly name: string;
  group?: KawkahMiddlewareGroup;
  commands?: string[];
  enabled?: boolean;
  extend?: boolean;
  handler: KawkahMiddlwareHandler;
  [key: string]: any;
}

// ENUMS //

export enum KawkahHelpScheme {
  None = 'none',
  Default = 'default',
  Commands = 'commands'
}

export enum KawkahGroupType {
  Commands = 'commands',
  Arguments = 'arguments',
  Flags = 'flags',
  Examples = 'examples'
}

export enum KawkahEvent {
  Error = 'Error',
  Warning = 'Warning',
  Notify = 'Notify',
  Ok = 'Ok',
  Help = 'Help',
  Catch = 'Catch'
}

// INTERFACES //

export interface IKawkahValidateConfig {
  message?: string;
  handler?: RegExp | KawkahValidateHandler;
}

export interface IKawkahDemandDeny {
  handler?: RegExp | KawkahValidateHandler;
  keys?: string | string[];
  match?: number;
}

export interface IKawkahTheme {
  header?: KawkahAnsiType;
  label?: KawkahAnsiType;
  command?: KawkahAnsiType;
  title?: KawkahAnsiType;
  usage?: KawkahAnsiType;
  alias?: KawkahAnsiType;
  argument?: KawkahAnsiType;
  flag?: KawkahAnsiType;
  describe?: KawkahAnsiType;
  describeCommand?: KawkahAnsiType;
  type?: KawkahAnsiType;
  variadic?: KawkahAnsiType;
  required?: KawkahAnsiType;
  footer?: KawkahAnsiType;
  example?: KawkahAnsiType;
}

export interface IKawkahThemes {
  default: IKawkahTheme;
  dim: IKawkahTheme;
  bright: IKawkahTheme;
}

export interface IKawkahStyles {
  primary?: KawkahAnsiType;
  accent?: KawkahAnsiType;
  muted?: KawkahAnsiType;
  error?: KawkahAnsiType;
  warning?: KawkahAnsiType;
  notify?: KawkahAnsiType;
  ok?: KawkahAnsiType;
}

export interface IKawkahLocaleMap {
  toArray(...filters: any[]): any[];
  format(str: string, ...args: any[]): string;
}

export interface IKawkahHelpMetadata {
  header?: string | string[] | ITablurColumn | ITablurColumn[];
  footer?: string | string[] | ITablurColumn | ITablurColumn[];
}

export interface IKawkahFormatMessage {
  match: string;
  key: string;
  raw: any;
  val: any;
  obj: IKawkahMap<any>;
  colorize: boolean;
}

export interface IKawkahCompletionQuery {
  line?: string[];
  words?: number;
  point?: number;

  // Following for tabtab, may use in future.
  partial?: string;
  lastPartial?: string;
  prev?: string;
  last?: string;
}

export interface IKawkahAssert {
  type(val: any, type: string, err: string | Error);
  equals(val: any, comparator: any, err: string | Error);
  notEquals(val: any, comparator: any, err: string | Error);
}


export interface IKawkahGroup {
  title?: string;
  isCommand?: boolean;
  items?: string | string[];
  indent?: number;
  sort?: boolean;
  enabled?: boolean;
  children?: string | string[];
}

// COMMAND & OPTIONS //

export interface IKawkahOptionBase {
  type?: KawkahOptionType;
  index?: true | number; // indicates is argument.
  alias?: string | string[];
  describe?: string;
  demand?: string | string[] | IKawkahDemandDeny;
  deny?: string | string[] | IKawkahDemandDeny;
  default?: any;
  required?: boolean;
  coerce?: KawkahHandler;
  validate?: KawkahValidate;
  variadic?: number | boolean;
  help?: string | boolean | KawkahHandler;
  completions?: string | string[];
  extend?: any;
  skip?: boolean;
  action?: KawkahResultAction; // only avail for global command options.
}

/**
 * Contains all properties for arg and flag option types.
 */
export interface IKawkahOption extends IKawkahOptionBase {

}

export interface IKawkahOptionInternal extends IKawkahOption {
  name?: string;
  index?: number;
  alias?: string[];
  demand?: IKawkahDemandDeny;
  deny?: IKawkahDemandDeny;
  completions?: string[];
  extend?: true | string[];
  static?: any;
  validate?: IKawkahValidateConfig;
  command?: string;
}

export interface IKawkahCommandOptions {
  [key: string]: IKawkahOption | IKawkahOptionInternal;
}

export interface IKawkahCommand {
  readonly usage?: string;
  readonly args?: string[];
  describe?: string;
  alias?: string | string[];
  options?: IKawkahMap<string | IKawkahOption>;
  help?: string | boolean | KawkahHandler;
  spread?: boolean;
  external?: string;
  externalOptions?: SpawnOptions;
  skip?: boolean;
  abort?: boolean;
  minArgs?: number;
  maxArgs?: number;
  minFlags?: number;
  maxFlags?: number;
  action?: KawkahAction;
}

export interface IKawkahCommandInternal extends IKawkahCommand {
  usage?: string;
  name?: string;
  args?: string[];
  alias?: string[];
  options?: IKawkahMap<IKawkahOptionInternal>;
}

export interface IKawkahCommands {
  [key: string]: IKawkahCommand | IKawkahCommandInternal;
}

// OPTIONS //

export interface IKawkahOptionsBase {
  name?: string;
  locale?: string;
  output?: NodeJS.WritableStream;
  parser?: KawkahParser;
  scheme?: KawkahHelpScheme | string;
  theme?: KawkahThemeKeys | IKawkahTheme | string;
  header?: string;
  footer?: string;
  width?: number;
  colorize?: boolean;
  spread?: boolean;
  stacktrace?: boolean;
  throw?: boolean;
  terminate?: boolean;
  examples?: IKawkahMap<string>;
  commands?: IKawkahMap<string | IKawkahCommand>;
  timestampFormat?: string;
  logFormat?: string;
  middleware?: string[];
  styles?: IKawkahStyles;
  strict?: boolean;
}

/**
 * All Kawkah options passed by user for configuration.
 */
export interface IKawkahOptions extends IKawkahOptionsBase, IKawkahCommand, IKawhakParserBaseOptions {
  usage?: string;
}

/**
 * Internal options interface stripping out default command options.
 */
export interface IKawkahOptionsInternal extends IKawkahOptionsBase, IKawkahParserOptions {
  theme?: {
    header?: AnsiStyles[];
    label?: AnsiStyles[];
    title?: AnsiStyles[];
    usage?: AnsiStyles[];
    alias?: AnsiStyles[];
    argument?: AnsiStyles[];
    option?: AnsiStyles[];
    describe?: AnsiStyles[];
    type?: AnsiStyles[];
    variadic?: AnsiStyles[];
    required?: AnsiStyles[];
    footer?: AnsiStyles[];
  };
  styles?: {
    primary?: AnsiStyles[];
    accent?: AnsiStyles[];
    muted?: AnsiStyles[];
    alert?: AnsiStyles[];
    warning?: AnsiStyles[];
    notify?: AnsiStyles[];
  };
}

// RESULT & VALIDATION //

export interface IKawkahNormalized {
  first?: string;
  command?: IKawkahCommandInternal;
  defaultCommand?: IKawkahCommandInternal;
  argv?: string[];
  actionKeys?: string[];
}

export interface IKawkahValidateResult {
  anonymous?: any[];
  stripped?: any[];
  spread?: any[];
  variadics?: any[];
  errors?: any[];
  options?: IKawkahMap<any>;
}

export interface IKawkahResult extends IKawkahParserResult {
  $0?: string;
  $command?: string;
}

export interface IKawkahMiddlewareEventBase {
  start?: number;
  completed?: number;
  elapsed?: number;
  result?: IKawkahResult;
  isHelp?: boolean;               // indicates help was requested.
  command?: IKawkahCommandInternal;
}

export interface IKawkahMiddlewareEventResult extends IKawkahMiddlewareEventBase { }

export interface IKawkahMiddlewareEventOption extends IKawkahMiddlewareEventBase {
  isArg?: boolean;                // indicates current option is an argument.
  isFlag?: boolean;               // indicates current option is a flag.
  isPresent?: boolean;            // indicates option is present in result.
  option?: IKawkahOptionInternal; // the current option config.
}

export interface IKawkahMiddlewareEvent extends IKawkahMiddlewareEventResult, IKawkahMiddlewareEventOption { }

