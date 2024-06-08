import { IncomingMessage } from "http";

export class MseRequest {

    private context : IncomingMessage;
    public constructor(req : IncomingMessage){
        this.context = req;
    }

    public get url() : string {
        const urls = this.context.url.split("?");
        return urls[0];
    }

    public get query() : object {
        let result = {};
        const urls = this.context.url.split("?");
        const queryString : string = urls[1];
        if (!queryString){
            return result;
        }
        const queryArray = queryString.split("&");
        for (let n = 0 ; n < queryArray.length ; n++) {
            const buffer : Array<string> = queryArray[n].split("=");
            const name : string = buffer[0];
            const value : string = buffer[1];
            result[name] = value;
        }
        return result;
    }

    public get method() : string {
        return this.context.method;
    }

    

}