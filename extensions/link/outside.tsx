import React from "react";
import { Button } from "../../component/view/button";
import { Input } from "../../component/view/input";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import "./style.less";

export class OutsideUrl extends React.Component<{ url?: string, remark?: React.ReactNode, change: (url: string) => void }> {
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
        return <div className='shy-outside-url padding-10 flex-center flex-col'>
            <Input placeholder={lst('请输入网址')} value={this.url} onChange={e => this.url = e} onEnter={e => { this.url = e; this.save() }}></Input>
            <div className="flex-center gap-t-10">
                <Button block style={{ width: 200 }} onClick={() => this.save()}><S>保存</S></Button>
            </div>
            {this.error && <div className='shy-outside-url-error error gap-t-10'>{this.error}</div>}
            {this.props.remark && <div className='shy-outside-url-remark remark f-12 gap-t-10'>{this.props.remark}</div>}
        </div>
    }
}