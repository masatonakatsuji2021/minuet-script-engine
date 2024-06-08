import {  SandBox } from "../";

export class MseModuleBase {

    protected context : SandBox;

    public constructor(context : SandBox) {
        this.context = context;
    }
}