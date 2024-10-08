import React, { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import {
    BoardRefreshSvg,
    BrokenLineSvg,
    CureSvg,
    DotsSvg,
    DragHandleSvg,
    RefreshSvg
} from "../../component/svgs";

import { Icon } from "../../component/view/icon";
import { MeasureView } from "../../component/view/progress";
import { Tip } from "../../component/view/tooltip/tip";
import { Block } from "../../src/block";
import { Point, Rect } from "../../src/common/vector/point";
import { Polygon } from "../../src/common/vector/polygon";
import { BlockCache } from "../../src/page/common/cache";
import { FontBgColor, FontTextStyle, FillColor, MindLineColor, FontTextAlign } from "./fontColor";
import { FontFamily } from "./fontfamily";
import { LineArrow, LineTypes } from "./line.arrow";
import { TurnShapes } from "./shapes";
import { BorderBoxStyle, ShapeStroke } from "./stroke";
import { lst } from "../../i18n/store";
import lodash from "lodash";
import { popoverLayer } from "../../component/lib/zindex";
import { MouseDragger } from "../../src/common/dragger";
import { SelectBox } from "../../component/view/select/box";
import { BlockUrlConstant } from "../../src/block/constant";
import { canvasOptions } from "./util";
import { FixedViewScroll } from "../../src/common/scroll";
import { AlignNineGridView, RankGridView } from "./align";
import "./style.less";
import { S } from "../../i18n/view";
import { closeSelectMenutItem, useSelectMenuItem } from "../../component/view/menu";
import { MenuItem } from "../../component/view/menu/declare";
import { ElementSize } from "./size";
import { InputNumber } from "../../component/view/input/number";
import { useIconPicker } from "../icon";
import { useKatexInput } from "../katex";
import { useOutSideUrlInput } from "../link/outsite.input";
import { LoadShapeStore } from "../board/shapes/shapes";
import { AIView } from "./ai";
import { assyDiv } from "../../component/types";

export class BoardEditTool extends EventsComponent {
    el: HTMLElement;
    private fvs: FixedViewScroll = new FixedViewScroll();
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.visible == true && this.el) this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    render() {
        if (this.visible != true) return <></>;
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x,
            zIndex: popoverLayer.zoom(this)
        };
        var self = this;
        if (self.blocks.some(s => s.isLock))
            return <div ref={e => this.el = e} style={style} className="shy-board-edit-tool bg-white round  shadow-s border r-item-hover">
                <div style={{ paddingLeft: 0, paddingRight: 0, margin: 0, paddingTop: 5, paddingBottom: 5, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} onMouseDown={e => this.onDrag(e)} className={'shy-board-edit-tool-item remark item-light-hover-focus'}><Icon size={16} icon={DragHandleSvg}></Icon></div>
                <div className={'shy-board-edit-tool-devide'} style={{ marginLeft: 0, marginTop: 0, marginBottom: 0 }}></div>
                <div onMouseDown={e => this.onUnlock(e)} className={'shy-board-edit-tool-item'}><Icon size={16} icon={{ name: 'byte', code: 'lock' }}></Icon></div>
            </div>
        return <div ref={e => this.el = e} style={style} className="shy-board-edit-tool bg-white round  shadow-s border r-item-hover">
            <div style={{ paddingLeft: 0, paddingRight: 0, margin: 0, paddingTop: 5, paddingBottom: 5, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} onMouseDown={e => this.onDrag(e)} className={'shy-board-edit-tool-item remark  item-light-hover-focus'}><Icon size={16} icon={DragHandleSvg}></Icon></div>
            <div className={'shy-board-edit-tool-devide'} style={{ marginLeft: 0, marginTop: 0, marginBottom: 0 }}></div>
            {this.renderItems()}
            <div className={'shy-board-edit-tool-devide'}></div>
            <Tip placement="top" forcePlacement={true} text={'属性'}>
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
            if (command) return command?.value;
        }
        function has(name) {
            return self.commands.some(g => g.name == name);
        }
        if (name == 'divider') return <div key={at} className={'shy-board-edit-tool-devide'}></div>
        else if (name == 'mindDirection') {
            return <Tip key={at} placement="top" forcePlacement={true} text='分支方向'>
                <div className={'shy-board-edit-tool-item'}>
                    <SelectBox
                        dist={16}
                        value={getValue('mindDirection')}
                        onChange={e => this.onChange('mindDirection', e)}
                        dropWidth={40}
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
                        options={[
                            { icon: { name: 'byte', code: 'right-branch' }, value: 'x', iconSize: 16 },
                            { icon: { name: 'byte', code: "lower-branch" }, value: 'y', iconSize: 16 },
                        ]}></SelectBox >
                </div>
            </Tip>
        }
        else if (name == 'mindLineType') {
            return <Tip key={at} placement="top" forcePlacement={true} text='线框类型'>
                <div className={'shy-board-edit-tool-item'} >
                    <SelectBox
                        dist={16}
                        value={getValue('mindLineType')}
                        onChange={e => this.onChange('mindLineType', e)}
                        dropWidth={40}
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
                        options={[
                            { icon: BrokenLineSvg, value: 'brokenLine', iconSize: 16 },
                            { icon: CureSvg, value: 'cure', iconSize: 16 },
                        ]}></SelectBox>
                </div>
            </Tip>
        }
        else if (name == 'mindLineColor') {
            return <Tip overlay='分支颜色' placement="top" forcePlacement={true} key={at}>
                <div className={'shy-board-edit-tool-item'}>
                    <MindLineColor tool={this} value={getValue('mindLineColor')} change={e => { this.onChange('mindLineColor', e) }}></MindLineColor>
                </div>
            </Tip>
        }
        else if (name == 'frameFormat') {
            return <Tip placement="top" forcePlacement={true} key={at} text={'画板'}>
                <div className={'shy-board-edit-tool-item'} >
                    <SelectBox
                        dist={14}
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
                            canvasOptions()
                        }
                    ></SelectBox>
                </div>
            </Tip>
        }
        else if (name == 'lineStart') {
            return <div key={at} className="flex r-item-hover no-item-hover"><Tip placement="top" forcePlacement={true} text={'开始箭头'}>
                <div className={'shy-board-edit-tool-item'}>
                    <LineArrow tool={this}
                        lineStart={getValue('lineStart')}
                        change={(name, e) => this.onChange(name, e)}></LineArrow>
                </div>
            </Tip>
                <Tip placement="top" forcePlacement={true} text={'箭头切换'}><div className={'remark size-20 flex-center round item-hover'} onMouseDown={e => {
                    this.onChangeObject({
                        lineStart: getValue('lineEnd'),
                        lineEnd: getValue('lineStart')
                    });
                }}>
                    <Icon size={14} icon={BoardRefreshSvg}></Icon>
                </div></Tip>
                <Tip placement="top" forcePlacement={true} text={'结束箭头'}>
                    <div className={'shy-board-edit-tool-item'}>
                        <LineArrow tool={this} lineEnd={getValue('lineEnd')}
                            change={(name, e) => this.onChange(name, e)}></LineArrow>
                    </div>
                </Tip>
            </div>
        }
        else if (name == 'lineType') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'线形'}>
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
            return <Tip key={at} placement="top" forcePlacement={true} text={'形状'}>
                <div className={'shy-board-edit-tool-item'} >
                    <TurnShapes tool={this} change={(e) => this.onChange('turnShapes', e)} turnShapes={getValue('turnShapes')}></TurnShapes>
                </div>
            </Tip>
        }
        else if (name == 'fontFamily') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'字体'}>
                <div className={'shy-board-edit-tool-item'} >
                    <FontFamily tool={this}
                        value={getValue('fontFamily')}
                        change={(name) => this.onChange('fontFamily', name)}></FontFamily>
                </div>
            </Tip>
        }
        else if (name == 'fontSize') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'字体大小'}>
                <div className={'shy-board-edit-tool-item'}
                    style={{
                        paddingTop: 0,
                        paddingBottom: 0
                    }}
                    onMouseDown={async e => {
                        // e.preventDefault();
                        e.stopPropagation();
                        var items: MenuItem[] = [
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
                        ]
                        var it = items.find(c => c.value == getValue('fontSize'))
                        if (it) {
                            it.checkLabel = true;
                        }
                        this.showDrop('fontSize');
                        var r = await useSelectMenuItem({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) },
                            items)
                        if (r?.item) {
                            this.onChange('fontSize', r.item.value)
                        }
                    }}
                ><InputNumber style={{ width: 50 }} showIcon inputStyle={{ height: 24 }}
                    noborder
                    value={getValue('fontSize')}
                    onDeep={e => {
                        if (typeof e == 'number' && e >= 10)
                            this.onChange('fontSize', e)
                    }}
                    onChange={e => {
                        if (typeof e == 'number' && e >= 10)
                            this.onChange('fontSize', e, true)
                    }}></InputNumber>
                </div>
            </Tip>
        }
        else if (name == 'stickerSize') {
            return <Tip key={at} placement="top" forcePlacement={true} text='便利贴大小'>
                <div className={'shy-board-edit-tool-item'} >
                    <SelectBox
                        onDrop={e => {
                            if (e) self.showDrop('');
                        }}
                        dist={14}
                        dropWidth={100}
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
        else if (name == 'tickness') {
            return <div key={at} style={{ width: 90 }} className={'shy-board-edit-tool-item no-item-hover'}>
                <MeasureView theme="light" min={1} max={40} value={getValue('tickness')} inputting={false} onChange={e => { this.onChange('tickness', e) }}></MeasureView>
            </div>
        }
        else if (name == 'fontWeight') {
            return <Tip key={at} placement="top" forcePlacement={true} text='文本样式'>
                <div onMouseEnter={e => {
                    this.showDrop('text-font-style');
                }} onMouseLeave={e => {
                    this.showDrop('');
                }} className={'shy-board-edit-tool-item'}>
                    <FontTextStyle
                        tool={this}
                        fontWeight={getValue('fontWeight')}
                        fontStyle={getValue('fontStyle')}
                        textDecoration={getValue('textDecoration')}
                        change={e => {
                            var key = Object.keys(e)[0];
                            if (key) {
                                this.onChange(key, e[key])
                            }
                        }}
                    ></FontTextStyle>
                </div>
            </Tip>
        }
        else if (name == 'align') {
            return <Tip key={at} placement="top" forcePlacement={true} text='对齐'>
                <div onMouseEnter={e => {
                    this.showDrop('text-align');
                }} onMouseLeave={e => {
                    this.showDrop('');
                }} className="shy-board-edit-tool-item">
                    <FontTextAlign
                        align={getValue('align')}
                        valign={has('valign') ? getValue('valign') : undefined}
                        tool={this}
                        change={(e, v) => {
                            if (e)
                                this.onChange('align', e)
                            if (v)
                                this.onChange('valign', v)
                        }}
                    ></FontTextAlign>
                </div>
            </Tip>
        }
        else if (name == 'fontColor') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'颜色'}>
                <div className={'shy-board-edit-tool-item'}>
                    <FontBgColor
                        tool={this}
                        noTransparent={has('backgroundNoTransparentColor')}
                        name={has('backgroundColor') ? 'backgroundColor' : 'backgroundNoTransparentColor'}
                        fontColor={getValue('fontColor')}
                        bgColor={getValue(has('backgroundColor') ? 'backgroundColor' : 'backgroundNoTransparentColor')}
                        change={(e, f, o) => {
                            if (typeof e != 'undefined') this.onChange('fontColor', e)
                            if (typeof f != 'undefined') this.onChange(has('backgroundColor') ? 'backgroundColor' : 'backgroundNoTransparentColor', f)
                            if (typeof o != 'undefined') this.onChange('backgroundOpacity', o)
                        }}
                        showBg={has('backgroundColor') ? true : has('backgroundNoTransparentColor')}
                        showOpacity={has('backgroundOpacity')}
                        bgOpacity={getValue('backgroundOpacity')}
                    ></FontBgColor>
                </div>
            </Tip>
        }
        else if (name == 'fillColor' || name == 'fillNoTransparentColor') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'填充色'}>
                <div className={'shy-board-edit-tool-item'}><FillColor
                    name={has('fillColor') ? 'fillColor' : "fillNoTransparentColor"}
                    tool={this}
                    noTransparent={has('fillNoTransparentColor')}
                    value={getValue(has('fillColor') ? 'fillColor' : "fillNoTransparentColor")}
                    showOpacity={has('fillOpacity')}
                    fillOpacity={getValue('fillOpacity')}
                    change={(e, o) => {
                        if (e)
                            this.onChange(has('fillColor') ? 'fillColor' : "fillNoTransparentColor", e)
                        if (o)
                            this.onChange('fillOpacity', o)
                    }}></FillColor></div>
            </Tip >
        }
        else if (name == 'borderWidth') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'边框'}>
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
            return <Tip key={at} placement="top" forcePlacement={true} text={'边框'}>
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
        else if (name == 'nine-align') {
            return <Tip key={at} placement="top" forcePlacement={true} text='元素对齐'>
                <div onMouseEnter={e => {
                    this.showDrop('nine-align');
                }} onMouseLeave={e => {
                    this.showDrop('');
                }} className="shy-board-edit-tool-item">
                    <AlignNineGridView
                        name='nine-align'
                        tool={this}
                        change={e => {
                            this.onChange('nine-align', e)
                        }}
                    ></AlignNineGridView>
                </div>
            </Tip>
        }
        else if (name == 'rank') {
            return <Tip key={at} placement="top" forcePlacement={true} text='元素排列'>
                <div onMouseEnter={e => {
                    this.showDrop('rank');
                }} onMouseLeave={e => {
                    this.showDrop('');
                }} className="shy-board-edit-tool-item">
                    <RankGridView
                        name='rank'
                        tool={this}
                        change={e => {
                            this.onChange('rank', e)
                        }}
                    ></RankGridView>
                </div>
            </Tip>
        }
        else if (name == 'merge') {
            return <Tip key={at} placement="top" forcePlacement={true} text='合并'>
                <div onMouseDown={e => this.onMergeBlocks()} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'sum' }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'ungroup') {
            return <Tip key={at} placement="top" forcePlacement={true} text='取消合并'>
                <div onMouseDown={e => this.onChange('ungroup')} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'split' }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'crop') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'裁剪'}>
                <div onMouseDown={e => this.onChange(name, true)} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'cutting' }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'link') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'链接'}>
                <div onMouseDown={e => this.onChange(name, true)} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'link-three' }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'upload') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'替换'}>
                <div onMouseDown={e => this.onChange(name, true)} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={RefreshSvg}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'look') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'查看'}>
                <div onMouseDown={e => this.onChange(name, true)} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: "zoom-in" }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'download') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'下载'}>
                <div onMouseDown={e => this.onChange(name, true)} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'download' }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'croping') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'裁剪'}>
                <div onMouseDown={e => this.onChange(name, true)} className={'shy-board-edit-tool-item'}>
                    <S>退出裁剪</S>
                </div>
            </Tip>
        }
        else if (name == 'resetCrop') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'重置'}>
                <div onMouseDown={e => this.onChange(name, true)} className={'shy-board-edit-tool-item'}>
                    <S>重置</S>
                </div>
            </Tip>
        }
        else if (name == 'width') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'宽高'}>
                <div className={'shy-board-edit-tool-item'}>
                    <ElementSize
                        tool={this}
                        name='elementSize'
                        width={getValue('width')}
                        height={getValue('height')}
                        showHeight={has('height')}
                        radius={getValue('radius')}
                        showRadius={has('radius')}
                        change={(e, f, o) => {
                            if (typeof e != 'undefined') this.onChange('width', e, true);
                            if (typeof f != 'undefined') this.onChange('height', f, true);
                            if (typeof o != 'undefined') this.onChange('radius', o, true);
                        }}
                    ></ElementSize>
                </div>
            </Tip>
        }
        else if (name == 'icon') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'图标'}>
                <div onMouseDown={async e => {
                    var r = await useIconPicker({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, getValue('icon'), {
                        visibleColor: false
                    });
                    if (r) {
                        this.onChange('icon', r);
                    }
                }} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={getValue('icon')}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'katex') {
            return <Tip key={at} placement="top" forcePlacement={true} text={'图标'}>
                <div onMouseDown={async e => {
                    var newValue = await useKatexInput({
                        direction: "bottom",
                        align: 'center',
                        roundArea: Rect.fromEle(e.currentTarget as HTMLElement)
                    }, getValue('katex'), (data) => {
                        // this.content = data;
                        // this.forceManualUpdate()
                    });
                    if (newValue)
                        this.onChange('katex', newValue);
                }} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'formula' }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'embed') {
            var v = getValue('embed');
            return <Tip key={at} placement="top" forcePlacement={true} text={v?.embedType == "bookmark" ? "书签" : '嵌入'}>
                <div onMouseDown={async e => {
                    var r = await useOutSideUrlInput({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, getValue('embed'));
                    if (r?.url) {
                        this.onChange('embed', { url: r.url });
                    }
                }} className={'shy-board-edit-tool-item'}>
                    <div className="size-20 flex-center"><Icon size={16} icon={{ name: 'byte', code: 'write' }}></Icon></div>
                </div>
            </Tip>
        }
        else if (name == 'ai') {
            return <Tip key={at} placement="top" forcePlacement={true} text='AI'>
                <div onMouseEnter={e => {
                    this.showDrop('ai');
                }} onMouseLeave={e => {
                    // this.showDrop('');
                }} className="shy-board-edit-tool-item">
                    <AIView name='ai' tool={this} change={e => {
                        this.showDrop('')
                        this.onChange('ai', e)
                    }}></AIView>
                </div>
            </Tip>
        }
    }
    getItems() {
        if (this.blocks.first().url == BlockUrlConstant.Frame) {
            if (this.blocks.length > 1) {
                return [
                    "frameFormat",
                    "fillColor",
                    "fillOpacity",
                    "fillNoTransparentColor",
                    "width",
                    "divider",
                    "rank",
                    'nine-align'
                ]
            }
            return [
                "frameFormat",
                "fillColor",
                "fillOpacity",
                "fillNoTransparentColor",
                "width", ,
                ...(this.blocks.length > 1 ? ["divider", "rank", "nine-align"] : [])
            ]
        }
        if (this.blocks.first().url == BlockUrlConstant.BoardImage) {
            return [
                'crop',
                "divider",
                "width",
                "link",
                "divider",
                'upload',
                'look',
                'download',
                'croping',
                "divider",
                'resetCrop',
                ...(this.blocks.length > 1 ? ["divider", "rank", "nine-align", "merge"] : [])
            ]
        }
        if (this.blocks.first().url == BlockUrlConstant.Group) {
            return [
                'ungroup',
                ...(this.blocks.length > 1 ? [
                    "divider",
                    "rank",
                    "nine-align"
                ] : [])]
        }
        if (this.blocks.first().url == BlockUrlConstant.Mind) {
            return [
                "mindDirection",
                "divider",
                "mindLineType",
                "mindLineColor",
                "divider",
                "width",
                "fontColor",
                "backgroundColor",
                "fillColor",
                "fillOpacity",
                "fillNoTransparentColor",
                "borderWidth",
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
                "align",
                // "itailc",
                // "textDecoration",
                "bgOpacity",
                "backgroundNoTransparentColor",
                "ai",
                ...(this.blocks.length > 1 ? ["divider", "rank", "nine-align", "merge"] : [])
            ]
        }
        var items = [
            "mindDirection",
            "icon",
            "katex",
            "embed",
            "upload",
            "download",
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
            "width",
            "divider",
            "fontWeight",
            'valign',
            "align",
            // "itailc",
            // "textDecoration",
            "fontColor",
            "fillColor",
            "fillOpacity",
            "fillNoTransparentColor",
            "backgroundColor",
            "bgOpacity",
            "backgroundNoTransparentColor",
            "divider",
            "borderWidth",
            "stroke",
            "ai",
            ...(this.blocks.length > 1 ? ["divider", "rank", "nine-align", "merge"] : [])
        ]
        return items;
    }
    renderItems() {
        var items = this.getItems();
        lodash.remove(items, g => (g != 'divider' && !['nine-align', "rank", "merge"].includes(g)) && !this.commands.some(s => s.name == g));
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
        var pa = this.blocks.first();

        this.fvs.bind(pa.page.getScrollDiv());
        var poly = new Polygon(...this.blocks.map(b => b.getVisiblePolygon().points).flat());
        this.point = poly.bound.leftTop;
        var xoffset = 30;
        var yoffset = 30;
        if (this.point.y - 50 > 0) {
            this.point = this.point.move(0, -50);
            this.point = this.point.move(0, 0 - yoffset)
        }
        else {
            this.point = poly.bound.leftBottom;
            this.point = this.point.move(0, 10);
            this.point = this.point.move(0, yoffset);
        }
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
            var n = this.commands.find(g => g.name == 'turnShapes');
            if (n) {
                await LoadShapeStore(n.value?.name);
            }
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
    async onChange(name: string, value?: any, isLazy?: boolean, props?: Record<string, any>) {
        var url = this.blocks.first().url;
        if (value) await BlockCache.set(url, name, value);
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
    async onMergeBlocks() {
        await this.blocks.first().page.onMergeBlocks(this.blocks);
    }
    lazySave = lodash.debounce(async (data) => {
        this.emit('save', data);
    }, 600)
    close() {
        if (this.visible == true) {
            this.fvs.unbind();
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
        if (this.dropName !== 'fontSize') {
            closeSelectMenutItem()
        }
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
        document.removeEventListener('mousedown', this.onGlobalMousedown, true);
        popoverLayer.clear(this);
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown, true);
    }
    onGlobalMousedown = (event: MouseEvent) => {
        // if (this.blocked == true) return;
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            var ele = assyDiv();
            if (ele && ele.contains(target)) return;
            /**
          * 这说明是在弹窗点开的菜单
          */
            if (target && target.closest('.shy-menu-panel')) return;
            if (target && target.closest('.shy-popover-box')) return;
            if (target && target.closest('.shy-page-view')) return;
            this.close();
        }
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
    await editTool.open(blocks, range);
    return new Promise((resolve: (result: { name: string, value: any, props?: Record<string, any> } | Record<string, any>) => void, reject) => {
        editTool.only('save', (data: { name: string, value: any, props?: Record<string, any> } | Record<string, any>) => {
            resolve(data)
        });
        editTool.only("close", () => {
            resolve(undefined);
        })
    })
}

export function closeBoardEditTool() {
    if (editTool) editTool.close();
}