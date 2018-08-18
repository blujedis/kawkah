"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var KawkahMiddlewareGroup;
(function (KawkahMiddlewareGroup) {
    KawkahMiddlewareGroup["AfterParse"] = "AfterParse";
    KawkahMiddlewareGroup["BeforeValidate"] = "BeforeValidate";
    KawkahMiddlewareGroup["Validate"] = "Validate";
    KawkahMiddlewareGroup["AfterValidate"] = "AfterValidate";
    KawkahMiddlewareGroup["Finished"] = "Finished";
})(KawkahMiddlewareGroup = exports.KawkahMiddlewareGroup || (exports.KawkahMiddlewareGroup = {}));
// ENUMS //
var KawkahHelpScheme;
(function (KawkahHelpScheme) {
    KawkahHelpScheme["None"] = "none";
    KawkahHelpScheme["Default"] = "default";
    KawkahHelpScheme["Commands"] = "commands";
})(KawkahHelpScheme = exports.KawkahHelpScheme || (exports.KawkahHelpScheme = {}));
var KawkahGroupKeys;
(function (KawkahGroupKeys) {
    KawkahGroupKeys["Commands"] = "Commands";
    KawkahGroupKeys["Arguments"] = "Arguments";
    KawkahGroupKeys["Flags"] = "Flags";
    KawkahGroupKeys["Examples"] = "Examples";
})(KawkahGroupKeys = exports.KawkahGroupKeys || (exports.KawkahGroupKeys = {}));
var KawkahEvent;
(function (KawkahEvent) {
    KawkahEvent["Error"] = "Error";
    KawkahEvent["Warning"] = "Warning";
    KawkahEvent["Notify"] = "Notify";
    KawkahEvent["Ok"] = "Ok";
    KawkahEvent["Help"] = "Help";
    KawkahEvent["Catch"] = "Catch";
})(KawkahEvent = exports.KawkahEvent || (exports.KawkahEvent = {}));
//# sourceMappingURL=interfaces.js.map