import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { BlockcolorSvg, CardBackgroundFillSvg, CardBrushSvg, CheckSvg, ChevronDownSvg, CloseSvg, NoneSvg, PicSvg, UploadSvg } from "../../../component/svgs";
import { Button } from "../../../component/view/button";
import { ColorInput } from "../../../component/view/color/input";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { Rect } from "../../../src/common/vector/point";
import { BackgroundColorList } from "../../color/data";
import { GalleryPics } from "../../image/gellery";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { BoxFillType, BoxStyle } from "../declare";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import { UploadView } from "../../file/upload";

export class CardBoxStyle extends EventsComponent {
    options: {
        open: 'background' | 'style' | 'onlyBg',
        fill?: BoxFillType,
        cardStyle?: BoxStyle
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
        var items: MenuItem<string>[] = [
            { icon: { name: 'bytedance-icon', code: 'square' }, name: 'none', value: "none", text: lst('无背景'), checkLabel: self.options?.fill?.mode == 'none' },
            { type: MenuItemType.divide },
            { icon: PicSvg, name: 'image', text: lst('选择图片'), value: 'image', checkLabel: self.options?.fill?.mode == 'image' },
            { icon: UploadSvg, name: 'uploadImage', text: lst('上传图片'), value: 'uploadImage', checkLabel: self.options?.fill?.mode == 'uploadImage' },
            { type: MenuItemType.divide },
            { icon: { name: 'bytedance-icon', code: 'color-filter' }, name: 'color', text: lst('颜色'), value: 'color', checkLabel: self.options?.fill?.mode == 'color' }
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
                <span className="flex-auto">{items.find(c => c.value == this.options.fill.mode)?.text}</span>
                <span className="flex-center size-16"><Icon size={14} icon={ChevronDownSvg}></Icon></span>
            </div>
            <div className="h-400 padding-h-10 overflow-y">
                {this.options.fill.mode == 'none' && <div className=" padding-w-15 remark flex-center min-h-30">
                    <S>无背景</S>
                </div>}
                {this.options.fill.mode == 'image' && <div>
                    {GalleryPics().map(gp => {
                        return <div className="gap-b-15" key={gp.group}>
                            <div className="remark padding-w-15">{gp.group}</div>
                            <div className="flex flex-wrap">
                                {gp.childs.map(gc => {
                                    return <div
                                        onMouseDown={e => {
                                            this.setProps({ 'fill.mode': 'image', 'fill.src': gc.url })
                                        }}
                                        key={gc.url}
                                        style={{ width: (300 - 45) / 2 }} className={'relative gap-l-15 w-120 h-80 gap-b-10 cursor gap-h-10 '}>
                                        <img className="obj-center w100 h100 round-8" src={gc.thumb} />
                                        {gc.url == this.options.fill?.src && <div className="pos-all flex-end-top">
                                            <span className="flex-center size-20 round bg-white shadow gap-5"><Icon size={16} icon={CheckSvg}></Icon></span>
                                        </div>}
                                    </div>
                                })}
                            </div>
                        </div>
                    })}
                </div>}
                {this.options.fill.mode == 'uploadImage' && <div className="padding-w-15">
                    {this.options.fill.src && <div ><img className="obj-center w100" src={this.options.fill.src} /></div>}
                    <UploadView mine='image' change={e => {
                        self.setProps({
                            'fill.mode': 'uploadImage',
                            'fill.src': e.url
                        })
                    }}></UploadView>
                </div>}
                {this.options.fill.mode == 'color' && <div className="padding-w-15">
                    <div className="remark f-14 gap-b-5"><S>背景色</S></div>
                    <div className="gap-b-10">
                        <ColorInput color={this.options?.fill.color} onChange={e => {
                            this.setProps({ 'fill.mode': 'color', 'fill.color': e })
                        }}></ColorInput>
                    </div>
                    <div className="remark f-14 gap-b-5"><S>选择主题色</S></div>
                    {BackgroundColorList().map(bg => {
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
            <div className="remark gap-w-15 gap-h-10 f-12">
                <S>透明性</S>
            </div>
            <div className="flex flex-wrap text-1">

                <div className="flex-auto gap-l-15 " onClick={e => this.setValue('cardStyle.transparency', 'solid')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'solid' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>无透明</S></span></div>
                </div>

                <div className="flex-auto gap-l-15" onClick={e => this.setValue('cardStyle.transparency', 'frosted')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'frosted' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>毛玻璃</S></span></div>
                </div>
                <div className="flex-auto gap-l-15 " onClick={e => this.setValue('cardStyle.transparency', 'faded')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'faded' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>渐近</S></span></div>
                </div>
                <div className="flex-auto gap-l-15" onClick={e => this.setValue('cardStyle.transparency', 'noborder')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.options.cardStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.options.cardStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.transparency == 'noborder' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>无边框</S></span></div>
                </div>
            </div>
            <div className="remark gap-w-15 gap-h-10 f-12">
                <S>颜色</S>
            </div>
            <div className="flex flex-wrap text-1">
                <div className="flex-auto gap-l-15 " onClick={e => this.setValue('cardStyle.color', 'light')}>
                    <div className="h-80  box-border padding-w-10  border round-8 " style={{ width: (300 - 45) / 2 }}>
                        <div className="bg-black h-10 w-30 round gap-h-10"></div>
                        <div className="bg-black h-10 w-100 round gap-h-10"></div>
                        <div className="bg-black h-10 w-80 round gap-h-10"></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.color == 'light' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>明亮</S></span></div>
                </div>
                <div className="flex-auto gap-l-15" onClick={e => this.setValue('cardStyle.color', 'dark')}>
                    <div className="h-80 box-border padding-w-10  border round-8 bg-black" style={{ width: (300 - 45) / 2 }}>
                        <div className="bg-white h-10 w-30 round gap-h-10"></div>
                        <div className="bg-white h-10 w-100 round gap-h-10"></div>
                        <div className="bg-white h-10 w-80 round gap-h-10"></div>
                    </div>
                    <div className="flex gap-h-10">{this.options.cardStyle.color == 'dark' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>暗黑</S></span></div>
                </div>
            </div>
        </div>
    }
    render() {
        return <div className="padding-h-15 bg-white round w-300">
            <div className="h4 flex padding-w-15">
                <span className="flex-auto">{this.options.open == 'onlyBg' ? lst("背景主题") : lst("卡片样式")}</span>
                <span onClick={e => this.emit('close')} className="size-30 flex-center flex-fixed text-1 item-hover cursor round">
                    <Icon size={18} icon={CloseSvg}></Icon>
                </span>
            </div>
            {this.options.open != 'onlyBg' && <div className="flex gap-b-10  padding-w-15">
                <a onClick={e => { this.options.open = 'background'; this.forceUpdate() }} className={"cursor gap-r-10 flex-auto padding-w-10 flex-center h-30 round-8 " + (this.options.open == 'background' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBackgroundFillSvg}></Icon></span><span><S>背景</S></span></a>
                <a onClick={e => { this.options.open = 'style'; this.forceUpdate() }} className={"cursor gap-l-10 flex-auto  padding-w-10 flex-center h-30 round-8 " + (this.options.open == 'style' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBrushSvg}></Icon></span><span><S>样式</S></span></a>
            </div>}
            <div >
                {(this.options.open == 'background' || this.options.open == 'onlyBg') && this.renderBackground()}
                {this.options.open == 'style' && this.renderStyle()}
            </div>
            <div className="flex-center gap-h-20 padding-w-15">
                <Button className="gap-r-10" onClick={e => this.emit('save', this.options)}><S>保存</S></Button>
                <Button onClick={e => this.open(this.oldOptions)} ghost><S>重置</S></Button>
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