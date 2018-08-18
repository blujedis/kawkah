import * as chai from 'chai';
import * as mocha from 'mocha';
import * as passpipe from 'passpipe';
import { isWindows } from 'chek';
import { ChildProcess } from 'child_process';
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

describe('Kawkah:Spawn', () => {

  it('should spawn and test bash script.', (done) => {
    if (isWindows()) // windows can't run bash.
      return done();
    const cmd = kk.command('bash.sh', null, './src/test/bash.sh');
    const proc = cmd.exec({ _: [], __: [], $command: 'bash.sh' }) as ChildProcess;
    passpipe.proc(proc, (chunk) => {
      assert.equal(chunk, 'executed bash script.');
      done();
    });
  });

  it('should spawn and test node script.', (done) => {
    const cmd = kk.command('node.js', null, './src/test/node.js');
    const proc = cmd.exec({ _: [], __: [], $command: 'node.js' });
    passpipe.proc(proc, (chunk) => {
      assert.equal(chunk, 'executed node script.');
      done();
    });
  });

});