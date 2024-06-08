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
    rootDir: "areas",
});
const h = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield mse.listen(req, res);
        res.write(result.content);
        res.end();
    }
    catch (error) {
        res.statusCode = 500;
        if (error instanceof __1.MseError) {
            res.statusCode = error.statusCode;
            ;
        }
        res.write(error.toString());
        res.end();
    }
}));
h.listen(4851);
