import { Events } from "../util/events";
import { UserAction } from "./action";
export declare class HistoryRecord extends Events {
    private actions;
    private index;
    get isCanUndo(): boolean;
    get isCanRedo(): boolean;
    private get action();
    undo(): void;
    redo(): void;
    push(action: UserAction): void;
}
