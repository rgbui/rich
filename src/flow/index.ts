import lodash from "lodash";
import { util } from "../../util/util";
import { FlowCommand } from "./command";
import { FlowCommandFactory } from "./factory/block.factory";
import { LinkWs } from "../page/declare";
import { Block } from "../block";
import { FlowView } from "./view";
import { DuplicateSvg, Edit1Svg, LinkSvg } from "../../component/svgs";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { Rect } from "../common/vector/point";
import { lst } from "../../i18n/store";
import "./declare";
import { ElementType } from "../../net/element.type";

export class Flow {
    ws: LinkWs;
    view: FlowView;
    buttonBlock: Block;
    id: string = util.guid()
    creater: string;
    commands: FlowCommand[] = [];
    sitcom: 'button' | 'channel_bot' = 'button'
    constructor(button: Block, ws: LinkWs) {
        this.buttonBlock = button;
        this.ws = ws;
    }
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
    async clone() {
        var flow: Flow = new Flow(this.buttonBlock, this.ws);
        await flow.load(await this.get());
        return flow;
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
            { text: lst('插入块'), value: '/insertBlocks', icon: DuplicateSvg },
            { type: MenuItemType.divide },
            { text: lst('添加记录至数据表'), value: '/addRecords', icon: { name: 'byte', code: 'add' } },
            { text: lst('编辑记录至数据表'), value: '/editRecords', icon: Edit1Svg },
            { type: MenuItemType.divide },
            { text: lst('确认继续'), value: '/confirm', icon: { name: 'bytedance-icon', code: 'help' } },
            { type: MenuItemType.divide },
            { text: lst('打开页面'), value: '/openPage', icon: { name: 'bytedance-icon', code: 'arrow-right-up' } },
            { text: lst('页面跳转'), value: '/openPage/url', icon: LinkSvg },
            { text: lst('表单提交'), value: '/form/submit', icon: { name: 'bytedance-icon', code: 'form-one' }, visible: [ElementType.SchemaRecordView].includes(this.buttonBlock.page.pe.type) && this.buttonBlock.page.isForm('doc-add') ? true : false },
            { type: MenuItemType.divide },
            { text: lst('支付'), value: '/pay', icon: { name: 'bytedance-icon', code: 'paper-money' } },
        ]);
        if (r) {
            var data: Record<string, any> = {};
            if (r.item.value == '/insertBlocks') {
                data.block = { url: '/template' }
            }
            if (typeof at == 'undefined') at = this.commands.length;
            this.commands.splice(at, 0, await FlowCommandFactory.createCommand(r.item.value, this, data));
            this.view.forceUpdate()
            await this.view.onChange();
        }
    }
}