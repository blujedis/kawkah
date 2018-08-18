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
const cmd = kk.command('copy <source> [dest]');

describe('Kawkah:Command', () => {

  it('should CREATE a new command.', () => {

    const config = cmd.context();

    const expectedArgs = ['source', 'dest'];
    const expectedKeys = Object.keys(config.options);
    const expectedUsage = '$0 copy <source> [dest]';

    assert.deepEqual(config.args, expectedArgs);
    assert.deepEqual(expectedKeys, expectedArgs);
    assert.equal(config.usage, expectedUsage);

  });

  it('should add ALIAS to command.', () => {

    cmd.alias('cp', 'c');
    const config = cmd.context();
    assert.deepEqual(config.alias, ['cp', 'c']);

  });

  it('should test DESCRIBE for command.', () => {

    const expected = 'Copies files.';
    cmd.describe(expected);
    const config = cmd.context();
    assert.equal(config.describe, expected);

  });

  it('should test SPREAD for command.', () => {

    const expected = false;
    cmd.spread(expected);
    const config = cmd.context();
    assert.equal(config.spread, expected);

  });

  it('should test HELP for command.', () => {

    const expected = 'Copies a file.';
    cmd.help(expected);
    const config = cmd.context();
    assert.equal(config.help, expected);

  });



});