import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import { Icon } from "../../component/view/icon";
import { MenuItemType } from "../../component/view/menu/declare";
import { Select } from "../../component/view/select";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import { Block } from "../../src/block";
import { BlockDirective } from "../../src/block/enum";
import { BlockCssName } from "../../src/block/pattern/css";
import { Point } from "../../src/common/vector/point";
import { Polygon } from "../../src/common/vector/polygon";
import { textToolResult } from "../text.tool";
import { BackgroundColor } from "./background";
import { ShapeFill } from "./fill";
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
        console.log(this.commands);
        return <div style={style} className="shy-board-edit-tool">
            {this.commands.some(s => s.name == 'frameScale') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item'} >
                    <FrameScale></FrameScale>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'turnShapes') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item'} >
                    <TurnShapes></TurnShapes>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'fontSize') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item'} >
                    <Select style={{ width: 50 }} options={[{ text: '12', value: '12' }, { text: '14', value: '14' }]}></Select>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'stickerSize') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item'} >
                    <Select style={{ width: 50 }} options={[{ text: '小', value: '12' }, { text: '中', value: '14' }, { text: '大', value: '14' }]}></Select>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'bold') && <Tip id={LangID.textToolBold}>
                <div className={'shy-board-edit-tool-item'} >
                    <Icon icon='bold:sy'></Icon>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'itailc') && <Tip id={LangID.textToolItailc}>
                <div className={'shy-board-edit-tool-item'} >
                    <Icon icon='italic:sy'></Icon>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'textDecoration') && <Tip id={LangID.textToolUnderline}>
                <div className={'shy-board-edit-tool-item'}>
                    <Icon icon='underline:sy'></Icon>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'textDecoration') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item'}>
                    <Icon icon='delete-line:sy'></Icon>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'backgroundColor') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item'}>
                    <BackgroundColor value={'#000'} change={e => { }}></BackgroundColor>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'stoke') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item'}>
                    <ShapeStroke ></ShapeStroke>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'fillColor') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item'}>
                    <ShapeFill ></ShapeFill>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'lineArrow') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item'}>
                    <LineArrow ></LineArrow>
                </div>
            </Tip>}
            {this.commands.some(s => s.name == 'lineType') && <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-board-edit-tool-item'}>
                    <LineTypes ></LineTypes>
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
        this.point.y -= 30;
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
    close() {
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
            this.emit('close');
        }
    }
}
interface BoardEditTool {
    emit(name: 'setStyle', styles: Record<BlockCssName, Record<string, any>>);
    emit(name: 'setProp', props: Record<string, any>);
    emit(name: 'turn', item: MenuItemType<BlockDirective>, event: MouseEvent);
    emit(name: 'close');
    only(name: 'setProp', props: Record<string, any>);
    only(name: 'setStyle', fn: (syles: Record<BlockCssName, Record<string, any>>) => void);
    only(name: 'turn', fn: (item: MenuItemType<BlockDirective>, event: MouseEvent) => void);
    only(name: 'close', fn: () => void);
}
var editTool: BoardEditTool;
export async function useBoardEditTool(blocks: Block[]) {
    editTool = await Singleton(BoardEditTool);
    editTool.open(blocks);
    return new Promise((resolve: (result: textToolResult) => void, reject) => {
        editTool.only('setStyle', (styles) => {
            resolve({ command: 'setStyle', styles })
        });
        editTool.only('setProp', (props) => {
            resolve({ command: 'setProp', props })
        })
        editTool.only("turn", (item, event) => {
            resolve({ command: 'turn', item, event })
        });
        editTool.only("close", () => {
            resolve(false);
        })
    })
}
export function forceCloseBoardEditTool() {
    if (editTool) editTool.close();
}