"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function enumerable(enabled) {
    return function (target, propertyKey, descriptor) {
        descriptor.enumerable = enabled;
        return descriptor;
    };
}
exports.enumerable = enumerable;
function nonenumerable(target, key) {
    Object.defineProperty(target, key, {
        get: function () { return undefined; },
        set: function (val) {
            Object.defineProperty(this, key, {
                value: val,
                writable: true,
                enumerable: false,
                configurable: true,
            });
        },
        enumerable: false,
    });
}
exports.nonenumerable = nonenumerable;
//# sourceMappingURL=decorators.js.map