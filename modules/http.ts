/**
 * MIT License
 * 
 * Copyright (c) 2024 Masato Nakatsuji
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { MseModule, MseError } from "../";
import * as querystring from "querystring";

export class MseHttp extends MseModule {

    private dataBuffer : Object;

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

    public get(name : string) : string{
        if (this.query[name]){
            return this.query[name];
        }
        return "";
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

    public post(name : string) : any{
        if (!this.dataBuffer){
            return "";
        }

        if (this.dataBuffer[name]){
            return this.dataBuffer[name];
        }
        return "";
    }

    public get  data() : Promise<Object>  {

        return new Promise((resolve) => {

            if (this.dataBuffer){
                return resolve(this.dataBuffer);
            }

            let dataStr : string = "";
            this.req.on("data", (buff)=>{
                dataStr += buff.toString();
            });
            this.req.on("end", ()=>{
                let type = this.req.headers["content-type"];
                if(!type){
                    type = "application/x-www-form-urlencoded";
                }
                let result;
                if (type.indexOf("multipart/form-data") > -1){
                    result = dataStr;
                }
                else {
                    const dataStrBuffer = decodeURIComponent(dataStr);
                    result = querystring.parse(dataStrBuffer);
                }

                this.dataBuffer = result;
                resolve(this.dataBuffer);
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