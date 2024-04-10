import React from "react";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import "./style.less"
/**
 * https://github.com/remarkjs/react-markdown
 */
export class Markdown extends React.Component<{ md: string, html?: boolean, className?: string | (string[]) }> {
    constructor(props) { super(props) }
    render() {
        var classList: string[] = ['md', 'break-all'];
        if (this.props.className) {
            if (typeof this.props.className === 'string') {
                classList.push(this.props.className)
            } else {
                classList = classList.concat(this.props.className)
            }
        }
        var pls = [remarkGfm] as any[];
        
        return <div className={classList.join(" ")}><ReactMarkdown rehypePlugins={(this.props.html? [rehypeRaw]:[]) as any} remarkPlugins={pls} children={showMarkdown(this.props.md)} /></div>
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