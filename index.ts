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
import { MinuetServerModuleBase } from "minuet-server";

export  class SandBox {
    public req? : IncomingMessage;
    public res? : ServerResponse;
    public ___BODY : string = "";
    public tempDir? : string;
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
    notFound? : string | boolean,

    /**
     * ***internalError*** : Proxy page file path for 500 Internal Server Error.
     */
    InternalError?: string | boolean,
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
     * ***tagStart*** : Script opening tag. If not specified, the default is ``<script mse>``,
     */
    tagStart?  : string,

    /**
     * ***tagEnd*** : Script closing tag. If not specified, the default is ``</script>``,
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
    rootDir? : string | {[url : string] : string},

    /**
     * ***buffering*** : Setting whether to buffer server data.  
     * (The default is ``true``.)
     * 
     * If you select ``true``, when you instantiate or execute the ``setting`` method,  
     * a set of files in the root directory with access permissions for each MimeType will be buffered.  
     * When listening from now on, it will be loaded from the buffer.  
     * 
     * This is done as part of the speedup.  
     * Even if a file in the root directory is changed, the display results will not be updated when listening.
     * 
     * If you select ``false``, no buffer will be created and the script file will be loaded every time you listen.  
     */
    buffering? : boolean,

    /**
     * ***modules*** : List of modules to use for the extension.
     */
    modules? : Array<string>,

    /**
     * ***moduleOptions*** : 
     */
    moduleOptions? : Object,

    /**
     * ***pages*** : Page information to display on behalf of irregular request results    
     * For details, see ***IMseOptionPage***.
     */
    pages?: IMseOptionPage,

    /**
     * ***directoryIndexs*** : Specifies a list of files to display for a directory request..
     */
    directoryIndexs? : Array<string>,

    /**
     * ***bufferingInterval*** : Update the buffer periodically.  
     * Specify the execution time in milliseconds.
     */
    bufferingInterval? : number,

    /**
     * ***headers*** : Specify the default response header information.
     */
    headers?: Object,

    /**
     * ***logAccess*** : Specify the log output at the time of the request.  
     * Apply the log setting name set in ``minuet-server-logger``.
     */
    logAccess? : string,

    /**
     * ***logSuccess*** : Specify the log output when an error occurs.  
     * Apply the log setting name set in ``minuet-server-logger``.
     */
    logError? : string,
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
     * ***tagStart*** : Script opening tag. If not specified, the default is ``<script mse>``,
     */
    public tagStart : string = "<script mse>";

    /**
     * ***tagEnd*** : Script closing tag. If not specified, the default is ``</script>``,
     */
    public tagEnd : string = "</script>";

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
    public rootDir: string | {[url: string] : string}  = "htdocs";

    /**
     * ***buffering*** : Setting whether to buffer server data.  
     * (The default is ``true``.)
     * 
     * If you select ``true``, when you instantiate or execute the ``setting`` method,  
     * a set of files in the root directory with access permissions for each MimeType will be buffered.  
     * When listening from now on, it will be loaded from the buffer.  
     * 
     * This is done as part of the speedup.  
     * Even if a file in the root directory is changed, the display results will not be updated when listening.
     * 
     * If you select ``false``, no buffer will be created and the script file will be loaded every time you listen.  
     */
    public buffering : boolean = true;

    /**
     * ***modules*** : List of modules to use for the extension.
     */
    public modules : Array<string> = [];

    /**
     * ***moduleOptions*** : 
     */
    public moduleOptions : Object = {};

    /**
     * ***pages*** : Page information to display on behalf of irregular request results    
     * For details, see ***IMseOptionPage***.
     */
    public pages : IMseOptionPage;

    /**
     * ***directoryIndexs*** : Specifies a list of files to display for a directory request..
     */
    public directoryIndexs : Array<string> = [ "index.mse" ];

    /**
     * ***bufferingInterval*** : Update the buffer periodically.  
     * Specify the execution time in milliseconds.
     */
    public bufferingInterval: number;

    /**
     * ***headers*** : Specify the default response header information.
     */
    public headers: Object = {};

    /**
     * ***logAccess*** : Specify the log output at the time of the request.  
     * Apply the log setting name set in ``minuet-server-logger``.
     */
    public logAccess : string;
    
    /**
     * ***logSuccess*** : Specify the log output when an error occurs.  
     * Apply the log setting name set in ``minuet-server-logger``.
     */
    public logError : string;

    private buffers = {};
    private bufferingIntervalT;
    public logger;

