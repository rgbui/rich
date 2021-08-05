import React from "react";
import { Button } from "../../component/button";
import { OpenFileDialoug } from "../../component/file";
import { Sp } from "../../i18n";
import { LangID } from "../../i18n/declare";
import { Directive } from "../../util/bus/directive";
import { bus } from "../../util/bus/event.bus";
export class UploadView extends React.Component<{ mine: 'image' | 'file' | 'audio' | 'video', change: (url: string) => void }> {
    async uploadFile() {
        var file = await OpenFileDialoug();
        if (file) {
            var r = await bus.fireAsync(Directive.uploadFile, file, (event) => {

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