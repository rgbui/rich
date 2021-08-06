import React from "react";
import { Button } from "../../component/button";
import { Input } from "../../component/input";


export class OutsideUrl extends React.Component<{ change: (url: string) => void }>{
    private url: string = '';
    save() {
        this.props.change(this.url);
    }
    render() {
        return <div className='shy-outside-url'>
            <Input value={this.url} onChange={e => this.url = e} onEnter={e => { this.url = e; this.save() }}></Input>
            <Button onClick={() => this.save()}>提交</Button>
        </div>
    }
}