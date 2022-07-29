import React from "react";
import ReactMarkdown from 'react-markdown'
/**
 * https://github.com/remarkjs/react-markdown
 */
export class Markdown extends React.Component<{ md: string }>{
    constructor(props) { super(props) }
    render(): React.ReactNode {
        return   <ReactMarkdown children={this.props.md}  />
    }
}