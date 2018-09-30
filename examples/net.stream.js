'use strict';
const {createReadStream} = require('fs');
const path = require('path');
const {Server, Socket} = require('net');
const {Transform} = require('stream');
const {XmlStream} = require('../distribution/core');

const CONNECTION_PORT = 3000;

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

const server = new Server();

server.listen(
    CONNECTION_PORT,
    '127.0.0.1'
);

server.once(
    'connection',
    (socket) => {
        const input = createReadStream(path.join(__dirname, 'test.xml'));
        input.pipe(socket);
        
        socket.once('close', () => {
            server.close();
        });
    }
);

const client = new Socket();
client.connect(CONNECTION_PORT, '127.0.0.1', () => {
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
    xmlStream.pipe(itemStream);
    itemStream.on('data', (item) => {
        /**
         * You will see only two records:
         * {"number":1,"messages":["Hello","World"]}
         * {"number":2,"messages":["Foo","Bar","Baz"]}
         *
         * <garbage> is skipped because filter.emit() returns `false` on them
         */
        console.log(JSON.stringify(item));
    });
    itemStream.once('end', () => {
        client.destroy();
    });
    
    itemStream.once('error', (error) => {
        console.warn(error);
    });
    
    client.pipe(xmlStream);
});