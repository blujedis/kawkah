import { Kawkah } from '.';

const kk = new Kawkah();

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
