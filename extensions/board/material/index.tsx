/**
 * 
 * 表材库
 * 
 */
import React, { CSSProperties } from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { S } from "../../../i18n/view";
import { CloseSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { IllustrationView } from "./illustrator";
import { MaterialIconView } from "./icon";
import { MaterialEmojiView } from "./emoji";
import { Singleton } from "../../../component/lib/Singleton";
import { Point } from "../../../src/common/vector/point";
import { popoverLayer } from "../../../component/lib/zindex";
import { MaterialImageView } from "./image";
import { illustratorList, stickers } from "./data";
import { assyDiv } from "../../../component/types";

export class MaterialView extends EventsComponent {
    mode: string = '';
    renderGroups() {
        if (this.mode) return <></>
        return <div className="h100">

            <div className="flex h-30 border-bottom padding-w-5">
                <span className="flex-auto f-14 b-500"><S>素材库</S></span>
                <span className="flex-fixed remark item-hover size-24 round item-hover flex-center" onClick={e => this.close()}><Icon size={12} icon={CloseSvg}></Icon></span>
            </div>

            <div className="overflow-y" style={{ height: 'calc( 100% - 30px )' }}>
                <div className="col-2 gap-h-10">

                    <div className="visible-hover">
                        <div className="flex h-24 cursor" onMouseDown={e => { this.mode = '贴纸'; this.forceUpdate() }}>
                            <span className="flex-auto b-599 f-14 gap-l-5"><S>贴纸</S></span>
                            <span className="remark flex-fixed visible">{stickers.map(s => s.pics.length).sum(t => t)}</span>
                            <Icon className={'remark flex-fixed visible'} size={14} icon={{ name: 'byte', code: 'right' }}></Icon>
                        </div>
                        <div className="bg-1 round min-h-80 flex flex-wrap">
                            {stickers[0].pics.slice(0, 4).map((pic, index) => {
                                return <div onMouseDown={e => this.onMouseDown({ url: pic.url, mime: 'image' })} style={{
                                    width: 'calc( 50% - 5px)',
                                    marginRight: index == 0 ? 5 : undefined,
                                    marginLeft: index == 1 ? 5 : undefined,
                                    marginBottom: 5
                                }} key={index}>
                                    <img style={{ maxWidth: 'calc( 100% - 10px)' }} src={pic.url} alt={pic.text} />
                                </div>
                            })}
                        </div>
                    </div>

                    <div className="visible-hover">
                        <div className="flex h-24 cursor" onMouseDown={e => { this.mode = '插画'; this.forceUpdate() }}>
                            <span className="flex-auto b-599 f-14 "><S>插画</S></span>
                            <span className="remark flex-fixed visible">{illustratorList.map(s => s.pics.length).sum(t => t)}</span>
                            <Icon className={'remark flex-fixed visible'} size={14} icon={{ name: 'byte', code: 'right' }}></Icon>
                        </div>
                        <div className="bg-1 round min-h-80 flex flex-wrap">
                            {illustratorList[0].pics.slice(0, 4).map((pic, index) => {
                                return <div onMouseDown={e => this.onMouseDown({ url: pic.url, mime: 'image' })} style={{
                                    width: 'calc( 50% - 5px)',
                                    marginRight: index == 0 ? 5 : undefined,
                                    marginLeft: index == 1 ? 5 : undefined,
                                    marginBottom: 5
                                }} key={index}>
                                    <img style={{ maxWidth: 'calc( 100% - 10px)' }} src={pic.url} alt={pic.text} />
                                </div>
                            })}
                        </div>
                    </div>

                </div>

                <div className="col-2">

                    <div className="visible-hover">
                        <div className="flex h-24 cursor" onMouseDown={e => { this.mode = '图标'; this.forceUpdate() }}>
                            <span className="flex-auto b-599 f-14  gap-l-5"><S>图标</S></span>
                            <span className="remark flex-fixed visible">1000+</span>
                            <Icon className={'remark flex-fixed visible'} size={14} icon={{ name: 'byte', code: 'right' }}></Icon>
                        </div>
                        <div className="bg-1 round min-h-80  flex flex-wrap r-item-hover r-flex-center r-h-30 r-round r-cursor ">
                            {[
                                {
                                    name: 'byte',
                                    code: 'send'
                                },
                                {
                                    name: 'byte',
                                    code: 'hourglass-null'
                                },
                                {
                                    name: 'byte',
                                    code: 'umbrella'
                                },
                                {
                                    name: 'byte',
                                    code: 'bookshelf'
                                },
                                {
                                    name: 'byte',
                                    code: 'plan'
                                },
                                {
                                    name: 'byte',
                                    code: 'pushpin'
                                }
                            ].map((icon, index) => {
                                return <span key={index} onMouseDown={e => {
                                    this.onMouseDown({ data: icon, mime: "icon" }, e)
                                }} style={{
                                    width: 'calc(33.3% - 5px)',
                                    marginRight: 5,
                                }}>
                                    <Icon icon={icon as any}></Icon>
                                </span>
                            })}
                        </div>
                    </div>
                    <div className="visible-hover">
                        <div className="flex h-24 cursor" onMouseDown={e => { this.mode = '表情'; this.forceUpdate() }}>
                            <span className="flex-auto b-599 f-14"><S>表情</S></span>
                            <span className="remark flex-fixed visible">1000+</span>
                            <Icon className={'remark flex-fixed visible'} size={14} icon={{ name: 'byte', code: 'right' }}></Icon>
                        </div>
                        <div className="bg-1 round min-h-80  flex flex-wrap r-item-hover r-flex-center r-h-30  r-round r-cursor">
                            {
                                [
                                    {
                                        name: 'emoji',
                                        code: '😀'
                                    },
                                    {
                                        name: 'emoji',
                                        code: '😃'
                                    },
                                    {
                                        name: 'emoji',
                                        code: '😄'
                                    },
                                    {
                                        name: 'emoji',
                                        code: '😁'
                                    },
                                    {
                                        name: 'emoji',
                                        code: '😆'
                                    },
                                    {
                                        name: 'emoji',
                                        code: '😅'
                                    },
                                ].map((icon, index) => {
                                    return <span key={index} onMouseDown={e => {
                                        this.onMouseDown({ data: icon, mime: "emoji" }, e)
                                    }} style={{
                                        width: 'calc(33.3% - 5px)',
                                        marginRight: 5,
                                    }}>
                                        <Icon size={22} icon={icon as any}></Icon>
                                    </span>
                                })
                            }
                        </div>
                    </div>
                </div>

                <div className="col-2">
                    <div className="visible-hover">
                        <div className="flex h-24 cursor" onMouseDown={e => { this.mode = '图片库'; this.forceUpdate() }}>
                            <span className="flex-auto b-599 f-14 gap-l-5"><S>图片库</S></span>
                            <span className="remark flex-fixed visible">1000+</span>
                            <Icon className={'remark flex-fixed visible'} size={14} icon={{ name: 'byte', code: 'right' }}></Icon>
                        </div>
                        <div className="bg-1 round min-h-80 flex flex-wrap">
                            {
                                [
                                    {
                                        title: '',
                                        url: 'https://resources.shy.live/gallery/ai/shy_2024_4_7.png',
                                        thumb: 'https://resources.shy.live/gallery/ai/shy_2024_4_7_thumb.png'
                                    },
                                    {
                                        title: '',
                                        url: 'https://resources.shy.live/gallery/ai/shy_2024_4_1.png',
                                        thumb: 'https://resources.shy.live/gallery/ai/shy_2024_4_1_thumb.png'
                                    },
                                    {
                                        title: '',
                                        url: 'https://resources.shy.live/gallery/ai/shy_2024_4_16.png',
                                        thumb: 'https://resources.shy.live/gallery/ai/shy_2024_4_16_thumb.png'
                                    },
                                    {
                                        title: '',
                                        url: 'https://resources.shy.live/gallery/ai/shy_2024_4_12.png',
                                        thumb: 'https://resources.shy.live/gallery/ai/shy_2024_4_12_thumb.png'
                                    }
                                ].map((pic, index) => {
                                    return <div className="flex-center" onMouseDown={e => {
                                        this.onMouseDown({ url: pic.url, mime: 'image' }, e)
                                    }} style={{
                                        width: 'calc( 50% - 5px)',
                                        marginRight: index == 0 ? 5 : undefined,
                                        marginLeft: index == 1 ? 5 : undefined,
                                        marginBottom: 5
                                    }} key={index}>
                                        <img className="obj-center" style={{ maxWidth: 'calc( 100% - 10px)', height: 50 }} src={pic.thumb} />
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    <div>
                    </div>
                </div>

            </div>
        </div>
    }
    renderDetail() {
        if (!this.mode) return <></>
        return <div className="h100">
            <div className="flex h-30 cursor border-bottom  padding-w-5" onMouseDown={e => { this.mode = ''; this.forceUpdate() }}>
                <span className="flex-fixed size-20 flex-center "><Icon size={18} icon={{ name: 'byte', code: 'left' }}></Icon></span>
                <span className="flex-auto">{this.mode}</span>
                <span className="flex-fixed size-20 cursor round item-hover flex-center " onClick={e => { e.stopPropagation(); this.close() }}><Icon size={12} icon={CloseSvg}></Icon></span>
            </div>
            <div className="overflow-y"
                style={{
                    height: 'calc(100% - 30px)',
                }} >
                {this.mode == '贴纸' && <IllustrationView images={stickers} onMouseDown={(p, e) => {
                    this.onMouseDown({ url: p.url, mime: 'image' }, e)
                }}></IllustrationView>}
                {this.mode == '插画' && <IllustrationView images={illustratorList} onMouseDown={(p, e) => {
                    this.onMouseDown({ url: p.url, mime: 'image' }, e)
                }}></IllustrationView>}
                {this.mode == '图标' && <MaterialIconView change={e => {
                    console.log('eeee',e);
                    this.onMouseDown({ data: e, mime: 'icon' })
                }}></MaterialIconView>}
                {this.mode == '表情' && <MaterialEmojiView change={e => {

                    this.onMouseDown({ data: e, mime: 'emoji' })
                }}></MaterialEmojiView>}
                {this.mode == '图片库' && <MaterialImageView onChange={e => {
                    this.onMouseDown({ url: e.url, mime: 'image' })
                }}></MaterialImageView>}
            </div>
        </div>
    }
    render() {
        if (!this.visible) return <></>
        var style: CSSProperties = {
            top: this.point?.y,
            left: this.point?.x,
            zIndex: popoverLayer.zoom(this),
            maxHeight: '80vh'
        };
        return <div style={style} ref={e => this.el = e} className="pos w-300  h-500  bg-white shadow border  round-4 ">
            {this.renderDetail()}
            {this.renderGroups()}
        </div>
    }
    onMouseDown(data: Record<string, any>, e?: React.MouseEvent) {
        this.emit('save', data, e);
    }
    el: HTMLElement;
    private point: Point;
    visible: boolean = false;
    open(point: Point) {
        this.point = point;
        this.visible = true;
        this.forceUpdate()
    }
    close(): void {
        this.visible = false;
        this.forceUpdate();
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


var _mv: MaterialView;
export async function openMaterialView() {
    return _mv = await Singleton(MaterialView);
}

export function closeMaterialView() {
    if (_mv) _mv.close();
}

