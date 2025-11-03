export function createRequire() {
  return {
    // tinyglobby (fdir) needed require.resolve
    resolve(moduleName) {
      return import.meta.resolve(moduleName);
    }
  }
}