import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { CardBackgroundFillSvg, CardBrushSvg, CheckSvg, ChevronDownSvg, CloseSvg } from "../../../component/svgs";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/vector/point";
import { BackgroundColorList } from "../../color/data";
import { GalleryPics } from "../../image/gellery";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

export class CardBoxStyle extends EventsComponent {
    options: {
        open: 'background' | 'style',
        fill?: { mode: 'none' | 'image' | 'color', color?: string, src?: string },
        cardStyle?: { color: 'dark' | 'light', transparency: 'frosted' | 'solid' | 'noborder' | 'faded' }
    } = {
            open: 'background',
            fill: { mode: 'none' },
            cardStyle: { color: 'light', transparency: 'frosted' }
        }
    oldOptions: CardBoxStyle['options'];
    open(options: CardBoxStyle['options']) {
        this.options = this.oldOptions = lodash.cloneDeep(options);
        this.forceUpdate();
    }
    renderBackground() {
        var self = this;
        var items = [
            { name: 'none', value: "none", text: '无' },
            { name: 'image', text: '图片', value: 'image' },
            { name: 'color', text: '颜色', value: 'color' }
        ]
        async function openMenu(event: React.MouseEvent) {
            var r = await useSelectMenuItem(
                { roundArea: Rect.fromEvent(event) },
                items
            );
            if (r?.item) {
                lodash.set(self.options, 'fill.mode', r.item.value);
                self.forceUpdate()
            }
        }
        return <div>
            <div className="gap-w-15 flex border round cursor h-30 padding-w-10" onMouseDown={e => openMenu(e)}>
                <span>{items.find(c => c.value == this.options.fill.mode)?.text}</span>
                <span className="flex-center size-16"><Icon size={14} icon={ChevronDownSvg}></Icon></span>
            </div>
            <div className="h-400 padding-h-10 overflow-y">
                {this.options.fill.mode == 'none' && <div className=" padding-w-15 remark flex-center min-h-30">
                    卡片无背景
                </div>}
                {this.options.fill.mode == 'image' && <div>
                    {GalleryPics.map(gp => {
                        return <div className="gap-b-15" key={gp.group}>
                            <div className="remark padding-w-15">{gp.group}</div>
                            <div className="flex flex-wrap">
                                {gp.childs.map(gc => {
                                    return <div onMouseDown={e => {
                                        this.setProps({ 'fill.mode': 'image', 'fill.src': gc.url })
                                    }}
                                        key={gc.url}
                                        style={{ width: (300 - 45) / 2 }} className={'round-16 gap-l-15 w-120 h-80 gap-b-10 cursor gap-h-10 '}>
                                        <img className="obj-center w100 h100 round-8" src={gc.thumb} />
                                    </div>
                                })}
                            </div>
                        </div>
                    })}
                </div>}
                {this.options.fill.mode == 'color' && <div className="padding-w-15">
                    {BackgroundColorList.map(bg => {
                        return <div key={bg.color}
                            onMouseDown={e => {
                                this.setProps({ 'fill.mode': 'color', 'fill.color': bg.color })
                            }}
                            style={{ background: bg.color }}
                            className='round cursor gap-h-10 min-h-30 flex padding-w-10' >
                            <span className="flex-auto">{bg.text}</span>
                            {this.options?.fill.color == bg.color && <span className="flex-fixed">
                                <Icon size={16} icon={CheckSvg}></Icon>
                            </span>}
                        </div>
                    })}
                </div>}
            </div>
        </div>
    }
    setProps(props: Record<string, any>) {
        for (let n in props) {
            lodash.set(this.options, n, props[n])
        }
        this.emit('change', lodash.cloneDeep(this.options));
        this.forceUpdate();
    }
    setValue(key: string, value: string) {
        lodash.set(this.options, key, value);
        this.emit('change', lodash.cloneDeep(this.options));
        this.forceUpdate();
    }
    renderStyle() {

        return <div className="h-400 padding-h-10 overflow-y f-14">
            <div className="remark gap-w-15 gap-h-10">
                透明性
            </div>
            <div className="flex flex-wrap text-1">

                <div className="flex-auto gap-l-15 " onClick={e => this.setValue('cardStyle.transparency', 'solid')}>
                    <div className={"h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'solid' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span>无透明</span></div>
                </div>

                <div className="flex-auto gap-l-15" onClick={e => this.setValue('cardStyle.transparency', 'frosted')}>
                    <div className={"h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'frosted' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span>毛玻璃</span></div>
                </div>
                <div className="flex-auto gap-l-15 " onClick={e => this.setValue('cardStyle.transparency', 'faded')}>
                    <div className={"h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'faded' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span>渐近</span></div>
                </div>
                <div className="flex-auto gap-l-15" onClick={e => this.setValue('cardStyle.transparency', 'noborder')}>
                    <div className={"h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'noborder' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span>无边框</span></div>
                </div>
            </div>
            <div className="remark gap-w-15 gap-h-10">
                颜色
            </div>
            <div className="flex flex-wrap text-1">
                <div className="flex-auto gap-l-15 " onClick={e => this.setValue('cardStyle.color', 'light')}>
                    <div className="h-80  box-border padding-w-10  border round-8 " style={{ width: (300 - 45) / 2 }}>
                        <div className="bg-black h-10 w-30 round gap-h-10"></div>
                        <div className="bg-black h-10 w-100 round gap-h-10"></div>
                        <div className="bg-black h-10 w-80 round gap-h-10"></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.color == 'light' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span>明亮</span></div>
                </div>
                <div className="flex-auto gap-l-15" onClick={e => this.setValue('cardStyle.color', 'dark')}>
                    <div className="h-80 box-border padding-w-10  border round-8 bg-black" style={{ width: (300 - 45) / 2 }}>
                        <div className="bg-white h-10 w-30 round gap-h-10"></div>
                        <div className="bg-white h-10 w-100 round gap-h-10"></div>
                        <div className="bg-white h-10 w-80 round gap-h-10"></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.color == 'dark' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span>暗黑</span></div>
                </div>
            </div>
        </div>
    }
    render() {
        return <div className="padding-h-15 bg-white round w-300">
            <div className="h4 flex padding-w-15">
                <span className="flex-auto">卡片样式</span>
                <span onClick={e => this.emit('close')} className="size-30 flex-center flex-fixed text-1 item-hover cursor round">
                    <Icon size={18} icon={CloseSvg}></Icon>
                </span>
            </div>
            <div className="flex gap-b-10  padding-w-15">
                <a onClick={e => { this.options.open = 'background'; this.forceUpdate() }} className={"cursor gap-r-10 flex-auto padding-w-10 flex-center h-30 round-8 " + (this.options.open == 'background' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBackgroundFillSvg}></Icon></span><span>背景</span></a>
                <a onClick={e => { this.options.open = 'style'; this.forceUpdate() }} className={"cursor gap-l-10 flex-auto  padding-w-10 flex-center h-30 round-8 " + (this.options.open == 'style' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBrushSvg}></Icon></span><span>样式</span></a>
            </div>
            <div >
                {this.options.open == 'background' && this.renderBackground()}
                {this.options.open == 'style' && this.renderStyle()}
            </div>
            <div className="flex-center gap-h-20 padding-w-15">
                <Button className="gap-r-10" onClick={e => this.emit('save', this.options)}>保存</Button>
                <Button onClick={e => this.open(this.oldOptions)} ghost>重置</Button>
            </div>
        </div>
    }
}




export async function useCardBoxStyle(options: CardBoxStyle['options'], change?: (ops: CardBoxStyle['options']) => void) {
    var pos: PopoverPosition = { dockRight: true };
    let popover = await PopoverSingleton(CardBoxStyle, { mask: true, });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (id: CardBoxStyle['options']) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(fv.options);
        });
        popover.only('close', () => {
            resolve(fv.options)
        });
        fv.only('change', c => {
            if (typeof change == 'function')
                change(c);
        })
    })
}