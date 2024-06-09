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
import { promises } from "dns";

export  class SandBox {
    public req? : IncomingMessage;
    public res? : ServerResponse;
    [x: string] : any;
}

/**
 * ### IMseOptionPage
 */
export interface IMseOptionPage {
    /**
     * ***notFound*** : If the page does not exist or is an inaccessible page or endpoint,  
     * the page file path is displayed instead of 404 notFound
     */
    notFound? : string,

    /**
     * ***internalError*** : Proxy page file path for 500 Internal Server Error.
     */
    InternalError?: string,
}

export enum MssIregularPageCode {
    badRequest = 400,
    unauthorized = 401,
    paymentRequired = 402,
    forbidden = 403,
    notFound = 404,
    methodNotAllowed = 405,
    internalError = 500,
    notImplemented = 501,
}

enum MseIregularPageName {
    badRequest = "/#badRequest",
    unauthorized = "/#unauthorized",
    paymentRequired = "/#paymentRequired",
    forbidden = "/#forbidden",
    notFound = "/#notfound",
    methodNotAllowed = "/#methodNotAllowed",
    internalError = "/#internalerror",
    notImplemented = "/#notImplemented",
}

/**
 * ### IMseOption
 */
export interface IMseOption {

    /**
     * ***tagStart*** : Script opening tag. If not specified, the default is ``<?``,
     */
    tagStart?  : string,

    /**
     * ***tagEnd*** : Script closing tag. If not specified, the default is ``?>``,
     */
    tagEnd? : string,

    /**
     * ***ext*** : The extension of the script file that corresponds to MSE   
     * when automatically loading a buffer by specifying the root directory.  
     * If not specified, the default is ``.mse``,
     */
    ext? : string,

    /**
     * ***extHide*** : The extension of the script file that supports MSE   
     * when automatically loading a buffer by specifying the root directory.   
     * If the file has this extension, server access will be denied.  
     * 
     *  If not specified, the default is ``.mseh``,
     */
    extHide? : string,

    /**
     * ***rootDir*** : Path of the root directory to automatically load the buffer.   
     * If specified, all Mse-compatible files (.mse. mseh) in the root directory will be buffered.
     */
    rootDir? : string,

    /**
     * ***modules*** : List of modules to use for the extension.
     */
    modules? : Array<string>,

    /**
     * ***pages*** : Page information to display on behalf of irregular request results    
     * For details, see ***IMseOptionPage***.
     */
    pages?: IMseOptionPage,
}

export class MseError extends Error {

    private _statusCode : number;
    private _option;
    public constructor(statusCode : number, errorMessage: string, option? : Object){
        super(errorMessage);
        this._statusCode = statusCode;
        this._option = option;
    }

    public get statusCode() : number{
        return this._statusCode;
    }

    public get option() : any{
        return this._option;        
    }
}

/**
 * ### IMseLoadResult
 * Interface for Mse script execution results.
 */
export interface IMseLoadResult {

    /**
     * ***content*** : Output content after script execution.
     */
    content: string,

    /**
     * ***data***: Return value after execution as external script.
     */
    data: any,
}

 /**
 * ### Mse (Minuet-Script-Engine)
 * A lightweight and highly functional template engine aimed at replacing PHP..
 */
export class Mse {

    /**
     * ***tagStart*** : Script opening tag. If not specified, the default is ``<?``,
     */
    public tagStart : string = "<?";

    /**
     * ***tagEnd*** : Script closing tag. If not specified, the default is ``?>``,
     */
    public tagEnd : string = "?>";

    /**
     * ***ext*** : The extension of the script file that corresponds to MSE   
     * when automatically loading a buffer by specifying the root directory.  
     * If not specified, the default is ``.mse``,
     */
    public ext : string = ".mse";

    /**
     * ***extHide*** : The extension of the script file that supports MSE   
     * when automatically loading a buffer by specifying the root directory.   
     * If the file has this extension, server access will be denied.  
     * 
     *  If not specified, the default is ``.mseh``,
     */
    public extHide : string = ".mseh";

    /**
     * ***rootDir*** : Path of the root directory to automatically load the buffer.   
     * If specified, all Mse-compatible files (.mse. mseh) in the root directory will be buffered.
     */
    public rootDir: string;

    /**
     * ***modules*** : List of modules to use for the extension.
     */
    public modules : Array<string> = [];

    /**
     * ***pages*** : Page information to display on behalf of irregular request results    
     * For details, see ***IMseOptionPage***.
     */
    public pages : IMseOptionPage = {};
    
    private buffers = {};

    /**
     * ### constructor
     * @param {IMseOption} options Option Settings  
     */
    public constructor(options? : IMseOption){
        if (options.tagStart)  this.tagStart = options.tagStart;
        if (options.tagEnd) this.tagEnd = options.tagEnd;
        if (options.ext) this.ext = options.ext;
        if (options.extHide) this.extHide = options.extHide;
        if (options.rootDir) this.rootDir = options.rootDir;
        if (options.modules) this.modules = options.modules;
        if (options.pages) this.pages = options.pages;
        this.updateRootDirectory();
    }

    /**
     * ### resetBuffer
     * Delete the contents of the buffer.
     * @returns {Mse}
     */
    public resetBuffer(){
        this.buffers = {};
        return this;
    }

    /**
     * ### addBuffer
     * Manually save to a buffer with a specified file name.
     * @param {string} fileName File Name
     * @param {string} content File Content
     * @returns {Mse} 
     */
    public addBuffer(fileName : string, content : string) : Mse {
        const converted = this.convert(content);
        this.buffers[fileName] = converted;
        return this;
    }

