import React from "react";
import { Button } from "../../component/view/button";
import { Input } from "../../component/view/input";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { langProvider } from "../../i18n/provider";

import "./style.less";

export class OutsideUrl extends React.Component<{ url?: string, remark?: React.ReactNode, change: (url: string) => void }>{
    constructor(props) {
        super(props);
        if (this.props.url) this.url = this.props.url;
    }
    private url: string = '';
    private error: string = '';
    save() {
        this.props.change(this.url);
    }
    render() {
        return <div className='shy-outside-url'>
            <Input placeholder={langProvider.getText(LangID.PleaseInputLink)} value={this.url} onChange={e => this.url = e} onEnter={e => { this.url = e; this.save() }}></Input>
            <Button block style={{ width: 200 }} onClick={() => this.save()}><Sp id={LangID.SubmitButton}></Sp></Button>
            {this.error && <div className='shy-outside-url-error'>{this.error}</div>}
            {this.props.remark && <div className='shy-outside-url-remark'>{this.props.remark}</div>}
        </div>
    }
}