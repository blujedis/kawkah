import { KawkahEvent } from './interfaces';
import { KawkahCore } from './core';
export declare class KawkahError extends Error {
    name: string;
    message: string;
    stack: string;
    event: string;
    type: string;
    stacktrace: string;
    ministack: string;
    filename: string;
    line: number;
    column: number;
    timestamp: string;
    symbol: string;
    constructor(message: string, core: KawkahCore);
    constructor(message: string, purge: number, core: KawkahCore);
    constructor(message: string, name: string | KawkahEvent, core: KawkahCore);
    constructor(message: string, name: string | KawkahEvent, purge: number, core: KawkahCore);
    constructor(message: string, name: string | KawkahEvent, purge: number, trim: number, core: KawkahCore);
    /**
     * Generates custom stacktrace and ministack.
     *
     * @param stack the current error stack
     * @param purge whether to purge the stack.
     * @param trim whether to trim the stack.
     */
    generateStacktrace(stack: string, purge?: number, trim?: number): void;
}
