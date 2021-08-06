import React, { CSSProperties } from "react";
import { Tip } from "../../component/tip";
import { LangID } from "../../i18n/declare";
import { Point,Rect, RectUtility } from "../../src/common/point";
import { OutsideUrl } from "../link/outside";
import { EventsComponent } from "../events.component";
import { UploadView } from "./upload";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/upload.svg";
import { ResourceArguments } from "../icon/declare";
import { Singleton } from "../Singleton";
import { PopoverPosition } from "../popover/position";
class VideoPicker extends EventsComponent {
    point: Point = new Point(0, 0);
    visible: boolean = false;
    mode: 'upload' | 'link' = 'upload';
    private el: HTMLElement;
    open(pos: PopoverPosition) {
        this.visible = true;
        this.point = pos.roundArea.leftTop;
        this.forceUpdate(() => {
            if (this.el) {
                var b = Rect.from(this.el.getBoundingClientRect());
                pos.elementArea = b;
                var newPoint = RectUtility.cacPopoverPosition(pos);
                if (!this.point.equal(newPoint)) {
                    this.point = newPoint;
                    this.forceUpdate();
                }
            }
        })
    }
    onChangeMode(mode: VideoPicker['mode']) {
        this.mode = mode;
        this.forceUpdate()
    }
    onChange(mode: VideoPicker['mode'], data: any) {
        this.emit('select', { name: mode, ...data });
        this.close();
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    onClose() {
        this.close();
        this.emit('close');
    }
    private _mousedown: (event: MouseEvent) => void;
    componentDidMount() {
        document.addEventListener('mousedown', this._mousedown = this.globalMousedown.bind(this), true);
    }
    componentWillUnmount() {
        if (this._mousedown) document.removeEventListener('mousedown', this._mousedown, true);
    }
    private globalMousedown(event: MouseEvent) {
        var target = event.target as HTMLElement;
        if (this.el?.contains(target)) return;
        if (this.visible == true) {
            this.onClose()
        }
    }
    render() {
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        }
        return <div ref={e => this.el = e}>{this.visible && <div className='shy-video-picker' style={style}>
            <div className='shy-video-picker-head'>
                <Tip id={LangID.IconUpload}><a onMouseDown={e => this.onChangeMode('upload')}><Upload></Upload></a></Tip>
                <Tip id={LangID.IconLink}><a onMouseDown={e => this.onChangeMode('link')}><Link></Link></a></Tip>
            </div>
            <div className='shy-video-picker-content'>
                {this.mode == 'upload' && <UploadView mine='video' change={e => this.onChange(this.mode, { url: e })}></UploadView>}
                {this.mode == 'link' && <OutsideUrl change={e => this.onChange(this.mode, { url: e })}></OutsideUrl>}
            </div>
        </div>}
        </div>
    }
}

interface VideoPicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}

export async function useVideoPicker(pos: PopoverPosition) {
    let videoPicker = await Singleton<VideoPicker>(VideoPicker);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        videoPicker.only('select', (data) => {
            resolve(data);
        })
        videoPicker.only('close', () => {
            resolve(null)
        })
    })
}