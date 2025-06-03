import {Writable} from 'stream';

export class MemoryWritable extends Writable {

    public data: Uint8Array[] = [];

    constructor() {
        super();
        this.data = []; // Store incoming data in memory
    }

    _write(chunk, encoding, callback) {
        this.data.push(chunk); // Append the chunk to the data array
        callback(); // Signal that the write is complete
    }

    getData() {
        return Buffer.concat(this.data);
    }
}