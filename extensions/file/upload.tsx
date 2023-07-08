import React from "react";
import { Button } from "../../component/view/button";
import { OpenFileDialoug } from "../../component/file";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { channel } from "../../net/channel";
import { ResourceArguments } from "../icon/declare";
import { util } from "../../util/util";

export class UploadView extends React.Component<{ mine: 'image' | 'file' | 'audio' | 'video', change: (file: ResourceArguments) => void }> {
    async uploadFile() {
        this.button.disabled = true;
        this.error = '';
        var exts = ['*'];
        if (this.props.mine == 'image') exts = ['image/*'];
        else if (this.props.mine == 'audio') exts = ['audio/*'];
        else if (this.props.mine == 'video') exts = ['video/*'];
        this.progress = '';
        this.forceUpdate();
        var file = await OpenFileDialoug({ exts });
        if (file) {
            await this.onUpload(file);
        }
    }
    async onUpload(file: File) {
        var isUpload: boolean = true;
        if (this.props.mine == 'image' && file.size > 1024 * 1024 * 20) {
            this.error = '图片过大，不支持20M以上的图片';
            isUpload = false;
        }
        if (file.size > 1024 * 1024 * 100) {
            this.error = '文件过大，暂时不支持100G以上的文件';
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
        var text = '上传文件';
        if (this.props.mine == 'image') text = '上传图片';
        else if (this.props.mine == 'video') text = '上传视频';
        else if (this.props.mine == 'audio') text = '上传音频';
        return <div className='shy-upload'>
            <div className='shy-upload-remark'>
                <Sp id={LangID.UploadRemark}></Sp>
            </div>
            <div className="dashed gap-h-10 round flex-center min-h-80" tabIndex={1} onPaste={this.onPaste} onDrop={this.onDrop}>
                <span className="remark">拖动{text}或粘贴{text.replace('上传', '')}</span>
            </div>
            <Button ref={e => this.button = e} block onClick={e => this.uploadFile()}>{text}</Button>
            {this.progress && <span className="remark">{this.progress}</span>}
            {this.error && <div className='shy-upload-error'>{this.error}</div>}
        </div>
    }
}