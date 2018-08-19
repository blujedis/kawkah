import { Kawkah } from '.';

const kk = new Kawkah();

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
