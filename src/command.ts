/**
 * PLACEHOLDER
 * 
 * In case you're wondering this is a placeholder
 * class. Not currently needed but here for
 * future plans.
 */

import { KawkahCommandBase } from './base';
import { KawkahCore } from './core';
import { KawkahAction } from './interfaces';

export class KawkahCommand extends KawkahCommandBase<KawkahCommand> {

  constructor(name: string, core: KawkahCore) {
    super(name, core);
  }

}