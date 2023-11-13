
import React from "react";
import { S } from "../../../i18n/view";
import { FlowCommand, FlowCommandView } from "../command";
import { flow, flowView } from "../factory/observable";
import { Icon } from "../../../component/view/icon";
import { IconArguments } from "../../../extensions/icon/declare";
import { useSelectWorkspacePage } from "../../../extensions/link/select";
import { Rect } from "../../common/vector/point";
import { channel } from "../../../net/channel";
import lodash from "lodash";
import { SelectBox } from "../../../component/view/select/box";
import { lst } from "../../../i18n/store";
import { LinkSvg } from "../../../component/svgs";
import { Input } from "../../../component/view/input";

@flow('/openPage')
export class OpenPageCommand extends FlowCommand {
    pageId: string = '';
    pageIcon: IconArguments;
    pageText: string = '';
    openSource: 'page' | 'slide' | 'dialog' = 'page';
    async get() {
        var json = await super.get();
        json.pageId = this.pageId;
        json.pageIcon = this.pageIcon;
        json.pageText = this.pageText;
        return json;
    }
    async clone() {
        var json = await super.clone();
        json.pageId = this.pageId;
        json.pageIcon = this.pageIcon;
        json.pageText = this.pageText;
        return json;
    }
    async excute() {
        await channel.air('/page/open', { item: this.pageId })
    }
}

@flowView('/openPage')
export class OpenPageCommandView extends FlowCommandView<OpenPageCommand> {
    componentDidMount(): void {
        this.load();
    }
    async load() {
        var r = await channel.get('/page/item', { id: this.command.pageId });
        if (r.ok) {
            var isUpdate = false;
            if (r.data.item?.text != this.command.pageText) {
                this.command.pageText = r.data.item?.text;
                isUpdate = true;
            }
            if (lodash.isEqual(r.data.item?.icon, this.command.pageIcon) == false) {
                this.command.pageIcon = lodash.cloneDeep(r.data.item?.icon);
                isUpdate = true;
            }
            if (isUpdate) this.forceUpdate()
        }
    }
    async openSelectPage(event: React.MouseEvent) {
        var r = await useSelectWorkspacePage({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        });
        if (r) {
            this.command.pageId = r.id;
            this.command.pageIcon = r.icon;
            this.command.pageText = r.text;
            this.forceUpdate();
        }
    }
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={{ name: 'bytedance-icon', code: 'arrow-right-up' }}></Icon>,
                <><S>打开页面</S><span onMouseDown={e => this.openSelectPage(e)} className="item-hover  remark  round ">{this.command.pageText || <S>选择页面</S>}</span>
                </>)}
            <div>
                <div className="flex">
                    <span className="flex-auto gap-l-10"><S>打开方式</S></span>
                    <SelectBox className={'flex-fixed item-hover remark round padding-l-5'} onChange={e => this.command.onUpdateProps({ openSource: e })} value={this.command.openSource} options={[
                        { text: lst('页面打开'), value: 'page' },
                        { text: lst('对话框打开'), value: 'dialog' },
                        { text: lst('侧边栏打开'), value: 'slide' }
                    ]}></SelectBox>
                </div>
            </div>
        </div>
    }
}

@flow('/openPage/url')
export class OpenPageUrlCommand extends FlowCommand {
    pageUrl: string = '';
    target: '_blank' | '_self' = '_blank';
    async get() {
        var json = await super.get();
        json.pageUrl = this.pageUrl;
        json.target = this.target;
        return json;
    }
    async clone() {
        var json = await super.clone();
        json.pageUrl = this.pageUrl;
        json.target = this.target;
        return json;
    }
    async excute() {
        if (this.target == '_blank') window.open(this.pageUrl, '_blank')
        else window.location.href = this.pageUrl;
    }
}

@flowView('/openPage/url')
export class OpenPageUrlCommandView extends FlowCommandView<OpenPageUrlCommand>{
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={LinkSvg}></Icon>,
                <><S>打开网址</S>
                </>)}
            <div>
                <div className="flex">
                    <span className="flex-auto gap-l-10"><S>网址</S></span>
                    <div className="flex-fixed  round padding-l-5">
                        <Input value={this.command.pageUrl} onEnter={e => {
                            this.command.onUpdateProps({ pageUrl: e })
                        }} onChange={e => { this.command.onUpdateProps({ pageUrl: e }) }}></Input>
                    </div>
                </div>
                <div className="flex gap-h-10">
                    <span className="flex-auto gap-l-10"><S>跳转</S></span>
                    <SelectBox className={'flex-fixed item-hover remark round padding-l-5'}
                        onChange={e => this.command.onUpdateProps({ target: e })}
                        value={this.command.target} options={[
                            { text: lst('新窗口'), value: '_blank' },
                            { text: lst('当前窗口'), value: '_self' }
                        ]}></SelectBox>
                </div>
            </div>
        </div>
    }
}