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
    context(name) {
        if (name)
            return this.core.getCommand(name);
        return this._command;
    }
    contextFor(name, command) {
        name = this.utils.stripTokens(name);
        return this.core.getOption(command || this._name, name);
    }
    configVersion(name = true, describe, version) {
        this.assert('.configVersion()', '<string|array|boolean> [string] [string]', [name, describe, version]);
        this.core.setVersion(name, describe, version);
        return this;
    }
    configHelp(name = true, describe, fn) {
        this.assert('.configHelp()', '<string|array|boolean|function> [string|function] [function]', [name, describe, fn]);
        this.core.setHelp(name, describe, fn);
        return this;
    }
    configCompletions(name, describe, fn, template) {
        this.assert('.configCompletions()', '[string|boolean] [string|function] [function] [string]', arguments);
        this.core.setCompletions(name, describe, fn, template);
        return this;
    }
    /**
    * Sets a custom log/event handler.
    *
    * @param fn a log/event handler function.
    */
    configLogger(fn) {
        this.assert('.configLogger()', '[function]', arguments);
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
        this.assert('.command()', '<string> [string|object|boolean|function] [string|boolean|function]', arguments);
        // If just name was passed try to load existing command.
        // Otherwise continue and create the command.
        if (arguments.length === 1 && !this.utils.hasTokens(name)) {
            if (this.core.hasCommand(name))
                return new command_1.KawkahCommand(name, this.core);
        }
        let config;
        let action;
        if (chek_1.isFunction(describe)) {
            action = describe;
            describe = undefined;
        }
        if (chek_1.isFunction(external)) {
            action = external;
            external = undefined;
        }
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
        if (action)
            config.action = action;
        // Set the command.
        const cmd = this.core.setCommand(name, config);
        // Return command instance.
        return new command_1.KawkahCommand(cmd.name, this.core);
    }
    group(name, config, all, ...items) {
        this.assert('.group()', '<string> [string|boolean|object] [string|boolean|array] [string...]', arguments);
        if (!chek_1.isValue(config))
            return this.core.getGroup(name);
        this.core.setGroup(name, config, all, ...items);
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
    ok(message, ...args) {
        this.core.ok(message, ...args);
        return this;
    }
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
     * Enforces option descriptions, requires command or option on input and also outputs error on anonymous values.
     *
     * @param eanbled enables/disables strict.
     */
    strict(enabled = true) {
        this.assert('.strict()', '<boolean>', [enabled]);
        this.core.options.strict = enabled;
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
        this.assert('.terminate()', '<boolean>', [enabled]);
        this.core.options.terminate = enabled;
        return this;
    }
    /**
     * Exits Kawkah.
     *
     * @param code the process exit code.
     */
    exit(code = 0) {
        this.core.exit(code);
    }
}
exports.Kawkah = Kawkah;
//# sourceMappingURL=kawkah.js.map