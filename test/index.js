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
    tempDir: "temp",
    pages: {
        notFound: "error/404.mse",
        InternalError: "error/500.mse",
    },
    modules: [
        "http",
        "file",
        "text",
    ],
});
const h = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield mse.listen(req, res);
}));
h.listen(4851);
