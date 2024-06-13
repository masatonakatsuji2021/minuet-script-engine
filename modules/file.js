"use strict";
/**
 * MIT License
 *
 * Copyright (c) 2024 Masato Nakatsuji
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MseFile = void 0;
const __1 = require("../");
const fs = require("fs");
class MseFile extends __1.MseModule {
    getPath(targetPath) {
        if (!this.options.tempDir) {
            this.options.tempDir = "temp";
        }
        return this.options.tempDir + "/" + targetPath;
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
    appendFile(filePath, data, options) {
        return fs.appendFileSync(this.getPath(filePath), data, options);
    }
    readdir(filePath, options) {
        return fs.readdirSync(this.getPath(filePath), options);
    }
}
exports.MseFile = MseFile;
