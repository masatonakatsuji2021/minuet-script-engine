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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mse = exports.MseError = exports.MssIregularPageCode = exports.SandBox = void 0;
const fs = require("fs");
const path = require("path");
class SandBox {
}
exports.SandBox = SandBox;
var MssIregularPageCode;
(function (MssIregularPageCode) {
    MssIregularPageCode[MssIregularPageCode["badRequest"] = 400] = "badRequest";
    MssIregularPageCode[MssIregularPageCode["unauthorized"] = 401] = "unauthorized";
    MssIregularPageCode[MssIregularPageCode["paymentRequired"] = 402] = "paymentRequired";
    MssIregularPageCode[MssIregularPageCode["forbidden"] = 403] = "forbidden";
    MssIregularPageCode[MssIregularPageCode["notFound"] = 404] = "notFound";
    MssIregularPageCode[MssIregularPageCode["methodNotAllowed"] = 405] = "methodNotAllowed";
    MssIregularPageCode[MssIregularPageCode["internalError"] = 500] = "internalError";
    MssIregularPageCode[MssIregularPageCode["notImplemented"] = 501] = "notImplemented";
})(MssIregularPageCode || (exports.MssIregularPageCode = MssIregularPageCode = {}));
var MseIregularPageName;
(function (MseIregularPageName) {
    MseIregularPageName["badRequest"] = "/#badRequest";
    MseIregularPageName["unauthorized"] = "/#unauthorized";
    MseIregularPageName["paymentRequired"] = "/#paymentRequired";
    MseIregularPageName["forbidden"] = "/#forbidden";
    MseIregularPageName["notFound"] = "/#notfound";
    MseIregularPageName["methodNotAllowed"] = "/#methodNotAllowed";
    MseIregularPageName["internalError"] = "/#internalerror";
    MseIregularPageName["notImplemented"] = "/#notImplemented";
})(MseIregularPageName || (MseIregularPageName = {}));
class MseError extends Error {
    constructor(statusCode, errorMessage, option) {
        super(errorMessage);
        this._statusCode = statusCode;
        this._option = option;
    }
    get statusCode() {
        return this._statusCode;
    }
    get option() {
        return this._option;
    }
}
exports.MseError = MseError;
/**
* ### Mse (Minuet-Script-Engine)
* A lightweight and highly functional template engine aimed at replacing PHP..
*/
class Mse {
    /**
     * ### constructor
     * @param {IMseOption} options Option Settings
     */
    constructor(options) {
        /**
         * ***tagStart*** : Script opening tag. If not specified, the default is ``<?``,
         */
        this.tagStart = "<?";
        /**
         * ***tagEnd*** : Script closing tag. If not specified, the default is ``?>``,
         */
        this.tagEnd = "?>";
        /**
         * ***ext*** : The extension of the script file that corresponds to MSE
         * when automatically loading a buffer by specifying the root directory.
         * If not specified, the default is ``.mse``,
         */
        this.ext = ".mse";
        /**
         * ***extHide*** : The extension of the script file that supports MSE
         * when automatically loading a buffer by specifying the root directory.
         * If the file has this extension, server access will be denied.
         *
         *  If not specified, the default is ``.mseh``,
         */
        this.extHide = ".mseh";
        /**
         * ***modules*** : List of modules to use for the extension.
         */
        this.modules = [];
        /**
         * ***pages*** : Page information to display on behalf of irregular request results
         * For details, see ***IMseOptionPage***.
         */
        this.pages = {};
        this.buffers = {};
        if (options.tagStart)
            this.tagStart = options.tagStart;
        if (options.tagEnd)
            this.tagEnd = options.tagEnd;
        if (options.ext)
            this.ext = options.ext;
        if (options.extHide)
            this.extHide = options.extHide;
        if (options.rootDir)
            this.rootDir = options.rootDir;
        if (options.modules)
            this.modules = options.modules;
        if (options.pages)
            this.pages = options.pages;
        this.updateRootDirectory();
    }
    /**
     * ### resetBuffer
     * Delete the contents of the buffer.
     * @returns {Mse}
     */
    resetBuffer() {
        this.buffers = {};
        return this;
    }
    /**
     * ### addBuffer
     * Manually save to a buffer with a specified file name.
     * @param {string} fileName File Name
     * @param {string} content File Content
     * @returns {Mse}
     */
    addBuffer(fileName, content) {
        const converted = this.convert(content);
        this.buffers[fileName] = converted;
        return this;
    }
    /**
     * ### remoteBuffer
     * Delete the buffer with the specified file name.
     * @param {string} fileName File Name
     * @returns {Mse}
     */
    removeBuffer(fileName) {
        delete this.buffers[fileName];
        return this;
    }
    /**
     * ### setRootDirectory
     * Automatically loads MSE script files in the specified root directory and stores them in a buffer.
     * @param {string} rootDir Root Directory
     * @returns {Mse}
     */
    setRootDirectory(rootDir) {
        this.buffers = {};
        const lists = this.search(rootDir);
        for (let n = 0; n < lists.length; n++) {
            const list = lists[n];
            const filePath = list.path + "/" + list.name;
            const text = fs.readFileSync(filePath).toString();
            const converted = this.convert(text);
            const name = filePath.substring(rootDir.length);
            this.buffers[name] = converted;
        }
        if (this.pages) {
            if (this.pages.notFound) {
                const content = fs.readFileSync(this.pages.notFound).toString();
                this.addBuffer(MseIregularPageName.notFound, content);
            }
            if (this.pages.InternalError) {
                const content = fs.readFileSync(this.pages.InternalError).toString();
                this.addBuffer(MseIregularPageName.internalError, content);
            }
        }
        return this;
    }
    updateRootDirectory(fileName) {
        if (fileName) {
            this.setRootDirectory(fileName);
        }
        else {
            if (this.rootDir) {
                this.setRootDirectory(this.rootDir);
            }
        }
        return this;
    }
    /**
     * ### load
     * Gets a buffer from the specified file name, executes the script, and outputs the results.
     * @param {string} target Target File Name
     * @param {SandBox} sandbox Sandbox environment for script execution
     * @returns {promises<IMseLoadResult>}
     */
    load(target, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (target[0] != "/") {
                target = "/" + target;
            }
            if (!this.buffers[target]) {
                console.log(this.buffers);
                console.log(target);
                throw Error("Page not found.");
            }
            const text = this.buffers[target];
            if (!sandbox) {
                sandbox = this.setSandBox();
            }
            return yield this.sandbox(target, text, sandbox);
        });
    }
    setSandBox() {
        let sandbox = new SandBox();
        // load module....
        if (this.modules) {
            for (let n = 0; n < this.modules.length; n++) {
                const moduleName = this.modules[n];
                const modulePath = "./modules/" + moduleName;
                const moduleClassName = "Mse" + moduleName.substring(0, 1).toUpperCase() + moduleName.substring(1);
                try {
                    const mbuffer = require(modulePath);
                    sandbox[moduleName] = new mbuffer[moduleClassName](sandbox);
                }
                catch (error) {
                    continue;
                }
            }
        }
        return sandbox;
    }
    listen(req, res, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sandbox) {
                sandbox = this.setSandBox();
            }
            sandbox.req = req;
            sandbox.res = res;
            const urls = req.url.split("?");
            let url = urls[0];
            if (url[url.length - 1] == "/") {
                url = url + "index";
            }
            url = url + this.ext;
            if (!this.buffers[url]) {
                url = urls[0] + "/index" + this.ext;
            }
            url = url.split("//").join("/");
            try {
                if (!this.buffers[url]) {
                    throw new MseError(MssIregularPageCode.notFound, "page not found.", {
                        fileName: url,
                    });
                }
                const result = yield this.load(url, sandbox);
                res.write(result.content);
                res.end();
            }
            catch (error) {
                res.statusCode = MssIregularPageCode.internalError;
                if (error instanceof MseError) {
                    res.statusCode = error.statusCode;
                    if (this.pages.notFound) {
                        let result;
                        sandbox.exception = error;
                        try {
                            if (error.statusCode == MssIregularPageCode.notFound) {
                                result = yield this.load(MseIregularPageName.notFound, sandbox);
                            }
                            else {
                                result = yield this.load(MseIregularPageName.internalError, sandbox);
                            }
                            res.write(result.content);
                            res.end();
                            return;
                        }
                        catch (error) {
                            res.write(error.message + "\n");
                        }
                    }
                }
                res.write(error.toString());
                res.end();
            }
        });
    }
    search(target) {
        let res = [];
        const lists = fs.readdirSync(target, {
            withFileTypes: true,
        });
        for (let n = 0; n < lists.length; n++) {
            const list = lists[n];
            if (list.isDirectory()) {
                const buffer = this.search(list.path + "/" + list.name);
                for (let n2 = 0; n2 < buffer.length; n2++) {
                    const b_ = buffer[n2];
                    res.push(b_);
                }
            }
            else {
                if (path.extname(list.name) == this.ext ||
                    path.extname(list.name) == this.extHide) {
                    res.push(list);
                }
            }
        }
        return res;
    }
    static base64Encode(text) {
        return Buffer.from(text, "utf-8").toString("base64");
    }
    static base64Decode(textB64) {
        return Buffer.from(textB64, "base64").toString("utf-8");
    }
    static echoBase64(text, line) {
        return "eb64( \"" + Mse.base64Encode(text) + "\", " + line + ");";
    }
    convert(scriptCode) {
        let convertScriptStr = "";
        const sc1 = scriptCode.split(this.tagStart);
        let line = 0;
        for (let n = 0; n < sc1.length; n++) {
            const sc1_ = sc1[n];
            if (n == 0) {
                const length = sc1_.match(/\n/g);
                line += length ? length.length - 1 : 0;
                convertScriptStr += Mse.echoBase64(sc1_, line);
                continue;
            }
            const sc2 = sc1_.split(this.tagEnd);
            const length = sc2[0].match(/\n/g);
            line += length ? length.length - 1 : 0;
            convertScriptStr += sc2[0];
            const length2 = sc2[1].match(/\n/g);
            line += length2 ? length2.length - 1 : 0;
            convertScriptStr += Mse.echoBase64(sc2[1], line);
        }
        return convertScriptStr;
    }
    /**
     * ### execute
     * Execute a script by specifying the code directly.
     * This method does not use the buffer function.
     * @param {string} scriptCode Script Code
     * @param {SandBox} sandbox SandBox
     * @returns {Promise<IMseLoadResult>}
     */
    execute(scriptCode, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sandbox) {
                sandbox = this.setSandBox();
            }
            return yield this.sandbox("anonymous", this.convert(scriptCode), sandbox);
        });
    }
    sandbox(___FILENAME, ___TEXT, ___SANDBOX) {
        return __awaiter(this, void 0, void 0, function* () {
            const ___CONTEXT = this;
            let resData;
            const res = yield (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let ___BODY = "";
                    let ___LINE = 0;
                    const eb64 = (text, line) => {
                        ___BODY += Mse.base64Decode(text);
                        ___LINE = line;
                    };
                    const echo = (text) => {
                        if (text == undefined) {
                            throw Error("echo text is undefined.");
                        }
                        ___BODY += text;
                    };
                    const debug = (data) => {
                        let line;
                        try {
                            throw Error("trace");
                        }
                        catch (e) {
                            const stackLines = e.stack.split('\n');
                            const callerLine = stackLines[2];
                            line = parseInt(callerLine.match(/<anonymous>:(\d+):\d+/)[1]);
                        }
                        echo("[Debug] " + ___FILENAME + " (" + (___LINE + line) + ")\n");
                        const type = typeof data;
                        if (type == "string" ||
                            type == "number") {
                            echo(data.toString());
                        }
                        else if (type == "object") {
                            echo(JSON.stringify(data, null, "   "));
                        }
                    };
                    const sleep = (msec) => {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(true);
                            }, msec);
                        });
                    };
                    const async = (handle) => {
                        return new Promise((resolve) => {
                            handle(resolve);
                        });
                    };
                    const include = (target) => __awaiter(this, void 0, void 0, function* () {
                        const addBody = yield ___CONTEXT.load(target, ___SANDBOX);
                        ___BODY += addBody.content;
                        return addBody.data;
                    });
                    const bufferUpdateAll = () => {
                        ___CONTEXT.updateRootDirectory();
                    };
                    const bufferUpdate = (fileName) => {
                        if (fileName) {
                            ___CONTEXT.updateRootDirectory(fileName);
                        }
                        else {
                            ___CONTEXT.updateRootDirectory(___FILENAME);
                        }
                    };
                    try {
                        resData = yield eval("(async ()=>{" + ___TEXT + "})();");
                    }
                    catch (error) {
                        throw new MseError(500, error.message, {
                            fileName: ___FILENAME,
                        });
                    }
                    const result = {
                        data: resData,
                        content: ___BODY,
                    };
                    return result;
                });
            }).bind(___SANDBOX)();
            return res;
        });
    }
}
exports.Mse = Mse;
