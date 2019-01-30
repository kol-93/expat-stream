import { EventEmitter } from 'events';


export interface NameSpace<ValueType = any> {
    [key: string]: ValueType;
}

export interface TypedEmitter<EventMapType extends NameSpace<any[]>> extends EventEmitter {
    addListener<Event extends keyof EventMapType>           (event: Event, listener: (...args: EventMapType[Event]) => void): this;
    on<Event extends keyof EventMapType>                    (event: Event, listener: (...args: EventMapType[Event]) => void): this;
    once<Event extends keyof EventMapType>                  (event: Event, listener: (...args: EventMapType[Event]) => void): this;
    prependListener<Event extends keyof EventMapType>       (event: Event, listener: (...args: EventMapType[Event]) => void): this;
    prependOnceListener<Event extends keyof EventMapType>   (event: Event, listener: (...args: EventMapType[Event]) => void): this;
    removeListener<Event extends keyof EventMapType>        (event: Event, listener: (...args: EventMapType[Event]) => void): this;
    emit<Event extends keyof EventMapType>                  (event: Event, ...args: EventMapType[Event]): boolean;
    
    addListener                                             (event: string | symbol, listener: (...args: any[]) => void): this;
    on                                                      (event: string | symbol, listener: (...args: any[]) => void): this;
    once                                                    (event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener                                         (event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener                                     (event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener                                          (event: string | symbol, listener: (...args: any[]) => void): this;
    emit                                                    (event: string | symbol, ...args: any[]): boolean;
}
