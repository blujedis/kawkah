 # API

[Back to Menu](../README.md/#table-of-contents)

Kawkah is made up of four basic classes KawkahCore, KawkahComamnd & Kawkah. All classes interact with KawkahCore, it holds the context. You instantiate Kawkah passing in your initial options/config. This becomes the default command which has some special methods. When calling <code>kawkah.command()</code> It returns an instance of KawkahCommand.

It's import to note methods that end in **For** are methods meant to configure an option. This is because a command has for example the method <code>.alias()</code> to configure aliases. Options also can contain aliases, hence the method would be <code>.aliasFor()</code>.

**NOTE:** Please review [docs](https://blujedis.github.io/kawkah/) for generated API. The generated docs tend to be more acurate as they are generated from built source.

ALL examples assume you've instantiated an instance of Kawkah as follows.

```ts
import { Kawkah } from 'kawkah'; // or const Kawkah = require('kawkah').Kawkah;
const kk = new Kawkah({ /* options here */ });
```

## Base Methods

This section contains API methods that are base methods to both the Kawkah instance and any KawkahCommand instance.

### .arg()

Adds an argument option to the command.

```ts
kk.arg('type', {
  coerce: (v) => v.toUpperCase(),
  required: true
});
```

OR

```ts
kk.arg('<type>')
  .coerceFor('type', (v) => v.toUpperCase());
```
Usage: <code>$ pizza</code>

Result: <code>{ _: ['PIZZA'] }</code>

### .args()

Adds multiple argument options.

```ts
kk.args('<type>', '[arg2]', '[arg3]', '...');
```

Usage: <code>$ pizza arg2 arg3</code>

Result: <code>{ _: ['PIZZA', 'arg2', 'arg3'] }</code>

### .flag()

Adds a flag option to the command. Notice aliases are extended to the result. This is helpful as you don't have to think about the result object. This feature can be disabled.

```ts
kk.flag('toppings', {
  type: 'array',
  alias: 't',
  validate: /(cheese|mushroom|ham)/
});
```

OR

```ts
kk.flag('--toppings:t [array]')
  .validateFor('toppings', /(cheese|mushroom|ham)/);
```

Usage: <code>$ --toppings cheese --toppings ham</code>

Result: <code>{ toppings: ['cheese', 'ham' ]: t: ['cheese', 'ham' ] }</code>

### .flags()

Adds multiple argument options.

```ts
kk.flags('--toppings', '--drink', '...');
```

Usage: <code>$ --toppings cheese --toppings ham --drink</code>

Result: <code>{ toppings: ['cheese', 'ham' ]: t: ['cheese', 'ham' ], --drink: true }</code>

### .describe()

Adds description for command.

```ts
kk.describe('Some description for this command.');
```

### .alias()

Adds alias for command.

```ts
kk.alias('cmd', 'c');
```

### .spread()

Sets option indicating result args should be spread in action handler.

```ts
kk.spread(); // or .spread(false);
```

### .minArgs()

Sets option expecting at least this number of arguments.

```ts
kk.minArgs(2);
```

Usage: <code>$ pizza</code>

Result: <code>✖ Not enough arguments got: 1 expected: 2</code>

### .maxArgs()

Sets option allowing no more than this number of arguments.

```ts
kk.maxArgs(1);
```

Usage: <code>$ pizza arg2</code>

Result: <code>✖ Too many arguments got: 2 expected: 1</code>

### .minFlags()

Sets option expecting at least this number of flags.

```ts
kk.minFlags(2);
```

Usage: <code>$ --flag</code>

Result: <code>✖ Not enough flags got: 1 expected: 2</code>

### .maxFlags()

Sets option allowing no more than this number of flags.

```ts
kk.maxFlags(1);
```

Usage: <code>$ --flag --other</code>

Result: <code>✖ Too many flags got: 2 expected: 1</code>

### .skip()

Sets value indicating validation should be skipped on all options for this command.

```ts
kk.skip(); // or kk.skip(false);
```

### .help()

Sets a value enabling/disabling help or specifying custom text or function for retreiving help text.

```ts
kk.help(false); // would disable help for this command.
```

OR

```ts
kk.help('My custom help text to be displayed on help.');
```

OR

```ts
kk.help((command: IKawkahCommand, context: KawkahCore) => {
  return 'your generated help text for command';
});
```

### .action()

Sets an action method to be called when the command is detected.

```ts
kk.action((result: IKawkahResult, context: KawkahCore) => {
  // Do something with result.
});
```

### .example()

Adds an example to be displayed in help.

```ts
// "install.simple" is arbitrary just a name
// making it indexable for removal etc.
kk.example('install.simple', 'This is the simplest way to install');
```

### .about()

Adds a long description for the current command.

```ts
kk.about('Some very long description that would be helpful to user.');
```

Result:

```sh
CommandName:

'A very long memo for CommandName'

Examples:

'List of command examples'
```

## Option Methods

This section contains API methods that are base methods for options on both the Kawkah instance and any KawkahCommand instance.

### .typeFor()

Sets the type for an option.

```ts
kk.typeFor('toppings', 'array');
```

### .stringFor()

Sets an option as type string.

```ts
kk.stringFor('toppings');
```

### .booleanFor()

Sets an option as type boolean.

```ts
kk.booleanFor('toppings');
```

### .numberFor()

Sets an option as type number.

```ts
kk.numberFor('toppings');
```

### .arrayFor()

Sets an option as type array.

```ts
kk.arrayFor('toppings');
```

### .aliasFor()

Sets alias for an option. (ONLY for flags)

```ts
kk.aliasFor('toppings', 'top', 't');
```

### .describeFor()

Sets a description for an option.

```ts
kk.describeFor('toppings', 'Array of topping for my pizza.');
```

### .demandFor()

Sets keys to demand when this option is present.

```ts
kk.demandFor('order', 'toppings', 'drink');
// Only demand crust & size if order's value is "pizza".
kk.demandFor('order', ['crust', 'size'], /pizza/)
```

### .denyFor()

Sets keys to be denied when this option is present.

```ts
kk.denyFor('toppings', 'drink');
// Deny crust & size if order's value is of type not related to a pizza.
kk.demandFor('order', ['crust', 'size'], /(drink|dessert)/)
```

### .defaultFor()

Sets a default value for an option.

```ts
kk.defaultFor('toppings', 'cheese');
```

### .requiredFor()

Sets an option as required.

```ts
kk.requiredFor('toppings'); // or kk.requiredFor('toppings', false);
```

### .coerceFor()

Sets a handler for coercing value.

```ts
kk.coerceFor('toppings', (val) => {
  if (!~val.indexOf('ham'))
    val.push('ham');
  return val;
});
```

### .validateFor()

Performs validation of value.

```ts
kk.validateFor('toppings', /(cheese|mushroom|ham)/);
```

OR

```ts
kk.validateFor('toppings', (val) => {
  // Validate and return.
  return val;
});
```

OR

```ts
kk.validateFor('toppings', {
  message: 'My custom validation message',
  handler: /(cheese|mushroom|ham)/ // RegExp or handler function.
});
```

### .variadicFor()

Sets option as variadic. (ONLY for arguments)

```ts
kk.variadicFor('tags'); // or kk.variadicFor('tags', false);
```

OR

```ts
kk.variadicFor('tags', 2); // limit to 2
```

Usage: <code>$ other tag1 tag1</code>

Result: <code>{ _: [ 'other', ['tag1', 'tag2'] ] }</code>

### .helpFor()

Enables/disables help for option or specifies custom text or function for retreiving help text.

```ts
kk.helpFor('toppings', false); // would disable help for this command.
```

OR

```ts
kk.helpFor('toppings', 'My custom help text to be displayed on help.');
```

OR

```ts
kk.helpFor('toppings', (option: IKawkahOption, context: KawkahCore) => {
  return 'your generated help text for command';
});
```

### .completionsFor()

Sets completions hints for option. (NOT available in Windows)

```ts
kk.completionsFor('tags', 'red', 'green', 'yellow', 'blue');
```

### .extendFor()

Sets option as an extend option resulting in value being extended on the IKawkahResult object.

```ts
kk.extendFor('config');
```

Usage: <code>$ --config /some/path/to.json</code>

Result: <code>{ config: { /* your loaded config here */ } }</code>

```ts
kk.extendFor('config', [ 'name', 'version', 'license' ]);
```

Usage: <code>$ --config package.json</code>

Result: <code>{ config: { name: 'app', version: '1.0.0', license: 'MIT' } }</code>

### .skipFor()

Enables/disables skipping validation for the specified option.

```ts
kk.skip('toppings'); // or kk.skip('toppings', false);
```

## Instance Methods

This section contains API methods that are base methods to both the Kawkah instance and any KawkahCommand instance.

### .name()

Sets the CLI application name, replaces <code>$0</code> in help templates with this value. This value is auto generated if no value is set.

```ts
kk.name('app'); // sets the value.
```

```ts
kk.name(); // gets the value.
```

### .command()

Generates an instance of Kawkah command which includes all [Base Methods](#base-methods) and [Option Methods](#option-methods). For more on commands head over to the [Examples](EXAMPLES.md/#commands)

The following creates a command that requires both a source and a destination.

```ts
const cmd = kk.command('copy <source> <dest>', 'Copies file to destination');
```

Configuring an external command.

```ts
kk.command('ls', 'List files.', true);
```

Same as above but we use a custom command name.

```ts
kk.command('list', 'List files.', 'ls');
```

External command that runs file executable by NodeJS.

```ts
kk.command('mycmd', 'Calls executable file using node', './some/path/command.js');
```

External command which calls a bash script.

```ts
kk.command('mybash', 'Calls bash script.', './some/path/to/bash.sh');
```

### .configHelp()

Congigures help globally.

```ts
kk.configHelp(true); // enable/disable help
```

OR

```ts
kk.configHelp((groups: string[], context: KawkahCore) => {
  // Do something with requested groups/generate help.
});
```

OR

```ts
kk.configHelp('custom-name'); // enable help with custom flag.
```

### .configVersion()

Congigures version globally.

```ts
kk.configVersion(true); // enable/disable version
```

OR

```ts
kk.configVersion('1.0.0-alpha'); // set custom value.
```

OR

```ts
kk.configVersion('custom-name', 'Version help description.'); // enable version with custom flag.
```

### .configCompletions()

Congigures tab completions. (NOT available on Windows)

```ts
kk.configCompletions(true); // enable/disable tab completions.
```

OR

```ts
kk.configCompletions('custom-name', 'Completions help text.', (query: IKawkahCompletionQuery, done: KawkahCompletionsCallback) => {
  // return array of completions suggestions
  // or call done([]) for async.
});
```

### .configLogger()

Configure a custom log handler to capture all log messages.

```ts
kk.configLogger((type: string, message: string, ...args: any[]) => {
  // Handle
});
```

### .configAbout() 

Configure and/or enable the Memo feature which allows for long descriptions for commands.

```ts
kk.configAbout();
```

OR

```ts
kk.configAbout(false);
```

OR

```ts
kk.configAbout('custom-name', 'Option description');
```

### .middleware()

Creates or updates a help group.

```ts
kk.middleware('Commands:', false); // enable/disable group
```

### .group()

Creates or updates a help group.

```ts
kk.group('Commands:', false); // enable/disable group
```

OR

```ts
kk.group('MyGroup:', 'cmd', 'cmd.option1', 'cmd.option2'); // creates group w/ options.
```

OR

```ts
kk.group('MyGroup:', {

  // The group's title.
  title: string;

  // When true each option is auto added
  // to the items array below.
  isCommand: boolean;

  // List of items in this group.
  items: string | string[];

  // Number indicating length to indent items (default: 2)
  indent: number;

  // Sort items before building help items.
  sort: boolean;

  // Indicates if group is enabled.
  enabled: boolean;

});
```

### .strict()

When enabled errors are output if input is missing a command or option, a missing description or the argument is missing a configuration.

```ts
kk.strict(true);
```

### .actionFor()

Sets an action handler for an option. This is ONLY available on the Kawkah instance or default command. It is this feature that is used to fire off --help and --version options.

```ts
kk.actionFor('version', (result: IKawkahResult, context: KawkahCore) => {
  // Do something with global actionable option.
});
```

### .log()

Logs a message to the output stream.

```ts
kk.log('some message');
```

OR

```ts
kk.log('My name is %s', 'Milton');
```

### .error()

Logs an error to the output stream.

```ts
kk.log('some error');
```

### .warning()

Logs a warning to the output stream.

```ts
kk.log('some warning');
```

### .notify()

Logs a notification to the output stream.

```ts
kk.log('some notification');
```

### .ok()

Logs an ok or success message to the output stream.

```ts
kk.log('some success message');
```

### .locale()

Gets or sets the current locale for localization.

```ts
kk.locale('en');
```

### .theme()

Gets or sets the theme for displaying help.

```ts
kk.theme('default');
```

OR

```ts
kk.theme({

  // See: https://github.com/origin1tech/colurs/blob/master/src/constants.ts#L23
  // for list of AnsiStyle color names.

  // Example Default Theme.

  header: null,
  title: 'accent',
  label: 'accent',
  usage: null,
  alias: null,
  argument: null,
  flag: null,
  describe: null,
  type: null,
  variadic: 'warning',
  required: 'error',
  footer: 'muted'

});
```

### .header()

Adds header text to your help. Good for adding ASCII logos/art etc.

```ts
kk.header('My Help Header', 'left'); // align: left, right or center.
```

### .footer()

Adds footer text to your help.

```ts
kk.footer('copyright My Company 2018', 'center'); // align: left, right or center.
```

### .catch()

Enables/disables a handler to be called on errors. The default behavior will display help.

```ts
kk.catch(false); // disables catch.
```

OR

```ts
kk.catch('Whoops maybe try: app --help'); // custom text.
```

```sh
Whoops maybe try: app --help

✖ Too many arguments got: 1 expected: 0
```

OR

```ts
kk.catch((message: string, err: Error | KawkahError) => {
  // Do something with error message.
});
```

### .trace()

Adds --trace flag or user defined flag to trigger stacktraces on errors. Useful during development.

```ts
kk.trace(false); // enables/disables trace.
```

Usage: <code>$ some-command --trace</code>

### .terminate()

When true errors and help trigger process.exit() terminating the app.

```ts
kk.terminate(); // Enables/disables terminate.
```

### .parse()

Parses arguments and returns result before validation, coercion etc.

```ts
kk.parse(); // parses default process.argv.
```

OR

```ts
kk.parse('arg1 arg2 --flag'); // parses defined args/flags.
```

### .listen()

Listens for matching commands and actionable options. When a matching arg or global flag with action is found the action handler is called.

```ts
kk.listen(); // listens using default process.argv.
```

OR

```ts
kk.listen('arg1 arg2 --flag') // listens using defined args/flags.
```

### .result()

Returns the last result.

```ts
kk.result(false);
```

### .showHelp()

Shows help text or shows help for specific groups.

```ts
kk.showHelp(); // shows all help.
```

OR

```ts
kk.showHelp('Group1', 'Group2', '...'); // shows for specific group.
```