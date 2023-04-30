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
        var classList: string[] = ['md']
        if (this.props.className) {
            if (typeof this.props.className === 'string') {
                classList.push(this.props.className)
            } else {
                classList = classList.concat(this.props.className)
            }
        }
        return <div className={classList.join(" ")}><ReactMarkdown remarkPlugins={[remarkGfm]} children={this.props.md} /></div>
    }
}