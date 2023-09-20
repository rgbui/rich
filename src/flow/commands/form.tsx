
import React from "react";
import { S } from "../../../i18n/view";
import { FlowCommand, FlowCommandView } from "../command";
import { flow, flowView } from "../factory/observable";
import { Icon } from "../../../component/view/icon";

@flow('/form/submit')
export class ConfirmCommand extends FlowCommand {
    constructor() {
        super();
    }
    async excute() {
        if (this.flow.buttonBlock) {
            await this.flow.buttonBlock.page.onSubmitForm({ isClose: true });
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
