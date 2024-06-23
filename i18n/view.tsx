import React from "react";
import { ls, lst } from "./store";
import lodash from "lodash";

export class S extends React.Component<{ text?: string, data?: Record<string, any>, children: React.ReactText }> {
    render() {
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

export class Sp extends React.Component<{
    block?: boolean,
    text: string,
    className?: string | (string[]),
    data?: Record<string, any>,
    view?: Record<string, JSX.Element>,
    children?: React.ReactNode
}> {
    split(text: string): JSX.Element[] {
        var ps: JSX.Element[] = [];
        var te = '';
        for (let i = 0; i < text.length; i++) {
            var c = text[i];
            if (c == '{') {
                if (te) ps.push(<span key={i}>{te}</span>);
                te = '';
                var m = text.slice(i + 1).match(/^[^\{\}]+/);
                if (m) {
                    var k = m[0];
                    i += k.length + 1;
                    if (this.props.view[k.trim()]) ps.push(<span key={i + 1}>{this.props.view[k.trim()]}</span>);
                    else ps.push(<span key={i + 1}>{k}</span>);
                }
            }
            else te += c;
        }
        if (te) ps.push(<span key={text.length + 1}>{te}</span>);
        return ps;
    }
    render() {
        var text = lst(this.props.text, this.props.data || undefined, true);
        if (!text && lodash.isObject(this.props.view)) text = this.props.text;
        var classList: string[] = [];
        if (this.props.className) {
            if (lodash.isArray(this.props.className)) {
                classList.push(...this.props.className);
            } else {
                classList.push(this.props.className);
            }
        }
        if (this.props.block) {
            if (text) {
                if (lodash.isObject(this.props.view) && Object.keys(this.props.view).length > 0) {
                    return <div className={classList.join(' ')}>{this.split(text)}</div>
                }
                else return <div className={classList.join(' ')} dangerouslySetInnerHTML={{ __html: text }}></div>;
            }
            else return <div className={classList.join(' ')}>{this.props.children}</div>
        }
        else {
            if (text) {
                if (lodash.isObject(this.props.view) && Object.keys(this.props.view).length > 0) {
                    return <span className={classList.join(' ')} >{this.split(text)}</span>
                }
                else return <span className={classList.join(' ')} dangerouslySetInnerHTML={{ __html: text }}></span>;
            }
            else return <span className={classList.join(' ')}>{this.props.children}</span>
        }
    }
    componentDidMount(): void {
        ls.sps.push(this);
    }
    componentWillUnmount(): void {
        lodash.remove(ls.sps, g => g === this)
    }
}