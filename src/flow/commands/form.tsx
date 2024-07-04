
import React from "react";
import { S } from "../../../i18n/view";
import { FlowCommand, FlowCommandView } from "../command";
import { flow, flowView } from "../factory/observable";
import { Icon } from "../../../component/view/icon";
import { ShyAlert } from "../../../component/lib/alert";
import { lst } from "../../../i18n/store";

@flow('/form/submit')
export class ConfirmCommand extends FlowCommand {
    constructor() {
        super();
    }
    async excute() {
        if (this.flow.buttonBlock) {
            var page = this.flow.buttonBlock.page;
            await page.onSubmitForm();
            if (page.openSource == 'dialog' || page.openSource == 'slide')
                await page.onPageClose();
            else {
                ShyAlert(lst('数据已保存'))
            }
        }
    }
}

@flowView('/form/submit')
export class ConfirmCommandView extends FlowCommandView<ConfirmCommand> {
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={{ name: 'bytedance-icon', code: 'form-one' }}></Icon>,
                <><S>表单提交</S></>)}
        </div>
    }
}
