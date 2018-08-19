"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chek_1 = require("chek");
const constants_1 = require("./constants");
const base_1 = require("./base");
const command_1 = require("./command");
class Kawkah extends base_1.KawkahCommandBase {
    constructor(usage, options) {
        super(constants_1.DEFAULT_COMMAND_NAME, usage, options);
    }
    // GETTERS //
    get middleware() {
        return this.core.middleware;
    }
    get configHelp() {
        return this.core.setHelp;
    }
    get configVersion() {
        return this.core.setVersion;
    }
    get configCompletions() {
        return this.core.setCompletions;
    }
    get ok() {
        return this.core.ok;
    }
    context(name) {
        return this._command;
    }
    contextFor(name, command) {
        name = this.utils.stripTokens(name);
        return this.core.getOption(command || this._name, name);
    }
    /**
    * Sets a custom log/event handler.
    *
    * @param fn a log/event handler function.
    */
    configLogger(fn) {
        this.assert('.logger()', '[function]', arguments);
        this.core.setLogHandler(fn);
        return this;
    }
    name(name) {
        this.assert('.name()', '[string]', arguments);
        if (!name)
            return this.core.$0;
        this.core.name(name);
        return this;
    }
    command(name, describe, external) {
        this.assert('.command()', '<string> [string|object|boolean] [string|boolean]', arguments);
        let config;
        if (chek_1.isBoolean(describe)) {
            external = describe;
            describe = undefined;
        }
        // User passed usage tokens.
        else if (chek_1.isString(describe)) {
            config = {
                describe: describe
            };
        }
        else if (chek_1.isObject(describe)) {
            config = describe;
        }
        config = config || {};
        config.external = external;
        // Set the command.
        const cmd = this.core.setCommand(name, config);
        // Return command instance.
        return new command_1.KawkahCommand(cmd.name, this.core);
    }
    group(name, config, isCommand, ...items) {
        this.assert('.group()', '<string> <string|boolean|object> [string|boolean] [string...]', arguments);
        this.core.setGroup(name, config, isCommand, ...items);
        return this;
    }
    /**
     * Adds action for option flag, only available on default command.
     * Command actions when present supersede these callbacks.
     *
     * @example .actionFor('version', (result) => { // do something });
     *
     * @param option the option name to add action to.
     * @param fn the action handler.
     */
    actionFor(option, fn) {
        this.assert('.actionFor()', '<string> [function]', arguments);
        this.core.setOption(this._name, option, 'action', fn);
        return this;
    }
    catch(fn = true, isCommand = false) {
        this.assert('.catch()', '<string|boolean|function> <boolean>', [fn, isCommand]);
        this.core.setCatchHandler(fn, isCommand);
        return this;
    }
    parse(argv) {
        this.assert('.parse()', '[string|array]', arguments);
        return this.core.parse(argv);
    }
    listen(argv, show) {
        this.assert('.listen()', '[string|array|boolean] [boolean]', arguments);
        if (chek_1.isBoolean(argv)) {
            show = argv;
            argv = undefined;
        }
        const result = this.core.listen(argv);
        if (this.core.abort())
            return;
        if (show)
            this.log(result);
        return result;
    }
    /**
     * Enables --trace option to enable stacktrace for errors on the fly.
     *
     * @param option the name of the trace option.
     */
    trace(option) {
        this.core.setTrace(option);
        return this;
    }
    log(message, ...args) {
        this.core.log(message, ...args);
        return this;
    }
    /**
     * Logs an Error message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    error(message, ...args) {
        this.core.error(message, ...args);
        return this;
    }
    /**
     * Logs a Warning message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    warning(message, ...args) {
        this.core.warning(message, ...args);
        return this;
    }
    /**
     * Logs a Notify message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    notify(message, ...args) {
        this.core.notify(message, ...args);
        return this;
    }
    /**
     * Logs an OK message.
     *
     * @param message a message to be logged.
     * @param args optional format arguments.
     */
    // ok(message: any, ...args: any[]): Kawkah {
    //   this.core.ok(message, ...args);
    //   return this;
    // }
    /**
     * Sets a header for help.
     *
     * @param header a string to display as help header.
     * @param align the alignment for the above string.
     */
    header(header, align) {
        this.assert('.header()', '<string> [string]', arguments);
        this.core.setHeader(header, align);
        return this;
    }
    /**
     * Sets a footer for help.
     *
     * @param footer a string to display as help footer.
     * @param align the alignment for the above string.
     */
    footer(footer, align) {
        this.assert('.footer()', '<string> [string]', arguments);
        this.core.setFooter(footer, align);
        return this;
    }
    theme(theme) {
        if (!theme)
            return this.core.getTheme();
        this.assert('.theme()', '<string|object>', arguments);
        this.core.setTheme(theme);
        return this;
    }
    locale(locale) {
        if (!locale)
            return this.core.options.locale;
        this.assert('.locale()', '[string]', arguments);
        this.core.options.locale = locale;
        return this;
    }
    /**
     * Returns the parsed result generated from .listen();
     */
    result() {
        return this.core.result;
    }
    /**
     * Shows all help or by group name.
     *
     * @param groups optionally specify help groups to be shown.
     */
    showHelp(...groups) {
        this.core.showHelp(...groups);
    }
    /**
     * Sets terminate to exit process on help, version and errors.
     *
     * @param eanbled enables/disables terminate.
     */
    terminate(enabled = true) {
        this.assert('.exit()', '[boolean]', [enabled]);
        this.core.options.terminate = enabled;
        return this;
    }
}
exports.Kawkah = Kawkah;
//# sourceMappingURL=kawkah.js.map