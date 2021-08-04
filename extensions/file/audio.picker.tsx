import React, { CSSProperties } from "react";
import { Tip } from "../../component/tip";
import { LangID } from "../../i18n/declare";
import { Point, PopoverPosition, Rect, RectUtility } from "../../src/common/point";
import { UrlView } from "../link/url";
import { SyExtensionsComponent } from "../sy.component";
import { UploadView } from "./upload";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/uplaod.svg";
import { ResourceArguments } from "../icon/declare";
import { Singleton } from "../Singleton";
class AudioPicker extends SyExtensionsComponent {
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
    onChangeMode(mode: AudioPicker['mode']) {
        this.mode = mode;
        this.forceUpdate()
    }
    onChange(mode: AudioPicker['mode'], data: any) {
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
        return <div ref={e => this.el = e}>{this.visible && <div className='shy-audio-picker' style={style}>
            <div className='shy-audio-picker-head'>
                <Tip id={LangID.IconUpload}><a onMouseDown={e => this.onChangeMode('upload')}><Upload></Upload></a></Tip>
                <Tip id={LangID.IconLink}><a onMouseDown={e => this.onChangeMode('link')}><Link></Link></a></Tip>
            </div>
            <div className='shy-audio-picker-content'>
                {this.mode == 'upload' && <UploadView mine='audio' change={e => this.onChange(this.mode, { url: e })}></UploadView>}
                {this.mode == 'link' && <UrlView change={e => this.onChange(this.mode, { url: e })}></UrlView>}
            </div>
        </div>}
        </div>
    }
}

interface AudioPicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}

export async function useAudioPicker(pos: PopoverPosition) {
    let audioPicker = await Singleton<AudioPicker>(AudioPicker);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        audioPicker.only('select', (data) => {
            resolve(data);
        })
        audioPicker.only('close', () => {
            resolve(null)
        })
    })
}