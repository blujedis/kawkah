import * as chai from 'chai';
import * as mocha from 'mocha';
import * as MuteStream from 'mute-stream';
import { Kawkah } from '../';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

const ms = new MuteStream();
ms.pipe(process.stderr);
ms.mute();

const kk = new Kawkah({
  output: ms
});

const $0 = kk.name();

describe('Kawkah:Option', () => {

  it('should CREATE flag using tokens.', () => {

    kk.flag('--age [number|50|The user age]');

    const expected = {
      name: 'age',
      type: 'number',
      alias: [],
      required: false,
      default: 50,
      describe: 'The user age',
      demand: [],
      deny: [],
      completions: [],
      skip: false,
      help: true
    };

    const opt = kk.contextFor('age');

    assert.deepEqual(opt, <any>expected);

    kk.core.removeOption(kk.context().name, 'age');

  });

  it('should CREATE flag using object.', () => {

    const expected = {
      variadic: 2,
      name: 'status',
      type: 'string',
      describe: '',
      default: null,
      alias: [],
      demand: [],
      deny: [],
      completions: [],
      required: false,
      skip: false,
      help: true
    };

    kk.flag('status', {
      variadic: 2
    });

    const opt = kk.contextFor('status');

    assert.deepEqual(opt, <any>expected);

  });

  it('should fail to create DUPLICATE flag.', (done) => {

    kk.configLogger((type, message) => {
      assert.equal(message, 'Duplicate flag status could not be created');
      kk.core.removeOption(kk.context().name, 'status');
      done();
    });

    kk.flag('status');

  });

  it('should create ARGUMENTS.', () => {

    kk.args('<one> [two]');
    let config = kk.context();
    assert.deepEqual(config.args, ['one', 'two']);

    kk.core.removeOption(config.name, 'one');
    kk.core.removeOption(config.name, 'two');

  });

  it('should REQUIRE a flag option.', (done) => {

    const config = kk.context();

    kk.configLogger((type, message) => {
      assert.equal(message, 'Flag test failed: invalidated by required (value: undefined)');
      kk.core.removeOption(config.name, 'test');
      kk.core.abort(false);
      done();
    });

    kk.flag('test', { required: true, type: 'string' });

    kk.listen('--asdf');

  });

  it('should DEMAND a child option.', (done) => {

    const config = kk.context();

    kk.configLogger((type, message) => {
      assert.equal(message, 'Flag test failed: invalidated by demand (missing: test2)');
      kk.core.removeOption(config.name, 'test');
      kk.core.removeOption(config.name, 'test2');
      done();
    });

    kk.flag('test2');
    kk.flag('test', { demand: 'test2' });

    kk.listen('--test');

  });

  it('should DENY a child option.', (done) => {

    const config = kk.context();

    kk.configLogger((type, message) => {
      assert.equal(message, 'Flag test failed: invalidated by deny (exists: test2)');
      kk.core.removeOption(config.name, 'test');
      kk.core.removeOption(config.name, 'test2');
      done();
    });

    kk.flag('test2');
    kk.flag('test', { deny: 'test2' });

    kk.listen('--test --test2');

  });

  it('should test option VALIDATE.', (done) => {

    const config = kk.context();

    kk.configLogger((type, message) => {
      assert.equal(message, 'Argument topping failed: invalidated by /(cheese|ham|sausage)/ (value: bad)');
      kk.core.removeOption(config.name, 'test');
      kk.core.removeOption(config.name, 'test2');
      kk.core.removeOption(config.name, 'topping');
      kk.configLogger();
      done();
    });

    kk.arg('topping', { validate: /(cheese|ham|sausage)/ });

    kk.listen('bad');

  });

  it('should test option COERSION.', () => {

    kk.flag('coerce', {
      coerce: (val) => {
        return '22';
      }
    });

    const result = kk.listen('--coerce 22.95');

    assert.equal(result.coerce, '22');

    kk.core.removeOption(kk.context().name, 'coerce');


  });

  it('should test typeFor, stringFor, booleanFor, numberFor and arrayFor', () => {

    const config = kk.context();
    const options = config.options;

    kk.flags('force', 'status');

    kk.typeFor('force', 'number');
    assert.equal(options.force.type, 'number');

    // Test String //

    kk.stringFor('force', 'status');

    ['force', 'status'].forEach(k => {
      assert.equal(options[k].type, 'string');
    });

    // Test Boolean //

    kk.booleanFor('force', 'status');

    ['force', 'status'].forEach(k => {
      assert.equal(options[k].type, 'boolean');
    });

    // Test Number //

    kk.numberFor('force', 'status');

    ['force', 'status'].forEach(k => {
      assert.equal(options[k].type, 'number');
    });

    // Test Array //

    kk.arrayFor('force', 'status');

    ['force', 'status'].forEach(k => {
      assert.equal(options[k].type, 'array');
    });


    kk.core.removeOption(config.name, 'force');
    kk.core.removeOption(config.name, 'status');


  });

  it('should load an EXTERNAL config.', () => {

    const expected = ['Apple', 'Orange', 'Strawberry', 'Mango'];

    kk.flag('load', {
      type: 'string',
      extend: true
    });

    kk.flag('static', {
      type: 'boolean',
      extend: { fruits: expected }
    });

    kk.flag('pick', {
      type: 'string',
      extend: ['fruits']
    });

    const jResult = kk.listen('--load ./src/test/config');
    const yResult = kk.listen('--load ./src/test/config.yml');
    const sResult = kk.listen('--static');
    const pResult = kk.listen('--pick ./src/test/pick.json');

    assert.deepEqual(jResult.load.fruits, expected);
    assert.deepEqual(yResult.load.fruits, expected);
    assert.deepEqual(sResult.static.fruits, expected);
    assert.deepEqual(pResult.pick.fruits, expected);

    kk.core.removeOption(kk.context().name, 'load');
    kk.core.removeOption(kk.context().name, 'static');
    kk.core.removeOption(kk.context().name, 'pick');

  });

  it('should test aliasFor.', () => {

    const config = kk.context();
    const options = config.options;

    kk.aliasFor('port', 'pt', 'p');

    assert.deepEqual(options.port.alias, ['pt', 'p']);

    kk.core.removeOption(config.name, 'port');

  });

  it('should test describeFor.', () => {

    const config = kk.context();
    const options = config.options;

    const expected = 'Some description.';
    kk.describeFor('test', expected);

    assert.equal(options.test.describe, expected);

    kk.core.removeOption(config.name, 'test');

  });

  it('should test defaultFor.', () => {

    const config = kk.context();
    const options = config.options;

    const expected = 100;
    kk.defaultFor('test', expected);

    assert.equal(options.test.default, expected);

    kk.core.removeOption(config.name, 'test');

  });

  it('should test variadicFor.', () => {

    const config = kk.context();
    const options = config.options;

    const expected = 2;
    kk.variadicFor('test', expected);

    assert.equal(options.test.variadic, expected);

    kk.core.removeOption(config.name, 'test');

  });

  it('should test skipFor.', () => {

    const config = kk.context();
    const options = config.options;

    const expected = true;
    kk.skipFor('test', expected);

    assert.equal(options.test.skip, expected);

    kk.core.removeOption(config.name, 'test');

  });

});