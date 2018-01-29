'use strict';
const {XMLSerializer, DOMImplementation} = require('xmldom');
const {PassThrough, Transform} = require('stream');
const {XmlStream} = require('../distribution/core');

const serializer = new XMLSerializer();
const dom = new DOMImplementation();

function _generateXML(maxChildren) {
    const document = dom.createDocument(null, 'xml', null);
    const max_item = maxChildren;
    for (let item_id = 0; item_id !== max_item; ++item_id) {
        const element = document.createElement('item');
        const attr = document.createAttribute('number');
        attr.value = item_id.toString(10);
        element.attributes.setNamedItem(attr);
        document.documentElement.appendChild(element);
        const max_messages = Math.floor(Math.random() * maxChildren) + 1;
        for (let message_id = 0; message_id !== max_messages; ++message_id) {
            const message = document.createElement('message');
            message.appendChild(document.createTextNode(Math.random().toString()));
            element.appendChild(message);
        }
    }
    return {
        data: serializer.serializeToString(document),
        count: max_item,
    };
}
const ITEMS = 100;
const data = _generateXML(ITEMS);
const buffer = Buffer.from(data.data);

const input = new PassThrough();
const filter = {
    write(info) {
        // selecting for processing only top-level <item> elements
        return info.level === 1;
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
            const number = parseInt(chunk.attributes.getNamedItem('number').value, 10);
            const messages = [];
            const elements = chunk.getElementsByTagName('message');
            for (let i = 0; i !== elements.length; ++i) {
                messages.push(elements[i].textContent);
            }
            // Making async transformation by calling back with some timeout
            setTimeout(
                () => {
                    callback(null, {
                        number,
                        messages,
                    });
                },
                messages.length
            );
        } catch (error) {
            console.error(error);
            callback(error);
        }
    },
});

let itemsFound = 0;
itemStream.on('data', (item) => {
    itemsFound += 1;
    /**
     * You will see <ITEMS> records like:
     * {"number":1,"messages":["0.1", ...]}
     */
    console.log(JSON.stringify(item));
});

itemStream.on('error', (error) => {
    console.error(error);
});

itemStream.on('end', () => {
    console.log(`Found ${itemsFound} items of ${data.count}`);
});

input.pipe(xmlStream);
xmlStream.pipe(itemStream);

input.end(buffer);