    /**
     * ### constructor
     * @param {IMseOption} options Option Settings  
     */
    public constructor(options? : IMseOption){
        if (options){
            this.setting(options);
        }
        else {
            this.updateBuffer();
        }
    }

    /**
     * ### settings
     * @param options 
     * @returns 
     */
    public setting(options? : IMseOption) : Mse {
        if (options.tagStart != undefined)  this.tagStart = options.tagStart;
        if (options.tagEnd != undefined) this.tagEnd = options.tagEnd;
        if (options.ext != undefined) this.ext = options.ext;
        if (options.extHide != undefined) this.extHide = options.extHide;
        if (options.rootDir != undefined) this.rootDir = options.rootDir;
        if (options.buffering != undefined) this.buffering = options.buffering;
        if (options.modules != undefined) this.modules = options.modules;
        if (options.moduleOptions != undefined) this.moduleOptions = options.moduleOptions;
        if (options.pages != undefined) this.pages = options.pages;
        if (options.directoryIndexs != undefined) this.directoryIndexs = options.directoryIndexs;
        if (options.bufferingInterval != undefined) this.bufferingInterval = options.bufferingInterval;
        if (options.headers != undefined) this.headers = options.headers;
        if (options.logAccess != undefined) this.logAccess = options.logAccess;
        if (options.logError != undefined) this.logError = options.logError;
        this.updateBuffer();
        this.startBufferingIntarval();
        return this;
    }

