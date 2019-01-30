
import { EventEmitter } from 'events';
import { Parser } from "node-expat";
import { DOMImplementation } from "xmldom";
import { NameSpace, TypedEmitter } from './typed.emitter';

const DOM = new DOMImplementation();

interface XMLStreamEventsMap extends NameSpace<any[]> {
    /**
     *
     */
    startElement: [Element, number, Document];
    endElement: [Element, number, Document];
    updateElement: [Node, Element, number, Document];
    close: [];
    error: [Error];
}

export interface IXMLStream extends TypedEmitter<XMLStreamEventsMap> {
    /**
     * Pauses parsing
     */
    pause(): void;
    
    /**
     * Resumes parsing
     */
    resume(): void;
}

class _XMLStream extends EventEmitter implements IXMLStream {
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
        this._parser.on('startElement', this._onStartElement);
        this._parser.on('endElement', this._onEndElement);
        this._parser.on('text', this._onText);
        this._parser.on('startCdata', this._onStartCData);
        this._parser.on('endCdata', this._onEndCData);
        this._parser.on('xmlDecl', this._onXmlDeclaration);
        this._parser.on('close', this._onParserClose);
        this._parser.on('error', this._onParserError);
        
        this._stack = [];
        this._cdata = false;
        this._document = null;
        this._paused = false;
        this._written = 0;
        stream.pipe(this._parser);
    }
    
    private readonly _onStartElement = (name: string, attributes: NameSpace<string>) => {
        let node: Element;
        if (this._stack.length === 0) {
            this._document = DOM.createDocument(attributes['xmlns'] || null, name, null);
            node = this._document.documentElement!;
        } else if (this._document) {
            node = this._document.createElement(name);
            this._stack[this._stack.length - 1].appendChild(node);
        } else {
            this._parser.emit('error', new Error('Empty document'));
            return;
        }
        for (let attrName of Object.keys(attributes)) {
            const attr = this._document.createAttribute(attrName);
            attr.value = attributes[attrName];
            node.attributes.setNamedItem(attr);
        }
        this._stack.push(node);
        this.emit('startElement', node, this._stack.length - 1, this._document);
        if (this._stack.length > 1) {
            this.emit('update', node, this._stack[this._stack.length - 1], this._document);
        }
    };
    
    private readonly _onEndElement = (name: string) => {
        const node = this._stack.pop();
        if (node) {
            if (node.nodeName !== name) {
                this._parser.emit('error', new Error(`Node with name ${JSON.stringify(name)} expected but ${JSON.stringify(node.nodeName)} found`));
                return;
            } else if (!this._document) {
                this._parser.emit('error', new Error('Empty document'));
                return;
            } else if (this._stack.length >= 0) {
                try {
                    this.emit('endElement', node, this._stack.length, this._document);
                } catch (error) {
                    this.emit('error', error);
                }
            }
        } else {
            this.emit('error', new Error('Stack is empty'));
        }
    };
    
    private readonly _onText = (value: string) => {
        if (this._document) {
            const text = this._cdata ? this._document.createTextNode(value) : this._document.createCDATASection(value);
            // const target = this._stack.length !== 0
            //     ? this._stack[this._stack.length - 1]
            //     : this._document.documentElement!;
            const target = this._stack[this._stack.length - 1];
            target.appendChild(text);
            this.emit('updateElement', text, target, this._stack.length - 1, this._document);
        } else {
            this.emit('error', new Error('Empty document'));
        }
    };
    
    private readonly _onStartCData = () => {
        this._cdata = true;
    };
    
    private readonly _onEndCData = () => {
        this._cdata = false;
    };
    
    private readonly _onXmlDeclaration = (version: string | null, encoding: string | null, standalone: boolean) => {
        if (encoding) {
            this._parser.setEncoding(encoding);
        }
    };
    
    private readonly _onParserError = (error: string | Error) => {
        if (typeof error === 'string') {
            this.emit('error', new Error(error));
        } else {
            this.emit('error', error);
        }
    };
    
    private readonly _onParserClose = () => {
        this.emit('close');
        this._parserClosed = true;
    };
    
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

export const XMLStream: {
    new (stream: NodeJS.ReadableStream): IXMLStream;
} = _XMLStream;
