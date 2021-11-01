import React from "react";
import { Button } from "../../component/view/button";
import { OpenFileDialoug } from "../../component/file";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { Directive } from "../../util/bus/directive";
import { messageChannel } from "../../util/bus/event.bus";
export class UploadView extends React.Component<{ mine: 'image' | 'file' | 'audio' | 'video', change: (url: string) => void }> {
    async uploadFile() {
        var exts = ['*'];
        if (this.props.mine == 'image') exts = ['image/*'];
        else if (this.props.mine == 'audio') exts = ['audio/*'];
        else if (this.props.mine == 'video') exts = ['video/*'];
        var file = await OpenFileDialoug({ exts });
        if (file) {
            var r = await messageChannel.fireAsync(Directive.UploadWorkspaceFile, file, (event) => {
                console.log(event, 'ev');
            });
            if (r.ok) {
                if (r.data.url) {
                    this.props.change(r.data.url);
                }
            }
        }
    }
    render() {
        var id = LangID.UploadFile;
        if (this.props.mine == 'image') id = LangID.UploadImage
        return <div className='shy-upload'>
            <div className='shy-upload-remark'>
                <Sp id={LangID.UploadRemark}></Sp>
            </div>
            <Button block onClick={e => this.uploadFile()}><Sp id={id}></Sp></Button>
            <div className='shy-upload-error'>
            </div>
        </div>
    }
}