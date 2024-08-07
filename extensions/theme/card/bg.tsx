import React from "react";
import { PageThemeStyle } from "../../../src/page/declare";
import { CheckSvg, ChevronDownSvg, CloseSvg } from "../../../component/svgs";
import { ColorInput } from "../../../component/view/color/input";
import { Icon } from "../../../component/view/icon";
import { S } from "../../../i18n/view";
import { UploadView } from "../../file/upload";

import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { Rect } from "../../../src/common/vector/point";
import lodash from "lodash";
import { SelectBox } from "../../../component/view/select/box";
import { GradColor } from "./grad";
import { GetPageBgs } from "../themes";
import { useSelectMenuItem } from "../../../component/view/menu";
import { GalleryBgs } from "../../image/store";

export class PageFillStyle extends React.Component<{
    bgStyle: PageThemeStyle['bgStyle'],
    isFill?: boolean,
    isNotEmpty?: boolean,
    smallGallery?: boolean,
    onChange: (e: PageThemeStyle['bgStyle']) => void,
    openSpread?: (spread: boolean) => void
}> {
    constructor(props) {
        super(props);
        this.bgStyle = lodash.cloneDeep(props.bgStyle);
        if (!this.bgStyle) this.bgStyle = { mode: 'none' };
    }
    componentDidUpdate(prevProps: Readonly<{
        bgStyle: PageThemeStyle['bgStyle'];
        onChange: (e: PageThemeStyle['bgStyle']) => void;
    }>,
        prevState: Readonly<{}>, snapshot?: any): void {
        if (!lodash.isEqual(prevProps.bgStyle, this.props.bgStyle)) {
            this.bgStyle = lodash.cloneDeep(this.props.bgStyle);
            if (!this.bgStyle) this.bgStyle = { mode: 'none' };
            this.forceUpdate();
        }
    }
    bgStyle: PageThemeStyle['bgStyle'] = { mode: 'none' };
    el: HTMLElement;
    top: number = 0;
    async onItem(ele: HTMLElement) {
        var s = Rect.fromEle(ele);
        var r = await useSelectMenuItem({ roundArea: s }, this.getItems(), {
            width: s.width,
            mask: false,
            range: ele
        });
        if (r) {
            var self = this;
            self.setProps({ mode: r.item.value })
            if (r.item.value == 'none') {
                this.spread = false;
                setTimeout(() => {
                    if (this.props.openSpread)
                        this.props.openSpread(this.spread);
                }, 10);
            }
            else {
                this.spread = true;
                if (this.props.openSpread)
                    this.props.openSpread(true);
            }
            self.forceUpdate(() => {
                self.cacDrop();
            })
            if (r.item.value != 'none')
                await this.onItem(ele);
        }
    }
    render() {
        if (this.props.isFill) {
            return <div ref={e => this.el = e}>
                {this.renderDrops()}
            </div>
        }
        return <div className="relative" ref={e => this.el = e}>
            <div className="h-28 cursor item-hover-light border round flex" onMouseDown={e => {
                this.spread = true;
                if (this.props.openSpread)
                    this.props.openSpread(true);
                this.top = 0;
                e.stopPropagation();
                this.onItem(e.currentTarget as HTMLElement);
                this.forceUpdate(() => this.cacDrop());
            }}>
                <span className="gap-l-10 flex-fixed">{(this.getItems().find(c => c.value == this.bgStyle.mode) as any)?.stext}</span>
                <span className="flex-auto  gap-l-10 flex">
                    {this.bgStyle.mode == 'color' && <span className="w-100 h-20 border round " style={{ backgroundColor: this.bgStyle.color, display: 'block' }}></span>}
                    {this.bgStyle.mode == 'image' && this.bgStyle.src && <img className="obj-center w-100 h-20 round" src={this.bgStyle.src}></img>}
                    {this.bgStyle.mode == 'uploadImage' && this.bgStyle.src && <img className="obj-center w-100 h-20  round" src={this.bgStyle.src}></img>}
                    {this.bgStyle.mode == 'grad' && this.bgStyle.grad?.bg && <span className="w-100 h-20 border round " style={{ backgroundImage: this.bgStyle.grad?.bg, display: 'block' }}></span>}
                </span>
                <span className="flex-fixed flex-center size-20 remark"><Icon size={14} icon={ChevronDownSvg}></Icon></span>
            </div>
            {this.spread && this.renderDrops()}
        </div>
    }
    setProps(data: Record<string, any>) {
        Object.assign(this.bgStyle, data);
        this.forceUpdate();
        this.props.onChange(data as any);
    }
    cacDrop() {
        if (this.props.isFill) return;
        if (this.dropEle) {
            var de = Rect.fromEle(this.dropEle);
            var re = Rect.fromEle(this.el);
            this.top = 0;
            if (this.top + de.height + re.top > window.innerHeight) {
                this.top = window.innerHeight - re.top - de.height - 20;
            }
            this.forceUpdate();
        }
    }
    spread: boolean = false;
    dropEle: HTMLElement;
    getItems() {
        var items = [
            { icon: { name: 'byte', code: 'rectangle-one' }, name: 'none', value: "none", stext: lst('无背景'), text: lst('无背景'), checkLabel: this.bgStyle?.mode == 'none' },
            { type: MenuItemType.divide },
            { icon: { name: 'byte', code: 'pic' }, name: 'image', text: lst('选择图片'), stext: lst('图片'), value: 'image', checkLabel: this.bgStyle?.mode == 'image' },
            { icon: { name: 'byte', code: 'upload-one' }, name: 'uploadImage', text: lst('上传图片'), stext: lst('图片'), value: 'uploadImage', checkLabel: this.bgStyle?.mode == 'uploadImage' },
            { type: MenuItemType.divide },
            { icon: { name: 'byte', code: 'background-color' }, stext: lst('背景色'), name: 'color', text: lst('颜色'), value: 'color', checkLabel: this.bgStyle?.mode == 'color' },
            { icon: { name: 'byte', code: 'color-filter' }, stext: lst('渐变色'), name: 'grad', text: lst('渐变色'), value: 'grad', checkLabel: this.bgStyle?.mode == 'grad' }
        ] as MenuItem<string>[];
        if (this.props.isNotEmpty == true)
            items = items.slice(2);
        return items;
    }
    renderDrops() {
        var self = this;
        return <div ref={e => this.dropEle = e} className={this.props.isFill ? "" : "pos padding-h-10     shadow border round bg-white "}
            style={this.props.isFill ? {} : {
                top: this.top,
                transform: 'translate(-100%, 0%)',
                width: 310,
                left: -10,
                display: this.bgStyle.mode == 'none' ? 'none' : 'block',

            }}>
            {!this.props.isFill && <div className="pos size-24 round item-hover flex-center cursor" onMouseDown={e => {
                this.spread = false;
                setTimeout(() => {
                    if (this.props.openSpread)
                        this.props.openSpread(this.spread);
                }, 10);
                this.forceUpdate();
            }} style={{ top: 0, right: 0 }}>
                <Icon icon={CloseSvg} size={14}></Icon>
            </div>}
            <div className={this.props.isFill ? "" : "max-h-400 overflow-y"}>
                {this.props.isFill && <div className="gap-b-10 padding-w-15">
                    <SelectBox dropAlign="full" border value={this.bgStyle.mode} onChange={(r, item) => {
                        self.setProps({ mode: item.value })
                        self.forceUpdate(() => {
                            self.cacDrop();
                        })
                    }} options={this.getItems()}></SelectBox>
                </div>}
                {
                    this.bgStyle.mode == 'none' && <div className="padding-w-15 remark f-12 flex-center min-h-30">
                        <S>无背景</S>
                    </div>
                }
                {
                    this.bgStyle.mode == 'image' && <div className="padding-l-15">
                        {GalleryBgs().map(gp => {
                            return <div className="gap-b-15 " key={gp.group}>
                                <div className="remark">{gp.group}</div>
                                <div className="flex flex-wrap">
                                    {gp.childs.map(gc => {
                                        return <div
                                            onMouseDown={e => {
                                                this.setProps({ 'mode': 'image', 'src': gc.url })
                                            }}
                                            key={gc.url}
                                            style={{ width: `calc( 50% - 15px )` }} className={'relative gap-r-15 gap-b-10 cursor ' + (this.props.smallGallery ? " h-80" : " h-100")}>
                                            <img className="op-hover obj-center w100 h100 round" src={gc.thumb} />
                                            {gc.url == this.bgStyle?.src && <div className="pos-all flex-end-top">
                                                <span className="flex-center size-20 round bg-white shadow gap-5"><Icon size={16} icon={CheckSvg}></Icon></span>
                                            </div>}
                                        </div>
                                    })}
                                </div>
                            </div>
                        })}
                    </div>
                }
                {
                    this.bgStyle.mode == 'uploadImage' && <div className="padding-w-15">
                        {this.bgStyle.src && <div ><img className="obj-center w100" src={this.bgStyle.src} /></div>}
                        <UploadView mine='image' change={e => {
                            this.setProps({
                                'mode': 'uploadImage',
                                'src': e.url
                            })
                        }}></UploadView>
                    </div>
                }
                {
                    this.bgStyle.mode == 'color' && <div className="padding-w-15" >
                        <div className="remark f-12 gap-b-5"><S>背景色</S></div>
                        <div className="gap-b-10">
                            <ColorInput color={this.bgStyle?.color} onChange={e => {
                                this.setProps({ 'mode': 'color', 'color': e })
                            }}></ColorInput>
                        </div>
                        <div className="remark f-12 gap-b-5"><S>选择主题色</S></div>
                        {GetPageBgs().map(bg => {
                            return <div key={bg.color}
                                onMouseDown={e => {
                                    this.setProps({ 'mode': 'color', 'color': bg.color })
                                }}
                                style={{ background: bg.color }}
                                className='round cursor gap-h-10 h-28 border item-hover-light flex padding-w-10' >
                                <span className="flex-auto text-1">{bg.text}</span>
                                {this.bgStyle?.color == bg.color && <span className="size-20 flex-center flex-fixed">
                                    <Icon size={16} icon={CheckSvg}></Icon>
                                </span>}
                            </div>
                        })}
                    </div>
                }
                {this.bgStyle.mode == 'grad' && <div className="padding-w-15" >
                    <GradColor grad={this.bgStyle.grad} onChange={e => {
                        this.setProps({ mode: 'grad', grad: e });
                    }}>
                    </GradColor>
                </div>}
            </div>
        </div>
    }
    componentDidMount(): void {
        document.addEventListener('mousedown', this.globalMousedown, true);
    }
    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.globalMousedown, true);
    }
    globalMousedown = (e: MouseEvent) => {
        if (this.spread == false) return;
        var ele = e.target as HTMLElement;
        var s = document.body.querySelector('.shy-app') as HTMLElement;
        var panel = this.el.closest('.shy-popover-box');
        if (s.contains(ele) && !this.el.contains(ele) || panel.contains(ele) && !this.el.contains(ele)) {
            this.spread = false;
            setTimeout(() => {
                if (this.props.openSpread)
                    this.props.openSpread(this.spread);
            }, 10);
            e.stopPropagation();
            this.forceUpdate();
        }
    }
}