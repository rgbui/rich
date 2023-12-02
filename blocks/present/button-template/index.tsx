import { Block } from "../../../src/block";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ChildsArea } from "../../../src/block/view/appear";
import { TextTurns } from "../../../src/block/turn/text";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { Divider } from "../../../component/view/grid";
import { PlusSvg, SettingsSvg } from "../../../component/svgs";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { ActionDirective } from "../../../src/history/declare";
import { BlockChildKey, BlockUrlConstant } from "../../../src/block/constant";
import { Input } from "../../../component/view/input";
import { GridMap } from "../../../src/page/grid";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear"
dayjs.extend(weekOfYear);
import { channel } from "../../../net/channel";
import { PageBlockUtil } from "../../../src/page/common/util";
import { getPageText } from "../../../src/page/declare";
import { Rect } from "../../../src/common/vector/point";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import "./style.less";

@url('/button/template')
export class ButtonTemplate extends Block {
    blocks: { childs: Block[] } = { childs: [] };
    expand: boolean = false;
    @prop()
    content = '添加待办事项';
    display = BlockDisplay.block;
    init() {
        this.gridMap = new GridMap(this)
    }
    get isPanel() {
        if (this.expand == true) return true;
        else return false;
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    async onGetTurnUrls() {
        return [];
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    async addTemplateInstance(event: React.MouseEvent) {
        if (!this.isCanEdit()) {
            return
        }
        var bs = await this.blocks.childs.asyncMap(async (block) => await block.cloneData({ isButtonTemplate: true }));
        await this.setVar(bs);
        await this.page.onAction(ActionDirective.onButtonTemplateCreateInstance, async () => {
            var at = this.at;
            var newBlocks = await this.parent.appendArrayBlockData(bs, at + 1, this.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
            await PageBlockUtil.eachBlockDatas(newBlocks, async (block: Block) => {
                if (block.url == BlockUrlConstant.Link) {
                    var r = await channel.post('/clone/page', {
                        pageId: (block as any).pageId,
                        parentId: this.page.pageInfo?.id,
                        text: block.content
                    });
                    if (r?.data?.items?.length > 0) {
                        await block.updateProps({ pageId: r.data.items[0].id });
                    }
                }
            })
            this.page.addUpdateEvent(async () => {
                this.page.kit.anchorCursor.onSelectBlocks(newBlocks, { merge: true, render: true })
            })
        })
    }
    private async setVar(bs) {
        var now = new Date();
        var user = channel.query('/query/current/user')
        function getC(c) {
            var maps = [
                { names: ['%DATE%', '%日期%'], value: dayjs().format('YYYY/MM/DD') },
                { names: ['%TOMORROW%', '%明天%'], value: dayjs().add(1, 'day').format('YYYY/MM/DD') },
                { names: ['%YESTERDAY%', '%昨天%'], value: dayjs().subtract(1, 'day').format('YYYY/MM/DD') },
                { names: ['%TIME%', '%时间%'], value: dayjs().format('HH:mm') },
                { names: ['%YEAR%', '%年%'], value: now.getFullYear() },

                { names: [`%MONTH%`, `%月%`], value: now.getMonth() + 1 },
                { names: [`%MONTH2%`, `%月2%`], value: (now.getMonth() + 1).toString().padStart(2, '0') },
                { names: [`%DAY%`, `%日%`], value: now.getDate() },
                { names: [`%DAY2%`, `%日2%`], value: (now.getDate().toString()).padStart(2, '0') },
                { names: [`%HOUR%`, `%小时%`], value: now.getHours() },
                { names: [`%HOUR2%`, `%小时2%`], value: now.getHours().toString().padStart(2, '0') },
                { names: [`%MINUTE%`, `%分钟%`], value: now.getMinutes() },
                { names: [`%MINUTE2%`, `%分钟2%`], value: now.getMinutes().toString().padStart(2, '0') },
                { names: [`%SECOND%`, `%秒%`], value: now.getSeconds().toString() },
                { names: [`%SECOND2%`, `%秒2%`], value: now.getSeconds().toString().padStart(2, '0') },
                { names: [`%DAYOFWEEK%`, `%星期%`], value: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()] },
                { names: [`%DAYOFWEEK2%`, `%星期2%`], value: now.getDay() == 0 ? 7 : now.getDay() },
                { names: [`%WEEK%`, `%周%`], value: dayjs().week() },
                { names: [`%WEEK2%`, `%周2%`], value: (dayjs().week().toString()).padStart(2, '0') },
                { names: [`%NEXTWEEK%`, `%下周%`], value: dayjs().add(1, 'week').week() },
                { names: [`%NEXTWEEK2%`, `%下周2%`], value: dayjs().add(1, 'week').week().toString().padStart(2, '0') },
                { names: [`%QUARTER%`, `%季度%`], value: Math.ceil((now.getMonth() + 1) / 3) },
                { names: [`%NEXTQUARTER%`, `%下季度%`], value: (Math.ceil((now.getMonth()) / 3) + 1) > 4 ? 1 : (Math.ceil((now.getMonth()) / 3) + 1) },
                { names: [`%ME%`, `%我%`], value: user.name },
            ]
            for (let i = 0; i < maps.length; i++) {
                var mp = maps[i];
                mp.names.forEach(n => {
                    c = c.replace(new RegExp(n, 'g'), mp.value);
                })
            }
            return c;
        }
        async function setb(bs) {
            for (let i = 0; i < bs.length; i++) {
                const b = bs[i];
                if (b.blocks)
                    for (let n in b.blocks) {
                        await setb(b.blocks[n]);
                    }
                if (typeof b.content == 'string') {
                    if (b.url == BlockUrlConstant.Link) {
                        var r = await channel.get('/page/query/info', { id: b.pageId });
                        b.content = getPageText(r.data);
                    }
                    b.content = getC(b.content)
                }
            }
        }
        await setb(bs);
    }
    get isSupportTextStyle(): boolean {
        return false;
    }
    async openSettings() {
        this.expand = !this.expand;
        this.view.forceUpdate()
    }
    async onSave() {
        this.onUpdateProps({ expand: false }, { range: BlockRenderRange.self })
    }
    async didMounted(): Promise<void> {
        if (this.blocks.childs.length == 0) {
            this.initButtonTemplate();
        }
    }
    async initButtonTemplate() {
        this.blocks.childs.push(await BlockFactory.createBlock('/todo', this.page, { content: lst('待办') }, this));
    }
    getVisiblePanelBound() {
        if (this.expand && (this.view as any).templatePanel) {
            var t = (this.view as any).templatePanel as HTMLElement;
            return Rect.fromEle(t)
        }
        return null;
    }
}

@view('/button/template')
export class ButtonTemplateView extends BlockView<ButtonTemplate>{
    templatePanel: HTMLElement = null;
    renderTemplate() {
        if (this.block.expand != true) return <></>;
        return <div className="sy-button-template-box">
            <div className="sy-button-template-box-head">
                <span><S>编辑模板按钮</S></span>
                <Button onClick={e => this.block.onSave()}><S>保存</S></Button>
            </div>
            <Divider></Divider>
            <div className="sy-button-template-box-label"><S>模板名称</S></div>
            <div className="sy-button-template-box-title" onMouseDown={e => e.stopPropagation()}>
                <Input value={this.block.content || lst('添加待办事项')} placeholder={lst('添加待办事项')} onChange={e => this.block.onLazyUpdateProps({ content: e }, { range: BlockRenderRange.self })}></Input>
            </div>
            <Divider></Divider>
            <div className="sy-button-template-box-label"><S>模板内容</S></div>
            <div ref={e => this.templatePanel = e} className="sy-button-template-box-content min-h-30">
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
            </div>
        </div>
    }
    renderView() {
        return <div style={this.block.visibleStyle}><div className='sy-button-template' >
            <div className='sy-button-template-wrapper' onMouseDown={e => e.stopPropagation()} >
                <a className="sy-button-template-btn flex" onMouseDown={e => { this.block.addTemplateInstance(e) }}><Icon size={18} icon={PlusSvg}></Icon><span>{this.block.content || lst('添加待办事项')}</span></a>
                {this.block.isCanEdit() && <div className='sy-button-template-operator size-24 flex-center item-hover round cursor'><Icon size={16} onMousedown={e => this.block.openSettings()} icon={SettingsSvg}></Icon></div>}
            </div>
            {this.block.expand == true && this.renderTemplate()}
        </div></div>
    }
}