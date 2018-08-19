"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const kk = new _1.Kawkah();
kk.middleware.disable('aliases');
kk.arg('order', {
    required: true,
    coerce: v => (v || '').toUpperCase()
})
    .flag('toppings', {
    type: 'array',
    validate: /(cheese|mushroom|ham)/,
    alias: 't'
})
    .flag('deep-dish')
    .listen('order -t mushroom', true);
//# sourceMappingURL=debug.js.map