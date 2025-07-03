/**
 * Thank you to https://github.com/Borewit/readable-web-to-node-stream/tree/master (MIT License)
 * 
 * A hybrid implementation that converts a Web-API ReadableStream
 * into a Node.js Readable stream.
 *
 * Node.js Readable docs: https://nodejs.org/api/stream.html#stream_readable_streams
 * Web API ReadableStream docs: https://developer.mozilla.org/docs/Web/API/ReadableStream
 */
export class CommonReadableWebToNodeStream {
    /**
     * @param stream The Web-API ReadableStream to be wrapped.
     * @param options Options: `{propagateDestroy: boolean}`
     */
    constructor(stream, options = { propagateDestroy: false }) {
        this.options = options;
        /** Total bytes pushed to the Node.js stream. */
        this.bytesRead = 0;
        /** Flag indicating that the stream has been released/closed. */
        this.released = false;
        /** Holds the currently pending read, if any. */
        this.pendingRead = null;
        this.reader = stream.getReader();
    }
    /**
     * Should be bound to the Node.js Readable._read() method.
     * This method pushes data into the Node stream's internal queue.
     *
     * @param nodeReadable The Node.js stream instance.
     */
    read(nodeReadable) {
        if (this.released) {
            nodeReadable.push(null); // Signal EOF
            return;
        }
        // Use an async IIFE to handle asynchronous reading.
        this.pendingRead = (async () => {
            try {
                const result = await this.reader.read();
                this.pendingRead = null;
                if (result.done || this.released) {
                    nodeReadable.push(null); // Signal EOF
                }
                else {
                    this.bytesRead += result.value.length;
                    nodeReadable.push(result.value); // Push the chunk into the Node.js stream
                }
            }
            catch (error) {
                nodeReadable.destroy(error);
            }
        })();
    }
    /**
     * Closes the stream and releasing the underlying stream lock.
     * Implementation is Readable._destroy()
     */
    destroy(error, callback) {
        if (this.options.propagateDestroy ?? false) {
            // Propagate cancelling stream to Web API Stream
            this.reader.cancel().then(() => {
                this.release();
                callback();
            }, error => callback(error));
        }
        else {
            this.release();
            callback(error);
        }
    }
    /**
     * Marks the stream as released, waits for pending operations,
     * and releases the underlying reader lock.
     */
    release() {
        this.released = true;
        this.reader.releaseLock();
    }
}
