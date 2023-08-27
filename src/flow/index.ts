import lodash from "lodash";
import { util } from "../../util/util";
import { FlowCommand } from "./command";
import "./declare";
import { FlowCommandFactory } from "./factory/block.factory";
import { LinkWs } from "../page/declare";
import { channel } from "../../net/channel";
import { Block } from "../block";
import { FlowView } from "./view";
import { DuplicateSvg, PlusSvg, Edit1Svg } from "../../component/svgs";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { Rect } from "../common/vector/point";

export class Flow {
    ws: LinkWs;
    view: FlowView;
    buttonBlock: Block;
    id: string = util.guid()
    creater: string;
    commands: FlowCommand[] = [];
    sitcom: 'button' | 'channel_bot' = 'button'
    async load(data) {
        for (let n in data) {
            if (n == 'commands') {
                for (let cmd of data[n]) {
                    let command = await FlowCommandFactory.createCommand(cmd.url, this, cmd);
                    this.commands.push(command)
                }
            }
            else this[n] = lodash.cloneDeep(data[n])
        }
    }
    async loadFlow() {
        var r = await channel.get('/ws/flow/get', { flowId: this.id, ws: this.ws });
        if (r.ok) {
            await this.load(r.data.flow);
        }
    }
    async saveFlow() {
        var r = await channel.put('/ws/flow', {
            ws: this.ws,
            flow: await this.get()
        });
        if (r.ok) {

        }
    }
    async get() {
        var json: Record<string, any> = {
            id: this.id,
            creater: this.creater,
            commands: await this.commands.asyncMap(async cmd => {
                return await cmd.get()
            }),
            sitcom: this.sitcom
        };
        return json;
    }
    async run() {
        await this.buttonBlock.page.onAction('FlowRun', async () => {
            for (let c of this.commands) {
                var r = await c.excute();
                if (r === false) break;
            }
        })
    }
    async openAddStep(event: React.MouseEvent | Rect, at?: number) {
        var r = await useSelectMenuItem({
            roundArea: event instanceof Rect ? event : Rect.fromEle(event.currentTarget as HTMLElement)
        }, [
            { text: '插入块', value: '/insertBlocks', icon: DuplicateSvg },
            { type: MenuItemType.divide },
            { text: '添加记录至数据表', value: '/addRecords', icon: PlusSvg },
            { text: '编辑记录至数据表', value: '/editRecords', icon: Edit1Svg },
            // { text: '批量选择记录编辑', value: '/batchEditRecords' },
            // { text: '批量选择记录删除', value: '/batchDeleteRecords' },
            { type: MenuItemType.divide },
            { text: '确认继续', value: '/confirm', icon: { name: 'bytedance-icon', code: 'help' } },
            { type: MenuItemType.divide },
            { text: '打开页面', value: '/openPage', icon: { name: 'bytedance-icon', code: 'arrow-right-up' } }
        ]);
        if (r) {
            var data: Record<string, any> = {};
            if (r.item.value == '/insertBlocks') {
                data.block = { url: '/template' }
            }
            if (typeof at == 'undefined') at = this.commands.length;
            this.commands.splice(at, 0, await FlowCommandFactory.createCommand(r.item.value, this, data));
            this.view.forceUpdate()
        }
    }
}