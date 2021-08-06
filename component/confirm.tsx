import React from "react";
import { Singleton } from "../extensions/Singleton";
import { EventsComponent } from "../extensions/events.component";
import { Button } from "./button";
class SyConfirm extends EventsComponent {
    private msg: string;
    private description: string;
    private visible: boolean = false;
    open(msg: string, description?: string) {
        this.msg = msg;
        this.description = description;
        this.visible = true;
        this.forceUpdate();
    }
    close() {
        this.visible = false;
        this.forceUpdate()
    }
    onConfirm() {
        this.emit('confirm');
        this.close()
    }
    onCancel() {
        this.emit('cancel');
        this.close()
    }
    render() {
        return this.visible && <div className='shy-confirm-box'>
            <div className='shy-confirm-mask' onMouseDown={e => this.onCancel()}></div>
            <div className='shy-confirm'>
                <div className='syh-confirm-msg'>{this.msg}</div>
                {this.description && <div className='syh-confirm-description'>{this.description}</div>}
                <div className='syh-confirm-buttons'>
                    <Button onClick={e => this.onConfirm()}>保存</Button>
                    <Button onClick={e => this.onCancel()} ghost>取消</Button>
                </div>
            </div>
        </div>
    }
}
var syConfirm: SyConfirm;
export async function Confirm(msg: string, description?: string) {
    syConfirm = await Singleton<SyConfirm>(SyConfirm);
    syConfirm.open(msg, description);
    return new Promise((resolve, reject) => {
        syConfirm.only('confirm', () => resolve(true))
        syConfirm.only('cancel', () => resolve(false))
    })
}