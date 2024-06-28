import { Mse } from "../";
import * as http from "http";

const mse = new Mse({
    rootDir: {
        "/": "htdocs",
        "/2": "htdocs2",
    },
    pages: {
        notFound: "error/404.mse",
        InternalError: "error/500.mse",
    },
    headers: {
        "content-type":"text/html",
        "name": "minuet-script-engine",
    },
    modules : [
        "http",
        "file",
        "text",
    ],
});

const mse2 = new Mse({
    rootDir: {
        "/": "htdocs",
        "/2": "htdocs2",
    },
    buffering: false,
    pages: {
        notFound: "error/404.mse",
        InternalError: "error/500.mse",
    },
    headers: {
        "content-type":"text/html",
        "name": "minuet-script-engine",
    },
    modules : [
        "http",
        "file",
        "text",
    ],
});

http.createServer(async (req, res)=>{
    await mse.listen(req, res);
}).listen(4851);
http.createServer(async (req, res)=>{
    await mse2.listen(req, res);
}).listen(9585);

console.log("listen http://localhost:4851");
console.log("listen http://localhost:9585");