"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MseRequest = void 0;
class MseRequest {
    constructor(req) {
        this.context = req;
    }
    get url() {
        const urls = this.context.url.split("?");
        return urls[0];
    }
    get query() {
        let result = {};
        const urls = this.context.url.split("?");
        const queryString = urls[1];
        if (!queryString) {
            return result;
        }
        const queryArray = queryString.split("&");
        for (let n = 0; n < queryArray.length; n++) {
            const buffer = queryArray[n].split("=");
            const name = buffer[0];
            const value = buffer[1];
            result[name] = value;
        }
        return result;
    }
    get method() {
        return this.context.method;
    }
}
exports.MseRequest = MseRequest;
