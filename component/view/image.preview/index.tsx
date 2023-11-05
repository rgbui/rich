import React from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { PopoverSingleton } from "../../popover/popover";
import { ChevronLeftSvg, ChevronRightSvg } from "../../svgs";
import { Icon } from "../icon";
import { getImageSize } from "../../file";
import { EventsComponent } from "../../lib/events.component";
import lodash from "lodash";
import { ToolTip } from "../tooltip";
import { lst } from "../../../i18n/store";

export class ImageViewer extends EventsComponent {
    pics: ResourceArguments[] = [];
    index: number = 0;
    rotate: number = 0;
    zoom: number = 1;
    render() {
        return <div onMouseDown={e => {
            if (e.target == e.currentTarget) {
                this.emit('close')
            }
        }} className="bg-dark  vw100 vh100 relative flex-center">
            {this.pics[this.index] && <img style={{
                transformOrigin: 'center center',
                transform: `rotate(${this.rotate}deg) scale(${this.zoom})`
            }} src={this.pics[this.index].url} />}
            <div className="bg-dark  text-white round h-30 flex-center  r-flex-center" style={{ position: 'absolute', zIndex: 1000, bottom: 20 }}>
                {this.pics.length > 1 && <span className="padding-w-5" style={{ borderRight: '1px solid rgba(255,255,255,.4)' }}>
                    <span className="size-24 cursor flex-center " onClick={e => this.onOperator('prev')}><Icon icon={ChevronLeftSvg}></Icon></span>
                    <span className="gap-w-5">{this.index + 1}/{this.pics.length}</span>
                    <span className="size-24 cursor flex-center " onClick={e => this.onOperator('next')}><Icon icon={ChevronRightSvg}></Icon></span>
                </span>}
                <span className="padding-w-5" style={{ borderRight: '1px solid rgba(255,255,255,.4)' }}>
                    <span className="size-24 cursor flex-center " onClick={e => this.onOperator('zoom-in')}><Icon icon={{ name: 'bytedance-icon', code: 'zoom-out' }}></Icon></span>
                    <span className="gap-w-5">{(this.zoom * 100).toFixed(0)}%</span>
                    <span className="size-24 cursor flex-center " onClick={e => this.onOperator('zoom-out')}><Icon icon={{ name: 'bytedance-icon', code: 'zoom-in' }}></Icon></span>
                    {this.zoom != 1 && <ToolTip overlay={lst('原图大小')}><span className="size-24 cursor flex-center " onClick={e => this.onOperator('one-to-one')}><Icon icon={{ name: 'bytedance-icon', code: 'one-to-one' }}></Icon></span></ToolTip>}
                    {this.zoom == 1 && <ToolTip overlay={lst('自适应')}><span className="size-24 cursor flex-center " onClick={e => this.onOperator('auto')}><Icon icon={{ name: 'bytedance-icon', code: 'fullwidth' }}></Icon></span></ToolTip>}
                </span>
                <ToolTip overlay={lst('旋转90°')}><span className="padding-w-5 size-24 cursor flex-center " onClick={e => this.onOperator('rotate')}><Icon icon={{ name: 'bytedance-icon', code: 'rotate' }}></Icon></span></ToolTip>
            </div>
        </div >
    }
    async onOperator(name: 'prev' | 'next' | 'zoom-in' | 'zoom-out' | 'rotate' | 'one-to-one' | 'auto') {
        switch (name) {
            case 'rotate':
                this.rotate += 90;
                break;
            case 'prev':
                this.index--;
                if (this.index < 0) this.index = this.pics.length - 1;
                this.rotate = 0;
                this.zoom = 1;
                await this.setImageAuto();
                break;
            case 'next':
                this.index++;
                if (this.index >= this.pics.length) this.index = 0;
                this.rotate = 0;
                this.zoom = 1;
                await this.setImageAuto();
                break;
            case 'zoom-in':
                this.zoom = this.zoom * 0.8;
                break;
            case 'zoom-out':
                this.zoom = this.zoom * 1.2;
                break;
            case 'one-to-one':
                this.zoom = 1;
                break;
            case 'auto':
                await this.setImageAuto();
                break;
        }
        this.forceUpdate();
    }
    async open(pic: ResourceArguments, pics: ResourceArguments[]) {
        this.pics = pics;
        this.index = this.pics.findIndex(g => g === pic);
        this.pics = lodash.cloneDeep(this.pics);
        await this.setImageAuto();
        this.forceUpdate();
    }
    async setImageAuto() {
        var pic = this.pics[this.index];
        if (pic.url && typeof pic.width == 'undefined') {
            var s = await getImageSize(pic.url);
            pic.width = s.width;
            pic.height = s.height;
        }
        var rw = 1, rh = 1;
        if (pic.width > window.innerWidth * 0.7) {
            rw = window.innerWidth * 0.7 / pic.width;
        }
        if (pic.height > window.innerHeight * 0.7) {
            rh = window.innerHeight * 0.7 / pic.height;
        }
        this.zoom = Math.min(rw, rh);
    }
}

export async function useImageViewer(pic: ResourceArguments, pics: ResourceArguments[]) {
    let popover = await PopoverSingleton(ImageViewer, { mask: true, shadow: true });
    let imageViewer = await popover.open({ center: true });
    imageViewer.open(pic, pics)
    return new Promise((resolve: (value?: any) => void, reject) => {
        popover.only('close', () => {
            resolve()
        })
        imageViewer.only('close', () => {
            popover.close()
            resolve()
        })
    })
}