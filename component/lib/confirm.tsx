import React from "react";
import { Singleton } from "./Singleton";
import { EventsComponent } from "./events.component";
import { Button } from "../view/button";
import "./style.less";
import { Space } from "../view/grid";
import { tipLayer, LayerWield } from "./zindex";
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
        tipLayer.clear(LayerWield.confirm)
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
        return this.visible && <div className='shy-confirm-box' style={{ zIndex: tipLayer.zoom(LayerWield.confirm) }}>
            <div className='shy-confirm-mask' onMouseDown={e => this.onCancel()}></div>
            <div className='shy-confirm'>
                <div className='shy-confirm-msg'>{this.msg}</div>
                {this.description && <div className='syh-confirm-description'>{this.description}</div>}
                <div className='syh-confirm-buttons' style={{ marginTop: 20 }}>
                    <Space align="center">
                        <Button onClick={e => this.onConfirm()}>确定</Button>
                        <Button onClick={e => this.onCancel()} ghost>取消</Button>
                    </Space>
                </div>
            </div>
        </div>
    }
}
var syConfirm: SyConfirm;
export async function Confirm(msg: string, description?: string) {
    syConfirm = await Singleton(SyConfirm);
    syConfirm.open(msg, description);
    return new Promise((resolve, reject) => {
        syConfirm.only('confirm', () => resolve(true))
        syConfirm.only('cancel', () => resolve(false))
    })
}