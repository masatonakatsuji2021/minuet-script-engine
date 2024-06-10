"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MseFile = void 0;
const __1 = require("../");
const fs = require("fs");
class MseFile extends __1.MseModule {
    getPath(targetPath) {
        return this.context.tempDir + "/" + targetPath;
    }
    mkdir(dirPath, options) {
        return fs.mkdirSync(this.getPath(dirPath), options);
    }
    rmdir(dirPath, options) {
        return fs.rmdirSync(this.getPath(dirPath), options);
    }
    readFile(filePath, options) {
        return fs.readFileSync(this.getPath(filePath), options);
    }
    writeFile(filePath, data, options) {
        return fs.writeFileSync(this.getPath(filePath), data, options);
    }
    appendFile(filePath) {
    }
}
exports.MseFile = MseFile;
