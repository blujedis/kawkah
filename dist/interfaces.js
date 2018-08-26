"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var KawkahMiddlewareGroup;
(function (KawkahMiddlewareGroup) {
    KawkahMiddlewareGroup["AfterParsed"] = "AfterParsed";
    KawkahMiddlewareGroup["BeforeValidate"] = "BeforeValidate";
    KawkahMiddlewareGroup["Validate"] = "Validate";
    KawkahMiddlewareGroup["AfterValidate"] = "AfterValidate";
    KawkahMiddlewareGroup["BeforeAction"] = "BeforeAction";
})(KawkahMiddlewareGroup = exports.KawkahMiddlewareGroup || (exports.KawkahMiddlewareGroup = {}));
// ENUMS //
var KawkahHelpScheme;
(function (KawkahHelpScheme) {
    KawkahHelpScheme["None"] = "none";
    KawkahHelpScheme["Default"] = "default";
    KawkahHelpScheme["Commands"] = "commands";
})(KawkahHelpScheme = exports.KawkahHelpScheme || (exports.KawkahHelpScheme = {}));
var KawkahGroupType;
(function (KawkahGroupType) {
    KawkahGroupType["Commands"] = "commands";
    KawkahGroupType["Arguments"] = "arguments";
    KawkahGroupType["Flags"] = "flags";
    KawkahGroupType["Examples"] = "examples";
})(KawkahGroupType = exports.KawkahGroupType || (exports.KawkahGroupType = {}));
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