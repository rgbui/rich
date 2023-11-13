
import { Flow } from "..";
import { FlowCommand, FlowCommandView } from "../command";

export class FlowCommandFactory {
    private static blockMap: Map<string, { model: typeof FlowCommand, view: typeof FlowCommandView }> = new Map();
    public static registerComponent(url: string, blockClass: typeof FlowCommand) {
        var b = this.blockMap.get(url);
        if (b) {
            b.model = blockClass;
        }
        else this.blockMap.set(url, { model: blockClass, view: null });
    }
    public static registerComponentView(url: string, blockView: typeof FlowCommandView) {
        var b = this.blockMap.get(url);
        if (b) {
            b.view = blockView;
        }
        else this.blockMap.set(url, { view: blockView, model: null });
    }
    public static async createCommand(url: string, flow: Flow, data: Record<string, any>, parent?: FlowCommand) {
        var bm = this.blockMap.get(url);
        var f = new bm.model();
        f.flow = flow;
        await f.load(data || {});
        if (parent) f.parent = parent;
        return f;
    }
    public static getView(url: string) {
        var bm = this.blockMap.get(url);
        if (!bm)
            console.log(this.blockMap, url, bm);
        return bm.view;
    }
}