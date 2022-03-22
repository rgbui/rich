import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import { BoardRefreshSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { MeasureView } from "../../component/view/progress";
import { Select } from "../../component/view/select";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import { Block } from "../../src/block";
import { Point } from "../../src/common/vector/point";
import { Polygon } from "../../src/common/vector/polygon";
import { BackgroundColor } from "./background";
import { ShapeFill } from "./fill";
import { FontColor } from "./fontColor";
import { FrameScale } from "./frame.scale";
import { LineArrow, LineTypes } from "./line.arrow";
import { TurnShapes } from "./shapes";
import { ShapeStroke } from "./stroke";
import "./style.less";

class BoardEditTool extends EventsComponent {
    render(): ReactNode {
        if (this.visible != true) return <></>;
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        };
        var self = this;
        function getValue(name: string) {
            var command = self.commands.find(g => g.name == name);
            if (command) return command.value;
        }
        function is(name: string) {
            return self.commands.some(s => s.name == name);
        }
        return <div style={style} className="shy-board-edit-tool">
            {is('frameScale') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item'} >
                    <FrameScale></FrameScale>
                </div>
            </Tip>}
            {is('lineStart') && <><Tip overlay={'开始箭头'}>
                <div className={'shy-board-edit-tool-item'}>
                    <LineArrow
                        lineStart={getValue('lineStart')}
                        change={(name, e) => this.onChange(name, e)}></LineArrow>
                </div>
            </Tip>
                <div className={'shy-board-edit-tool-icon'}> <Icon size={16} icon={BoardRefreshSvg}></Icon></div>
                <Tip overlay={'结束箭头'}>
                    <div className={'shy-board-edit-tool-item'}>
                        <LineArrow lineEnd={getValue('lineEnd')}
                            change={(name, e) => this.onChange(name, e)}></LineArrow>
                    </div>
                </Tip><div className={'shy-board-edit-tool-devide'}></div></>}
            {is('lineType') && <Tip overlay={'线形'}>
                <div className={'shy-board-edit-tool-item'}>
                    <LineTypes
                        lineType={getValue('lineType')}
                        strokeWidth={getValue('strokeWidth')}
                        strokeDasharray={getValue('strokeDasharray')}
                        change={(name, e) => this.onChange(name, e)}></LineTypes>
                </div>
            </Tip>}
            {is('turnShapes') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item'} >
                    <TurnShapes></TurnShapes>
                </div>
            </Tip>}
            {is('fontSize') && <><Tip overlay={'字体大小'}>
                <div className={'shy-board-edit-tool-item'} >
                    <Select value={getValue('fontSize')}
                        onChange={e => this.onChange('fontSize', e)}
                        dropAlign='center'
                        optionAlign="right"
                        options={[
                            { text: '12', value: 12 },
                            { text: '14', value: 14 },
                            { text: '18', value: 18 },
                            { text: '24', value: 24 },
                            { text: '36', value: 36 },
                            { text: '48', value: 48 },
                            { text: '64', value: 64 },
                            { text: '80', value: 80 },
                            { text: '144', value: 144 },
                            { text: '288', value: 288 }
                        ]}></Select>
                </div>
            </Tip><div className={'shy-board-edit-tool-devide'}></div></>}
            {is('stickerSize') && <><Tip overlay='便利贴'>
                <div className={'shy-board-edit-tool-item'} >
                    <Select value={getValue('stickerSize')} onChange={e => this.onChange('stickerSize', e)} style={{ width: 50 }} options={[
                        { text: '小', value: 'small' },
                        { text: '中', value: 'medium' },
                        { text: '大', value: 'big' }]}></Select>
                </div>
            </Tip><div className={'shy-board-edit-tool-devide'}></div></>}
            {is('fontWeight') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item' + (getValue('fontWeight') == 'bold' || getValue('fontWeight') > 500 ? " hover" : "")}
                    onMouseDown={e => this.onChange('fontWeight', getValue('fontWeight') == 'bold' || getValue('fontWeight') > 500 ? "normal" : 'bold')}
                ><Icon icon='bold:sy'></Icon>
                </div>
            </Tip>}
            {is('tickness') && <><div style={{ width: 90 }} className={'shy-board-edit-tool-item'}>
                <MeasureView min={1} max={40} showValue={false} value={getValue('tickness')} onChange={e => { this.onChange('tickness', e) }}></MeasureView>
            </div></>}
            {is('itailc') && <Tip id={LangID.textToolItailc}>
                <div className={'shy-board-edit-tool-item' + (getValue('itailc') == 'itailc' ? " hover" : "")}
                    onMouseDown={e => this.onChange('itailc', getValue('itailc') == 'itailc' ? false : true)}
                ><Icon icon='italic:sy'></Icon>
                </div>
            </Tip>}
            {is('textDecoration') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item' + (getValue('textDecoration') == 'line-through' ? " hover" : "")}
                    onMouseDown={e => this.onChange('textDecoration', getValue('textDecoration') == 'line-through' ? "none" : "line-through")}
                ><Icon icon='delete-line:sy'></Icon>
                </div>
            </Tip>}
            {is('textDecoration') && <><Tip id={LangID.textToolUnderline}>
                <div
                    className={'shy-board-edit-tool-item' + (getValue('textDecoration') == 'underline' ? " hover" : "")}
                    onMouseDown={e => this.onChange('textDecoration', getValue('textDecoration') == 'underline' ? "none" : "underline")}
                ><Icon icon='underline:sy'></Icon>
                </div>
            </Tip><div className={'shy-board-edit-tool-devide'}></div></>}
            {is('fontColor') && <Tip overlay={'字体颜色'}>
                <div className={'shy-board-edit-tool-item'}>
                    <FontColor value={getValue('fontColor')} change={e => { this.onChange('fontColor', e) }}></FontColor>
                </div>
            </Tip>}
            {is('backgroundColor') && <Tip overlay={'背景'}>
                <div className={'shy-board-edit-tool-item'}>
                    <BackgroundColor value={getValue('backgroundColor')} change={e => { this.onChange('backgroundColor', e) }}></BackgroundColor>
                </div>
            </Tip>}
            {is('stoke') && <Tip overlay={'边框'}>
                <div className={'shy-board-edit-tool-item'}>
                    <ShapeStroke
                        stroke={getValue('stroke')}
                        strokeWidth={getValue('strokeWidth')}
                        strokeDasharray={getValue('strokeDasharray')}
                        strokeOpacity={getValue('strokeOpacity')}
                        change={(name, e) => this.onChange(name, e)}></ShapeStroke>
                </div>
            </Tip>}
            {is('fillColor') && is('fillOpacity') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item'}>
                    <ShapeFill
                        fillColor={getValue('fillColor')}
                        fillOpacity={getValue('fillOpacity')}
                        change={(name, e) => this.onChange(name, e)}
                    ></ShapeFill>
                </div>
            </Tip>}
        </div>
    }
    point: Point = new Point();
    visible: boolean = false;
    blocks: Block[] = [];
    commands: { name: string, value?: any }[] = [];
    async open(blocks: Block[]) {
        this.blocks = blocks;
        var poly = new Polygon(...this.blocks.map(b => b.getVisiblePolygon().points).flat());
        this.point = poly.bound.leftTop;
        this.point.y -= 40;
        var rs;
        await this.blocks.eachAsync(async block => {
            var cs = await block.getBoardEditCommand();
            if (typeof rs == 'undefined') { rs = cs; }
            else {
                rs.removeAll(r => !cs.some(c => c.name == r.name))
            }
        });
        this.commands = rs || [];
        if (this.commands.length > 0) {
            this.visible = true;
            this.forceUpdate()
        }
        else {
            this.visible = true;
            this.close();
        }
    }
    async onChange(name: string, value: any) {
        this.emit('save', { name, value });
    }
    close() {
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
            this.emit('close');
        }
    }
}
interface BoardEditTool {
    emit(name: 'save', data: { name: string, value: any });
    emit(name: 'close');
    only(name: 'save', fn: (data: { name: string, value: any }) => void);
    only(name: 'close', fn: () => void);
}
var editTool: BoardEditTool;
export async function useBoardEditTool(blocks: Block[]) {
    editTool = await Singleton(BoardEditTool);
    editTool.open(blocks);
    return new Promise((resolve: (result: { name: string, value: any }) => void, reject) => {
        editTool.only('save', (data: { name: string, value: any }) => {
            resolve(data)
        });
        editTool.only("close", () => {
            resolve(undefined);
        })
    })
}
export function forceCloseBoardEditTool() {
    if (editTool) editTool.close();
}