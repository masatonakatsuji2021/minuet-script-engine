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
exports.MseHttp = void 0;
const base_1 = require("./base");
const __1 = require("..");
const querystring = require("querystring");
class MseHttp extends base_1.MseModuleBase {
    get req() {
        if (!this.context.req) {
            throw new __1.MseError(500, "Processing was interrupted because the http.incomingMessage class was not found.");
        }
        return this.context.req;
    }
    get res() {
        if (!this.context.res) {
            throw new __1.MseError(500, "Processing was interrupted because the http.ServerResponse class was not found.");
        }
        return this.context.res;
    }
    get urls() {
        return this.req.url.split("?");
    }
    get url() {
        return this.urls[0];
    }
    get query() {
        const queryStr = decodeURIComponent(this.urls[1]);
        return querystring.parse(queryStr);
    }
    get method() {
        return this.req.method;
    }
    get isGet() {
        if (this.req.method == "GET") {
            return true;
        }
        return false;
    }
    get isPost() {
        if (this.req.method == "POST") {
            return true;
        }
        return false;
    }
    get isPut() {
        if (this.req.method == "PUT") {
            return true;
        }
        return false;
    }
    get isDelete() {
        if (this.req.method == "DELETE") {
            return true;
        }
        return false;
    }
    get isOptions() {
        if (this.req.method == "OPTIONS") {
            return true;
        }
        return false;
    }
    get data() {
        return new Promise((resolve) => {
            let dataStr = "";
            this.req.on("data", (buff) => {
                dataStr += buff.toString();
            });
            this.req.on("end", () => {
                const type = this.req.headers["content-type"];
                if (type.indexOf("multipart/form-data") > -1) {
                    resolve(dataStr);
                }
                else {
                    const dataStrBuffer = decodeURIComponent(dataStr);
                    resolve(querystring.parse(dataStrBuffer));
                }
            });
        });
    }
    getData(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.data;
            return data[name];
        });
    }
    get requestHeader() {
        return this.req.headers;
    }
    responseHeader(name, value) {
        this.res.setHeader(name, value);
        return this;
    }
    set statusCode(statusCode) {
        this.res.statusCode = statusCode;
    }
    set statusMessage(statusMessage) {
        this.res.statusMessage = statusMessage;
    }
}
exports.MseHttp = MseHttp;
