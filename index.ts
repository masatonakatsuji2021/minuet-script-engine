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

import * as fs from "fs";
import * as path from "path";
import { IncomingMessage, ServerResponse } from "http";

interface ISandbox {
    req? : IncomingMessage,
    res? : ServerResponse,
}

export  class SandBox implements ISandbox {
     [x: string]: any;
}

export interface IMseOptionPage {
    404? : string,
    500?: string,
}

export interface MseOption {
    tagStart?  : string,
    tagEnd? : string,
    ext? : string,
    extHide? : string,
    rootDir? : string,
    modules? : Array<string>,
    pages?: IMseOptionPage,
}

export class MseError extends Error {

    private _statusCode : number;
    public constructor(statusCode : number, errorMessage: string){
        super(errorMessage);
        this._statusCode = statusCode;
    }

    public get statusCode() : number{
        return this._statusCode;
    }

}

export class Mse {

    private tagStart : string = "<?";
    private tagEnd : string = "?>";
    private ext : string = ".mse";
    private extHide : string = ".mseh";
    private rootDir: string;
    private buffers = {};
    private modules : Array<string> = [];
    private pages : IMseOptionPage = {};
    
    public constructor(options? : MseOption){
        if (options.tagStart){
            this.tagStart = options.tagStart;
        }
        if (options.tagEnd){
            this.tagEnd = options.tagEnd;
        }
        if (options.ext){
            this.ext = options.ext;
        }
        if (options.extHide){
            this.extHide = options.extHide;
        }
        if (options.rootDir) {
            this.rootDir = options.rootDir;
            this.setRootDirectory(this.rootDir);
        }
        if (options.modules){
            this.modules = options.modules;
        }
        if (options.pages){
            this.pages = options.pages;
        }
    }

    public setRootDirectory(rootDir : string) : Mse {
        this.buffers = {};
        const lists = this.search(rootDir);
        for ( let n = 0 ; n < lists.length ; n++) {
            const list = lists[n];
            const filePath = list.path + "/" + list.name;
            const text =  fs.readFileSync(filePath).toString();
            const converted = this.convert(text);
            const name = filePath.substring(rootDir.length);
            this.buffers[name] = converted;
        }
        return this;
    }

    public updateBuffer() : Mse {
        this.setRootDirectory(this.rootDir);
        return this;
    }

    public async load(target : string, sandbox? : SandBox){
        if(target[0] != "/"){
            target = "/" + target;
        }
        if (!this.buffers[target]){
            throw Error("Page not found.");
        }
        const text = this.buffers[target];
        if(!sandbox){
            sandbox = this.setSandBox();
        }
        return await this.sandbox(target, text, sandbox);
    }

    private setSandBox(){
        let sandbox = new SandBox();
        // load module....
        if (this.modules) {
            for (let n = 0 ; n < this.modules.length ; n++) {
                const moduleName = this.modules[n];
                const modulePath = "./modules/" + moduleName;
                const moduleClassName = "Mse" + moduleName.substring(0,1).toUpperCase() + moduleName.substring(1);
                try{
                    const mbuffer = require(modulePath);
                    sandbox[moduleName] = new mbuffer[moduleClassName](sandbox);
                }catch(error){
                    continue;
                }
             }
        }
        return sandbox;
    }

    public async listen(req : IncomingMessage, res : ServerResponse, sandbox? : SandBox) {
        const urls = req.url.split("?");
        let url = urls[0];
        if (url[url.length - 1] == "/") {
            url = url + "index";
        }
        url = url + this.ext;

        if (!this.buffers[url]) {
            throw new MseError(404, "page not found.");
        }
        return await this.load(url, sandbox);
    }

    private search(target : string) {
        let res = [];
        const lists = fs.readdirSync(target, {
            withFileTypes: true,
        });

        for (let n = 0 ; n < lists.length ; n++){
            const list = lists[n];

            if (list.isDirectory()){
                const buffer = this.search(list.parentPath + "/" + list.name);
                for (let n2 = 0 ; n2 < buffer.length ; n2++){
                    const b_ = buffer[n2];
                    res.push(b_);
                }
            }
            else {
                if (
                    path.extname(list.name) == this.ext ||
                    path.extname(list.name) == this.extHide
                ){
                    res.push(list);
                }
            }
        }

        return res;
    }

    private static base64Encode(text : string){
        return Buffer.from(text, "utf-8").toString("base64");
    }

    private static base64Decode(textB64 : string){
        return Buffer.from(textB64,"base64").toString("utf-8");
    }

    private static echoBase64( text : string, line : number){
        return "eb64( \"" + Mse.base64Encode(text) + "\", " + line + ");";
    }

    public convert(scriptCode : string){
        let convertScriptStr : string = "";

        const sc1 = scriptCode.split(this.tagStart);
        let line : number = 0;
        for (let n = 0 ; n < sc1.length ; n++){
            const sc1_ = sc1[n];

            if (n == 0) {
                const length = sc1_.match(/\n/g);
                line += length ? length.length - 1 : 0;
                convertScriptStr += Mse.echoBase64(sc1_, line);
                continue;
            }
            const sc2 = sc1_.split(this.tagEnd);

            const length = sc2[0].match(/\n/g);
            line += length ? length.length -1 : 0;
            convertScriptStr += sc2[0];
            const length2 = sc2[1].match(/\n/g);
            line += length2 ? length2.length -1 : 0;
            convertScriptStr += Mse.echoBase64( sc2[1], line);
        }

        return convertScriptStr;
    }

    public async direct(text : string, sandbox? : SandBox){
        if (!sandbox){
            sandbox = this.setSandBox();
        }
        return await this.sandbox("anonymous", this.convert(text), sandbox);
    }

    private async sandbox(___FILENAME : string, ___TEXT : string, ___SANDBOX : SandBox){

        const ___CONTEXT = this;

        let resData;

        const res = await (async function(){

            let ___BODY : string = "";
            let ___LINE : number = 0;

            const eb64 = (text : string, line : number) => {
                ___BODY += Mse.base64Decode(text);
                ___LINE = line;
            };

            const echo = (text : string) => {
                if (text == undefined){
                    throw Error("echo text is undefined.");
                }
                ___BODY += text;
            };

            const debug = (data : any) => {
                let line : number;
                try{
                    throw Error("trace");
                }catch(e){
                    const stackLines = e.stack.split('\n');
                    const callerLine = stackLines[2];
                    line = parseInt(callerLine.match(/<anonymous>:(\d+):\d+/)[1]);
                }
                echo( "[Debug] " + ___FILENAME + " (" + (___LINE + line) + ")\n");
                const type = typeof data;
                if (
                    type == "string" || 
                    type == "number" 
                ) {
                    echo(data.toString());
                }
                else if(type == "object"){
                    echo(JSON.stringify(data, null, "   "));
                }
            };

            const sleep = (msec : number) => {
                return new Promise((resolve)=>{
                    setTimeout(()=>{
                        resolve(true);
                    }, msec);
                });
            };

            const async = (handle : Function)=>{
                return new Promise((resolve)=>{
                    handle(resolve);                    
                });
            };

            const include = async (target : string)=>{
                const addBody = await ___CONTEXT.load(target, ___SANDBOX);
                ___BODY += addBody.content;
                return addBody.data;
            };

            try {
                resData = await eval("(async ()=>{" + ___TEXT + "})();");
            }catch( error){
                throw new MseError(500, error.message);
            }

            return {
                data: resData,
                content:  ___BODY,
            };

        }).bind(___SANDBOX)();

        return res;
    }

}