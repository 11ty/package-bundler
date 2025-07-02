// This file is used to shim the global assigned `fs` (via fs.js) in the browser
// See the `build.onResolve` esbuild plugin in compiler.js

// needs to match ./shims/shim-fs.js
const GLOBAL_FS_NAME = "eleventyFileSystem";

let fs = window[GLOBAL_FS_NAME] || globalThis[GLOBAL_FS_NAME];

if(!fs) {
	// In minimal core bundle, fs access throws an error
	function noopError() {
		throw new Error("This function was not included in your Eleventy bundle. Make sure you load memfs.js before using the virtual file system.");
	}

	fs = {
		mkdir: noopError,
		existsSync: () => false,
		mkdirSync: noopError,
		readFileSync: noopError,
		statSync: noopError,
		writeFileSync: noopError,
		promises: {},

		// image-size
		readSync: noopError,
		fstatSync: noopError,
		closeSync: noopError,
		openSync: noopError,
	};
}

export const mkdir = fs.mkdir;
export const existsSync = fs.existsSync;
export const mkdirSync = fs.mkdirSync;
export const readFileSync = fs.readFileSync;
export const statSync = fs.statSync;
export const writeFileSync = fs.writeFileSync;
export const promises = fs.promises;

export const readSync = fs.readSync;
export const fstatSync = fs.fstatSync;
export const closeSync = fs.closeSync;
export const openSync = fs.openSync;

export default fs;