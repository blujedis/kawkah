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

describe('Kawkah:Parse', () => {

  it('should parse args.', () => {
    const expected = {
      _: ['one', 'two', 3, true],
      __: [],
      '$0': '/usr/local/lib/node_modules/mocha/bin/_mocha',
      '$command': null
    };
    const actual = kk.parse('one two 3 true');
    assert.deepEqual(actual, expected);
  });

  it('should parse flags.', () => {
    const expected = {
      _: [],
      __: [],
      bool: true,
      key: 'value',
      b: true,
      k: 'value',
      '$0': '/usr/local/lib/node_modules/mocha/bin/_mocha',
      '$command': null
    };
    const actual = kk.parse('--bool --key value -b -k value');
    assert.deepEqual(actual, expected);
  });

  it('should parse expanded flags.', () => {
    const expected = {
      _: [],
      __: [],
      a: true,
      b: true,
      c: 'value',
      '$0': '/usr/local/lib/node_modules/mocha/bin/_mocha',
      '$command': null
    };
    const actual = kk.parse('-abc value');
    assert.deepEqual(actual, expected);
  });

  it('should parse duplicate flags.', () => {
    const expected = {
      _: [],
      __: [],
      tags: ['java', 'python', 'lua'],
      '$0': '/usr/local/lib/node_modules/mocha/bin/_mocha',
      '$command': null
    };
    const actual = kk.parse('--tags java --tags python --tags lua');
    assert.deepEqual(actual, expected);
  });

});