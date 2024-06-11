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
exports.MseHttp = void 0;
const __1 = require("../");
const querystring = require("querystring");
class MseHttp extends __1.MseModule {
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
    get(name) {
        if (this.query[name]) {
            return this.query[name];
        }
        return "";
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
    post(name) {
        if (!this.dataBuffer) {
            return "";
        }
        if (this.dataBuffer[name]) {
            return this.dataBuffer[name];
        }
        return "";
    }
    get data() {
        return new Promise((resolve) => {
            if (this.dataBuffer) {
                return resolve(this.dataBuffer);
            }
            let dataStr = "";
            this.req.on("data", (buff) => {
                dataStr += buff.toString();
            });
            this.req.on("end", () => {
                let type = this.req.headers["content-type"];
                if (!type) {
                    type = "application/x-www-form-urlencoded";
                }
                let result;
                if (type.indexOf("multipart/form-data") > -1) {
                    result = dataStr;
                }
                else {
                    const dataStrBuffer = decodeURIComponent(dataStr);
                    result = querystring.parse(dataStrBuffer);
                }
                this.dataBuffer = result;
                resolve(this.dataBuffer);
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
