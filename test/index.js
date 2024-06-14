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
const __1 = require("../");
const http = require("http");
const mse = new __1.Mse({
    rootDir: "htdocs",
    pages: {
        notFound: "error/404.mse",
        InternalError: "error/500.mse",
    },
    headers: {
        "content-type": "text/html",
        "name": "minuet-script-engine",
    },
    modules: [
        "http",
        "file",
        "text",
    ],
});
const h = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mbefore = process.memoryUsage();
    const status = yield mse.listen(req, res);
    const mAfter = process.memoryUsage();
    console.log({
        rss: mAfter.rss - mbefore.rss,
        heapTotal: mAfter.heapTotal - mbefore.heapTotal,
        heapUsed: mAfter.heapUsed - mbefore.heapUsed,
        external: mAfter.external - mbefore.external,
    });
}));
h.listen(4851);
console.log("listen http://localhost:4851");
