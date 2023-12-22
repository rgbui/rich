import React from "react";
import { Singleton } from "./Singleton";
import { EventsComponent } from "./events.component";
import { Button } from "../view/button";
import "./style.less";
import { Space } from "../view/grid";
import { tipLayer } from "./zindex";
import { S } from "../../i18n/view";

class SyConfirm extends EventsComponent {
    private msg: string;
    private description: string;
    private visible: boolean = false;
    private continueButton: string = '';
    private cancelButton: string = '';
    open(msg: string, description?: string, continueButton?: string, cancelButton?: string) {
        this.msg = msg;
        this.description = description;
        this.visible = true;
        this.continueButton = continueButton;
        this.cancelButton = cancelButton;
        this.forceUpdate();
    }
    close() {
        this.visible = false;
        tipLayer.clear(this)
        this.forceUpdate()
    }
    onConfirm(e: React.MouseEvent) {
        e.stopPropagation();
        this.emit('confirm');
        this.close()
    }
    onCancel(e: React.MouseEvent) {
        e.stopPropagation();
        this.emit('cancel');
        this.close()
    }
    render() {
        return this.visible && <div className='shy-confirm-box' style={{ zIndex: tipLayer.zoom(this) }}>
            <div className='shy-confirm-mask' onMouseDown={e => this.onCancel(e)}></div>
            <div className='shy-confirm'>
                <div className='shy-confirm-msg'>{this.msg}</div>
                {this.description && <div className='syh-confirm-description'>{this.description}</div>}
                <div className='syh-confirm-buttons' style={{ marginTop: 20 }}>
                    <Space align="center">
                        <Button onClick={e => this.onConfirm(e)}>{this.continueButton || <S>确定</S>}</Button>
                        <Button onClick={e => this.onCancel(e)} ghost>{this.cancelButton || <S>取消</S>}</Button>
                    </Space>
                </div>
            </div>
        </div>
    }
}
var syConfirm: SyConfirm;
export async function Confirm(msg: string, description?: string, continueButton?: string, cancelButton?: string) {
    syConfirm = await Singleton(SyConfirm);
    syConfirm.open(msg, description, continueButton, cancelButton);
    return new Promise((resolve, reject) => {
        syConfirm.only('confirm', () => resolve(true))
        syConfirm.only('cancel', () => resolve(false))
    })
}