    /**
     * ### remoteBuffer
     * Delete the buffer with the specified file name.
     * @param {string} fileName File Name
     * @returns {Mse}
     */
    public removeBuffer(fileName: string){
        delete this.buffers[fileName];
        return this;
    }

    /**
     * ### setRootDirectory
     * Automatically loads MSE script files in the specified root directory and stores them in a buffer.
     * @param {string} rootDir Root Directory
     * @returns {Mse}
     */
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

        if(this.pages){
            if(this.pages.notFound){
                const content = fs.readFileSync(this.pages.notFound).toString();
                this.addBuffer(MseIregularPageName.notFound,  content);
            }
            if(this.pages.InternalError){
                const content = fs.readFileSync(this.pages.InternalError).toString();
                this.addBuffer(MseIregularPageName.internalError,  content);
            }    
        }

        return this;
    }

    /**
     * ### updateRootDirectory
     * Updates the buffer information for the specified root directory.
     * @returns {Mse}
     */
    public updateRootDirectory() : Mse ;

    /**
     * ### updateRootDirectory
     * Updates the buffer information for the specified root directory.
     * @param {string} fileName update File Name
     * @returns {Mse}
     */
    public updateRootDirectory(fileName : string) : Mse ;

    public updateRootDirectory(fileName? : string) : Mse {
        if (fileName){
            this.setRootDirectory(fileName);
        }
        else{
            if (this.rootDir){
                this.setRootDirectory(this.rootDir);
            }    
        }
        return this;
    }

    /**
     * ### load
     * Gets a buffer from the specified file name, executes the script, and outputs the results.
     * @param {string} target Target File Name
     * @param {SandBox} sandbox Sandbox environment for script execution
     * @returns {promises<IMseLoadResult>} 
     */
    public async load(target : string, sandbox? : SandBox) : Promise<IMseLoadResult> {
        if(target[0] != "/"){
            target = "/" + target;
        }
        if (!this.buffers[target]){
            console.log(this.buffers);
            console.log(target);
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

    /**
     * ### listen
     * A method for publishing Mse files in the root directory to the server.
     * @param {IncomingMessage} req ServerRequest
     * @param {ServerResponse} res  ServerResponse
     */
    public async listen(req : IncomingMessage, res : ServerResponse);

    /**
     * ### listen
     * A method for publishing Mse files in the root directory to the server.
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {SandBox} sandbox?
     */
    public async listen(req : IncomingMessage, res : ServerResponse, sandbox: SandBox);

    public async listen(req : IncomingMessage, res : ServerResponse, sandbox? : SandBox) {
        if (!sandbox){
            sandbox = this.setSandBox();
        }
        sandbox.req = req;
        sandbox.res = res;
        const urls = req.url.split("?");
        let url = urls[0];
        if (url[url.length - 1] == "/") {
            url = url + "index";
        }
        url = url + this.ext;
        if(!this.buffers[url]){
            url = urls[0] + "/index" + this.ext;
        }
        url = url.split("//").join("/");

        try{
            if (!this.buffers[url]) {
                throw new MseError(MssIregularPageCode.notFound, "page not found.", {
                    fileName: url,
                });
            }
            
            const result : IMseLoadResult= await this.load(url, sandbox);

            res.write(result.content);
            res.end();    

        } catch(error){
            res.statusCode = MssIregularPageCode.internalError;
            if(error instanceof MseError) {
                res.statusCode = error.statusCode;
                if (this.pages.notFound) {
                    let result : IMseLoadResult;
                    sandbox.exception = error;
                    try{
                        if (error.statusCode == MssIregularPageCode.notFound) {
                            result = await this.load(MseIregularPageName.notFound, sandbox);
                        }
                        else {
                            result = await this.load(MseIregularPageName.internalError, sandbox);
                        }    
                        res.write(result.content);
                        res.end();    
                        return;
                    }catch(error){
                        res.write(error.message + "\n");
                    }
                }
            }

            res.write(error.toString());
            res.end();    
        }
    }

    private search(target : string) {
        let res = [];
        const lists = fs.readdirSync(target, {
            withFileTypes: true,
        });

        for (let n = 0 ; n < lists.length ; n++){
            const list = lists[n];
            if (list.isDirectory()){
                const buffer = this.search(list.path + "/" + list.name);
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

    private convert(scriptCode : string){
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

    /**
     * ### execute
     * Execute a script by specifying the code directly.   
     * This method does not use the buffer function.
     * @param {string} scriptCode Script Code 
     * @param {SandBox} sandbox SandBox
     * @returns {Promise<IMseLoadResult>}
     */
    public async execute(scriptCode : string, sandbox? : SandBox) : Promise<IMseLoadResult> {
        if (!sandbox){
            sandbox = this.setSandBox();
        }
        return await this.sandbox("anonymous", this.convert(scriptCode), sandbox);
    }

    private async sandbox(___FILENAME : string, ___TEXT : string, ___SANDBOX : SandBox) : Promise<IMseLoadResult>{

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

            const bufferUpdateAll = ()=>{
                 ___CONTEXT.updateRootDirectory();
            };

            const bufferUpdate = (fileName : string) => {
                if (fileName){
                    ___CONTEXT.updateRootDirectory(fileName);
                }
                else {
                    ___CONTEXT.updateRootDirectory(___FILENAME);
                }
            };

            try {
                resData = await eval("(async ()=>{" + ___TEXT + "})();");
            }catch(error){
                throw new MseError(500, error.message, {
                    fileName : ___FILENAME,                    
                });
            }

            const result : IMseLoadResult = {
                data: resData,
                content:  ___BODY,
            };

            return result;

        }).bind(___SANDBOX)();

        return res;
    }

}