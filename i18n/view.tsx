import React from "react";
import { ls, lst } from "./store";
import lodash from "lodash";

export class S extends React.Component<{ text?: string, data?: Record<string, any>, children: React.ReactText }>{
    render(): React.ReactNode {
        var text = this.props.children.toString().trim();
        if (this.props.text) {
            text = lst(this.props.text, this.props.data || text || undefined);
            if (text) return text;
            else return this.props.children
        }
        text = this.props.children.toString().trim();
        var r = lst(text, this.props.data || undefined);
        if (r) return r;
        else return this.props.children;
    }
    componentDidMount(): void {
        ls.svs.push(this);
    }
    componentWillUnmount(): void {
        lodash.remove(ls.svs, c => c === this)
    }
}

export class Sp extends React.Component<{ block?: boolean, text: string, data?: Record<string, any>, children: React.ReactNode }>{
    render(): React.ReactNode {
        var text = lst(this.props.text, this.props.data || undefined, true);
        if (this.props.block) {
            if (text) return <div dangerouslySetInnerHTML={{ __html: text }}></div>;
            else return <div>{this.props.children}</div>
        }
        else {
            if (text) return <span dangerouslySetInnerHTML={{ __html: text }}></span>;
            else return <span>{this.props.children}</span>
        }
    }
    componentDidMount(): void {
        ls.sps.push(this);
    }
    componentWillUnmount(): void {
        lodash.remove(ls.sps, g => g === this)
    }
}