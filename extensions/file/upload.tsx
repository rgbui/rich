import React from "react";
import { Button } from "../../component/view/button";
import { Sp } from "../../i18n/view";
import { channel } from "../../net/channel";
import { ResourceArguments } from "../icon/declare";
import { util } from "../../util/util";
import { lst } from "../../i18n/store";
import { OpenFileDialoug } from "../../component/file";
import { PlusSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";

export class UploadView extends React.Component<{
    mine: 'image' | 'file' | 'audio' | 'video',
    fileClassify?: 'cover',
    warn?: boolean,
    change: (file: ResourceArguments) => void,
    button?: boolean
}> {
    async onUpload(file: File) {
        if (!file) return;
        if (this.button) this.button.loading = true;
        this.error = '';
        try {
            var isUpload: boolean = true;
            if (this.props.mine == 'image' && file.size > 1024 * 1024 * 20) {
                this.error = lst('不支持20M以上的图片');
                isUpload = false;
            }
            if (file.size > 1024 * 1024 * 100) {
                this.error = lst('暂时不支持2G以上的文件');
                isUpload = false;
            }
            if (isUpload) {
                this.progress = '';
                this.forceUpdate();
                var r = await channel.post('/ws/upload/file', {
                    file,
                    data: this.props.fileClassify ? {
                        fileClassify: this.props.fileClassify
                    } : undefined,
                    uploadProgress: (event) => {
                        // console.log(event, 'ev');
                        if (event.lengthComputable) {
                            this.progress = `${util.byteToString(event.total)}  ${(100 * event.loaded / event.total).toFixed(2)}%`;
                            this.forceUpdate();
                        }
                    }
                })
                this.progress = '';
                this.forceUpdate();
                if (r.ok) {
                    if (r.data?.file?.url) {
                        this.props.change(r.data?.file as any);
                    }
                }
                else {
                    this.error = lst('上传失败');
                    this.forceUpdate();
                }
            }
            else {
                this.forceUpdate();
            }
        }
        catch (ex) {
            throw ex
        }
        finally {
            if (this.button) this.button.loading = false;
        }
    }
    async onOpenFile() {
        var exts = ['*'];
        if (this.props.mine == 'image') exts = ['image/*'];
        else if (this.props.mine == 'audio') exts = ['audio/*'];
        else if (this.props.mine == 'video') exts = ['video/*'];
        var file = await OpenFileDialoug({ exts: exts });
        if (file) {
            this.onUpload(file);
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
        e.stopPropagation();
        var file = e.clipboardData.files[0];
        if (file) {
            this.onUpload(file);
        }
        else {
            var url = e.clipboardData.getData('text');
            if (url && url.startsWith('http')) {
                this.props.change({ name: 'link', url });
            }
        }
    }
    button: Button;
    error: string;
    progress: string = '';
    render() {
        var text = lst('上传文件');
        var mineText = lst('拖放文件或粘贴文件或粘贴文件网址');
        if (this.props.mine == 'image') { text = lst('上传图片'); mineText = mineText = lst('拖放图片或粘贴图片或粘贴图片网址'); }
        else if (this.props.mine == 'video') { text = lst('上传视频'); mineText = mineText = lst('拖放视频或粘贴视频或粘贴视频网址'); }
        else if (this.props.mine == 'audio') { text = lst('上传音频'); mineText = mineText = lst('拖放音频或粘贴音频或粘贴音频网址'); }
        return <div className='shy-upload'>
            <div className="dashed gap-h-10 cursor round flex-center flex-col min-h-80  padding-10" tabIndex={1} onPaste={this.onPaste} onDragOverCapture={e => { e.preventDefault() }} onDrop={this.onDrop}>
                <span className="remark f-14">
                    {mineText}
                </span>
                {this.props.button == false && <div >
                    <div onClick={e => this.onOpenFile()} className="circle remark border-light cursor  flex flex-center size-30 item-hover-light-foucs item-hover">
                        <Icon size={20} icon={PlusSvg}></Icon>
                    </div>
                </div>}
            </div>
            {this.props.button !== false && <Button onClick={e => this.onOpenFile()} ref={e => this.button = e} block>{text}</Button>}
            {this.progress && <div className="remark">{this.progress}</div>}
            {this.error && <div className='error bold'>{this.error}</div>}
            {this.props.warn !== false && <div className='shy-upload-remark remark f-12 gap-h-10'>
                <Sp text={'请勿上传色情'}>请勿上传色情、涉政涉恐涉暴、侵权内容或<a target='_blank' className="link-red" href='https://shy.live/service_protocol'>服务条款</a>
                    中禁止上传的其它内容</Sp>
            </div>}
        </div>
    }
}