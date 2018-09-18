# Change Log

Changes in descending order.

### 09.15.2018 (v1.0.16-v1.0.18)

<table>
  <tr><td>core.ok, .notify, .warning, .error</td><td>should allow logging any type not just strings.</td></tr>
  <tr><td>options.sortGroups</td><td>allow global options to set default for sorting group items.</td></tr>
  <tr><td>core.listen</td><td>catch handler not being called.</td></tr>
</table>

### 09.12.2018 (v1.0.12-v1.0.15)

<table>
 <tr><td>base.validateFor()</td><td>fix issue where regexp or ojects not allowed.</td></tr>
 <tr><td>KawkahError.generateStacktrace()</td><td>fix issue where line returns not respected in messages.</td></tr>
 <tr><td>options.width</td><td>add option to define width of help default undefined which is auto or your terminal's width</td></tr>
 <tr><td>core.listen()</td><td>disable validation middlware group when help is present.</td></tr>
 <tr><td>IKawkahMiddlewareEvent</td><td>add isHelp flag useful in toggling middleware.</td></tr>
 <tr><td>middleware.demand(), kawkah.demand()</td><td>refactor to support demandIf features.</td></tr>
 <tr><td>middleware.deny(), kawkah.deny()</td><td>refactor to support denyIf features.</td></tr>
 <tr><td>middleware.demandIf()</td><td>DEPRECATE.</td></tr>
 <tr><td>middleware.denyIf()</td><td>DEPRECATE.</td></tr>
</table>

### 09.09.2018 (v1.0.8-v1.0.11)

<table>
  <tr><td>core.log()</td><td>log should allow empty message and values not of string or object.</td></tr>
  <tr><td>middleware.demandIf()</td><td>add feature to demand if matches criteria.</td></tr>
  <tr><td>middleware.denyIf()</td><td>add feature to deny if matches criteria.</td></tr>
  <tr><td>middleware.demand()</td><td>fix issue where args were not demanded properly.</td></tr>
  <tr><td>middleware.deny()</td><td>fix issue where args were not denied properly.</td></tr>
  <tr><td>middleware.validator()</td><td>validate callback should pass event instead of just current option.</td></tr>
  <tr><td>core.buildHelp()</td><td>bug where aliases may contain name by error.</td></tr>
  <tr><td>core.spawnCommand()</td><td>allow external command to contain default args.</td></tr>
  <tr><td>base.external()</td><td>add .external() method to allow specifiying spawn options.</td></tr>
  <tr><td>utils.parseArg()</td><td>parsed default value not set to correct type.</td></tr>
</table>

### 09.08.2018 (v1.0.3-v1.0.7)

<table>
  <tr><td>base.example()</td><td>improve handling for examples.</td></tr>
  <tr><td>core.validate()</td><td>action flag options should still run middleware validation.</td></tr>
  <tr><td>typings</td><td>typings were build by error with relative paths.</td></tr>
  <tr><td>base.flag()</td><td>resolve issue where aliases aren't honored.</td></tr>
  <tr><td>CHANGE.md</td><td>renamed to CHANGES to support default npm behavior.</td></tr>
  <tr><td>base.extendFor()</td><td>option type should not be overridden..</td></tr>
</table>

### 08.26.2018 (v1.0.0-v1.0.2)

<table>
  <tr><td>pre-release</td><td>pre-release need more tests and examples.</td></tr>
  <tr><td>fix links</td><td>fix readme links.</td></tr>
</table>

### 08.13.2018

<table>
  <tr><td>initial</td><td>initial commit.</td></tr>
</table>