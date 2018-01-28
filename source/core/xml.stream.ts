
import {NamedCollection, Parser} from "node-expat";
import {Transform} from "stream";
import {DOMImplementation} from "xmldom";

import {IElementFilter, IElementInfo} from "./element.filter";

const DOM = new DOMImplementation();

export class XmlStream extends Transform<string | Buffer, Element> {
    private readonly _parser: Parser;
    private readonly _stack: Element[];
    private _cdata: boolean;
    private _document: Document | null;
    private readonly _filter: IElementFilter;
    private _parsedEnded: boolean;
    
    constructor(filter: IElementFilter) {
        super({
            writableObjectMode: false,
            readableObjectMode: true,
            allowHalfOpen: true,
        });
        this._parser = new Parser();
        this._parser.on('startElement', this._onStartElement.bind(this));
        this._parser.on('endElement', this._onEndElement.bind(this));
        this._parser.on('text', this._onText.bind(this));
        this._parser.on('startCdata', this._onStartCData.bind(this));
        this._parser.on('endCdata', this._onEndCData.bind(this));
        this._parser.on('xmlDecl', this._onXmlDeclaration.bind(this));
        this._parser.on('error', this._onParserError.bind(this));
        this._parser.on('end', this._onParserEnd.bind(this));
        
        this._stack = [];
        this._cdata = false;
        this._document = null;
        this._filter = filter;
    }
    
    private _onStartElement(this: XmlStream, name: string, attributes: NamedCollection<string>) {
        let node: Element;
        if (this._stack.length === 0) {
            this._document = DOM.createDocument(attributes['xmlns'] || null, name, null);
            node = this._document.documentElement;
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
    
    private _onEndElement(this: XmlStream, name: string) {
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
                    const info: IElementInfo = {
                        level: this._stack.length,
                        document: this._document,
                        element: node
                    };
                    if (this._filter.write(info)) {
                        this.push(node);
                    }
                    if (!this._filter.keep(info) && node.parentElement) {
                        node.parentElement.removeChild(node);
                    }
                } catch (error) {
                    this._parser.emit('error', error);
                }
            }
            if (this._stack.length === 0) {
                // console.info('Parsing almost done', this._);
            }
        } else {
            this._parser.emit('error', new Error('Stack is empty'));
        }
    }
    
    private _onText(this: XmlStream, value: string) {
        if (this._document) {
            const text = this._cdata ? this._document.createTextNode(value) : this._document.createCDATASection(value);
            if (this._stack.length === 0) {
                this._document.rootElement.appendChild(text);
            } else {
                this._stack[this._stack.length - 1].appendChild(text);
            }
        } else {
            this._parser.emit('error', new Error('Empty document'));
        }
    }
    
    private _onStartCData(this: XmlStream) {
        this._cdata = true;
    }
    
    private _onEndCData(this: XmlStream) {
        this._cdata = false;
    }
    
    private _onXmlDeclaration(this: XmlStream, version: string | null, encoding: string | null, standalone: boolean) {
        if (encoding) {
            this._parser.setEncoding(encoding);
        }
    }
    
    private _onParserError(this: XmlStream, error: string | Error) {
        if (typeof error === 'string') {
            this.emit('error', new Error(error));
        } else {
            this.emit('error', error);
        }
    }
    
    private _onParserEnd(this: XmlStream) {
        this._parsedEnded = true;
        this.emit('end');
    }
    
    public _transform(chunk: string | Buffer, encoding: string, callback: (error?: Error | null, chunk?: Element) => any) {
        let exception: Error | null = null;
        const _error = (error: Error) => {
            exception = error;
        };
        const _finally = () => {
            this.removeListener('error', _error);
            callback(exception);
        };
        
        this.once('error', _error);
        try {
            if (!this._parsedEnded) {
                this._parser.write(chunk);
            } else {
                exception = new Error('Already ended');
            }
            _finally();
        } catch (error) {
            _error(error);
            _finally();
        }
    }
    
    public end(cb?: (error?: Error | null) => any): void;
    public end(chunk: string | Buffer, cb?: (error?: Error | null) => any): void;
    public end(chunk: string | Buffer, encoding?: string, cb?: (error?: Error | null) => any): void;
    public end(first?: string | Buffer | ((error?: Error | null) => any), second?: string | ((error?: Error | null) => any), third?: (error?: Error | null) => any): void {
        let callback: ((error?: Error | null) => void) | undefined;
        if (typeof first === 'function') {
            callback = first;
        } else if (typeof second === 'function') {
            callback = second;
        } else if (typeof third === 'function') {
            callback = third;
        }
        if (callback) {
            let success: () => void;
            let fail: (error: Error) => void;
            const unsubscribe = () => {
                this.removeListener('end', success);
                this.removeListener('error', fail);
            };
            
            success = () => {
                if (callback) {
                    callback();
                }
                unsubscribe();
            };
            fail = (error: Error) => {
                if (callback) {
                    callback(error);
                }
                unsubscribe();
            };
            this.on('end', success);
            this.on('error', fail);
        }
        if (this._parsedEnded) {
            this.emit('error', new Error('Already ended'));
            return;
        }
        
        if (typeof first === 'string' || first instanceof Buffer) {
            this._parser.end(first);
        } else {
            this._parser.end();
        }
    }
}
