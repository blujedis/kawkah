# Options

When defining your CLI app you can set only core options which we'll cover first below or additionally provide commands and their options as well. This makes it easy to create your logic in separate files and then import for instantiation of Kawkah.

## Core Options

Below are the primary Kawkah options.

### name

The CLI app's name which is used in help and templating. This <code>$0 install</code> becomes <code>app install</code> where "name" is equal to "app".

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>undefined</td></tr>
</table>

### locale

The localization locale to use for messages and help.

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>'en'</td></tr>
</table>

### output

The output stream to use for logging.

<table>
  <tr><td>Type</td><td>NodeJS.WriteStream</td></tr>
  <tr><td>Default</td><td>process.stderr</td></tr>
</table>

### scheme

Kawkah has multiple help schemes. Default lists Commands at the top with global options below. Additionally you can set to none for no scheme or "Commands" to display help grouped by commands with their respective options.

<table>
  <tr><td>Type</td><td>KawkahHelpScheme</td></tr>
  <tr><td>Default</td><td>KawkahHelpScheme.Default</td></tr>
   <tr><td>Values</td><td>Default, None, Commands</td></tr>
</table>

### theme

The colorization theme to use for help.

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>'default'</td></tr>
  <tr><td>Values</td><td>default, dim, bright, null</td></tr>

</table>

### commands

