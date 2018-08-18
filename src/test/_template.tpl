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

let expected = { _: [], __: [], $0: $0, $command: null };

describe('Kawkah:Parse', () => {

  it('should do something.', () => {

  });

});