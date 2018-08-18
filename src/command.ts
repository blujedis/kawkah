import { KawkahCommandBase } from './base';
import { KawkahCore } from './core';
import { KawkahAction } from './interfaces';

export class KawkahCommand extends KawkahCommandBase<KawkahCommand> {

  constructor(name: string, core: KawkahCore) {
    super(name, core);
  }

}