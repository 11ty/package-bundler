import test from "ava";
import fs from "node:fs";
import bundlePackage from "../package-bundler.js";

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

test.after.always(() => {
  fs.unlinkSync("./test/stubs/output0.js");
  fs.unlinkSync("./test/stubs/output1.js");
  fs.unlinkSync("./test/stubs/output2.js");
  fs.unlinkSync("./test/stubs/output2b.js");
  fs.unlinkSync("./test/stubs/output3.js");
  fs.unlinkSync("./test/stubs/output4.js");
})