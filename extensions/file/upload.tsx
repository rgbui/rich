import React from "react";
import { Button } from "../../component/view/button";
import { OpenFileDialoug } from "../../component/file";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { channel } from "../../net/channel";
import {  ResourceArguments } from "../icon/declare";
export class UploadView extends React.Component<{ mine: 'image' | 'file' | 'audio' | 'video', change: (file:ResourceArguments) => void }> {
    async uploadFile() {
        var exts = ['*'];
        if (this.props.mine == 'image') exts = ['image/*'];
        else if (this.props.mine == 'audio') exts = ['audio/*'];
        else if (this.props.mine == 'video') exts = ['video/*'];
        var file = await OpenFileDialoug({ exts });
        if (file) {
            var r = await channel.post('/ws/upload/file', {
                file, uploadProgress: (event) => {
                    console.log(event, 'ev');
                }
            })
            if (r.ok) {
                if (r.data?.file?.url) {
                    this.props.change(r.data?.file as any);
                }
            }
        }
    }
    render() {
        var text = '上传文件';
        if (this.props.mine == 'image') text = '上传图片';
        else if (this.props.mine == 'video') text = '上传视频';
        else if(this.props.mine=='audio')text='上传音频';
        return <div className='shy-upload'>
            <div className='shy-upload-remark'>
                <Sp id={LangID.UploadRemark}></Sp>
            </div>
            <Button block onClick={e => this.uploadFile()}>{text}</Button>
            <div className='shy-upload-error'>
            </div>
        </div>
    }
}