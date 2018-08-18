import * as chai from 'chai';
import * as mocha from 'mocha';
import * as MuteStream from 'mute-stream';
import { Kawkah } from '../';
import { KawkahMiddlewareGroup } from '../middleware';
import { KawkahResultMiddlewareHandler } from '../interfaces';

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
const mw = kk.core.middleware;

const handlerBefore: KawkahResultMiddlewareHandler = (result, event, context) => {
  result.before = true;
  return result;
};

mw.add(KawkahMiddlewareGroup.AfterParse, 'before:test', handlerBefore, true);

const handlerAfter = (result, event, context) => {
  result.after = true;
  return result;
};

mw.add(KawkahMiddlewareGroup.Finished, 'after:test', handlerAfter, true);

describe('Kawkah:Middleware', () => {

  it('should disable before and after check enabled.', () => {
    const expected = ['minmax', 'coerce', 'extend', 'required', 'validator', 'demand', 'deny', 'aliases'];
    mw.disable('before:test', 'after:test');
    const enabled = mw.enabled();
    assert.deepEqual(enabled, expected);
  });

  it('should enable before and after middleware.', () => {
    const expected = ['minmax', 'coerce', 'extend', 'required', 'validator', 'demand', 'deny', 'aliases', 'before:test', 'after:test'];
    mw.enable('before:test', 'after:test');
    const enabled = mw.enabled();
    assert.deepEqual(enabled, expected);
  });

  it('should test before/after middleware.', () => {
    const actual = kk.listen('--dummy');
    assert.equal(actual.before, true);
    assert.equal(actual.after, true);
  });

  it('should remove before and after middleware.', () => {
    const expected = ['minmax', 'coerce', 'extend', 'required', 'validator', 'demand', 'deny', 'aliases'];
    mw.removeMiddleware('before:test', 'after:test');
    const enabled = mw.enabled();
    assert.deepEqual(enabled, expected);
  });

  it('should add before validation middleware.', () => {

    let expected: any = ['minmax', 'coerce', 'extend', 'required', 'validator', 'demand', 'deny', 'aliases', 'modify:test'];

    const handlerModify = (val) => {
      if (val === 'Milton Waddams')
        return 'Peter Gibbons';

      return val;

    };

    mw
      .add(KawkahMiddlewareGroup.BeforeValidate, 'modify:test', handlerModify);

    let enabled: any = mw.enabled();
    assert.deepEqual(enabled, expected);

    kk.flag('user.name', {
      type: 'string'
    });

    const parsed = kk.listen('--user.name "Milton Waddams"');

    assert.equal(parsed.user.name, 'Peter Gibbons');

  });

});