const path = require('node:path');
const Module = require('node:module');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const relPath = request.slice(2);
    const resolvedPath = path.join(__dirname, '..', 'dist-test', 'src', relPath);
    return originalResolve.call(this, resolvedPath, parent, isMain, options);
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
