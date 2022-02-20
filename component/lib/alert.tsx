import React from "react";
import { Singleton } from "./Singleton";
import { EventsComponent } from "./events.component";
import { Button } from "../view/button";
import "./style.less";
import { Space } from "../view/grid";
class SyAlert extends EventsComponent {
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
        return this.visible && <div className='shy-alert-box'>
            <div className='shy-alert-mask' onMouseDown={e => this.onCancel()}></div>
            <div className='shy-alert'>
                <div className='shy-alert-msg'>{this.msg}</div>
                {this.description && <div className='shy-alert-description'>{this.description}</div>}
                <div className='shy-alert-buttons' style={{ marginTop: 20 }}>
                    <Space align="center">
                        <Button block onClick={e => this.onConfirm()}>确定</Button>
                    </Space>
                </div>
            </div>
        </div>
    }
}
var syAlert: SyAlert;
export async function Alert(msg: string, description?: string) {
    syAlert = await Singleton(SyAlert);
    syAlert.open(msg, description);
    return new Promise((resolve, reject) => {
        syAlert.only('confirm', () => resolve(true))
        syAlert.only('cancel', () => resolve(true))
    })
}