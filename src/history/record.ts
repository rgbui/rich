
import { Events } from "../../util/events";
import { UserAction } from "./action";

export class HistoryRecord extends Events {
    private actions: UserAction[] = [];
    private index: number = -1;
    get isCanUndo() {
        if (this.actions.length > 0 && this.index > 0) return true;
        else return false;
    }
    get isCanRedo() {
        if (this.index <= this.actions.length - 1 && this.index != -1) return true;
        else return false;
    }
    private get action() {
        return this.actions[this.index];
    }
    undo() {
        if (this.isCanUndo) {
            try {
                this.emit('undo', this.action);
            }
            catch (ex) {
                this.emit('error', ex);
            }
            finally {
                this.index -= 1;
            }
        }
    }
    redo() {
        if (this.isCanRedo) {
            try {
                this.emit('redo', this.action)
            }
            catch (ex) {
                this.emit('error', ex);
            }
            finally {
                this.index += 1;
            }
        }
    }
    push(action: UserAction) {
        this.actions.push(action);
        this.index += 1;
    }
}