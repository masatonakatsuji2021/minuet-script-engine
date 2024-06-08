import { Mse, MseError } from "../";
import * as http from "http";

const mse = new Mse({
    rootDir: "areas",
});

const h = http.createServer(async (req, res)=>{

    try{
        const result = await mse.listen(req, res);
        res.write(result.content);
        res.end();

    } catch (error){
        res.statusCode = 500;
        if(error instanceof MseError) {
            res.statusCode = error.statusCode;;
        }
        res.write(error.toString());
        res.end();
    }    
});
h.listen(4851);