import React from "react";
import { Button } from "../../component/view/button";
import { Input } from "../../component/view/input";
import { S, Sp } from "../../i18n/view";
import "./style.less";
import { ls } from "../../i18n/store";

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
            <Input placeholder={ls.t('请输入网址')} value={this.url} onChange={e => this.url = e} onEnter={e => { this.url = e; this.save() }}></Input>
            <Button block style={{ width: 200 }} onClick={() => this.save()}><S>保存</S></Button>
            {this.error && <div className='shy-outside-url-error'>{this.error}</div>}
            {this.props.remark && <div className='shy-outside-url-remark'>{this.props.remark}</div>}
        </div>
    }
}