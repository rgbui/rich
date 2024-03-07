import React from "react";
import { util } from "../../util/util";
import { Flow } from ".";
import { DragHandleSvg, DotsSvg, DuplicateSvg, TrashSvg, ArrowUpSvg, ArrowDownSvg, PlusSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Tip } from "../../component/view/tooltip/tip";
import lodash from "lodash";
import { useSelectMenuItem } from "../../component/view/menu";
import { Rect } from "../common/vector/point";
import { MenuItemType } from "../../component/view/menu/declare";
import { lst } from "../../i18n/store";
import { FlowCommandFactory } from "./factory/block.factory";

/***
 * 
 * 有那些实用的command
 * insert blocks
 * open page
 * open editPage where 
 * export database
 * select records open editPage batch handle
 * select records delete
 * confirm
 * alert
 * 
 * if else
 * 
 * ai write prompt
 * 
 * ai gen image prompt
 * 
 */

export class FlowCommand {
    id: string = util.guid();
    url: string;
    flow: Flow;
    parent?: FlowCommand;
    async load(data) {
        for (let n in data) {
            this[n] = data[n]
        }
    }
    async get() {
        var json: Record<string, any> = {};
        json.id = this.id;
        json.url = this.url;
        return json;
    }
    async clone() {
        var json: Record<string, any> = {};
        json.url = this.url;
        return json;
    }
    async onUpdateProps(props: Record<string, any>) {
        lodash.assign(this, props);
        if (this.view) this.view.forceUpdate();
    }
    async onOpenProperty(event: React.MouseEvent) {
        var rect = Rect.fromEle(event.currentTarget as HTMLElement);
        var r = await useSelectMenuItem({ roundArea: rect },
            [
                { icon: ArrowUpSvg, text: lst('移到上一步'), name: 'above' },
                { icon: ArrowDownSvg, text: lst('移到下一步'), name: 'below' },
                { type: MenuItemType.divide },
                { name: 'add', icon: PlusSvg, text: lst('添加下一步') },
                { type: MenuItemType.divide },
                { name: 'clone', icon: DuplicateSvg, text: lst('复制') },
                { type: MenuItemType.divide },
                { name: 'trash', icon: TrashSvg, text: lst('删除') }
            ]
        );
        if (r) {
            switch (r.item.name) {
                case 'above':
                    var at = this.flow.commands.indexOf(this);
                    if (at > 0) {
                        this.flow.commands.splice(at, 1);
                        this.flow.commands.splice(at - 1, 0, this);
                        if (this.flow.view)
                            this.flow.view.forceUpdate()
                        await this.flow.view.onChange();
                    }
                    break;
                case 'below':
                    var at = this.flow.commands.indexOf(this);
                    if (at < this.flow.commands.length - 1) {
                        this.flow.commands.splice(at, 1);
                        this.flow.commands.splice(at + 1, 0, this);
                        if (this.flow.view)
                            this.flow.view.forceUpdate()
                        await this.flow.view.onChange();
                    }
                    break;
                case 'clone':
                    var d = await this.clone();
                    var at = this.flow.commands.indexOf(this);
                    var nc = await FlowCommandFactory.createCommand(d.url, this.flow, d);
                    this.flow.commands.splice(at + 1, 0, nc);
                    if (this.flow.view) this.flow.view.forceUpdate()
                    await this.flow.view.onChange();
                    break;
                case 'trash':
                    var at = this.flow.commands.indexOf(this);
                    this.flow.commands.splice(at, 1);
                    if (this.flow.view) this.flow.view.forceUpdate();
                    await this.flow.view.onChange();
                    break;
                case 'add':
                    await this.flow.openAddStep(rect, this.flow.commands.indexOf(this) + 1);
                    break;
            }
        }
    }
    async excute(): Promise<boolean | void> {

    }
    view: FlowCommandView<any>
}

export abstract class FlowCommandView<T extends FlowCommand> extends React.Component<{
    command: T
}> {
    constructor(props) {
        super(props)
        this.props.command.view = this;
    }
    renderHead(icon: React.ReactNode, title: React.ReactNode) {
        return <div className="flex gap-b-5 text-1">
            <div className="flex-fixed flex">
                <Tip text='拖动它'><span className="hover-toggle drag flex-center size-24 item-hover round cursor">
                    <Icon size={16} icon={DragHandleSvg}></Icon>{icon}
                </span>
                </Tip>
            </div>
            <div className="flex-auto flex">
                {title}
            </div>
            <div className="flex-fixed size-24 flex-center round item-hover cursor" onMouseDown={e => this.command.onOpenProperty(e)}><Icon icon={DotsSvg} size={20}></Icon></div>
        </div>
    }
    render(): React.ReactNode {
        return <div className="bg-white round border padding-10 gap-b-10">
            {this.renderView()}
        </div>
    }
    get command() {
        return this.props.command;
    }
    abstract renderView(): React.ReactNode;
}