Object containing command configurations. See [Command Options](#CommandOptions) below.

<table>
  <tr><td>Type</td><td>IKawkahMap&lt;IKawkahCommand&gt;</td></tr>
  <tr><td>Default</td><td>undefined</td></tr>
</table>

### examples

Object containing examples to be displayed in help.

<table>
  <tr><td>Type</td><td>IKawkahMap&lt;string&gt;</td></tr>
  <tr><td>Default</td><td>undefined</td></tr>
</table>

### stacktrace

When true errors are displayed with full stacktrace. HINT: you can enabled <code>.trace()</code> which will allow you to enter <code>--trace</code> as a flag to toggle tracing on and off. It's helpful while building your application.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### terminate

When true the application will call process.exit() when an error or help is called. This is typically desired but in some complex cases you may wish to disable this.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### throw

When true Kawkah will simply throw errors rather than handle them internally.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### colorize

When true errors and help will be displayed with Ansi Styles/colors.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### timestampFormat

If you enable timestamps in error messages this format is used to display that timestamp. Some formats may not work but will fit the need in most cases.

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>'MM-dd-yyyy hh:mm:ss'</td></tr>
</table>

### logFormat

Logging uses the "formatr" module to format messages. Any property from KawkahError or KawkahCore can be used in the output.

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>'{{symbol}} {{message}}'</td></tr>
</table>

### middleware

List of default middleware that should be enabled, more on that below.

<table>
  <tr><td>Type</td><td>array</td></tr>
  <tr><td>Default</td><td>['minmax', 'coerce', 'extend', 'required', 'validator', 'demand', 'deny', 'aliases']</td></tr>
</table>

### styles

Object of Ansi styles used by Kawkah to style log messages and help when <code>.colorize</code> is enabled.

<table>
  <tr><td>Type</td><td>IKawkahMap&lt;string&gt;</td></tr>
  <tr><td>Default</td><td>see below</td></tr>
</table>

```ts
 styles: {
    primary: 'blueBright',
    accent: 'cyan',
    muted: 'gray',
    error: 'redBright.bold',
    warning: 'yellow',
    notify: 'blue',
    ok: 'green'
  }
```

### parser

By default Kawkah uses [kawkah-parser](https://github.com/blujedis/kawkah-parser) to parse raw command line arguments. You may also use your own parser that accepts the interface below.

<table>
  <tr><td>Type</td><td>IKawkahMap&lt;string&gt;</td></tr>
  <tr><td>Default</td><td>kawkah-parser</td></tr>
  <tr><td>Interface</td><td>argv?: string | any[], options?: IKawhakParserOptions</td></tr>

</table>

## Parser Options

The below are the options passed to the default or your custom parser.

### charVariadic

Character denoting variadic arguments.

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>...</td></tr>
</table>

### charAbort

Character used to abort parsing of args.

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>--</td></tr>
</table>

### charNegate

Character used to negate boolean flags

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>no-</td></tr>
</table>

### allowParseBooleans

Allows parsing flags as boolean.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowParseNumbers

Allows parsing number like values.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowCamelcase

Allow converting some-flag to someFlag.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowShortExpand

Allows expanding -abc to -a -b -c.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowShortValues

Allows short flags to have values.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowDuplicateOptions

Allows --tag red --tag green --tag blue which will be stored in an array.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowDotNotation

Allows --user.name bob to result in { name: 'bob'}.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowBoolNegation

Allows --no-force to set --force flag to false.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowCountOptions

Allows -vvvvv to result in { v: 5 }.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowVariadics

Allows arguments to be grouped in an array.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowAnonymous

Allows anonymous arguments when false flags/args must have configuration.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowExtendArgs

When true args in _ are extend to result object by name.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### allowPlaceholderArgs

When true result._ args set as null when no value.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### allowPlaceholderOptions

When true if a configured option is not present a placeholder is set.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### onParserError

When null errors are thrown otherwise handled by specified handler.

<table>
 <tr><td>Type</td><td>function</td></tr>
  <tr><td>Default</td><td>undefined</td></tr>
</table>

## Command Options

These are the options that can be defined for a single command when creating an object of commands for the core options [commands](#commands) property.

### usage

The usage string will be auto generated if one is not provided. If you do provide a usage string it will be parsed and ensure the arguments you defined are created for the command. See [usage examples](/assets/EXAMPLES.md/#usage) for more information.

<table>
 <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>'$0'</td></tr>
</table>

### describe

This property stores the description.

<table>
 <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>''</td></tr>
</table>

### alias

String or array of aliases for the command.

<table>
 <tr><td>Type</td><td>string|array</td></tr>
 <tr><td>Default</td><td>[]</td></tr>
</table>

### help

Custom string for displaying help or a boolean to enable/disable.

<table>
 <tr><td>Type</td><td>string|boolean</td></tr>
 <tr><td>Default</td><td>true</td></tr>
</table>

### spread

When true arguments are spread when calling a command's action handler. See [spread examples](/assets/EXAMPLES.md/#spread).

<table>
 <tr><td>Type</td><td>string|boolean</td></tr>
 <tr><td>Default</td><td>false</td></tr>
</table>

### minArgs

Specifies that a minimum amount of arguemnts are required.

<table>
 <tr><td>Type</td><td>number</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
</table>

### maxArgs

Specifies that a maximum amount of arguemnts are allowed.

<table>
 <tr><td>Type</td><td>number</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
</table>

### minFlags

Specifies that a minimum amount of flags are required.

<table>
 <tr><td>Type</td><td>number</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
</table>

### maxFlags

Specifies that a maximum amount of flags are allowed.

<table>
 <tr><td>Type</td><td>number</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
</table>

### options

An object map containing [command option](#CommandOption) configurations.

<table>
 <tr><td>Type</td><td>IKawkahMap&lt;IKawkahOption&gt;</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
</table>

### action

A function to be called when Kawkah detects the command.

<table>
 <tr><td>Type</td><td>KawkahAction</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
 <tr><td>Spread Interface</td><td>(...args: any[])</td></tr>
 <tr><td>Default Interface</td><td>(result: IKawkahResult, context: KawkahCore)</td></tr>
</table>


## Command Option

Command options are configuration objects attached to a command. ONLY options attacked to the default command (the command created when you instantiate Kawkah) are global. You can see more on this in the examples.

Command options consist of two basic types. Argument options and Flag options. An argument defined in usage looks like <code>&lt;arg&gt;</code> whereas a flag looks like <code>--flag</code>. We'll get more into this in the examples but it is important to understand that both are "options" yet they behave differently.

### type

The type hint for the option.

<table>
 <tr><td>Type</td><td>string</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
 <tr><td>Values</td><td>string, boolean, number, array</td></tr>
</table>

### describe

The description for the option.

<table>
 <tr><td>Type</td><td>string</td></tr>
 <tr><td>Default</td><td>''</td></tr>
</table>

### alias

An alias for the option (ONLY available for Flag options).

<table>
 <tr><td>Type</td><td>string|array</td></tr>
 <tr><td>Default</td><td>[]</td></tr>
</table>

### default

A default value when this option is undefined.

<table>
 <tr><td>Type</td><td>any</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
</table>

### required

Indicates the option is required.

<table>
 <tr><td>Type</td><td>boolean</td></tr>
 <tr><td>Default</td><td>false</td></tr>
</table>

### demand

An array of option keys that are to be demanded when this option is present.

<table>
 <tr><td>Type</td><td>string|array</td></tr>
 <tr><td>Default</td><td>[]</td></tr>
</table>

### demand

An array of option keys that are to be denied when this option is present.

<table>
 <tr><td>Type</td><td>string|array</td></tr>
 <tr><td>Default</td><td>[]</td></tr>
</table>

### variadic

Indicates the argument option is variadic meaning it accepts multiple values. When a number is defined it limits to that count.

<table>
 <tr><td>Type</td><td>number|boolean</td></tr>
 <tr><td>Default</td><td>false</td></tr>
</table>

### validate

Allows for simple validations such as validating against a RegExp a custom user function or a configuration object.

<table>
 <tr><td>Type</td><td>RegExp|KawkahValidateHandler|IKawkahValidateConfig</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
 <tr><td>Function Interface</td><td>(val?: any, key?: string, option?: IKawkahOption, context?: KawkahCore)</td></tr>
 <tr><td>Object Interface</td><td>{ message?: string; handler?: RegExp | KawkahValidateHandler; }</td></tr>
</table>

### help

Custom help string or boolean to enable/disable.

<table>
 <tr><td>Type</td><td>string|boolean</td></tr>
 <tr><td>Default</td><td>true</td></tr>
</table>

### completions

Custom values for tab completions. (NOT available for Windows)

<table>
 <tr><td>Type</td><td>string|array</td></tr>
 <tr><td>Default</td><td>[]</td></tr>
</table>

### extend

Defines the option as an extend option allowing the extention of static values onto the parsed result or looking up from a config file such as config.yml or config.json. ONLY Yaml and JSON are supported.

<table>
 <tr><td>Type</td><td>string|array</td></tr>
 <tr><td>Default</td><td>any|boolean</td></tr>
</table>

### skip

When true validation middleware is skipped for this option.

<table>
 <tr><td>Type</td><td>boolean</td></tr>
 <tr><td>Default</td><td>false</td></tr>
</table>

### action

A function to be called when Kawkah detects this option. (ONLY available for Flag options on default command).

<table>
 <tr><td>Type</td><td>KawkahAction</td></tr>
 <tr><td>Default</td><td>undefined</td></tr>
 <tr><td>Spread Interface</td><td>(...args: any[])</td></tr>
 <tr><td>Default Interface</td><td>(result: IKawkahResult, context: KawkahCore)</td></tr>
</table>