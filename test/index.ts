import { Mse } from "../";
import * as http from "http";

const mse = new Mse({
    rootDir: "htdocs",
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

const h = http.createServer(async (req, res)=>{
    await mse.listen(req, res);
});
h.listen(4851);
console.log("listen http://localhost:4851");