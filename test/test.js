import test from "ava";
import fs from "node:fs";
import bundlePackage from "../package-bundler.js";

test.after.always(() => {
  for(let filepath of fs.globSync("./test/stubs/output*.js")) {
    fs.unlinkSync(filepath);
  }
})

test("Default behavior (no adapters)", async t => {
  await bundlePackage("./test/stubs/module.js", "./test/stubs/output0.js");

  let { originalModule } =  await import("./stubs/output0.js");
  t.is(typeof originalModule, "function");
});

test("No adapters", async t => {
  await bundlePackage("./test/stubs/module.js", "./test/stubs/output1.js", {
    adapterSuffixes: [],
  });

  let { originalModule } =  await import("./stubs/output1.js");
  t.is(typeof originalModule, "function");
});

test("One adapters", async t => {
  await bundlePackage("./test/stubs/module.js", "./test/stubs/output2.js", {
    adapterSuffixes: [".adapter.js"],
  });

  let { adaptedModule } =  await import("./stubs/output2.js");
  t.is(typeof adaptedModule, "function");
});

test("One adapter (core)", async t => {
  await bundlePackage("./test/stubs/module.js", "./test/stubs/output2b.js", {
    adapterSuffixes: [".core.adapter.js"],
  });

  let { adaptedCoreModule } =  await import("./stubs/output2b.js");
  t.is(typeof adaptedCoreModule, "function");
});

test("Two adapters", async t => {
  await bundlePackage("./test/stubs/module.js", "./test/stubs/output3.js", {
    adapterSuffixes: [".core.adapter.js", ".adapter.js"],
  });

  let { adaptedCoreModule } =  await import("./stubs/output3.js");
  t.is(typeof adaptedCoreModule, "function");
});

test("Two adapters (reversed order)", async t => {
  await bundlePackage("./test/stubs/module.js", "./test/stubs/output4.js", {
    adapterSuffixes: [".adapter.js", ".core.adapter.js"],
  });

  let { adaptedModule } =  await import("./stubs/output4.js");
  t.is(typeof adaptedModule, "function");
});

test("Tiny globby uses node:url now", async t => {
  await bundlePackage("./test/stubs/tinyglobby.js", "./test/stubs/output-tinyglobby.js");

  let mod = await import("./stubs/output-tinyglobby.js");
  t.is(typeof mod.glob, "function");
  t.is(typeof mod.globSync, "function");
});

test("memfs uses Buffer", async t => {
  await bundlePackage("./test/stubs/memfs.js", "./test/stubs/output-memfs.js");

  let { memfs } = await import("./stubs/output-memfs.js");
  t.is(typeof memfs, "function");
});

test("Adapter suffixes support cjs extensions", async t => {
  await bundlePackage("./test/stubs/commonjs.cjs", "./test/stubs/output-cjs.js", {
    adapterSuffixes: [".adapter.cjs"],
  });

  let mod =  await import("./stubs/output-cjs.js");
  t.is(typeof mod.default.originalModule, "undefined");
  t.is(typeof mod.default.adaptedModule, "function");
});

test("Adapter suffixes support mjs extensions", async t => {
  await bundlePackage("./test/stubs/esm.mjs", "./test/stubs/output-esm.js", {
    adapterSuffixes: [".adapter.mjs"],
  });

  let {originalModule, adaptedModule} =  await import("./stubs/output-esm.js");
  t.is(typeof originalModule, "undefined");
  t.is(typeof adaptedModule, "function");
});

