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
    
    export class Parser extends Stream {
        stop(this: Parser): this;
        pause(this: Parser): this;
        resume(this: Parser): this;
        parse(this: Parser, buf: string | Buffer, isFinal: boolean): boolean;
        setEncoding(this: Parser, value: string): this;
        /// @TODO setUnknownEncoding
        getError(this: Parser): string | null;
        destroy(this: Parser): this;
        destroySoon(this: Parser): this;
        write(this: Parser, data: string | Buffer): boolean;
        end(this: Parser, data?: string | Buffer): boolean;
        reset(this: Parser): this;
        getCurrentLineNumber(this: Parser): number;
        getCurrentColumnNumber(this: Parser): number;
        getCurrentByteIndex(this: Parser): number;
    
        addListener(event: string | symbol, listener: (...args: any[]) => void): this;
        emit(event: string | symbol, ...args: any[]): boolean;
        on(event: string | symbol, listener: (...args: any[]) => void): this;
        once(event: string | symbol, listener: (...args: any[]) => void): this;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    
        addListener(event: 'startElement', listener: (name: string, attributes: NamedCollection<string>) => void): this;
        emit(event: 'startElement', name: string, attributes: NamedCollection<string>): boolean;
        on(event: 'startElement', listener: (name: string, attributes: NamedCollection<string>) => void): this;
        once(event: 'startElement', listener: (name: string, attributes: NamedCollection<string>) => void): this;
        prependListener(event: 'startElement', listener: (name: string, attributes: NamedCollection<string>) => void): this;
        prependOnceListener(event: 'startElement', listener: (name: string, attributes: NamedCollection<string>) => void): this;
        removeListener(event: 'startElement', listener: (name: string, attributes: NamedCollection<string>) => void): this;
    
        addListener(event: 'endElement', listener: (name: string) => void): this;
        emit(event: 'endElement', name: string): boolean;
        on(event: 'endElement', listener: (name: string) => void): this;
        once(event: 'endElement', listener: (name: string) => void): this;
        prependListener(event: 'endElement', listener: (name: string) => void): this;
        prependOnceListener(event: 'endElement', listener: (name: string) => void): this;
        removeListener(event: 'endElement', listener: (name: string) => void): this;
    
        addListener(event: 'text', listener: (value: string) => void): this;
        emit(event: 'text', value: string): boolean;
        on(event: 'text', listener: (value: string) => void): this;
        once(event: 'text', listener: (value: string) => void): this;
        prependListener(event: 'text', listener: (value: string) => void): this;
        prependOnceListener(event: 'text', listener: (value: string) => void): this;
        removeListener(event: 'text', listener: (value: string) => void): this;
    
        addListener(event: 'processingInstruction', listener: (target: string, data: string) => void): this;
        emit(event: 'processingInstruction', target: string, data: string): boolean;
        on(event: 'processingInstruction', listener: (target: string, data: string) => void): this;
        once(event: 'processingInstruction', listener: (target: string, data: string) => void): this;
        prependListener(event: 'processingInstruction', listener: (target: string, data: string) => void): this;
        prependOnceListener(event: 'processingInstruction', listener: (target: string, data: string) => void): this;
        removeListener(event: 'processingInstruction', listener: (target: string, data: string) => void): this;
    
        addListener(event: 'comment', listener: (value: string) => void): this;
        emit(event: 'comment', value: string): boolean;
        on(event: 'comment', listener: (value: string) => void): this;
        once(event: 'comment', listener: (value: string) => void): this;
        prependListener(event: 'comment', listener: (value: string) => void): this;
        prependOnceListener(event: 'comment', listener: (value: string) => void): this;
        removeListener(event: 'comment', listener: (value: string) => void): this;
    
        addListener(event: 'xmlDecl', listener: (version: string | null, encoding: string | null, standalone: boolean) => void): this;
        emit(event: 'xmlDecl', version: string | null, encoding: string | null, standalone: boolean): boolean;
        on(event: 'xmlDecl', listener: (version: string | null, encoding: string | null, standalone: boolean) => void): this;
        once(event: 'xmlDecl', listener: (version: string | null, encoding: string | null, standalone: boolean) => void): this;
        prependListener(event: 'xmlDecl', listener: (version: string | null, encoding: string | null, standalone: boolean) => void): this;
        prependOnceListener(event: 'xmlDecl', listener: (version: string | null, encoding: string | null, standalone: boolean) => void): this;
        removeListener(event: 'xmlDecl', listener: (version: string | null, encoding: string | null, standalone: boolean) => void): this;
    
    
        addListener(event: 'startCdata', listener: () => void): this;
        emit(event: 'startCdata', ): boolean;
        on(event: 'startCdata', listener: () => void): this;
        once(event: 'startCdata', listener: () => void): this;
        prependListener(event: 'startCdata', listener: () => void): this;
        prependOnceListener(event: 'startCdata', listener: () => void): this;
        removeListener(event: 'startCdata', listener: () => void): this;
    
        addListener(event: 'endCdata', listener: () => void): this;
        emit(event: 'endCdata', ): boolean;
        on(event: 'endCdata', listener: () => void): this;
        once(event: 'endCdata', listener: () => void): this;
        prependListener(event: 'endCdata', listener: () => void): this;
        prependOnceListener(event: 'endCdata', listener: () => void): this;
        removeListener(event: 'endCdata', listener: () => void): this;
        
        addListener(event: 'entityDecl', listener: (entityName: string | null, isParameterEntity: boolean, value: string | null, base: string | null, systemId: string | null, publicId: string | null, notationName: string | null) => void): this;
        emit(event: 'entityDecl', entityName: string | null, isParameterEntity: boolean, value: string | null, base: string | null, systemId: string | null, publicId: string | null, notationName: string | null): boolean;
        on(event: 'entityDecl', listener: (entityName: string | null, isParameterEntity: boolean, value: string | null, base: string | null, systemId: string | null, publicId: string | null, notationName: string | null) => void): this;
        once(event: 'entityDecl', listener: (entityName: string | null, isParameterEntity: boolean, value: string | null, base: string | null, systemId: string | null, publicId: string | null, notationName: string | null) => void): this;
        prependListener(event: 'entityDecl', listener: (entityName: string | null, isParameterEntity: boolean, value: string | null, base: string | null, systemId: string | null, publicId: string | null, notationName: string | null) => void): this;
        prependOnceListener(event: 'entityDecl', listener: (entityName: string | null, isParameterEntity: boolean, value: string | null, base: string | null, systemId: string | null, publicId: string | null, notationName: string | null) => void): this;
        removeListener(event: 'entityDecl', listener: (entityName: string | null, isParameterEntity: boolean, value: string | null, base: string | null, systemId: string | null, publicId: string | null, notationName: string | null) => void): this;
    
        addListener(event: 'end', listener: () => void): this;
        emit(event: 'end', ): boolean;
        on(event: 'end', listener: () => void): this;
        once(event: 'end', listener: () => void): this;
        prependListener(event: 'end', listener: () => void): this;
        prependOnceListener(event: 'end', listener: () => void): this;
        removeListener(event: 'end', listener: () => void): this;
    
        addListener(event: 'error', listener: (error: string | Error) => void): this;
        emit(event: 'error', error: string | Error): boolean;
        on(event: 'error', listener: (error: string | Error) => void): this;
        once(event: 'error', listener: (error: string | Error) => void): this;
        prependListener(event: 'error', listener: (error: string | Error) => void): this;
        prependOnceListener(event: 'error', listener: (error: string | Error) => void): this;
        removeListener(event: 'error', listener: (error: string | Error) => void): this;

        // addListener(event: '', listener: () => void): this;
        // emit(event: '', ): boolean;
        // on(event: '', listener: () => void): this;
        // once(event: '', listener: () => void): this;
        // prependListener(event: '', listener: () => void): this;
        // prependOnceListener(event: '', listener: () => void): this;
        // removeListener(event: '', listener: () => void): this;
    }
    
    export function createParser(callback?: (name: string, attributes: NamedCollection<string>) => void): Parser;
}