    /**
     * addRootDir
     * @param {string} url 
     * @param {string} rootDir 
     */
    public addRootDir(url : string, rootDir : string) {
        if (typeof this.rootDir == "string") {
            this.rootDir = { "/" : this.rootDir };
        }

        this.rootDir[url] = rootDir;

        if(this.buffering) {
            this.search(rootDir, url);
        }
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
     * ### updateBuffer
     * Updates the buffer information for the specified root directory.
     * @returns {Mse}
     */
    public updateBuffer() : Mse {
        if (this.buffering){
            this.buffers = {};
            if(typeof this.rootDir == "string") {
                this.rootDir = { "/" : this.rootDir };
            }
            const r = Object.keys(this.rootDir);
            for(let n = 0 ; n < r.length ; n++) {
                const url = r[n];
                const rootDir = this.rootDir[url];
                this.search(rootDir, url);
            }

            if(this.pages){
                if(this.pages.notFound){
                    if (typeof this.pages.notFound == "string"){
                        const content = fs.readFileSync(this.pages.notFound).toString();
                        this.addBuffer(MseIregularPageName.notFound,  content);    
                    }
                }
                if(this.pages.InternalError){
                    if (typeof this.pages.InternalError == "string"){
                        const content = fs.readFileSync(this.pages.InternalError).toString();
                        this.addBuffer(MseIregularPageName.internalError,  content);
                    }
                }
            }
        }
        return this;
    }

    /**
     * *** startBufferingIntarval *** :
     * @returns 
     */
    public startBufferingIntarval() {
        if (this.bufferingInterval){
            if (this.bufferingIntervalT) clearInterval(this.bufferingIntervalT);
            this.bufferingIntervalT = setInterval(()=>{
                this.updateBuffer();
            }, this.bufferingInterval);
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
        let text : string;
        if (this.buffering) {
            if (!this.buffers[target]){
                throw Error("Page not found." + target);
            }    
            text = this.buffers[target];
        }
        else {
            if (typeof this.rootDir == "string") {
                this.rootDir = { "/": this.rootDir };
            }

            let decisionPath;
            const c = Object.keys(this.rootDir);
            for (let n2 = 0 ; n2 < c.length ; n2++) {
                const burl = c[n2];
                const rootDir = this.rootDir[burl];

                if (target.indexOf(burl) === 0) {
                    const targetPath = (rootDir + "/" + target.substring(burl.length)).split("//").join("/");
                    if (fs.existsSync(targetPath)) {
                        if (fs.statSync(targetPath).isFile()){
                            decisionPath = targetPath;
                            break;
                        }
                    }    
                }
            }

            if (!decisionPath) {
                throw Error("Page not found." + target);
            }

            text = fs.readFileSync(decisionPath).toString();
            text = this.convert(text);
        }
        if(!sandbox){
            sandbox = this.setSandBox();
        }
        return await this.sandbox(target, text, sandbox);
    }

    /**
     * ## setSandBox
     * @returns {SandBox} SandBox
     */
    public setSandBox(){
        let sandbox = new SandBox();
        // load module....
        if (this.modules) {
            for (let n = 0 ; n < this.modules.length ; n++) {
                const moduleName = this.modules[n];
                const moduleOption = this.moduleOptions[moduleName];
                const modulePath = "./modules/" + moduleName;
                const moduleClassName = "Mse" + moduleName.substring(0,1).toUpperCase() + moduleName.substring(1);
                try{
                    const mbuffer = require(modulePath);
                    sandbox[moduleName] = new mbuffer[moduleClassName](sandbox, moduleOption);
                }catch(error){
                    console.log(error);
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
        const url = this.getUrl(req.url);
        try{
            if(!url){
                throw new MseError(MssIregularPageCode.notFound, "page not found.", {
                    fileName: url,
                });
            }

            if (this.headers) {
                const hc = Object.keys(this.headers);
                for (let n = 0 ; n < hc.length ; n++){
                    const name = hc[n];
                    const value = this.headers[name];
                    res.setHeader(name, value);
                }
            }

            const result : IMseLoadResult= await this.load(url, sandbox);

            res.write(result.content);
            res.end();   

            // access log write
            this.log(this.logAccess, req, res);

        } catch(error){

            if (!this.pages){
                return false;
            }

            res.statusCode = MssIregularPageCode.internalError;
            if(!(error instanceof MseError)) {
                error = new MseError(500, error.message);
            }
            
            res.statusCode = error.statusCode;
            sandbox.exception = error;

            let errorStr;
            let result : IMseLoadResult;
            try{

                if (error.statusCode == MssIregularPageCode.notFound) {
                    if (typeof this.pages.notFound == "string") {
                        result = await this.load(MseIregularPageName.notFound, sandbox);
                    }
                    else {
                        result = {
                            data: null,
                            content: error.message.toString(),
                        };
                    }
                }
                else {
                    if (typeof this.pages.InternalError == "string"){
                        result = await this.load(MseIregularPageName.internalError, sandbox);
                    }
                    else {
                        result = {
                            data: null,
                            content: error.message.toString(),
                        };
                    }
                }
                errorStr = result.content;
                res.write(result.content);
                res.end();
            }catch(error){
                errorStr = error.message.toString();
                res.write(error.message + "\n");
                res.end();
            }

            // access log write
            this.log(this.logAccess, req, res);
            // error log write
            this.log(this.logError, req, res, errorStr);
        }

        return true;
    }

    // log write
    private log(logMode : string, req : IncomingMessage, res : ServerResponse, message? : string) {
        if (!logMode) return;
        if (this.logger) {
            if (typeof logMode == "string") {
                this.logger.write(logMode, req, res, message);
            }
        }
    }

    // get request url
    private getUrl(baseUrl : string) : string {
        let url = baseUrl.split("?")[0];
        if (url != "/" && url[url.length - 1] == "/") {
            url = url.substring(0, url.length- 1);
        }
        let urlList = [];
        urlList.push(url);
        for (let n = 0 ; n < this.directoryIndexs.length ; n++){
            const index = this.directoryIndexs[n];
            urlList.push((url + "/" + index).split("//").join("/"));
        }

        let decisionUrl : string;
        for (let n = 0 ; n < urlList.length ; n++){
            const url_ = urlList[n];;
            if (this.buffering) {
                if(this.buffers[url_]){
                    decisionUrl = url_;
                    break;
                }   
            }
            else {
                if (typeof this.rootDir == "string") {
                    this.rootDir = { "/": this.rootDir };
                }

                const c = Object.keys(this.rootDir);
                for (let n2 = 0 ; n2 < c.length ; n2++) {
                    const burl = c[n2];
                    const rootDir = this.rootDir[burl];

                    if (url_.indexOf(burl) === 0) {
                        const targetPath = (rootDir + "/" + url_.substring(burl.length)).split("//").join("/");
                        if (fs.existsSync(targetPath)) {
                            if (fs.statSync(targetPath).isFile()){
                                decisionUrl = url_;
                                break;
                            }
                        }    
                    }
                }
            }
        }

        if (decisionUrl){
            if (path.extname(decisionUrl) == this.extHide) {
                decisionUrl = undefined;
            }
        }

        return decisionUrl;        
    }

    private search(target : string, url : string) : void {
        const lists = fs.readdirSync(target, {
            withFileTypes: true,
        });
        for (let n = 0 ; n < lists.length ; n++){
            const list = lists[n];
            if (list.isDirectory()){
                this.search(target + "/" + list.name, url);
            }
            else {
                if (
                    path.extname(list.name) == this.ext ||
                    path.extname(list.name) == this.extHide
                ){
                    const filePath = target + "/" + list.name;
                    const text =  fs.readFileSync(filePath).toString();
                    const converted = this.convert(text);
                    let url2 = url;
                    if (url2 == "/") {
                        url2 = "";
                    }
                    const name = url2 + filePath.substring(this.rootDir[url].length).substring((this.ext.length) * -1);
                    this.buffers[name] = converted;
                }
            }
        }
    }

    public static base64Encode(text : string){
        return Buffer.from(text, "utf-8").toString("base64");
    }

    public static base64Decode(textB64 : string){
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
            if (sc2[1]){
                const length2 = sc2[1].match(/\n/g);
                line += length2 ? length2.length -1 : 0;
                convertScriptStr += Mse.echoBase64( sc2[1], line);    
            }
        }

        return convertScriptStr;
    }

    /**
     * getRaw
     * @param target 
     * @returns 
     */
    public getRaw(target : string) : string {
        if(target[0] != "/"){
            target = "/" + target;
        }
        if (this.buffering){
            if (this.buffers[target]){
                return this.buffers[target];
            }
        }
        else {
            if (fs.existsSync(this.rootDir + "/" + target)) {
                const content = fs.readFileSync(this.rootDir + "/" + target).toString();
                return this.convert(content);
            }
        }
    }

    /**
     * rawExec
     * @param raw 
     * @param sandbox 
     * @returns 
     */
    public async rawExec(raw : string, sandbox? : SandBox) : Promise<IMseLoadResult> {
        if (!sandbox){
            sandbox = this.setSandBox();
        }
        return await this.sandbox("anonymous", raw, sandbox);
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

    /**
     * ### file
     * @param filePath 
     */
    public async file(filePath : string) : Promise<IMseLoadResult>;

    /**
     * ### file
     * @param filePath 
     * @param sandbox 
     */
    public async file(filePath : string, sandbox : SandBox) : Promise<IMseLoadResult>;

    public async file(filePath : string, sandbox? : SandBox) : Promise<IMseLoadResult> {
        if (!sandbox){
            sandbox = this.setSandBox();
        }
        const fileContent = fs.readFileSync(filePath).toString();
        return await this.sandbox("anonymous", this.convert(fileContent), sandbox);
    }

    private async sandbox(___FILENAME : string, ___TEXT : string, ___SANDBOX : SandBox) : Promise<IMseLoadResult>{

        const ___CONTEXT = this;

        let resData;

        const res = await (async function(){

            let ___LINE : number = 0;

            const eb64 = (text : string, line : number) => {
                ___SANDBOX.___BODY += Mse.base64Decode(text);
                ___LINE = line;
            };

            const echo = (text : string) => {
                if (text == undefined){
                    text = "";
                }
                ___SANDBOX.___BODY += text;
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
                return addBody.data;
            };

            const scriptUpdateBuffer = ()=>{
                 ___CONTEXT.updateBuffer();
            };

            const staticUpdateBuffer = ()=>{
                if (___SANDBOX.updateBuffer){
                    ___SANDBOX.updateBuffer();
                }
            };

            const require = undefined;
            const path = undefined;
            const fs = undefined;

            try {
                resData = await eval("(async ()=>{" + ___TEXT + "})();");
            }catch(error){
                throw new MseError(500, error.message + "(File : " + ___FILENAME + ")", {
                    fileName : ___FILENAME,                    
                });
            }

            const result : IMseLoadResult = {
                data: resData,
                content:  ___SANDBOX.___BODY,
            };

            return result;

        }).bind(___SANDBOX)();

        return res;
    }
}

export class MseModule {
    protected context : SandBox;
    public options : any = {};
    public constructor(context : SandBox, options : any) {
        this.context = context;
        if (options){
            this.options = options;
        }
    }
}

export class MinuetServerModuleMse extends MinuetServerModuleBase {

    private mse : Mse;

    public onBegin(): void {
        if (!this.init){
            this.init = {
                rootDir: "htdocs",
            };
        }
        this.init.rootDir = this.sector.root + "/" + this.init.rootDir;
        this.mse = new Mse(this.init);

        // load logger module
        const logger = this.getModule("logger");
        if (logger) {
            this.mse.logger = logger;
        }
    }

    public async onListen(req: IncomingMessage, res: ServerResponse)  {
        try{
            return await this.mse.listen(req, res);
        }catch(err){
            return;
        }
    }

}