import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { MseModuleBase } from "./base";
import { MseError } from "..";
import * as querystring from "querystring";

export class MseHttp extends MseModuleBase {

    private get req(): IncomingMessage {
        if (!this.context.req){
            throw new MseError(500, "Processing was interrupted because the http.incomingMessage class was not found.");
        }
        return this.context.req;
    }

    private get res() : ServerResponse{
        if (!this.context.res){
            throw new MseError(500, "Processing was interrupted because the http.ServerResponse class was not found.");
        }
        return this.context.res;
    }

    private get urls() : Array<string> {
        return this.req.url.split("?");
    }

    public get url() : string {
        return this.urls[0];
    }

    public get query() : object {
        const queryStr = decodeURIComponent(this.urls[1]);
        return querystring.parse(queryStr);
    }

    public get method() : string {
        return this.req.method;
    }

    public get isGet() : boolean {
        if (this.req.method == "GET"){
            return true;
        }
        return false;
    }

    public get isPost() : boolean {
        if (this.req.method == "POST"){
            return true;
        }
        return false;
    }

    public get isPut() : boolean {
        if (this.req.method == "PUT"){
            return true;
        }
        return false;
    }

    public get isDelete() : boolean {
        if (this.req.method == "DELETE"){
            return true;
        }
        return false;
    }

    public get isOptions() : boolean {
        if (this.req.method == "OPTIONS"){
            return true;
        }
        return false;
    }

    public get  data() : Promise<Object>  {

        return new Promise((resolve) => {

            let dataStr : string = "";
            this.req.on("data", (buff)=>{
                dataStr += buff.toString();
            });
            this.req.on("end", ()=>{
                const type = this.req.headers["content-type"];
                if (type.indexOf("multipart/form-data") > -1){
                    resolve(dataStr);
                }
                else {
                    const dataStrBuffer = decodeURIComponent(dataStr);
                    resolve(querystring.parse(dataStrBuffer));
                }
            });
        });
    }

    public async getData(name : string) : Promise<unknown>  {
        const data = await this.data;
         return data[name];
    }

    public get requestHeader() : IncomingHttpHeaders {
        return this.req.headers;
    }

    public responseHeader(name : string, value : any)  : MseHttp {
            this.res.setHeader(name, value);
            return this;
    }

    public set statusCode(statusCode : number)  {
        this.res.statusCode = statusCode;
    }

    public set statusMessage(statusMessage : string) {
        this.res.statusMessage = statusMessage;
    }

}