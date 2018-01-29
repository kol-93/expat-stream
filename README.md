<h1 align="center">
    Expat-Stream
    <br />
    <img alt="Expat-Stream Logo" src="https://raw.githubusercontent.com/kol-93/expat-stream/master/logo.svg" />
</h1>

## What is Expat-Stream?
Expat-Stream is a JavaScript/TypeScript stream-like XML processing library for [Node.js](https://nodejs.org) based on [node-expat](https://www.npmjs.com/package/node-expat).

With this library you can process huge XML streams and files before they end by selecting and keeping only specific elements from the tree. 

## Installation
`expat-stream` is available on [npm](https://npmjs.org). To install it type
```$bash
$ npm install expat-stream
``` 

## Usage
### API
#### Class: `XmlStream`
Implements `stream.Transform` as non-object-mode readable and object-mode writable.
##### Constructor: `new XmlStream([filter]) `
 - filter `<Object>`
   - `write(info)` `<Function>` that makes decision about writing (or not) an element to output stream.
   Function has to return `true` if element should be written to output and `false` elsewhere. 
 
     info `<Object>`:
       - element `<Object>` instance of the Element that is processing
       - document `<Object>` root instance of the DOM element belongs to
       - level `<Number>` depth level of the element in the tree
   - `keep(info)` `<Function>` that makes decision about keeping (or not) an element in the DOM tree.
   Function has to return `true` if element should be kept in the DOM tree and `false` elsewhere.
    
     info `<Object>`:
       - element `<Object>` instance of the Element that is processing
       - document `<Object>` root instance of the DOM element belongs to
       - level `<Number>` depth level of the element in the tree
For example:
```ecmascript 6
const {XmlStream} = require('expat-stream');

const stream = new XmlStream({
    write(info) {
        return info.level === 1
    },
    keep(info) {
        return info.level > 1
    }
});
```
or
```ecmascript 6
const {XmlStream, ElementFilter} = require('expat-stream');

const stream = new XmlStream(new ElementFilter({
    write(info) {
        return info.level === 1
    },
    keep(info) {
        return info.level > 1
    }
}));
```
or
```ecmascript 6
const {XmlStream, ElementFilter} = require('expat-stream');

class MyFilter extends ElementFilter {
    constructor() { super(); }
    write(info) {
        return info.level === 1;
    }
    keep(info) {
        return info.level > 1;
    }
}
const stream = new XmlStream(new MyFilter());
```
##### Event: `'data'`:
 - chunk `<Object>` Single DOM element, provided by [xmldom](https://www.npmjs.com/package/xmldom).

The `'data'` events emitted whenever stream is reading closed xml-tag in the input stream and `filter.write({ element, document, level})` returns `true`;

##### Event `'error'`:
 - error `<Object>` Instance of the error.

The `'error'` event can be emitted on syntax error during input stream processing.

##### Event: `'end'`:
The `'end'` event is emitted whenever input stream is closed or right after `'error'` event.

### Parsing string data:
```ecmascript 6
const {XmlStream} = require('expat-stream');
const stream = new XmlStream({
    write(info) {
        /* decide which elements should be written to the output */
    },
    keep(info) {
        /* decide which elements should be kept in the DOM */
    }
});
stream.on('data', function(element) { /* do something*/ });
stream.on('end', function() { /* do something after stream end*/});
stream.on('error', function(error) { /* do something after stream error */ });
stream.end(data);
```

### Parsing a file:
```ecmascript 6
const {createReadStream} = require('fs');
const {XmlStream} = require('expat-stream');
const input = createReadStream(fileName);
const stream = new XmlStream({
    write(info) {
        /* decide which elements should be written to the output */
    },
    keep(info) {
        /* decide which elements should be kept in the DOM */
    }
});
stream.on('data', function(element) { /* do something*/ });
stream.on('end', function() { /* do something after stream end*/});
stream.on('error', function(error) { /* do something after stream error */ });
input.pipe(stream);
```

### Parsing a network-based stream:
```ecmascript 6
const {Socket} = require('net');
const {XmlStream} = require('expat-stream');
const input = new Socket();
const stream = new XmlStream({
    write(info) {
        /* decide which elements should be written to the output */
    },
    keep(info) {
        /* decide which elements should be kept in the DOM */
    }
});
stream.on('data', function(element) { /* do something*/ });
stream.on('end', function() { /* do something after stream end*/});
stream.on('error', function(error) { /* do something after stream error */ });
input.pipe(stream);
input.connect(port, host);
```

### Parsing an HTTP response:
```ecmascript 6
const {request} = require('http');
const {XmlStream} = require('expat-stream');

request(requestOptions, function (response) {
    if (response.statusCode === 200 && response.getHeader('Content-Type').indexOf('/xml') > 0) {
        const stream = new XmlStream({
            write(info) {
                /* decide which elements should be written to the output */
            },
            keep(info) {
                /* decide which elements should be kept in the DOM */
            }
        });
        stream.on('data', function(element) { /* do something*/ });
        stream.on('end', function() { /* do something after stream end*/});
        stream.on('error', function(error) { /* do something after stream error */ });
        response.pipe(stream);
    } else {
        /* do something else */
    }
});
```
### Examples:
You can read an examples in `examples` directory of the repository.
