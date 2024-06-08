import { Mse } from "../";
import * as http from "http";

const mse = new Mse({
    rootDir: "areas",
    pages: {
        notFound: "errorpages/404.mse",
        InternalError: "errorpages/500.mse",
    }
});

const h = http.createServer(async (req, res)=>{
    await mse.listen(req, res);
});
h.listen(4851);