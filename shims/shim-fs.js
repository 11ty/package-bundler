// This file is used by esbuild to create the fs global script,
// the single source of truth for fs on a page

import process from "process/browser";
import fs from "memfs";

window.process = globalThis.process = process;

// needs to match ./shims/shim-fs-consume.js
const GLOBAL_FS_NAME = "eleventyFileSystem";

window[GLOBAL_FS_NAME] = globalThis[GLOBAL_FS_NAME] = fs;

export const mkdir = fs.mkdir;
export const existsSync = fs.existsSync;
export const mkdirSync = fs.mkdirSync;
export const readFileSync = fs.readFileSync;
export const statSync = fs.statSync;
export const writeFileSync = fs.writeFileSync;
export const promises = fs.promises;

// image-size
export const readSync = fs.readSync;
export const fstatSync = fs.fstatSync;
export const closeSync = fs.closeSync;
export const openSync = fs.openSync;

export default fs;