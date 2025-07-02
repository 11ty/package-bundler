import esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Adapter substitution happens for files in an `adapters` folder, ending with any of adapterSuffixes (first found wins)
function getAdapterReplacementPlugin(importMap = {}, adapterSuffixes = [".core.js"]) {
	return {
		name: 'eleventyAdapterSubstitution',
		setup(build) {
			for(let {pattern, path: modulePath} of Object.values(importMap)) {
				build.onResolve({ filter: pattern }, (args) => {
					return {
						path: path.resolve(modulePath),
					}
				});
			}

			// File remapping convention (used by Core)
			build.onResolve({ filter: /\/Adapters\//i }, args => {
				for(let suffix of adapterSuffixes) {
					let newPath = ""+args.path;
					if(!args.path.endsWith(suffix)) {
						newPath = newPath.replace(".js", suffix);
					}

					let possiblePath = path.join(args.resolveDir, newPath);
					if(fs.existsSync(possiblePath)) {
						return {
							path: possiblePath,
						};
					}
				}

				// No adapter file found, return original
				return {
					path: path.resolve(args.resolveDir, args.path),
				}
			});
		},
	}
}

function resolveScriptPath(filepath) {
	let p = fileURLToPath(import.meta.url);
	let dir = path.parse(p).dir;
	return path.resolve(dir, filepath);
}

export default async function(entryFile, outputFile, buildOptions = {}) {
	let originalEntry = entryFile;

	if(entryFile.startsWith("file://")) {
		// when import.meta.resolve’d upstream
		entryFile = fileURLToPath(entryFile);
	}

	let buildOpts = Object.assign({
		name: `${originalEntry} (Eleventy Stork)`,
		minimalBundle: false,
		importMap: {},
		external: [
			"chokidar", // always
			"fs",
			"node:fs",
			"node:crypto",
		],
		fileSystemMode: "consume",
		fsPath: undefined, // assigned via fileSystemMode (usually)
		adapterSuffixes: undefined,
		esbuild: {},
	}, buildOptions);

	buildOpts.banner ??= `/*! ${buildOpts.name} */`;

	let { fileSystemMode, adapterSuffixes, minimalBundle, fsPath, external, importMap } = buildOpts;

	if(fileSystemMode === "consume") {
		fsPath = resolveScriptPath("./shims/shim-consume-fs.js");
	} else if(fileSystemMode === "publish") {
		fsPath = resolveScriptPath("./shims/shim-fs.js");
	} else {
		fsPath = path.resolve(fsPath); // relative to working project dir
	}

	if(minimalBundle) {
		adapterSuffixes = [".coremin.js", ".core.js"];

		// Don’t need to preserve names
		esbuild.keepNames = false;

		// Remove `debug`
		Object.assign(importMap, {
			"debug": {
				pattern: /^debug$/,
				path: resolveScriptPath("./shims/debug.js"),
			},
		});
	}

	if(!fsPath) {
		throw new Error("Missing `fsPath` option.");
	}

	Object.assign(importMap, {
		"node:fs": {
			pattern: /^(node\:)?fs$/,
			path: fsPath,
		},
		"node:events": {
			pattern: /^(node\:)?events$/,
			path: resolveScriptPath("./node_modules/events/events.js"),
		},
		"node:path": {
			pattern: /^(node\:)?path$/,
			path: resolveScriptPath("./node_modules/path/path.js"),
		},
		"node:os": {
			pattern: /^(node\:)?os$/,
			path: resolveScriptPath("./shims/os.js"),
		},
		// These are used by memfs (not Eleventy or Core)
		"node:assert": {
			pattern: /^(node\:)?assert$/,
			path: resolveScriptPath("./node_modules/assert/build/assert.js"),
		},
		"node:stream": {
			pattern: /^(node\:)?stream$/,
			path: resolveScriptPath("./node_modules/readable-stream/lib/stream.js"),
		},
	});

	let options = Object.assign({
		entryPoints: [entryFile],
		bundle: true,
		platform: "browser", // "node",
		format: "esm",

		treeShaking: true,

		minify: false,
		keepNames: true,

		external,
		plugins: [
			getAdapterReplacementPlugin(importMap, adapterSuffixes),
		],
		banner: {
			js: buildOpts.banner,
		},
		metafile: true,
		outfile: outputFile,
	}, buildOptions.esbuild);

	return esbuild.build(options);
}
