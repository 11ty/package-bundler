import { CommonReadableWebToNodeStream } from './common.js';
/**
 * Thank you to https://github.com/Borewit/readable-web-to-node-stream/tree/master (MIT License)
 * Removed references to readable-stream
 *
 * Converts a Web-API stream into Node stream.Readable class
 * Node stream readable: https://nodejs.org/api/stream.html#stream_readable_streams
 * Web API readable-stream: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
 * Node readable stream: https://nodejs.org/api/stream.html#stream_readable_streams
 */
// export class ReadableWebToNodeStream extends Readable {
export class ReadableWebToNodeStream {
    /**
     * @param stream ReadableStream: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
     * @param options Options: `{propagateDestroy: boolean}`
     */
    constructor(stream, options) {
        // super();
        this.converter = new CommonReadableWebToNodeStream(stream, options);
    }
    /**
     * Implementation of readable._read(size).
     * When readable._read() is called, if data is available from the resource,
     * the implementation should begin pushing that data into the read queue
     * https://nodejs.org/api/stream.html#stream_readable_read_size_1
     */
    _read() {
        this.converter.read(this);
    }
    _destroy(error, callback) {
        this.converter.destroy(error, callback);
    }
}
