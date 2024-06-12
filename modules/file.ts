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

import { MseModule } from "../";
import * as fs from "fs";

export class MseFile extends MseModule {

    private getPath(targetPath : string) : string {
        if (!this.options.tempDir) {
            this.options.tempDir = "temp";
        }
        return this.options.tempDir + "/" + targetPath;
    }

    public mkdir(dirPath : string, options?: fs.MakeDirectoryOptions & { recursive: true; }) : string {
        return fs.mkdirSync(this.getPath(dirPath), options);
    }

    public rmdir(dirPath : string, options?: fs.RmDirOptions) : void {
        return fs.rmdirSync(this.getPath(dirPath), options);
    }

    public readFile(filePath : string, options?: { encoding?: null; flag?: string; }) : Buffer {
        return fs.readFileSync(this.getPath(filePath), options);
    }

    public writeFile(filePath : string, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions) : void {
        return fs.writeFileSync(this.getPath(filePath), data, options);
    }

    public appendFile(filePath : string, data: string | Uint8Array, options?: fs.WriteFileOptions) : void {
        return fs.appendFileSync(this.getPath(filePath), data, options);        
    }

    public readdir(filePath : string, options?: BufferEncoding | { encoding: BufferEncoding; withFileTypes?: false; }) : string[] | Buffer[] | fs.Dirent[] {
        return fs.readdirSync(this.getPath(filePath), options);
    }

}