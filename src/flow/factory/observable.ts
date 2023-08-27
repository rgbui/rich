import { FlowCommandFactory } from "./block.factory";


export function flow(url: string) {
    return (target) => {
        target.prototype.url = url;
        FlowCommandFactory.registerComponent(url, target);
    }
}
export function flowView(url: string) {
    return (target) => {
        target.prototype.url = url;
        FlowCommandFactory.registerComponentView(url, target);
    }
}

