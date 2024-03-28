import React from "react";
import { FlowCommand, FlowCommandView } from "../command";
import { flow, flowView } from "../factory/observable";
import { DuplicateSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { S } from "../../../i18n/view";
import { SelectBox } from "../../../component/view/select/box";
import { lst } from "../../../i18n/store";
import { Block } from "../../block";
import { BlockFactory } from "../../block/factory/block.factory";
import { BlockChildKey, BlockUrlConstant } from "../../block/constant";
import { PageBlockUtil } from "../../page/common/util";
import dayjs from "dayjs";
import { channel } from "../../../net/channel";
import { getPageText } from "../../page/declare";
import weekOfYear from "dayjs/plugin/weekOfYear"
import { HelpText } from "../../../component/view/text";
import { PageLink } from "../../../extensions/link/declare";
dayjs.extend(weekOfYear);

@flow('/insertBlocks')
export class InsertBlocksCommand extends FlowCommand {
    direction: 'above' | 'below' = 'below';
    block: Block = null;
    async load(data) {
        for (let n in data) {
            if (n == 'block') {
                if (data[n] == null) this.block = null;
                else {
                    var nb = await BlockFactory.createBlock(data[n].url, this.flow.buttonBlock.page, data[n], this.flow.buttonBlock);
                    this.block = nb;
                    this.flow.buttonBlock.childs.push(nb);
                }
            }
            else this[n] = data[n]
        }
    }
    async get() {
        var json: Record<string, any> = {};
        json.id = this.id;
        json.url = this.url;
        json.direction = this.direction;
        if (this.block) json.block = await this.block.get();
        else json.block = null;
        return json;
    }
    async clone() {
        var json: Record<string, any> = {};
        json.url = this.url;
        json.direction = this.direction;
        if (this.block) json.block = await this.block.clone();
        else json.block = null;
        return json;
    }
    async excute() {
        var bs = await this.block.blocks.childs.asyncMap(async (block) => await block.cloneData({ isButtonTemplate: true }));
        await this.setVar(bs);
        var at = this.flow.buttonBlock.at;
        var newBlocks = await this.flow.buttonBlock.parent.appendArrayBlockData(bs, at + 1, this.flow.buttonBlock.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
        await PageBlockUtil.eachBlockDatas(newBlocks, async (block: Block) => {
            if (block.url == BlockUrlConstant.Link) {
                var la = await (block as any).getLink() as PageLink;
                if (la?.pageId) {
                    var r = await channel.post('/clone/page', {
                        pageId: la?.pageId,
                        parentId: this.block.page.pageInfo?.id,
                        text: block.content
                    });
                    if (r?.data?.items?.length > 0) {
                        await block.updateProps({ pageId: r.data.items[0].id });
                    }
                }
            }
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
                        var lb = await b.getLink() as PageLink;
                        if (lb?.pageId) {
                            var r = await channel.get('/page/query/info', { id: lb?.pageId });
                            b.content = getPageText(r.data);
                        }
                    }
                    b.content = getC(b.content)
                }
            }
        }
        await setb(bs);
    }
}

@flowView('/insertBlocks')
export class InsertBlocksCommandView extends FlowCommandView<InsertBlocksCommand> {
    renderView() {
        var self = this;
        return <div>
            {this.renderHead(<Icon size={16} icon={DuplicateSvg}></Icon>,
                <><S>插入块至</S><div className="flex max-w-120 remark gap-l-5 padding-w-5 item-hover round"><SelectBox
                    iconHidden
                    small
                    onChange={e => this.command.onUpdateProps({ direction: e })}
                    value={this.command.direction}
                    options={[
                        { icon: { name: 'bytedance-icon', code: 'up-one' }, text: lst('按钮上面'), value: 'above' },
                        { icon: { name: 'bytedance-icon', code: 'down-one' }, text: lst('按钮下面'), value: 'below' }
                    ]
                    }></SelectBox></div>
                    <HelpText url={window.shyConfig.isUS ? "https://help.shy.live/page/1831#84fR6G8fevzTjHf56tZnJ9" : "https://help.shy.live/page/1831#84fR6G8fevzTjHf56tZnJ9"}><S>模板变量</S></HelpText>
                </>)}
            <div className="round border bg-white">
                {self.command.block && <self.command.block.viewComponent block={self.command.block}></self.command.block.viewComponent >}
            </div>
        </div>
    }
}