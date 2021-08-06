
import React, { CSSProperties } from "react";
import { Tip } from "../../component/tip";
import { LangID } from "../../i18n/declare";
import { SyExtensionsComponent } from "../sy.component";
import Emoji from "../../src/assert/svg/emoji.svg";
import FontAwesome from "../../src/assert/svg/fontawesome.svg";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/uplaod.svg";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { UploadView } from "../file/upload";
import { EmojiView } from "../emoji/view";
import { FontaweSomeView } from "../fontawesome";
import { OutsideUrl } from "../link/outside";
import { PopoverPosition } from "../popover/position";

class IconPicker extends SyExtensionsComponent {
    point: Point = new Point(0, 0);
    visible: boolean = false;
    mode: 'emoji' | 'FontAwesome' | 'upload' | 'link' = 'emoji';
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
    onChange(mode: IconPicker['mode'], data: any) {

    }
    render() {
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        }
        return <div>{this.visible && <div className='shy-icon-picker' style={style}>
            <div className='shy-icon-picker-head'>
                <Tip id={LangID.IconEmoji}><a><Emoji></Emoji></a></Tip>
                <Tip id={LangID.IconFontAwesome}><a><FontAwesome></FontAwesome></a></Tip>
                <Tip overlay id={LangID.IconUpload}><a><Upload></Upload></a></Tip>
                <Tip id={LangID.IconLink}><a><Link></Link></a></Tip>
            </div>
            <div className='shy-icon-picker-content'>
                {this.mode == 'emoji' && <EmojiView change={e => this.onChange(this.mode, { code: e.char })}></EmojiView>}
                {this.mode == 'FontAwesome' && <FontaweSomeView change={e => this.onChange(this.mode, { ...e })}></FontaweSomeView>}
                {this.mode == 'upload' && <UploadView mine='image' change={e => this.onChange(this.mode, { url: e })}></UploadView>}
                {this.mode == 'link' && <OutsideUrl change={e => this.onChange(this.mode, { url: e })}></OutsideUrl>}
            </div>
        </div>}
        </div>
    }
}