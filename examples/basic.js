'use strict';
const {PassThrough, Transform} = require('stream');
const {XmlStream} = require('../distribution/core');

const data = `<stream>
    <item number="1"><message>Hello</message><message>World</message></item>
    <garbage x="1" y="2"><item number="x"></item></garbage>
    <item number="2"><message>Foo</message><message>Bar</message><message>Baz</message></item>
</stream>`;

const input = new PassThrough();
const filter = {
    write(info) {
        // selecting for processing only top-level <item> elements
        return info.level === 1 && info.element.tagName === 'item';
    },
    keep(info) {
        // saving contents of all internal elements
        return info.level > 1;
    },
};

const xmlStream = new XmlStream(filter);
const itemStream = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        try {
            const number = parseInt(chunk.attributes.getNamedItem('number').value, 10) || null;
            const messages = [];
            const elements = chunk.getElementsByTagName('message');
            for (let i = 0; i !== elements.length; ++i) {
                messages.push(elements[i].textContent);
            }
            callback(null, {
                number,
                messages,
            });
        } catch (error) {
            console.error(error);
            callback(error);
        }
    },
});

itemStream.on('data', (item) => {
    /**
     * You will see only two records:
     * {"number":1,"messages":["Hello","World"]}
     * {"number":2,"messages":["Foo","Bar","Baz"]}
     *
     * <garbage> is skipped because filter.write() returns `false` on them
      */
    console.log(JSON.stringify(item));
});

input.pipe(xmlStream);
xmlStream.pipe(itemStream);
input.end(data);
