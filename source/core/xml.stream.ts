
import { EventEmitter } from 'events';
import {NamedCollection, Parser} from "node-expat";
import {DOMImplementation} from "xmldom";

const DOM = new DOMImplementation();

interface _Emitter<EventType = string | symbol, Args extends any[] = any[]> {
    emit(event: EventType, ...args: Args): boolean;
    
    addListener(event: EventType, listener: (...args: Args) => void): this;
    on(event: EventType, listener: (...args: Args) => void): this;
    once(event: EventType, listener: (...args: Args) => void): this;
    prependListener(event: EventType, listener: (...args: Args) => void): this;
    prependOnceListener(event: EventType, listener: (...args: Args) => void): this;
    removeListener(event: EventType, listener: (...args: Args) => void): this;
}


export type IXMLStreamEmitter = EventEmitter
    & _Emitter<'element', [Element, number, Document]>
    & _Emitter<'close', []>
    & _Emitter<'error', [Error]>
    ;


export interface IXMLStream extends IXMLStreamEmitter {
    
    pause(): void;
    
    resume(): void;
    
}


export class XMLStream extends EventEmitter implements IXMLStream {
    private readonly _parser: Parser;
    private readonly _stack: Element[];
    private _cdata: boolean;
    private _document: Document | null;
    private _parserClosed: boolean;
    private _paused: boolean;
    private _written: number;
    
    constructor(stream: NodeJS.ReadableStream) {
        super();
        this._parser = new Parser();
        this._parser.on('startElement', this._onStartElement.bind(this));
        this._parser.on('endElement', this._onEndElement.bind(this));
        this._parser.on('text', this._onText.bind(this));
        this._parser.on('startCdata', this._onStartCData.bind(this));
        this._parser.on('endCdata', this._onEndCData.bind(this));
        this._parser.on('xmlDecl', this._onXmlDeclaration.bind(this));
        this._parser.on('close', this._onParserClose.bind(this));
        this._parser.on('error', this._onParserError.bind(this));
        
        this._stack = [];
        this._cdata = false;
        this._document = null;
        this._paused = false;
        this._written = 0;
        stream.pipe(this._parser);
    }
    
    private _onStartElement(this: XMLStream, name: string, attributes: NamedCollection<string>) {
        let node: Element;
        if (this._stack.length === 0) {
            this._document = DOM.createDocument(attributes['xmlns'] || null, name, null);
            node = this._document.documentElement!;
            this._stack.push(node);
        } else if (this._document) {
            node = this._document.createElement(name);
            this._stack[this._stack.length - 1].appendChild(node);
        } else {
            this._parser.emit('error', new Error('Empty document'));
            return;
        }
        for (let attrName in attributes) {
            const attr = this._document.createAttribute(attrName);
            attr.value = attributes[attrName];
            node.attributes.setNamedItem(attr);
        }
        this._stack.push(node);
    }
    
    private _onEndElement(this: XMLStream, name: string) {
        const node = this._stack.pop();
        if (node) {
            if (node.nodeName !== name) {
                this._parser.emit('error', new Error(`Node with name ${JSON.stringify(name)} expected but ${JSON.stringify(node.nodeName)} found`));
                return;
            } else if (!this._document) {
                this._parser.emit('error', new Error('Empty document'));
                return;
            } else if (this._stack.length !== 0) {
                try {
                    this.emit('element', node, this._stack.length - 1, this._document);
                } catch (error) {
                    this.emit('error', error);
                }
            }
        } else {
            this.emit('error', new Error('Stack is empty'));
        }
    }
    
    private _onText(this: XMLStream, value: string) {
        if (this._document) {
            const text = this._cdata ? this._document.createTextNode(value) : this._document.createCDATASection(value);
            if (this._stack.length === 0) {
                this._document.documentElement!.appendChild(text);
            } else {
                this._stack[this._stack.length - 1].appendChild(text);
            }
        } else {
            this.emit('error', new Error('Empty document'));
        }
    }
    
    private _onStartCData(this: XMLStream) {
        this._cdata = true;
    }
    
    private _onEndCData(this: XMLStream) {
        this._cdata = false;
    }
    
    private _onXmlDeclaration(this: XMLStream, version: string | null, encoding: string | null, standalone: boolean) {
        if (encoding) {
            this._parser.setEncoding(encoding);
        }
    }
    
    private _onParserError(this: XMLStream, error: string | Error) {
        if (typeof error === 'string') {
            this.emit('error', new Error(error));
        } else {
            this.emit('error', error);
        }
    }
    
    private _onParserClose(this: XMLStream) {
        this.emit('close');
        this._parserClosed = true;
    }
    
    public pause() {
        if (!this._paused) {
            this._paused = true;
            this._parser.pause();
        }
    }
    
    public resume() {
        if (this._paused) {
            this._paused = false;
            this._parser.resume();
        }
    }
}
