"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const kk = new _1.Kawkah();
kk.arg('order', {
    required: true,
    coerce: v => (v || '').toUpperCase()
})
    .flag('toppings', {
    type: 'array',
    validate: /(cheese|mushroom|ham)/
})
    .flag('deep-dish')
    .maxArgs(0)
    .listen('order --toppings cheese --toppings ham --deep-dish', true);
//# sourceMappingURL=debug.js.map