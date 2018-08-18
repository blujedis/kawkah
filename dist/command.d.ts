import { KawkahCommandBase } from './base';
import { KawkahCore } from './core';
export declare class KawkahCommand extends KawkahCommandBase<KawkahCommand> {
    constructor(name: string, core: KawkahCore);
}
