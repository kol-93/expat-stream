// import {ISuiteCallbackContext} from 'mocha'
//
// import {XMLStream} from '../core/xml.stream';
// import {ElementProcessor, IElementFilter, IElementInfo} from '../core/element.filter';
// import 'chai';
// import {XMLSerializer, DOMImplementation} from 'xmldom';
// import {PassThrough, Transform} from 'stream';
//
// const dom = new DOMImplementation();
// const serializer = new XMLSerializer();
//
// interface IXMLInput {
//     data: string;
//     count: number;
// }
//
// function _generateXML(maxLevel: number, maxChildren: number, count: ElementProcessor): IXMLInput {
//     const document = dom.createDocument(null, 'xml' + maxLevel.toString(10), null);
//     const queue: Array<{ element: Element, levelsLeft: number}> = [{
//         element: document.documentElement,
//         levelsLeft: maxLevel
//     }];
//     let total = count({ element: document.documentElement, document, level: 0 }) ? 1: 0;
//     for (let item = queue.shift(); item; item = queue.shift()) {
//         const children = Math.floor(Math.random() * maxChildren) + 1;
//         for (let i = 0; i !== children; ++i) {
//             const levelsLeft = item.levelsLeft - 1;
//             const element = document.createElement('item');
//             if (count({ element, document, level: maxLevel - levelsLeft})) {
//                 total += 1;
//             }
//             item.element.appendChild(element);
//             if (levelsLeft !== 0) {
//                 queue.push({
//                     element,
//                     levelsLeft
//                 });
//             }
//         }
//     }
//     return {
//         data: serializer.serializeToString(document),
//         count: total,
//     };
// }
//
// describe('Basic stream testing', function(this: ISuiteCallbackContext) {
//     const basicXml = '<document><item id="1"><inner value="1">text 1</inner></item><item id="2"><inner value="2">text 2</inner></item></document>';
//     it('Stream should end after single chunk of data passed through stream.end(chunk)', (done) => {
//         const stream = new XMLStream({
//             emit(this: IElementFilter, info: IElementInfo) { return false; },
//             keep(this: IElementFilter, info: IElementInfo) { return true; }
//         });
//         const callback = (error?: Error) => {
//             if (error instanceof Error) {
//                 done(error);
//             } else {
//                 done();
//             }
//         };
//         stream.on('data', () => {});
//         stream.once('error', callback);
//         stream.once('end', callback);
//         stream.end(basicXml);
//     }).timeout(1000);
//
//     it('Stream should work over pipe', (done) => {
//         const stream = new XMLStream({
//             emit(this: IElementFilter, info: IElementInfo) { return false; },
//             keep(this: IElementFilter, info: IElementInfo) { return true; }
//         });
//         const callback = (error?: Error) => {
//             if (error instanceof Error) {
//                 done(error);
//             } else {
//                 done();
//             }
//         };
//         stream.on('data', () => {});
//         stream.once('error', callback);
//         stream.once('end', callback);
//         const input = new PassThrough();
//         input.pipe(stream);
//         input.end(basicXml);
//     }).timeout(1000);
//
//     it('Stream should end after single chunk of data passed through stream.emit(chunk) and closed through stream.end()', (done) => {
//         const stream = new XMLStream({
//             emit(this: IElementFilter, info: IElementInfo) { return false; },
//             keep(this: IElementFilter, info: IElementInfo) { return true; }
//         });
//         const callback = (error?: Error) => {
//             if (error instanceof Error) {
//                 done(error);
//             } else {
//                 done();
//             }
//         };
//         stream.on('data', () => {});
//         stream.once('error', callback);
//         stream.once('end', callback);
//         stream.write(basicXml);
//         stream.end();
//     }).timeout(1000);
//
//
//     it('Stream should fail after second xml passed', (done) => {
//         const stream = new XMLStream({
//             emit(this: IElementFilter, info: IElementInfo) { return false; },
//             keep(this: IElementFilter, info: IElementInfo) { return true; }
//         });
//         const callback = (error?: Error) => {
//             stream.removeAllListeners();
//             if (error instanceof Error) {
//                 if (error.message === 'junk after document element') {
//                     done()
//                 } else {
//                     done(error);
//                 }
//             } else {
//                 done(new Error('Should be an error'));
//             }
//         };
//         stream.on('data', () => {});
//         stream.once('error', callback);
//         stream.once('end', callback);
//         stream.write(basicXml);
//         stream.write(basicXml);
//         stream.end();
//     }).timeout(1000);
//
//     it('Stream should fail on stream.emit after stream.end', (done) => {
//         const stream = new XMLStream({
//             emit(this: IElementFilter, info: IElementInfo) { return false; },
//             keep(this: IElementFilter, info: IElementInfo) { return true; }
//         });
//         const callback = (error?: Error) => {
//             stream.removeAllListeners();
//             if (error instanceof Error) {
//                 done();
//             } else {
//                 done(new Error('Should be an error'));
//             }
//         };
//         stream.on('data', () => {});
//         stream.once('error', (error) => {
//             stream.removeAllListeners();
//             done(error);
//         });
//         stream.once('end', () => {
//             stream.removeAllListeners();
//             stream.once('error', callback);
//             stream.once('end', callback);
//             stream.once('data', callback);
//             stream.write(basicXml);
//         });
//         stream.end(basicXml);
//     }).timeout(1000);
//
//     it('Stream should fail on stream.end after stream.end', (done) => {
//         const stream = new XMLStream({
//             emit(this: IElementFilter, info: IElementInfo) { return false; },
//             keep(this: IElementFilter, info: IElementInfo) { return true; }
//         });
//         const callback = (error?: Error) => {
//             stream.removeAllListeners();
//             if (error instanceof Error) {
//                 done();
//             } else {
//                 done(new Error('Should be an error'));
//             }
//         };
//         stream.on('data', () => {});
//         stream.once('error', (error) => {
//             stream.removeAllListeners();
//             done(error);
//         });
//         stream.once('end', () => {
//             stream.removeAllListeners();
//             stream.once('error', callback);
//             stream.once('end', callback);
//             stream.once('data', callback);
//             stream.end(basicXml);
//         });
//         stream.end(basicXml);
//     }).timeout(1000);
// });
//
// describe('Simple elements/levels counter testing', function(this: ISuiteCallbackContext) {
//     const MAX_LEVEL = 5;
//     const MAX_CHILDREN = 20;
//     const REPEAT = 10;
//     for (let maxLevel = 1; maxLevel < MAX_LEVEL + 1; ++maxLevel) {
//         for (let repeat = 0; repeat !== REPEAT; ++repeat) {
//             const generated = _generateXML(
//                 maxLevel,
//                 Math.floor(Math.random() * MAX_CHILDREN) + 1,
//                 () => true
//             );
//             it(`Stream should find ${generated.count} items on ${maxLevel} levels`, (done) => {
//                 let found = 0;
//                 let level = 0;
//                 const stream = new XMLStream({
//                     emit(this: IElementFilter, info: IElementInfo) { level = Math.max(level, info.level); return true; },
//                     keep(this: IElementFilter, info: IElementInfo) { return true; }
//                 });
//                 const callback = (error?: Error) => {
//                     if (error instanceof Error) {
//                         done(error);
//                     } else {
//                         if (found !== generated.count) {
//                             done(new Error(`${generated.count} elements expected but ${found} found`));
//                         } else if (level !== maxLevel) {
//                             done(new Error(`${maxLevel} levels expected but ${level} found`));
//                         } else {
//                             done();
//                         }
//                     }
//                 };
//                 stream.on('data', (element) => {
//                     found += 1;
//                 });
//                 stream.once('error', callback);
//                 stream.once('end', callback);
//                 stream.end(generated.data);
//             }).timeout(10000);
//         }
//     }
// });
//
// describe('Filtered elements/levels counter testing', function(this: ISuiteCallbackContext) {
//     const MAX_LEVEL = 5;
//     const MAX_CHILDREN = 20;
//     const REPEAT = 10;
//     for (let maxLevel = 1; maxLevel < MAX_LEVEL + 1; ++maxLevel) {
//         for (let repeat = 0; repeat !== REPEAT; ++repeat) {
//             const reportLevel = Math.floor(Math.random() * maxLevel) + 1;
//             const counting: ElementProcessor = (info: IElementInfo) => info.level === reportLevel;
//             const generated = _generateXML(
//                 maxLevel,
//                 Math.floor(Math.random() * MAX_CHILDREN) + 1,
//                 counting
//             );
//
//             it(`Stream should find ${generated.count} items on ${reportLevel} of ${maxLevel} levels`, (done) => {
//                 let found = 0;
//                 const stream = new XMLStream({
//                     emit(this: IElementFilter, info: IElementInfo) { return counting(info); },
//                     keep(this: IElementFilter, info: IElementInfo) { return true; }
//                 });
//                 const callback = (error?: Error) => {
//                     if (error instanceof Error) {
//                         done(error);
//                     } else {
//                         if (found !== generated.count) {
//                             done(new Error(`${generated.count} elements expected but ${found} found`));
//                         } else {
//                             done();
//                         }
//                     }
//                 };
//                 stream.on('data', (element) => {
//                     found += 1;
//                 });
//                 stream.once('error', callback);
//                 stream.once('end', callback);
//                 stream.end(generated.data);
//             }).timeout(10000);
//         }
//     }
// });
//
// describe('Counting elements after async transformations', function(this: ISuiteCallbackContext) {
//     const MAX_CHILDREN = 1000;
//     const MAX_TIMEOUT = 100;
//     const REPEAT = 10;
//     for (let repeat = 0; repeat !== REPEAT; ++repeat) {
//         const document = dom.createDocument(null, 'xml', null);
//         const totalItems = Math.floor(Math.random() * MAX_CHILDREN) + 1;
//         for (let item_id = 0; item_id !== totalItems; ++item_id) {
//             const node = document.createElement('item');
//             const timeoutAttr = document.createAttribute('timeout');
//             const idAttr = document.createAttribute('id');
//             timeoutAttr.value = Math.floor(Math.random() * MAX_TIMEOUT).toString(10);
//             idAttr.value = item_id.toString(10);
//             node.attributes.setNamedItem(timeoutAttr);
//             node.attributes.setNamedItem(idAttr);
//             document.documentElement.appendChild(node);
//         }
//         const write: ElementProcessor = (info: IElementInfo) => info.element.tagName === 'item'
//             && !isNaN(parseInt(info.element.attributes.getNamedItem('id').value, 10))
//             && !isNaN(parseInt(info.element.attributes.getNamedItem('timeout').value, 10))
//         ;
//         const keep: ElementProcessor = (info: IElementInfo) => false;
//
//         const data = serializer.serializeToString(document);
//
//         it(`Stream should find ${totalItems} items after async transformation`, (done) => {
//             let found = 0;
//             const stream = new XMLStream({
//                 emit: write, keep,
//             });
//             const transform = new Transform<Element, {id: number, timeout: number}>({
//                 readableObjectMode: true,
//                 writableObjectMode: true,
//                 transform(chunk: Element, encoding: string, callback: (error?: Error | null, chunk?: {id: number, timeout: number}) => any) {
//                     try {
//                         const item_id = parseInt(chunk.attributes.getNamedItem('id').value, 10);
//                         const timeout = parseInt(chunk.attributes.getNamedItem('timeout').value, 10);
//                         if (isNaN(item_id)) {
//                             done(new Error(`Invalid item id ${JSON.stringify(chunk.attributes.getNamedItem('id').value)}`));
//                             return;
//                         }
//                         if (isNaN(timeout)) {
//                             done(new Error(`Invalid item timeout ${JSON.stringify(chunk.attributes.getNamedItem('timeout').value)}`));
//                             return;
//                         }
//                         setTimeout(
//                             () => {
//                                 callback(null, { id: item_id, timeout });
//                             },
//                             timeout
//                         );
//                     } catch (error) {
//                         callback(error);
//                     }
//                 }
//             });
//             stream.pipe(transform);
//             transform.on('data', (element) => {
//                 found += 1;
//             });
//             transform.once('error', (error) => {
//                 transform.removeAllListeners();
//                 done(error);
//             });
//             transform.once('end', () => {
//                 transform.removeAllListeners();
//                 if (found !== totalItems) {
//                     done(new Error(`${totalItems} elements expected but ${found} found`));
//                 } else {
//                     done();
//                 }
//             });
//             stream.end(data);
//         }).timeout(2 * MAX_TIMEOUT * MAX_CHILDREN);
//     }
// });