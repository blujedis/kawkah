import * as chai from 'chai';
import * as mocha from 'mocha';
import * as MuteStream from 'mute-stream';
import { Kawkah } from '../';
import { doesNotReject } from 'assert';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

const ms = new MuteStream();
ms.pipe(process.stderr);
ms.mute();

const kk = new Kawkah({
  output: ms,
  colorize: false
});

kk
  .configCompletions()
  .terminate(false);

const $0 = kk.name();
const cmd = kk.command('copy <source> [dest]');

describe('Kawkah', () => {

  it('should test LOGGER.', (done) => {

    const finished = [];

    const messages = {
      log: 'test log.',
      error: 'test error.',
      warning: 'test warning.',
      notify: 'test notify.',
      ok: 'test ok.',
    };

    kk.configLogger((type, message) => {
      finished.push(type);
      const expected = !type ? messages.log : messages[type];
      assert.equal(message, expected);
      if (finished.length === 5) {
        kk.configLogger();
        done();
      }
    });

    kk.log(messages.log);
    kk.error(messages.error);
    kk.warning(messages.warning);
    kk.notify(messages.notify);
    kk.ok(messages.ok);

  });

  it('should set custom app NAME.', () => {

    kk.name('custom');
    assert.equal(kk.name(), 'custom');

  });

  it('should receive HELP in custom logger.', (done) => {

    kk.configLogger((type, message) => {
      assert.equal(type, 'help');
      done();
    });

    kk.showHelp();

  });

  it('should set custom HELP handler.', (done) => {

    const expected = ['group1', 'group2'];

    kk.configHelp((groups) => {
      assert.deepEqual(groups, expected);
      kk.configHelp();
      done();
    });

    kk.showHelp(...expected);

  });

  it('should set HELP header and footer.', (done) => {

    kk.configLogger((type, message) => {
      const split = message.split('\n');
      split.shift(); // first is empty row.
      const header = split.shift().trim();
      split.pop(); // last is empty row.
      const footer = split.pop().trim();
      assert.equal(header, 'header');
      assert.equal(footer, 'footer');
      kk.configLogger(); // reset the logger.
      done();
    });

    kk.header('header').footer('footer');

    kk.showHelp();

  });

  it('should set an EXAMPLE.', () => {

    kk.example('test', 'Test example.');

    assert.equal(kk.core.examples.test, 'Test example.');

    kk.core.removeExample('test');

  });

  it('should set a custom HELP GROUP.', () => {

    const expected = {
      title: 'Test',
      items: ['commands.@Default.options.help', 'commands.@Default.options.version'],
      indent: 2,
      enabled: true,
      sort: false,
      children: []
    };

    kk.group('test', 'help', 'version');

    assert.deepEqual(kk.core.groups.test, expected);

    // Disable the group.

    const expectedFalse = {
      title: 'Test',
      items: ['commands.@Default.options.help', 'commands.@Default.options.version'],
      indent: 2,
      enabled: false,
      sort: false,
      children: []
    };

    kk.group('test', false);

    assert.deepEqual(kk.core.groups.test, expectedFalse);

  });

});