import React, { CSSProperties } from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { CloseSvg } from "../../svgs";
import { Icon } from "../icon";
import { useUploadPicker } from "../../../extensions/file/file.picker";
import { Rect } from "../../../src/common/vector/point";
import { lst } from "../../../i18n/store";

export class FileInput extends React.Component<{
    style?: CSSProperties,
    value?: ResourceArguments,
    placeholder?: string,
    onChange?: (value: ResourceArguments) => void,
    className?: string | (string[]),
    mime?: 'image' | 'file' | 'audio' | 'video'
}>{
    render(): React.ReactNode {
        var self = this;
        async function uploadFile(event: React.MouseEvent) {
            var r = await useUploadPicker({ roundArea: Rect.fromEle(event.currentTarget as any) }, self.props.mime);
            if (r) {
                self.props.onChange(r);
            }
        }
        var text = lst('上传文件')
        if (this.props.mime == 'image') {
            text = lst('上传图片')
        }
        else if (this.props.mime == 'audio') {
            text = lst('上传音频')
        }
        else if (this.props.mime == 'video') {
            text =lst('上传视频') 
        }
        return <div className="flex">
            {this.props.value && this.props.mime == 'image' && <span onMouseDown={e => uploadFile(e)} className="flex flex-inline item-hover round padding-w-5 padding-h-2 relative">
                <img className="max-w-100 max-w-180 max-h-120 obj-center" src={this.props.value.url}></img>
                <div className="pos-top-full flex-end">
                    <span onClick={e => {
                        e.stopPropagation();
                        this.props.onChange(null);
                    }} className="size-24 flex-center cursor item-hover"><Icon size={12} icon={CloseSvg}></Icon></span>
                </div>
            </span>}
            {this.props.value && this.props.mime != 'image' && <span onMouseDown={e => uploadFile(e)} className="flex flex-inline item-hover round padding-w-5 padding-h-2">
                <span className="gap-r-10 max-w-100 text-overflow">{this.props.value.filename}</span>
                <Icon size={12} onClick={e => {
                    e.stopPropagation();
                    this.props.onChange(null);
                }} icon={CloseSvg}></Icon>
            </span>}
            {!this.props.value && <span onMouseDown={e => uploadFile(e)} className="flex flex-inline item-hover round padding-w-5 padding-h-2">{text}</span>}
        </div>
    }
}