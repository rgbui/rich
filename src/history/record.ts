
import { Events } from "../../util/events";
import { UserAction } from "./action";

export class HistoryRecord extends Events {
    private actions: UserAction[] = [];
    private index: number = -1;
    get isCanUndo() {
        if (this.actions.length > 0 && this.index > -1) return true;
        else return false;
    }
    get isCanRedo() {
        if (this.index < this.actions.length - 1) return true;
        else return false;
    }
    get action() {
        return this.actions[this.index];
    }
    private get nextAction() {
        return this.actions[this.index + 1]
    }
    async undo(handler: (action: UserAction) => Promise<void>) {
        if (this.isCanUndo) {
            try {
                await handler(this.action);
            }
            catch (ex) {
                console.log(ex);
                this.emit('error', ex);
            }
            finally {
                this.index -= 1;
            }
        }
    }
    async redo(handler: (action: UserAction) => Promise<void>) {
        if (this.isCanRedo) {
            try {
                await handler(this.nextAction);
            }
            catch (ex) {
                console.log(ex);
                this.emit('error', ex);
            }
            finally {
                this.index += 1;
            }
        }
    }
    push(action: UserAction) {
        if (this.actions.length - 1 > this.index) {
            this.actions.splice(this.index + 1, this.actions.length - this.index - 1);
        }
        this.actions.push(action);
        this.index += 1;
    }
}