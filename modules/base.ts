import { SandBox } from "../";

export class MseModuleBase {

    private context : SandBox;
    public constructor(context : SandBox) {
        this.context = context;
    }
}