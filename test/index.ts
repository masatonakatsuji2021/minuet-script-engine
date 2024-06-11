import { Mse } from "../";
import * as http from "http";

const mse = new Mse({
    rootDir: "htdocs",
    pages: {
        notFound: "error/404.mse",
        InternalError: "error/500.mse",
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