import { ReadableWebToNodeStream } from './lib/readable-web-to-node-stream/index.js';

export function Readable(...args) {
  let webStreamReadable = new ReadableStream(...args);
  return new ReadableWebToNodeStream(webStreamReadable);
}

export function Writable(...args) {
  let webStreamWritable = new WritableStream(...args);
  return new ReadableWebToNodeStream(webStreamWritable);
}