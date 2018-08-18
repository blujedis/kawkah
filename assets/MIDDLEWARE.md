# Middleware

[Back to Menu](../README.md/#table-of-contents)

Middleware consists of two basic types that are grouped into 5 groups that all run synchronously. **Result Middleware** injects the IKawkahResult into each iteration whereas **Option Middleware** injects the current option value on each interation.

## How It Works

Upon each iteration you must return either the value to continue in the chain or an Error. If an Error is returned Kawkah Middleware will exit and display the Error or hand off to your custom logger.

**Result Middleware** returns the IKawkahResult upon each iteration. If you set your Middleware configuration to **extend** then the result is extended onto the previous result using <code>Object.assign({}, previous, current)</code>. This is helpful when want to merge in custom values or manipulate the parsed result.

**Option Middleware** simply returns the option's value. For example the default internal middleware **deny** and **demand** are hit in the chain passing down the value until if/when an Error is thrown.

## Groups

The following middleware groups are in the order of which they are called.

### AfterParsed

Called after .parse() is called internally.

<table>
  <tr><td>Name</td><td>AfterParsed</td></tr>
  <tr><td>Type</td><td>Result</td></tr>
  <tr><td>Interface</td><td>(result: IKawkahResult, event?: IKawkahMiddlewareEventGlobal, context?: KawkahCore)</td></tr>
  <tr><td>Returns</td><td>IKawkahResult|Error</td></tr>
</table>

### BeforeValidate

This group is where you Kawkah runs coercion and other middleware before we validate the results.

<table>
  <tr><td>Name</td><td>BeforeValidate</td></tr>
  <tr><td>Type</td><td>Option</td></tr>
  <tr><td>Interface</td><td>(val: any, key?: string, event?: IKawkahMiddlewareEventOption, context?: KawkahCore)</td></tr>
  <tr><td>Returns</td><td>any</td></tr>
</table>

### Validate

At this point we have parsed our arguments, we've run any transform type middleware like coercion and are ready to make sure the option is valid. This is where we check if the option is required or where it should deny or demand other options etc.

<table>
  <tr><td>Name</td><td>Validate</td></tr>
  <tr><td>Type</td><td>Option</td></tr>
  <tr><td>Interface</td><td>(val: any, key?: string, event?: IKawkahMiddlewareEventOption, context?: KawkahCore)</td></tr>
  <tr><td>Returns</td><td>any</td></tr>
</table>

### AfterValidate

At this stage we've pretty much completed built up our result object but may need to do some housekeeping. This is where we extend values onto our result such as aliases. For example if we have an option <code>--force</code> it is helpful to extend it's alias <code>-f</code> onto our result object so we don't have to think about it in our result.

<table>
  <tr><td>Name</td><td>AfterValidate</td></tr>
  <tr><td>Type</td><td>Option</td></tr>
  <tr><td>Interface</td><td>(val: any, key?: string, event?: IKawkahMiddlewareEventOption, context?: KawkahCore)</td></tr>
  <tr><td>Returns</td><td>any</td></tr>
</table>

### BeforeAction

Our result object is complete and ready to ship to our action or return to user. This is a good spot to create a hook for tracking usage statistics of your CLI app.

<table>
  <tr><td>Name</td><td>BeforeAction</td></tr>
  <tr><td>Type</td><td>Result</td></tr>
  <tr><td>Interface</td><td>(result: IKawkahResult, event?: IKawkahMiddlewareEventGlobal, context?: KawkahCore)</td></tr>
  <tr><td>Returns</td><td>IKawkahResult|Error</td></tr>
</table>

## Configuration Object

When adding middleware the <code>.add()</code> method supports multiple signatures or interfaces, however it's often easiest to just pass the middleware's name and a config object. Here's the object and it's properties.

```ts
  readonly name: string;            // name of the middleware for indexing.
  group: KawkahMiddlewareGroup;     // see above "Groups" for values.
  commands: string[];               // empty for any or command names to apply to.
  enabled: boolean;                 // whether enabled or not.
  extend: boolean;                  // returned value should be extended to previous.
  handler: KawkahMiddlwareHandler;  // the middleware handler see below examples.
```

## Example

The following examples assume you have instantiated Kawkah as follows.

```ts
import { Kawkah } from 'kawkah';
const kk = new Kawkah();
```

### Result middleware example:

The following runs after raw arguments are parsed but before any coercion or validation. The **result** that is returned will be merged with the previous iteration's result. Essentially <code>Object.assign({}, previous, result)</code>

```ts
const handler = (result: IKawkahResult, event: IKawkahMiddlewareEventResult, context: KawkahCore) => {
  // Do something with result.
  return result;
};

const config = {
  group: KawkahMiddlewareGroup.AfterParsed,
  extend: true
  handler: handler
}

kk.middleware.add('some-result-middleware', config);
```

### Option middleware example:

The following runs in the **Validate** group and only for the **install** command.

```ts
const handler = (val: any, key?: string, event?: IKawkahMiddlewareEventOption, context?: KawkahCore) => {
  // Do something with val.
  return val;
};

const config = {
  group: KawkahMiddlewareGroup.Validate,
  commands: ['install'], // only runs for the install command.
  handler: handler
}

kk.middleware.add('some-option-middleware', config);
```

## Managing Middleware

Middleware can be enabled, disabled or re-grouped. When adding custom middleware it may be necessary to reorder the groups. Or you may want to disable a specific middleware that ships with Kawkah.

By default the following middleware is set in the default options when you instantiate Kawkah:

**NOTE** Order here doesn't matter this setting merely says which of the middlware that Kawkah ships with do you want enabled.

Also see [options.middleware](OPTIONS.md/#middleware)

```ts
const DEFAULTS = {
  middleware:  ['minmax', 'coerce', 'extend', 'required', 'validator', 'demand', 'deny', 'aliases']
}
```

### Enable, Disable & Remove

Disable all middleware then enable non-validation middleware.

```ts
kk.middleware
  .disable()
  .enable('minmax', 'coerce', 'extend', 'aliases');
```

Getting enabled/disabled states.

```ts
const enabled = kk.middleware.enabled();                  // result is array of strings.
const disabled = kk.middleware.disabled();                // result is array of strings.
const isMinMaxEnabled = kk.middleware.enabled('minmax');  // result is boolean.
```

Removing middleware.

```ts
kk.middleware.remove('minmax');
```

### Add & Run Groups

You can create custom groups however it is important to note they will NOT automatically run. To run a custom middleware group you must call the group manually as shown below. Please take note of the [docs](https://blujedis.github.io/kawkah/) for additional methods.

Add a group.

```ts
kk.middleware.group('group-name', 'minmax', 'coerce', 'extend');
```

Running a group.

```ts
kk.middleware.runGroup('group-name', 'arg1', 'arg2', '...');
```

### Run by Name

You can also run middleware manually by name.

```ts
kk.middleware.runNames(['minmax', 'aliases'], 'arg1', 'arg2', '...');
```