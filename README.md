<p align="left">
  <a href="http://github.com/blujedis/kawkah"><img src="https://cdn.rawgit.com/blujedis/kawkah/master/assets/logo.png"></a>
</p>

Kawkah is a Node command line parser written in Typescript. It's purpose is to simplify parsing CLI arguments for complex CLI applications. One of the key benefits of Kawkah is the use of customizable middleware. If you wish to add a feature into the pipeline simply add custom middleware. We'll get to that in a moment.

### NOTE

Kawkah is not in production as of yet. Although fairly stable many more tests need to be written more debugging blah blah blah you get the idea.

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

## Table of Contents

The documentation listed in this table of contents is here for convenience. If you find an error we suggest heading over to the [Generated Docs](https://blujedis.github.io/kawkah/). These tend to be pretty accurate given the cannot be generated without the project building. We try to keep examples up to date but there's only so much time. Feel free to create a PR if you see a mistake!

* [API.md](/assets/API.md)
* [OPTIONS.md](/assets/OPTIONS.md)
* [MIDDLEWARE.md](/assets/MIDDLEWARE.md)
* [EXAMPLES.md](/assets/EXAMPLES.md)
* [Kawkah Parser](https://blujedis/github.io/kawkah-parser)

## Docs

Documentation generated from source.

See [https://blujedis.github.io/kawkah/](https://blujedis.github.io/kawkah/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)