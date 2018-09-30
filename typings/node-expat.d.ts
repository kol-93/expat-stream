// Type definitions for node-expat 2.3.x
// Project: http://nodejs.org/
// Definitions by: Microsoft TypeScript <http://typescriptlang.org>
//                 Oleksandr Fedorchuk <https://github.com/kol-93>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "node-expat" {
    import {Stream} from "stream";
    
    export interface NamedCollection<Type> {
        [name: string]: Type;
    }
    
    interface _Emitter<EventType = string | symbol, Args extends any[] = any[]> {
        emit(event: EventType, ...args: Args): boolean;
        
        addListener(event: EventType, listener: (...args: Args) => void): this;
        on(event: EventType, listener: (...args: Args) => void): this;
        once(event: EventType, listener: (...args: Args) => void): this;
        prependListener(event: EventType, listener: (...args: Args) => void): this;
        prependOnceListener(event: EventType, listener: (...args: Args) => void): this;
        removeListener(event: EventType, listener: (...args: Args) => void): this;
    }
    
    export class Parser extends Stream
                        implements NodeJS.WritableStream,
                                   _Emitter,
                                   _Emitter<'startElement', [string, NamedCollection<string>]>,
                                   _Emitter<'endElement', [string]>,
                                   _Emitter<'text', [string]>,
                                   _Emitter<'processingInstruction', [string, string]>,
                                   _Emitter<'comment', [string]>,
                                   _Emitter<'xmlDecl', [string | null, string | null, boolean]>,
                                   _Emitter<'startCdata', []>,
                                   _Emitter<'endCdata', []>,
                                   _Emitter<'entityDecl', [string | null, boolean, string | null, string | null, string | null, string | null, string | null]>,
                                   _Emitter<'end', []>,
                                   _Emitter<'close', []>,
                                   _Emitter<'error', [string | Error]>
    {
        readonly writable: boolean;
        stop(): this;
        
        pause(): this;
        resume(): this;
        
        parse(buf: string | Buffer, isFinal: boolean): boolean;
        setEncoding(value: string): this;
        /// @TODO setUnknownEncoding
        getError(): string | null;
        destroy(): this;
        destroySoon(): this;
        
        write(buffer: Buffer | string, cb?: Function): boolean;
        write(str: string, encoding?: string, cb?: Function): boolean;
        end(cb?: Function): boolean;
        end(chunk: Buffer, cb?: Function): boolean;
        end(chunk: string, cb?: Function): boolean;
        end(chunk: string, encding?: string, cb?: Function): boolean;
        reset(this: Parser): this;
        getCurrentLineNumber(this: Parser): number;
        getCurrentColumnNumber(this: Parser): number;
        getCurrentByteIndex(this: Parser): number;
    }
    
    export function createParser(callback?: (name: string, attributes: NamedCollection<string>) => void): Parser;
}
