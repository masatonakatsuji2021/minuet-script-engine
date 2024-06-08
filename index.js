"use strict";
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
exports.Mse = exports.MseError = exports.SandBox = void 0;
const fs = require("fs");
const path = require("path");
class SandBox {
}
exports.SandBox = SandBox;
class MseError extends Error {
    constructor(statusCode, errorMessage, body) {
        super(errorMessage);
        this._body = "";
        this._statusCode = statusCode;
        if (body) {
            this._body = body;
        }
    }
    get statusCode() {
        return this._statusCode;
    }
    get body() {
        return this._body;
    }
}
exports.MseError = MseError;
class Mse {
    constructor(options) {
        this.tagStart = "<?";
        this.tagEnd = "?>";
        this.ext = ".mse";
        this.extHide = ".mseh";
        this.buffers = {};
        this.modules = [];
        this.pages = {};
        if (options.tagStart) {
            this.tagStart = options.tagStart;
        }
        if (options.tagEnd) {
            this.tagEnd = options.tagEnd;
        }
        if (options.ext) {
            this.ext = options.ext;
        }
        if (options.extHide) {
            this.extHide = options.extHide;
        }
        if (options.rootDir) {
            this.rootDir = options.rootDir;
            this.setRootDirectory(this.rootDir);
        }
        if (options.modules) {
            this.modules = options.modules;
        }
    }
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
        return this;
    }
    updateBuffer() {
        this.setRootDirectory(this.rootDir);
        return this;
    }
    load(target, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (target[0] != "/") {
                target = "/" + target;
            }
            if (!this.buffers[target]) {
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
            const urls = req.url.split("?");
            let url = urls[0];
            if (url[url.length - 1] == "/") {
                url = url + "index";
            }
            url = url + this.ext;
            if (!this.buffers[url]) {
                throw new MseError(404, "page not found.");
            }
            return yield this.load(url, sandbox);
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
                const buffer = this.search(list.parentPath + "/" + list.name);
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
    direct(text, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sandbox) {
                sandbox = this.setSandBox();
            }
            return yield this.sandbox("anonymous", this.convert(text), sandbox);
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
                    try {
                        resData = yield eval("(async ()=>{" + ___TEXT + "})();");
                    }
                    catch (error) {
                        throw new MseError(500, error.message, ___BODY);
                    }
                    return {
                        data: resData,
                        content: ___BODY,
                    };
                });
            }).bind(___SANDBOX)();
            return res;
        });
    }
}
exports.Mse = Mse;
