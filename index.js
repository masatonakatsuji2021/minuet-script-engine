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
exports.MinuetServerModuleMse = exports.MseModule = exports.Mse = exports.MseError = exports.MssIregularPageCode = exports.SandBox = void 0;
const fs = require("fs");
const path = require("path");
const minuet_server_1 = require("minuet-server");
class SandBox {
    constructor() {
        this.___BODY = "";
    }
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
         * ***tagStart*** : Script opening tag. If not specified, the default is ``<script mse>``,
         */
        this.tagStart = "<script mse>";
        /**
         * ***tagEnd*** : Script closing tag. If not specified, the default is ``</script>``,
         */
        this.tagEnd = "</script>";
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
         * ***rootDir*** : Path of the root directory to automatically load the buffer.
         * If specified, all Mse-compatible files (.mse. mseh) in the root directory will be buffered.
         */
        this.rootDir = "htdocs";
        /**
         * ***buffering*** : Setting whether to buffer server data.
         * (The default is ``true``.)
         *
         * If you select ``true``, when you instantiate or execute the ``setting`` method,
         * a set of files in the root directory with access permissions for each MimeType will be buffered.
         * When listening from now on, it will be loaded from the buffer.
         *
         * This is done as part of the speedup.
         * Even if a file in the root directory is changed, the display results will not be updated when listening.
         *
         * If you select ``false``, no buffer will be created and the script file will be loaded every time you listen.
         */
        this.buffering = true;
        /**
         * ***modules*** : List of modules to use for the extension.
         */
        this.modules = [];
        /**
         * ***moduleOptions*** :
         */
        this.moduleOptions = {};
        /**
         * ***directoryIndexs*** : Specifies a list of files to display for a directory request..
         */
        this.directoryIndexs = ["index.mse"];
        /**
         * ***headers*** : Specify the default response header information.
         */
        this.headers = {};
        this.buffers = {};
        if (options) {
            this.setting(options);
        }
        else {
            this.updateBuffer();
        }
    }
    /**
     * ### settings
     * @param options
     * @returns
     */
    setting(options) {
        if (options.tagStart != undefined)
            this.tagStart = options.tagStart;
        if (options.tagEnd != undefined)
            this.tagEnd = options.tagEnd;
        if (options.ext != undefined)
            this.ext = options.ext;
        if (options.extHide != undefined)
            this.extHide = options.extHide;
        if (options.rootDir != undefined)
            this.rootDir = options.rootDir;
        if (options.buffering != undefined)
            this.buffering = options.buffering;
        if (options.modules != undefined)
            this.modules = options.modules;
        if (options.moduleOptions != undefined)
            this.moduleOptions = options.moduleOptions;
        if (options.pages != undefined)
            this.pages = options.pages;
        if (options.directoryIndexs != undefined)
            this.directoryIndexs = options.directoryIndexs;
        if (options.bufferingInterval != undefined)
            this.bufferingInterval = options.bufferingInterval;
        if (options.headers != undefined)
            this.headers = options.headers;
        if (options.logAccess != undefined)
            this.logAccess = options.logAccess;
        if (options.logError != undefined)
            this.logError = options.logError;
        this.updateBuffer();
        this.startBufferingIntarval();
        return this;
    }
    /**
     * addRootDir
     * @param {string} url
     * @param {string} rootDir
     */
    addRootDir(url, rootDir) {
        if (typeof this.rootDir == "string") {
            this.rootDir = { "/": this.rootDir };
        }
        this.rootDir[url] = rootDir;
        if (this.buffering) {
            this.search(rootDir, url);
        }
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
     * ### updateBuffer
     * Updates the buffer information for the specified root directory.
     * @returns {Mse}
     */
    updateBuffer() {
        if (this.buffering) {
            this.buffers = {};
            if (typeof this.rootDir == "string") {
                this.rootDir = { "/": this.rootDir };
            }
            const r = Object.keys(this.rootDir);
            for (let n = 0; n < r.length; n++) {
                const url = r[n];
                const rootDir = this.rootDir[url];
                this.search(rootDir, url);
            }
            if (this.pages) {
                if (this.pages.notFound) {
                    if (typeof this.pages.notFound == "string") {
                        const content = fs.readFileSync(this.pages.notFound).toString();
                        this.addBuffer(MseIregularPageName.notFound, content);
                    }
                }
                if (this.pages.InternalError) {
                    if (typeof this.pages.InternalError == "string") {
                        const content = fs.readFileSync(this.pages.InternalError).toString();
                        this.addBuffer(MseIregularPageName.internalError, content);
                    }
                }
            }
        }
        return this;
    }
    /**
     * *** startBufferingIntarval *** :
     * @returns
     */
    startBufferingIntarval() {
        if (this.bufferingInterval) {
            if (this.bufferingIntervalT)
                clearInterval(this.bufferingIntervalT);
            this.bufferingIntervalT = setInterval(() => {
                this.updateBuffer();
            }, this.bufferingInterval);
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
            let text;
            if (this.buffering) {
                if (!this.buffers[target]) {
                    throw Error("Page not found." + target);
                }
                text = this.buffers[target];
            }
            else {
                if (typeof this.rootDir == "string") {
                    this.rootDir = { "/": this.rootDir };
                }
                let decisionPath;
                const c = Object.keys(this.rootDir);
                for (let n2 = 0; n2 < c.length; n2++) {
                    const burl = c[n2];
                    const rootDir = this.rootDir[burl];
                    if (target.indexOf(burl) === 0) {
                        const targetPath = (rootDir + "/" + target.substring(burl.length)).split("//").join("/");
                        if (fs.existsSync(targetPath)) {
                            if (fs.statSync(targetPath).isFile()) {
                                decisionPath = targetPath;
                                break;
                            }
                        }
                    }
                }
                if (!decisionPath) {
                    throw Error("Page not found." + target);
                }
                text = fs.readFileSync(decisionPath).toString();
                text = this.convert(text);
            }
            if (!sandbox) {
                sandbox = this.setSandBox();
            }
            return yield this.sandbox(target, text, sandbox);
        });
    }
    /**
     * ## setSandBox
     * @returns {SandBox} SandBox
     */
    setSandBox() {
        let sandbox = new SandBox();
        // load module....
        if (this.modules) {
            for (let n = 0; n < this.modules.length; n++) {
                const moduleName = this.modules[n];
                const moduleOption = this.moduleOptions[moduleName];
                const modulePath = "./modules/" + moduleName;
                const moduleClassName = "Mse" + moduleName.substring(0, 1).toUpperCase() + moduleName.substring(1);
                try {
                    const mbuffer = require(modulePath);
                    sandbox[moduleName] = new mbuffer[moduleClassName](sandbox, moduleOption);
                }
                catch (error) {
                    console.log(error);
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
            const url = this.getUrl(req.url);
            try {
                if (!url) {
                    throw new MseError(MssIregularPageCode.notFound, "page not found.", {
                        fileName: url,
                    });
                }
                if (this.headers) {
                    const hc = Object.keys(this.headers);
                    for (let n = 0; n < hc.length; n++) {
                        const name = hc[n];
                        const value = this.headers[name];
                        res.setHeader(name, value);
                    }
                }
                const result = yield this.load(url, sandbox);
                res.write(result.content);
                res.end();
                // access log write
                this.log(this.logAccess, req, res);
            }
            catch (error) {
                if (!this.pages) {
                    return false;
                }
                res.statusCode = MssIregularPageCode.internalError;
                if (!(error instanceof MseError)) {
                    error = new MseError(500, error.message);
                }
                res.statusCode = error.statusCode;
                sandbox.exception = error;
                let errorStr;
                let result;
                try {
                    if (error.statusCode == MssIregularPageCode.notFound) {
                        if (typeof this.pages.notFound == "string") {
                            result = yield this.load(MseIregularPageName.notFound, sandbox);
                        }
                        else {
                            result = {
                                data: null,
                                content: error.message.toString(),
                            };
                        }
                    }
                    else {
                        if (typeof this.pages.InternalError == "string") {
                            result = yield this.load(MseIregularPageName.internalError, sandbox);
                        }
                        else {
                            result = {
                                data: null,
                                content: error.message.toString(),
                            };
                        }
                    }
                    errorStr = result.content;
                    res.write(result.content);
                    res.end();
                }
                catch (error) {
                    errorStr = error.message.toString();
                    res.write(error.message + "\n");
                    res.end();
                }
                // access log write
                this.log(this.logAccess, req, res);
                // error log write
                this.log(this.logError, req, res, errorStr);
            }
            return true;
        });
    }
    // log write
    log(logMode, req, res, message) {
        if (!logMode)
            return;
        if (this.logger) {
            if (typeof logMode == "string") {
                this.logger.write(logMode, req, res, message);
            }
        }
    }
    // get request url
    getUrl(baseUrl) {
        const url = baseUrl.split("?")[0];
        let urlList = [];
        urlList.push(url);
        for (let n = 0; n < this.directoryIndexs.length; n++) {
            const index = this.directoryIndexs[n];
            urlList.push((url + "/" + index).split("//").join("/"));
        }
        let decisionUrl;
        for (let n = 0; n < urlList.length; n++) {
            const url_ = urlList[n];
            ;
            if (this.buffering) {
                if (this.buffers[url_]) {
                    decisionUrl = url_;
                    break;
                }
            }
            else {
                if (typeof this.rootDir == "string") {
                    this.rootDir = { "/": this.rootDir };
                }
                const c = Object.keys(this.rootDir);
                for (let n2 = 0; n2 < c.length; n2++) {
                    const burl = c[n2];
                    const rootDir = this.rootDir[burl];
                    if (url_.indexOf(burl) === 0) {
                        const targetPath = (rootDir + "/" + url_.substring(burl.length)).split("//").join("/");
                        if (fs.existsSync(targetPath)) {
                            if (fs.statSync(targetPath).isFile()) {
                                decisionUrl = url_;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (decisionUrl) {
            if (path.extname(decisionUrl) == this.extHide) {
                decisionUrl = undefined;
            }
        }
        return decisionUrl;
    }
    search(target, url) {
        const lists = fs.readdirSync(target, {
            withFileTypes: true,
        });
        for (let n = 0; n < lists.length; n++) {
            const list = lists[n];
            if (list.isDirectory()) {
                this.search(target + "/" + list.name, url);
            }
            else {
                if (path.extname(list.name) == this.ext ||
                    path.extname(list.name) == this.extHide) {
                    const filePath = target + "/" + list.name;
                    const text = fs.readFileSync(filePath).toString();
                    const converted = this.convert(text);
                    let url2 = url;
                    if (url2 == "/") {
                        url2 = "";
                    }
                    const name = url2 + filePath.substring(this.rootDir[url].length).substring((this.ext.length) * -1);
                    this.buffers[name] = converted;
                }
            }
        }
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
            if (sc2[1]) {
                const length2 = sc2[1].match(/\n/g);
                line += length2 ? length2.length - 1 : 0;
                convertScriptStr += Mse.echoBase64(sc2[1], line);
            }
        }
        return convertScriptStr;
    }
    /**
     * getRaw
     * @param target
     * @returns
     */
    getRaw(target) {
        if (target[0] != "/") {
            target = "/" + target;
        }
        if (this.buffering) {
            if (this.buffers[target]) {
                return this.buffers[target];
            }
        }
        else {
            if (fs.existsSync(this.rootDir + "/" + target)) {
                const content = fs.readFileSync(this.rootDir + "/" + target).toString();
                return this.convert(content);
            }
        }
    }
    /**
     * rawExec
     * @param raw
     * @param sandbox
     * @returns
     */
    rawExec(raw, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sandbox) {
                sandbox = this.setSandBox();
            }
            return yield this.sandbox("anonymous", raw, sandbox);
        });
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
    file(filePath, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sandbox) {
                sandbox = this.setSandBox();
            }
            const fileContent = fs.readFileSync(filePath).toString();
            return yield this.sandbox("anonymous", this.convert(fileContent), sandbox);
        });
    }
    sandbox(___FILENAME, ___TEXT, ___SANDBOX) {
        return __awaiter(this, void 0, void 0, function* () {
            const ___CONTEXT = this;
            let resData;
            const res = yield (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let ___LINE = 0;
                    const eb64 = (text, line) => {
                        ___SANDBOX.___BODY += Mse.base64Decode(text);
                        ___LINE = line;
                    };
                    const echo = (text) => {
                        if (text == undefined) {
                            text = "";
                        }
                        ___SANDBOX.___BODY += text;
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
                        return addBody.data;
                    });
                    const scriptUpdateBuffer = () => {
                        ___CONTEXT.updateBuffer();
                    };
                    const staticUpdateBuffer = () => {
                        if (___SANDBOX.updateBuffer) {
                            ___SANDBOX.updateBuffer();
                        }
                    };
                    const require = undefined;
                    const path = undefined;
                    const fs = undefined;
                    try {
                        resData = yield eval("(async ()=>{" + ___TEXT + "})();");
                    }
                    catch (error) {
                        throw new MseError(500, error.message + "(File : " + ___FILENAME + ")", {
                            fileName: ___FILENAME,
                        });
                    }
                    const result = {
                        data: resData,
                        content: ___SANDBOX.___BODY,
                    };
                    return result;
                });
            }).bind(___SANDBOX)();
            return res;
        });
    }
}
exports.Mse = Mse;
class MseModule {
    constructor(context, options) {
        this.options = {};
        this.context = context;
        if (options) {
            this.options = options;
        }
    }
}
exports.MseModule = MseModule;
class MinuetServerModuleMse extends minuet_server_1.MinuetServerModuleBase {
    onBegin() {
        if (!this.init) {
            this.init = {
                rootDir: "htdocs",
            };
        }
        this.init.rootDir = this.sector.root + "/" + this.init.rootDir;
        this.mse = new Mse(this.init);
        // load logger module
        const logger = this.getModule("logger");
        if (logger) {
            this.mse.logger = logger;
        }
    }
    onRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.mse.listen(req, res);
            }
            catch (err) {
                return;
            }
        });
    }
}
exports.MinuetServerModuleMse = MinuetServerModuleMse;
