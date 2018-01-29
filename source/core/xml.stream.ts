
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
    private _parserClosed: boolean;
    private _paused: boolean;
    private _written: number;
    
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
        this._parser.on('close', this._onParserClose.bind(this));
        this._parser.on('error', this._onParserError.bind(this));
        
        this._stack = [];
        this._cdata = false;
        this._document = null;
        this._filter = filter;
        this._paused = false;
        this._written = 0;
    }
    
    private _onStartElement(this: XmlStream, name: string, attributes: NamedCollection<string>) {
        let node: Element;
        if (this._stack.length === 0) {
            this._document = DOM.createDocument(attributes['xmlns'] || null, name, null);
            node = this._document.documentElement;
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
                        level: this._stack.length - 1,
                        document: this._document,
                        element: node
                    };
                    if (this._filter.write(info)) {
                        if (!this.push(node)) {
                            this._parser.pause();
                            this._paused = true;
                        }
                    }
                    if (!this._filter.keep(info) && node.parentElement) {
                        node.parentElement.removeChild(node);
                    }
                } catch (error) {
                    this.destroy(error);
                }
            }
        } else {
            this.destroy(new Error('Stack is empty'));
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
            this.destroy(new Error('Empty document'));
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
        /**
         * Suppressing parser errors
         **/
    }
    
    private _onParserClose(this: XmlStream) {
        this._parserClosed = true;
    }
    
    public _read(size: number): void {
        if (this._paused) {
            this._paused = false;
            this._parser.resume();
            if (!this._paused) {
                this._parser.emit('resume');
            }
        }
        super._read(size);
    }
    
    public _transform(chunk: string | Buffer, encoding: string, callback: (error?: Error | null, chunk?: Element) => any) {
        let exception: Error | null = null;
        const _error = (error: Error) => {
            exception = error;
        };
        const _finally = () => {
            try {
                callback(exception);
            } catch (error) {}
        };
        
        if (typeof chunk === 'string') {
            chunk = Buffer.from(chunk, encoding);
        }
        const _process = () => {
            try {
                if (this._parser.write(chunk)) {
                    this._written += chunk.length;
                } else {
                    const error = this._parser.getError();
                    if (error) {
                        exception = new Error(error);
                    }
                }
                if (this._paused) {
                    this._parser.once('resume', _finally);
                } else {
                    _finally();
                }
            } catch (error) {
                _error(error);
                _finally();
            }
        };
        if (this._paused) {
            this._parser.once('resume', _process);
        } else {
            _process();
        }
    }
    
    public _final(callback: (error?: Error | null) => any): void {
        let exception: Error | null = null;
        const _catch = (error?: Error | string) => {
            if (error instanceof Error) {
                exception = error;
            } else if (typeof error === 'string' && error) {
                exception = new Error(error);
            }
            this._parser.removeListener('error', _catch);
            this._parser.removeListener('end', _catch);
            callback(exception);
        };
        const _process = () => {
            this._parser.once('error', _catch);
            this._parser.once('end', _catch);
            this._parser.end();
        };
        if (this._paused) {
            this._parser.once('resume', _process);
        } else {
            _process();
        }
    }
}
