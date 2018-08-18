# Examples

[Back to Menu](../README.md/#table-of-contents)

More examples will be added as time permits. ALWAYS double check the [docs]() to ensure the API hasn't changed as the project grows.

## Commands

To this point the above are merely added to the default command which is basically the Kawkah instance you instantiated. The default command's flags are global to your CLI application. If you define an alias to the default command e.g. <code>kk.alias('copy')</code> it will behave like a standalone command although that's only useful if you have only one command, probably not, so let's create a standalone command.

```ts
const cmd = kk.command('copy', { describe: 'Copies a file.' });
cmd.arg('source', { required: true });
cmd.arg('dest', { default: process.cwd() });

// OR USING TOKENS

const cmd = kk.command('copy <source> [dest]', 'Copies a file.');
cmd.defaultFor('dest', process.cwd());
```

**Quick Note** The default command or the Kawkah instance has additional methods/properties that are not available on standalone commands since the default command or instance controls your CLI application globally.

For example the below won't work with the "command" we created above. Methods/properties such as <code>.listen()</code> or <code>.parse()</code> can ONLY be accessed using <code>kk.listen()</code> from your instance. Where "kk" is the name of your instance.

```ts
cmd.listen(); // METHOD DOES NOT EXIST!
```

You can see more on Command and the Default Command (which is basically the Kawkah Instance) below:

See >> [Command Docs](https://blujedis.github.io/kawkah/classes/_command_.kawkahcommand.html)

See >> [Default Command Docs](https://blujedis.github.io/kawkah/classes/_kawkah_.kawkah.html)

## External Commands

Kawkah can also run external commands or known commands in your environemnt/path. The third argument when creating a command can be set to true or you can specify a known command in your environemnt or a path to a file to be executed.

```ts
// Wire up to 'ls'
kk.command('ls', 'List files.', true);

// OR

// Wire up to 'ls' but we name the
// command in our CLI app 'list'.
kk.command('list', 'List files.', 'ls')

// OR

// Call file using NodeJS.
kk.command('mycmd', 'Calls executable file using node', './some/path/command.js')

// OR

kk.command('mybash', 'Calls bash script.', './some/path/to/bash.sh');
```

## Args

Argument options are values after the initial command. For example if you were to type <code>$ copy /some/path /some/dest</code> in your terminal where "copy" is a command (we'll get to that) to copy a file you might represent the args as such.

Notice below we set the first arg to required, but we'll assume if you don't provide a dest you want it copied to the current directory. The order you specify when creating the args is respected.

```ts
kk.arg('source', { required: true });
kk.arg('dest', { default: process.cwd() });

// OR USING TOKENS

kk.args('<source>', '[dest]'); // <required> [optional].

// OR

kk.args('<source> [dest]'); // Kawkah will break this out.

// AND

kk.requiredFor('source');
kk.defaultFor('dest', process.cwd());
```

**note** if you were to add the above in reverse <code>kk.args('[dest]', '&lt;source&gt;')</code> you'd get an error as optional arguments cannot preceede required ones.

## Flags

Flag options are options that are preceeded by '--' or '-'.

```ts
kk.flag('force', {
  type: 'string'
});

// OR USING TOKENS

kk.flag('--force [string]');

// OR

kk.flags('--force [string]', '--status');
```
