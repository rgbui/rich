import React from "react";
import { FlowCommand, FlowCommandView } from "../command";
import { flow, flowView } from "../factory/observable";
import { S } from "../../../i18n/view";
import { Icon } from "../../../component/view/icon";
import { lst } from "../../../i18n/store";
import { Textarea } from "../../../component/view/input/textarea";
import { Input } from "../../../component/view/input";
import { Confirm } from "../../../component/lib/confirm";

@flow('/confirm')
export class ConfirmCommand extends FlowCommand {
    constructor() {
        super();
        this.confirmMessage = lst('确认继续吗？');
        this.continueButtonMessage = lst('继续');
        this.cancelButtonMessage = lst('取消');
    }
    confirmMessage: string = '';
    continueButtonMessage: string = ''
    cancelButtonMessage: string = '';
    async get() {
        var json: Record<string, any> = {};
        json.id = this.id;
        json.url = this.url;
        json.confirmMessage = this.confirmMessage;
        json.continueButtonMessage = this.continueButtonMessage;
        json.cancelButtonMessage = this.cancelButtonMessage;
        return json;
    }
    async clone() {
        var json: Record<string, any> = {};
        json.url = this.url;
        json.confirmMessage = this.confirmMessage;
        json.continueButtonMessage = this.continueButtonMessage;
        json.cancelButtonMessage = this.cancelButtonMessage;
        return json;
    }
    async excute() {
        if (!await Confirm(this.confirmMessage,'', this.continueButtonMessage, this.cancelButtonMessage)) {
            return false;
        }
    }
}

@flowView('/confirm')
export class ConfirmCommandView extends FlowCommandView<ConfirmCommand> {
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={{ name: 'bytedance-icon', code: 'helpcenter' }}></Icon>,
                <><S>显示确认框</S>
                </>)}
            <div className="r-gap-h-10">
                <div><Textarea value={this.command.confirmMessage}
                    onChange={e => this.command.onUpdateProps({ confirmMessage: e })
                    }></Textarea></div>
                <div><Input value={this.command.continueButtonMessage}
                    onChange={e => this.command.onUpdateProps({ continueButtonMessage: e })}></Input></div>
                <div><Input value={this.command.cancelButtonMessage}
                    onChange={e => this.command.onUpdateProps({ cancelButtonMessage: e })}></Input></div>
            </div>
        </div>
    }
}



@flow('/alert')
export class AlertCommand extends FlowCommand {
    constructor() {
        super();
        this.alertMessage = lst('操作成功');
    }
    alertMessage: string = '';
}

@flowView('/alert')
export class AlertCommandView extends FlowCommandView<AlertCommand> {
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={{ name: 'bytedance-icon', code: 'helpcenter' }}></Icon>,
                <><S>警告提示框</S></>)}
            <div>
                <div><Textarea value={this.command.alertMessage}
                    onChange={e => this.command.onUpdateProps({ confirmMessage: e })
                    }></Textarea>
                </div>
            </div>
        </div>
    }
}