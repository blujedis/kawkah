<p align="left">
  <a href="http://github.com/blujedis/kawkah"><img src="https://cdn.rawgit.com/blujedis/kawkah/master/assets/logo.png"></a>
</p>

Kawkah is a Node command line parser written in Typescript. It's purpose is to simplify parsing CLI arguments for complex CLI applications. One of the key benefits of Kawkah is the use of customizable middleware. If you wish to add a feature into the pipeline simply add a custom middleware handler. See [Middleware](#Middleware) below for more on that.

### NOTE

This is a beta. It is not in use in production as of yet. Although fairly stable many more tests need to be written more debugging blah blah blah you get the idea. The readme is a bit light for now however the [Docs](#Docs) below are largely complete thanks to Typescript.

## Install

```sh
$ npm install kawkah
```

## Usage

Here are the basics. After instantiating define your args, flags and other settings then call <code>.listen()</code> to have Kawkah listen for process.argv arguments.

```ts
import { Kawkah } from 'kawkah';

// OR

const Kawkah = require('kawkah').Kawkah;

const kk = new Kawkah({ /* options */ });

kk
  .arg('order', {
    coerce: v => v.toUpperCase()
  })
  .flag('toppings', {
    type: 'array',
    validate: /(cheese|mushroom|ham)/
  })
  .flag('deep-dish')
  // parse or listen MUST be called last.
  .listen('order --toppings cheese --toppings ham --deep-dish');

// RESULT

const result = {
  {
    _: [ 'ORDER' ],
    __: [],
    toppings: [ 'cheese', 'ham' ],
    deepDish: true,
    '$0': 'app',
    '$command': null
  }
}
```

## Options

List of all Kawkah options.

See [OPTIONS.md](/assets/OPTIONS.md)

## API

The majority of the API including links to examples of use. You should always favor [Docs](https://blujedis.github.io/kawkah/) for the full implementation as the API may change/improve. These docs are generated with each build so unlike the API examples/usage they are more accurate.

See [API.md](/assets/API.md)

## Middleaware

Middleware allows for validation, modification and tracking. When creating middlware then injecting it into the Kawkah pipeline you're able to create hooks for tracking usage of your application or pre/post modify or validate properties.

See [MIDDLEWARE.md](/assets/MIDDLEWARE.md)

## Examples

Examples of API usage and common use examples.

See [EXAMPLES.md](/assets/EXAMPLES.md)

## Docs

These are the generated docs from the Typescript code itself. These tend to be pretty accurate as the docs cannot be generated unless the project can build properly. It is your most trusted source for the current API.

See [https://blujedis.github.io/kawkah/](https://blujedis.github.io/kawkah/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)