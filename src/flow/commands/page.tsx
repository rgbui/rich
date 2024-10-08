
import React from "react";
import { S, Sp } from "../../../i18n/view";
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
import { GridPageDialougSvg, GridPagePageSvg, GridPageSlideSvg, LinkSvg } from "../../../component/svgs";
import { Input } from "../../../component/view/input";
import { PageLayoutType, getPageIcon, getPageText } from "../../page/declare";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { util } from "../../../util/util";
import { ShyAlert } from "../../../component/lib/alert";

@flow('/openPage')
export class OpenPageCommand extends FlowCommand {
    pageId: string = '';
    pageIcon: IconArguments;
    pageText: string = '';
    pageType: PageLayoutType;
    openSource: 'page' | 'slide' | 'dialog' = 'page';
    async get() {
        var json = await super.get();
        json.pageId = this.pageId;
        json.pageIcon = this.pageIcon;
        json.pageText = this.pageText;
        json.pageType = this.pageType;
        return json;
    }
    async clone() {
        var json = await super.clone();
        json.pageId = this.pageId;
        json.pageIcon = this.pageIcon;
        json.pageText = this.pageText;
        json.pageType = this.pageType;
        return json;
    }
    async excute() {
        await channel.act('/page/open', { item: this.pageId })
    }
}

@flowView('/openPage')
export class OpenPageCommandView extends FlowCommandView<OpenPageCommand> {
    componentDidMount() {
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
            if (r.data.item?.pageType != this.command.pageType) {
                this.command.pageType = r.data.item?.pageType;
                isUpdate = true;
            }
            if (isUpdate) this.forceUpdate()
        }
    }
    async openSelectPage(event: React.MouseEvent) {
        event.stopPropagation();
        var r = await useSelectWorkspacePage({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        });
        if (r) {
            this.command.pageId = r.id;
            this.command.pageIcon = r.icon;
            this.command.pageText = r.text;
            this.command.pageType = r.pageType;
            this.forceUpdate();
        }
    }
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={{ name: 'bytedance-icon', code: 'arrow-right-up' }}></Icon>,
                <><S>打开页面</S><span onMouseDown={e => this.openSelectPage(e)} className="gap-w-3 padding-w-5 cursor item-hover  remark  round flex ">
                    {this.command.pageId ? <>
                        <Icon icon={getPageIcon({ icon: this.command.pageIcon, pageType: this.command.pageType })}></Icon>
                        {getPageText({
                            text: this.command.pageText,
                            pageType: this.command.pageType
                        })}
                    </> : <span className="link"><S>选择页面</S></span>}
                </span>
                    <Sp className={'flex'} text=',以{box}方式打开' view={{
                        box: <SelectBox hover className={'flex-fixed'} onChange={e => this.command.onUpdateProps({ openSource: e })} value={this.command.openSource} options={[
                            { text: lst('对话框'), value: 'dialog', icon: GridPageDialougSvg, iconSize: 18 },
                            { text: lst('右侧栏'), value: 'slide', icon: GridPageSlideSvg, iconSize: 18 },
                            { text: lst('页面'), value: 'page', icon: GridPagePageSvg, iconSize: 18 },
                        ]}></SelectBox>
                    }} >以方式打开</Sp>
                </>)}
            <div>
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
        if (this.pageUrl) {
            if (this.pageUrl.startsWith('{')) {
                var name = this.pageUrl.substring(1, this.pageUrl.length - 1);
                var fe = this.page.schema.fields.find(g => g.text == name);
                if (fe) {
                    if (fe.type == FieldType.link) {
                        var url = this.page.formRowData[fe.name];
                        if (url) this.pageUrl = url;
                    }
                    else if (fe.type == FieldType.phone) {
                        var phone = this.page.formRowData[fe.name];
                        if (phone) this.pageUrl = 'tel:' + phone;
                    }
                    else if (fe.type == FieldType.email) {
                        var email = this.page.formRowData[fe.name];
                        if (email) this.pageUrl = 'mailto:' + email;
                    }
                    else if (fe.type == FieldType.image || fe.type == FieldType.video || fe.type == FieldType.audio) {
                        var files = this.page.formRowData[fe.name];
                        if (files) {
                            var file = Array.isArray(files) ? files[0] : files;
                            if (file.url) {
                                this.pageUrl = file.url;
                            }
                        }
                    }
                    else if (fe.type == FieldType.file) {
                        var files = this.page.formRowData[fe.name];
                        if (files) {
                            var file = Array.isArray(files) ? files[0] : files;
                            if (file.url) {
                                this.pageUrl = file.url;
                                util.downloadFile(file.url, file.name);
                                return;
                            }
                        }
                    }
                }
            }
            if (this.pageUrl) {
                if (this.target == '_blank') window.open(this.pageUrl, '_blank')
                else window.location.href = this.pageUrl;
            }
            else ShyAlert(lst('网址为空'));
        }
    }
}

@flowView('/openPage/url')
export class OpenPageUrlCommandView extends FlowCommandView<OpenPageUrlCommand> {
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={LinkSvg}></Icon>,
                <><S>打开网址</S>
                </>)}
            <div className="r-gap-h-10">
                <div>
                    <div className="f-12 remark gap-b-3"><S>网址</S></div>
                    <Input value={this.command.pageUrl} onEnter={e => {
                        this.command.onUpdateProps({ pageUrl: e })
                    }} onChange={e => { this.command.onUpdateProps({ pageUrl: e }) }}></Input>
                </div>
                <div>
                    <div className="f-12 remark gap-b-3"><S>跳转</S></div>
                    <SelectBox border bg
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
