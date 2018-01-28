
/**
 * Element info for filter
 */
export interface IElementInfo {
    /**
     * Document of current element
     */
    readonly document: Document;
    /**
     * Current element
     */
    readonly element: Element;
    /**
     * Nesting level of current element
     */
    readonly level: number;
}

export type ElementProcessor = (info: IElementInfo) => boolean;

/**
 * Minimal interface for element filter
 */
export interface IElementFilter {
    /**
     * Makes decision about pushing/writing `element` to the stream
     * @param {IElementInfo} info
     * @return {boolean}
     */
    write(this: IElementFilter, info: IElementInfo): boolean;
    
    /**
     * Makes decision about saving/keeping element in the DOM tree
     * @param {IElementInfo} info
     * @return {boolean}
     */
    keep(this: IElementFilter, info: IElementInfo): boolean;
}

/**
 * Options for ElementFilter constructor
 */
export interface ElementFilterOptions {
    write?: ElementProcessor;
    keep?: ElementProcessor;
}

function _NotImplemented(name): never {
    throw new Error(`${name} is not implemented`);
}

/**
 *
 */
export class ElementFilter implements IElementFilter {
    protected __keep?: ElementProcessor;
    protected __write?: ElementProcessor;
    
    public constructor(options?: ElementFilterOptions) {
        if (options) {
            if (typeof options.keep === 'function') {
                this.__keep = options.keep;
            }
            if (typeof options.write === 'function') {
                this.__write = options.write;
            }
        }
    }
    
    public write(this: ElementFilter, info: IElementInfo): boolean {
        if (typeof this.__write === 'function') {
            return this.__write(info);
        }
        throw new Error(`write(info) is not implemented`);
    }
    
    public keep(this: ElementFilter, info: IElementInfo): boolean {
        if (typeof this.__keep === 'function') {
            return this.__keep(info);
        }
        throw new Error(`keep(info) is not implemented`);
    }
}
