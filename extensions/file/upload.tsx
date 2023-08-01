import React from "react";
import { Button } from "../../component/view/button";
import { S, Sp } from "../../i18n/view";
import { channel } from "../../net/channel";
import { ResourceArguments } from "../icon/declare";
import { util } from "../../util/util";
import { FileView } from "../../component/view/input/file.view";
import { lst } from "../../i18n/store";

export class UploadView extends React.Component<{ mine: 'image' | 'file' | 'audio' | 'video', change: (file: ResourceArguments) => void }> {
    async onUpload(file: File) {
        if (!file) return;
        var isUpload: boolean = true;
        if (this.props.mine == 'image' && file.size > 1024 * 1024 * 20) {
            this.error =lst('图片过大，不支持20M以上的图片') ;
            isUpload = false;
        }
        if (file.size > 1024 * 1024 * 100) {
            this.error =lst('文件过大，暂时不支持100G以上的文件') ;
            isUpload = false;
        }
        if (isUpload) {
            var r = await channel.post('/ws/upload/file', {
                file,
                uploadProgress: (event) => {
                    // console.log(event, 'ev');
                    if (event.lengthComputable) {
                        this.progress = `${util.byteToString(event.total)}  ${(100 * event.loaded / event.total).toFixed(2)}%`;
                        this.forceUpdate();
                    }
                }
            })
            this.progress = '';
            this.button.disabled = false;
            this.forceUpdate();
            if (r.ok) {
                if (r.data?.file?.url) {
                    this.props.change(r.data?.file as any);
                }
            }
        }
        else {
            this.forceUpdate();
        }
    }
    onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        let file = e.dataTransfer.files[0];
        if (file) {
            this.onUpload(file);
        }
    }
    onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        var file = e.clipboardData.files[0];
        if (file) {
            this.onUpload(file);
        }
    }
    button: Button;
    error: string;
    progress: string = '';
    render() {
        var text = lst('上传文件');
        if (this.props.mine == 'image') text =lst('上传图片') ;
        else if (this.props.mine == 'video') text = lst('上传视频');
        else if (this.props.mine == 'audio') text = lst('上传音频');
        var exts = ['*'];
        if (this.props.mine == 'image') exts = ['image/*'];
        else if (this.props.mine == 'audio') exts = ['audio/*'];
        else if (this.props.mine == 'video') exts = ['video/*'];
        return <div className='shy-upload'>
            <div className='shy-upload-remark'>
                <Sp key={'请勿上传色情、涉政涉恐涉暴、侵权内容'}>请勿上传色情、涉政涉恐涉暴、侵权内容或<a target='_blank' className="link-red" href='https://shy.live/service_protocol'>服务条款</a>
                    中禁止上传的其它内容</Sp>
            </div>
            <FileView exts={exts} onChange={e => { this.onUpload(e[0]) }}>
                <div className="dashed gap-h-10 round flex-center min-h-80" tabIndex={1} onPaste={this.onPaste} onDrop={this.onDrop}>
                    <span className="remark"><S>拖动</S>{text}<S>或粘贴</S>{text.replace(lst('上传'), '')}</span>
                </div>
                <Button ref={e => this.button = e} block>{text}</Button>
            </FileView>
            {this.progress && <span className="remark">{this.progress}</span>}
            {this.error && <div className='shy-upload-error'>{this.error}</div>}
        </div>
    }
}