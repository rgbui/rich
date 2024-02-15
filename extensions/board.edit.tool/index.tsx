import React, { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import {
    BoardFrame11Svg,
    BoardFrame169Svg,
    BoardFrame34Svg,
    BoardFrame43Svg,
    BoardFrameA4Svg,
    BoardFramePadSvg,
    BoardFramePhoneSvg,
    BoardFrameWebSvg,
    BoardRefreshSvg,
    BoardToolFrameSvg,
    BrokenLineSvg,
    CureSvg,
    DotsSvg,
    DragHandleSvg,
    MindDirectionXSvg,
    MindDirectionYSvg
} from "../../component/svgs";

import { Icon } from "../../component/view/icon";
import { MeasureView } from "../../component/view/progress";
import { Tip } from "../../component/view/tooltip/tip";
import { Block } from "../../src/block";
import { Point, Rect } from "../../src/common/vector/point";
import { Polygon } from "../../src/common/vector/polygon";
import { BlockCache } from "../../src/page/common/cache";
import { BackgroundColor } from "./background";
import { ShapeFill } from "./fill";
import { FontColor, LineColor, MindLineColor } from "./fontColor";
import { FontFamily } from "./fontfamily";
import { LineArrow, LineTypes } from "./line.arrow";
import { TurnShapes } from "./shapes";
import { BorderBoxStyle, ShapeStroke } from "./stroke";
import { lst } from "../../i18n/store";
import lodash from "lodash";
import { popoverLayer } from "../../component/lib/zindex";
import { MouseDragger } from "../../src/common/dragger";
import { SelectBox } from "../../component/view/select/box";
import { MenuItemType } from "../../component/view/menu/declare";
import { BlockUrlConstant } from "../../src/block/constant";
import "./style.less";

export class BoardEditTool extends EventsComponent {
    el: HTMLElement;
    render() {
        if (this.visible != true) return <></>;
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x,
            zIndex: popoverLayer.zoom(this)
        };
        var self = this;
        if (self.blocks.some(s => s.isLock))
            return <div ref={e => this.el = e} style={style} className="shy-board-edit-tool shadow border-light r-item-hover">
                <div style={{ paddingLeft: 0, paddingRight: 0, margin: 0, paddingTop: 5, paddingBottom: 5, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} onMouseDown={e => this.onDrag(e)} className={'shy-board-edit-tool-item remark item-light-hover-focus'}><Icon size={16} icon={DragHandleSvg}></Icon></div>
                <div className={'shy-board-edit-tool-devide'} style={{ marginLeft: 0, marginTop: 0, marginBottom: 0 }}></div>
                <div onMouseDown={e => this.onUnlock(e)} className={'shy-board-edit-tool-item'}><Icon size={16} icon={{ name: 'byte', code: 'lock' }}></Icon></div>
            </div>
        return <div ref={e => this.el = e} style={style} className="shy-board-edit-tool shadow border-light r-item-hover">
            <div style={{ paddingLeft: 0, paddingRight: 0, margin: 0, paddingTop: 5, paddingBottom: 5, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} onMouseDown={e => this.onDrag(e)} className={'shy-board-edit-tool-item remark  item-light-hover-focus'}><Icon size={16} icon={DragHandleSvg}></Icon></div>
            <div className={'shy-board-edit-tool-devide'} style={{ marginLeft: 0, marginTop: 0, marginBottom: 0 }}></div>
            {this.renderItems()}
            <div className={'shy-board-edit-tool-devide'}></div>
            <Tip placement="top" text={'属性'}>
                <div onMouseDown={e => this.onProperty(e)} className={'shy-board-edit-tool-item'}>
                    <span className="size-20 flex-center"><Icon size={16} icon={DotsSvg}></Icon></span>
                </div>
            </Tip>
        </div>
    }
    renderItem(name: string, at: number) {
        var self = this;
        function getValue(name: string) {
            var command = self.commands.find(g => g.name == name);
            if (command) return command.value;
        }
        if (name == 'divider') return <div key={at} className={'shy-board-edit-tool-devide'}></div>
        else if (name == 'mindDirection') {
            return <Tip key={at} placement="top" text='思维导图方向'>
                <div className={'shy-board-edit-tool-item'}>
                    <SelectBox value={getValue('mindDirection')}
                        onChange={e => this.onChange('mindDirection', e)}
                        dropWidth={40}
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
                        options={[
                            { icon: MindDirectionXSvg, value: 'x' },
                            { icon: MindDirectionYSvg, value: 'y' },
                        ]}></SelectBox >
                </div>
            </Tip>
        }
        else if (name == 'mindLineType') {
            return <Tip key={at} placement="top" text='线框类型'>
                <div className={'shy-board-edit-tool-item'} >
                    <SelectBox value={getValue('mindLineType')}
                        onChange={e => this.onChange('mindLineType', e)}
                        dropWidth={40}
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
                        options={[
                            { icon: BrokenLineSvg, value: 'brokenLine' },
                            { icon: CureSvg, value: 'cure' },
                        ]}></SelectBox>
                </div>
            </Tip>
        }
        else if (name == 'mindLineColor') {
            return <Tip overlay='分支颜色' key={at}>
                <div className={'shy-board-edit-tool-item'}>
                    <MindLineColor tool={this} value={getValue('mindLineColor')} change={e => { this.onChange('mindLineColor', e) }}></MindLineColor>
                </div>
            </Tip>
        }
        else if (name == 'frameFormat') {
            return <Tip placement="top" key={at} text={'画板'}>
                <div className={'shy-board-edit-tool-item'} >
                    <SelectBox
                        value={getValue('frameFormat')}
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
                        onChange={e => {
                            if (e.name) {
                                this.onChangeObject({
                                    name: 'frameFormat',
                                    value: e.name
                                }, false, {
                                    'fixedWidth': e.width,
                                    'fixedHeight': e.height
                                })
                            }
                            else this.onChange('frameFormat', e)
                        }}
                        iconHidden
                        dropWidth={180}
                        options={
                            [
                                {
                                    text: lst('画板'),
                                    renderIcon() {
                                        return <span className="flex-center flex-line  text-1 size-32"><Icon icon={BoardToolFrameSvg}></Icon></span>
                                    },
                                    value: 'none'
                                },
                                { text: '3:4', value: '3:4', iconSize: 32, icon: BoardFrame34Svg },
                                { text: '4:3', value: '4:3', iconSize: 32, icon: BoardFrame43Svg },
                                { text: '1:1', value: '1:1', iconSize: 32, icon: BoardFrame11Svg },
                                { text: '16:9', value: '16:9', iconSize: 32, icon: BoardFrame169Svg },
                                { text: 'A4', value: 'A4', iconSize: 32, icon: BoardFrameA4Svg },
                                { text: lst('原型'), type: MenuItemType.text },
                                {
                                    text: ('Phone'),
                                    value: 'phone',
                                    iconSize: 32,
                                    icon: BoardFramePhoneSvg,
                                    childs: [
                                        {
                                            "text": "iPhone 14",
                                            "value": {
                                                "name": "phone",
                                                "width": 390,
                                                "height": 844
                                            },
                                            "label": "390 x 844"
                                        },
                                        {
                                            "text": "iPhone 14 Pro",
                                            "value": {
                                                "name": "phone",
                                                "width": 393,
                                                "height": 852
                                            },
                                            "label": "393 x 852"
                                        },
                                        {
                                            "text": "iPhone 14 Plus",
                                            "value": {
                                                "name": "phone",
                                                "width": 428,
                                                "height": 926
                                            },
                                            "label": "428 x 926"
                                        },
                                        {
                                            "text": "iPhone 14 Pro Max",
                                            "value": {
                                                "name": "phone",
                                                "width": 430,
                                                "height": 932
                                            },
                                            "label": "430 x 932"
                                        },
                                        {
                                            "text": "iPhone 13 Pro Max",
                                            "value": {
                                                "name": "phone",
                                                "width": 428,
                                                "height": 926
                                            },
                                            "label": "428 x 926"
                                        },
                                        {
                                            "text": "iPhone 13 / 13 Pro",
                                            "value": {
                                                "name": "phone",
                                                "width": 390,
                                                "height": 844
                                            },
                                            "label": "390 x 844"
                                        },
                                        {
                                            "text": "iPhone 13 mini",
                                            "value": {
                                                "name": "phone",
                                                "width": 375,
                                                "height": 812
                                            },
                                            "label": "375 x 812"
                                        },
                                        {
                                            "text": "iPhone SE",
                                            "value": {
                                                "name": "phone",
                                                "width": 320,
                                                "height": 568
                                            },
                                            "label": "320 x 568"
                                        },
                                        {
                                            "text": "iPhone 8 Plus",
                                            "value": {
                                                "name": "phone",
                                                "width": 414,
                                                "height": 736
                                            },
                                            "label": "414 x 736"
                                        },
                                        {
                                            "text": "iPhone 8",
                                            "value": {
                                                "name": "phone",
                                                "width": 375,
                                                "height": 667
                                            },
                                            "label": "375 x 667"
                                        },
                                        {
                                            "text": "Android Small",
                                            "value": {
                                                "name": "phone",
                                                "width": 360,
                                                "height": 640
                                            },
                                            "label": "360 x 640"
                                        },
                                        {
                                            "text": "Android Large",
                                            "value": {
                                                "name": "phone",
                                                "width": 360,
                                                "height": 800
                                            },
                                            "label": "360 x 800"
                                        }
                                    ]

                                },
                                {
                                    text: ('Pad'), value: 'pad', iconSize: 32, icon: BoardFramePadSvg, childs: [
                                        {
                                            "text": "iPad mini",
                                            "value": {
                                                "name": "pad",
                                                "width": 768,
                                                "height": 1024
                                            },
                                            "label": "768 x 1024"
                                        },
                                        {
                                            "text": "iPad Pro 11",
                                            "value": {
                                                "name": "pad",
                                                "width": 834,
                                                "height": 1194
                                            },
                                            "label": "834 x 1194"
                                        },
                                        {
                                            "text": "iPad Pro 12.9",
                                            "value": {
                                                "name": "pad",
                                                "width": 1024,
                                                "height": 1366
                                            },
                                            "label": "1024 x 1366"
                                        },
                                        {
                                            "text": "Surface Pro 8",
                                            "value": {
                                                "name": "pad",
                                                "width": 1440,
                                                "height": 960
                                            },
                                            "label": "1440 x 960"
                                        }
                                    ]
                                },
                                {
                                    text: ('Web'), value: 'web', iconSize: 32, icon: BoardFrameWebSvg, childs: [
                                        {
                                            "text": "FHD",
                                            "value": {
                                                "name": "web",
                                                "width": 1920,
                                                "height": 1080
                                            },
                                            "label": "1920 x 1080"
                                        },
                                        {
                                            "text": "Desktop",
                                            "value": {
                                                "name": "web",
                                                "width": 1440,
                                                "height": 1024
                                            },
                                            "label": "1440 x 1024"
                                        },
                                        {
                                            "text": "Macbook Air",
                                            "value": {
                                                "name": "web",
                                                "width": 1280,
                                                "height": 832
                                            },
                                            "label": "1280 x 832"
                                        },
                                        {
                                            "text": "Macbook Pro 14",
                                            "value": {
                                                "name": "web",
                                                "width": 1512,
                                                "height": 982
                                            },
                                            "label": "1512 x 982"
                                        },
                                        {
                                            "text": "Macbook Pro 16",
                                            "value": {
                                                "name": "web",
                                                "width": 1728,
                                                "height": 1117
                                            },
                                            "label": "1728 x 1117"
                                        },
                                        {
                                            "text": "Surface Book",
                                            "value": {
                                                "name": "web",
                                                "width": 1500,
                                                "height": 1000
                                            },
                                            "label": "1500 x 1000"
                                        },
                                        {
                                            "text": "TV",
                                            "value": {
                                                "name": "web",
                                                "width": 1280,
                                                "height": 720
                                            },
                                            "label": "1280 x 720"
                                        }
                                    ]
                                }
                            ]
                        }
                    ></SelectBox>
                </div>
            </Tip>
        }
        else if (name == 'lineStart') {
            return <div key={at} className="flex r-item-hover no-item-hover"><Tip placement="top" text={'开始箭头'}>
                <div className={'shy-board-edit-tool-item'}>
                    <LineArrow tool={this}
                        lineStart={getValue('lineStart')}
                        change={(name, e) => this.onChange(name, e)}></LineArrow>
                </div>
            </Tip>
                <Tip placement="top" text={'箭头切换'}><div className={'remark size-20 flex-center round item-hover'} onMouseDown={e => {
                    this.onChangeObject({
                        lineStart: getValue('lineEnd'),
                        lineEnd: getValue('lineStart')
                    });
                }}>
                    <Icon size={14} icon={BoardRefreshSvg}></Icon>
                </div></Tip>
                <Tip placement="top" text={'结束箭头'}>
                    <div className={'shy-board-edit-tool-item'}>
                        <LineArrow tool={this} lineEnd={getValue('lineEnd')}
                            change={(name, e) => this.onChange(name, e)}></LineArrow>
                    </div>
                </Tip>
            </div>
        }
        else if (name == 'lineType') {
            return <Tip key={at} placement="top" text={'线形'}>
                <div className={'shy-board-edit-tool-item'}>
                    <LineTypes tool={this}
                        lineType={getValue('lineType')}
                        strokeWidth={getValue('strokeWidth')}
                        strokeDasharray={getValue('strokeDasharray')}
                        change={(name, e, isLazy) => this.onChange(name, e, isLazy)}></LineTypes>
                </div>
            </Tip>
        }
        else if (name == 'turnShapes') {
            return <Tip key={at} placement="top" text={'形状'}>
                <div className={'shy-board-edit-tool-item'} >
                    <TurnShapes tool={this} change={(e) => this.onChange('turnShapes', e)} turnShapes={getValue('turnShapes')}></TurnShapes>
                </div>
            </Tip>
        }
        else if (name == 'fontFamily') {
            return <Tip key={at} placement="top" text={'字体'}>
                <div className={'shy-board-edit-tool-item'} >
                    <FontFamily tool={this}
                        value={getValue('fontFamily')}
                        change={(name) => this.onChange('fontFamily', name)}></FontFamily>
                </div>
            </Tip>
        }
        else if (name == 'fontSize') {
            return <Tip key={at} placement="top" text={'字体大小'}>
                <div className={'shy-board-edit-tool-item'} >
                    <SelectBox value={getValue('fontSize')}
                        onChange={e => this.onChange('fontSize', e)}
                        dropWidth={80}
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
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
                        ]}>{getValue('fontSize')}</SelectBox>
                </div>
            </Tip>
        }
        else if (name == 'stickerSize') {
            return <Tip key={at} placement="top" text='便利贴尺寸大小'>
                <div className={'shy-board-edit-tool-item'} >
                    <SelectBox
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
                        dropWidth={60}
                        placeholder={lst('大小')}
                        value={getValue('stickerSize')}
                        onChange={e => this.onChange('stickerSize', e)} options={[
                            { text: lst('小'), value: 'small' },
                            { text: lst('中'), value: 'medium' },
                            { text: lst('大'), value: 'big' }
                        ]}></SelectBox>
                </div>
            </Tip>
        }
        else if (name == 'fontWeight') {
            return <Tip key={at} placement="top" text='加粗'>
                <div className={'shy-board-edit-tool-item' + ((getValue('fontWeight') == 'bold' || getValue('fontWeight') == true || getValue('fontWeight') > 500) ? " hover" : "")}
                    onMouseDown={e => this.onChange('fontWeight', (getValue('fontWeight') == 'bold' || getValue('fontWeight') == true || getValue('fontWeight') > 500) ? "normal" : 'bold')}
                ><span className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'text-bold' }}></Icon></span>
                </div>
            </Tip>
        }
        else if (name == 'tickness') {
            return <div key={at} style={{ width: 90 }} className={'shy-board-edit-tool-item'}>
                <MeasureView theme="light" min={1} max={40} showValue={false} value={getValue('tickness')} inputting={false} onChange={e => { this.onChange('tickness', e) }}></MeasureView>
            </div>
        }
        else if (name == 'itailc') {
            return <Tip key={at} placement="top" text='斜体'>
                <div className={'shy-board-edit-tool-item' + (getValue('itailc') == 'itailc' ? " hover" : "")}
                    onMouseDown={e => this.onChange('itailc', getValue('itailc') == 'itailc' ? false : true)}
                ><span className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'text-italic' }} ></Icon></span>
                </div>
            </Tip>
        }
        else if (name == 'textDecoration') {
            return <div key={at} className="flex r-item-hover no-item-hover">
                <Tip placement="top" text={'删除线'}>
                    <div className={'shy-board-edit-tool-item' + (getValue('textDecoration') == 'line-through' ? " hover" : "")}
                        onMouseDown={e => this.onChange('textDecoration', getValue('textDecoration') == 'line-through' ? "none" : "line-through")}
                    ><span className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'strikethrough' }}></Icon></span>
                    </div>
                </Tip>
                <Tip placement="top" text={'下划线'}>
                    <div
                        className={'shy-board-edit-tool-item' + (getValue('textDecoration') == 'underline' ? " hover" : "")}
                        onMouseDown={e => this.onChange('textDecoration', getValue('textDecoration') == 'underline' ? "none" : "underline")}
                    ><span className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'text-underline' }}></Icon></span>
                    </div>
                </Tip>
            </div>
        }
        else if (name == 'fontColor') {
            return <Tip key={at} placement="top" text={'字体颜色'}>
                <div className={'shy-board-edit-tool-item'}>
                    <FontColor tool={this} value={getValue('fontColor')} change={e => { this.onChange('fontColor', e) }}></FontColor>
                </div>
            </Tip>
        }
        else if (name == 'backgroundColor') {
            if (this.blocks.first().url == BlockUrlConstant.Line) {
                return <Tip key={at} placement="top" text={'线条颜色'}>
                    <div className={'shy-board-edit-tool-item'}><LineColor name='backgroundColor' tool={this} value={getValue('backgroundColor')} change={e => { this.onChange('backgroundColor', e) }}></LineColor></div>
                </Tip >
            }
            return <Tip key={at} placement="top" text={'背景'}>
                <div className={'shy-board-edit-tool-item'}>
                    <BackgroundColor tool={this} value={getValue('backgroundColor')} change={e => { this.onChange('backgroundColor', e) }}></BackgroundColor>
                </div>
            </Tip>
        }
        else if (name == 'backgroundNoTransparentColor') {
            return <Tip key={at} placement="top" text={'背景'}>
                <div className={'shy-board-edit-tool-item'}>
                    <BackgroundColor noTransparent tool={this} value={getValue('backgroundNoTransparentColor')} change={e => { this.onChange('backgroundNoTransparentColor', e) }}></BackgroundColor>
                </div>
            </Tip>
        }
        else if (name == 'borderWidth') {
            return <Tip key={at} placement="top" text={'边框'}>
                <div className={'shy-board-edit-tool-item'}>
                    <BorderBoxStyle
                        tool={this}
                        borderWidth={getValue('borderWidth')}
                        borderType={getValue('borderType')}
                        borderColor={getValue('borderColor')}
                        borderRadius={getValue('borderRadius')}
                        change={(name, e, isLazy?: boolean) => this.onChange(name, e, isLazy)}></BorderBoxStyle>
                </div>
            </Tip>
        }
        else if (name == 'stroke') {
            return <Tip key={at} placement="top" text={'边框'}>
                <div className={'shy-board-edit-tool-item'}>
                    <ShapeStroke
                        tool={this}
                        stroke={getValue('stroke')}
                        strokeWidth={getValue('strokeWidth')}
                        strokeDasharray={getValue('strokeDasharray')}
                        strokeOpacity={getValue('strokeOpacity')}
                        change={(name, e, isLazy) => this.onChange(name, e, isLazy)}></ShapeStroke>
                </div>
            </Tip>
        }
        else if (name == 'fillColor') {
            return <Tip key={at} placement="top" text={'填充'}>
                <div className={'shy-board-edit-tool-item'}>
                    <ShapeFill
                        tool={this}
                        fillColor={getValue('fillColor')}
                        fillOpacity={getValue('fillOpacity')}
                        change={(name, e, isLazy) => this.onChange(name, e, isLazy)}
                    ></ShapeFill>
                </div>
            </Tip>
        }
    }
    getItems() {
        if (this.blocks.first().url == BlockUrlConstant.Mind) {
            return [
                "mindDirection",
                "divider",
                "mindLineType",
                "mindLineColor",
                "divider",
                "backgroundColor",
                "backgroundNoTransparentColor",
                "divider",
                "borderWidth",
                "fillColor",
                "stroke",
                "divider",
                "frameFormat",
                "divider",
                "lineStart",
                "divider",
                "lineType",
                "divider",
                "turnShapes",
                "divider",
                "stickerSize",
                "tickness",
                "divider",
                "fontFamily",
                "fontSize",
                "divider",
                "fontWeight",
                "itailc",
                "textDecoration",
                "fontColor"
            ]
        }
        return [
            "mindDirection",
            "divider",
            "mindLineType",
            "mindLineColor",
            "divider",
            "frameFormat",
            "divider",
            "lineStart",
            "divider",
            "lineType",
            "divider",
            "turnShapes",
            "divider",
            "stickerSize",
            "tickness",
            "divider",
            "fontFamily",
            "fontSize",
            "divider",
            "fontWeight",
            "itailc",
            "textDecoration",
            "fontColor",
            "divider",
            "backgroundColor",
            "backgroundNoTransparentColor",
            "divider",
            "borderWidth",
            "fillColor",
            "stroke",

        ]
    }
    renderItems() {
        var items = this.getItems();
        lodash.remove(items, g => g != 'divider' && !this.commands.some(s => s.name == g));
        lodash.remove(items, (g, i) => g == 'divider' && items[i - 1] == 'divider');
        if (items.indexOf('divider') == 0) {
            items = items.slice(1);
        }
        if (items.lastIndexOf('divider') == items.length - 1) {
            items = items.slice(0, items.length - 1);
        }
        return items.map((name, i) => {
            return this.renderItem(name, i);
        })
    }
    point: Point = new Point();
    visible: boolean = false;
    blocks: Block[] = [];
    commands: { name: string, value?: any }[] = [];
    range: Rect;
    async open(blocks: Block[], range: Rect) {
        this.range = range;
        this.blocks = blocks;
        var poly = new Polygon(...this.blocks.map(b => b.getVisiblePolygon().points).flat());
        this.point = poly.bound.leftTop;
        var yoffset = 80;
        var xoffset = 30;
        if (this.point.y - yoffset < 100) {
            this.point = poly.bound.leftBottom;
            this.point.moved(0, yoffset);
        }
        else this.point = this.point.move(0, -yoffset)
        if (this.point.x < this.range.left) {
            this.point.x = this.range.left + xoffset;
        }
        var rs;
        await this.blocks.eachAsync(async block => {
            var cs = await block.getBoardEditCommand();
            if (typeof rs == 'undefined') {
                rs = cs;
            }
            else {
                rs.removeAll(r => !cs.some(c => c.name == r.name))
            }
        });
        this.commands = rs || [];
        if (this.commands.length > 0) {
            this.visible = true;
            this.forceUpdate(() => {
                var r = Rect.fromEle(this.el);
                if (this.point.x + r.width > this.range.right) {
                    var willX = this.range.right - r.width - xoffset;
                    if (willX < this.range.left) {
                        willX = this.range.left + xoffset;
                    }
                    this.point.x = willX;
                    this.forceUpdate();
                }
            })
        }
        else {
            this.visible = true;
            this.close();
        }
    }
    async reOpen() {
        await this.open(this.blocks, this.range);
    }
    onDrag(event: React.MouseEvent) {
        var p = Point.from(event);
        var self = this;
        var ol = self.point.clone();
        MouseDragger({
            event,
            moving(ev, data, isEnd, isMove) {
                var dx = ev.clientX - p.x;
                var dy = ev.clientY - p.y;
                var oc = ol.clone();
                oc.x += dx;
                oc.y += dy;
                self.point = oc;
                self.forceUpdate();
            }
        })
    }
    async onUnlock(event: React.MouseEvent) {
        await this.blocks.first().page.onAction('onUnlock', async () => {
            for (let i = 0; i < this.blocks.length; i++) {
                var bl = this.blocks[i];
                await bl.unlock(false);
            }
            await this.reOpen();
        })
    }
    async onChange(name: string, value: any, isLazy?: boolean, props?: Record<string, any>) {
        var url = this.blocks.first().url;
        await BlockCache.set(url, name, value);
        if (isLazy) this.lazySave({ name, value })
        else this.emit('save', { name, value, props });
    }
    async onChangeObject(obj: Record<string, any>, isLazy?: boolean, props?: Record<string, any>) {
        var url = this.blocks.first().url;
        await BlockCache.set(url, obj);
        if (props) obj.props = props;
        if (isLazy) this.lazySave(obj)
        else this.emit('save', obj);
    }
    lazySave = lodash.debounce(async (data) => {
        this.emit('save', data);
    }, 1000)
    close() {
        if (this.visible == true) {
            this.dropName = '';
            this.visible = false;
            this.forceUpdate();
            this.emit('close');
        }
    }
    private dropName: string;
    showDrop(dropName: string) {
        if (this.dropName == dropName) this.dropName = '';
        else this.dropName = dropName;
        this.forceUpdate();
    }
    isShowDrop(dropName: string) {
        if (this.dropName == dropName) return true;
        else return false;
    }
    async onProperty(event: React.MouseEvent) {
        if (this.blocks.length == 1) {
            this.showDrop('');
            await this.blocks.first().onContextmenu(Rect.fromEle(event.currentTarget as HTMLElement));
            this.dropName = '';
            this.reOpen();
        }
    }
    componentWillUnmount(): void {
        popoverLayer.clear(this);
    }
}

export interface BoardEditTool {
    emit(name: 'save', data: { name: string, value: any, props?: Record<string, any> } | Record<string, any>);
    emit(name: 'close');
    only(name: 'save', fn: (data: { name: string, value: any, props?: Record<string, any> } | Record<string, any>) => void);
    only(name: 'close', fn: () => void);
}

var editTool: BoardEditTool;
export async function useBoardEditTool(blocks: Block[], range: Rect) {
    editTool = await Singleton(BoardEditTool);
    editTool.open(blocks, range);
    return new Promise((resolve: (result: { name: string, value: any, props?: Record<string, any> } | Record<string, any>) => void, reject) => {
        editTool.only('save', (data: { name: string, value: any, props?: Record<string, any> } | Record<string, any>) => {
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