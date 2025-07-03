# @11ty/package-bundler

Internal package to build Eleventy core and plugin bundles (using esbuild, with support for adapters) for use in various environments (client).

## Usage

```
npm install @11ty/package-bundler
```

```js
import bundle from "@11ty/package-bundler";

await bundle(INPUT, OUTPUT, {
  name: "Eleventy Fetch",
  minimalBundle: false,
  fileSystemMode: "consume",
  external: [
    "chokidar",
    "fs",
    "node:fs",
    "node:crypto",
  ],
  moduleRoot: ".", // root directory to resolve node_modules paths
  esbuild: {}, // options passed to esbuild
});
```

### Sample

```js
import pkg from "../package.json" with { type: "json" };
import bundle from "@11ty/package-bundler";

await bundle(import.meta.resolve("@11ty/eleventy-fetch"), `demo/lib/eleventy-fetch.js`, {
  name: "Eleventy Fetch",
});
await bundle(import.meta.resolve("@11ty/eleventy-plugin-syntaxhighlight"), `demo/lib/eleventy-plugin-syntaxhighlight.js`, {
  name: "Eleventy Syntax Highlighter",
});
await bundle(import.meta.resolve("@11ty/eleventy-navigation"), `demo/lib/eleventy-navigation.js`, {
  name: "Eleventy Navigation",
});
await bundle(import.meta.resolve("@11ty/eleventy-plugin-rss"), `demo/lib/eleventy-plugin-rss.js`, {
  name: "Eleventy RSS",
});
await bundle(import.meta.resolve("@11ty/eleventy-img"), `demo/lib/eleventy-img.js`, {
  name: "Eleventy Image",
});
```
