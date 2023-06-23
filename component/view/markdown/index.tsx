import React from "react";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import "./style.less"
/**
 * https://github.com/remarkjs/react-markdown
 */
export class Markdown extends React.Component<{ md: string, className?: string | (string[]) }>{
    constructor(props) { super(props) }
    render(): React.ReactNode {
        var classList: string[] = ['md','break-all'];
        if (this.props.className) {
            if (typeof this.props.className === 'string') {
                classList.push(this.props.className)
            } else {
                classList = classList.concat(this.props.className)
            }
        }
        return <div className={classList.join(" ")}><ReactMarkdown remarkPlugins={[remarkGfm]} children={showMarkdown(this.props.md)} /></div>
    }
}


export function showMarkdown(content) {
    if (content) {
        var rs = content.split(/\r?\n/g);
        for (let i = 0; i < rs.length; i++) {
            if (!rs[i].endsWith('  ')) rs[i] += "  "
        }
        return rs.join("\n");
    }
    else return '';
}