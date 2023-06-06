import React, { CSSProperties } from "react";
import "./style.less";
function TabPage(props: { item?: React.ReactNode, visible?: boolean, style?: CSSProperties, children?: React.ReactNode }) {
    return <div className='shy-tab-page' style={props.style || {}}>{props.children}</div>
}
export class Tab extends React.Component<{
    index?: number,
    children?: React.ReactNode,
    rightBtns?: React.ReactNode,
    style?: CSSProperties,
    align?: 'left' | 'right' | 'center',
    keeplive?: boolean,
    show?: 'text' | 'icon',
    change?: (index: number) => void
}>{
    constructor(props) {
        super(props);
        if (typeof this.props.index == 'number')
            this.focusIndex = this.props.index;
    }
    static get Page(): typeof TabPage {
        return TabPage;
    }

    componentDidMount(): void {
        if (typeof this.props.index == 'number' && this.focusIndex !== this.props.index) { this.focusIndex = this.props.index; this.forceUpdate() }
    }
    private focusIndex: number = 0;
    onFocus(index: number) {
        this.focusIndex = index;
        this.forceUpdate(() => {
            if (typeof this.props.change == 'function')
                this.props.change(this.focusIndex);
        });
    }
    render() {
        return <div className='shy-tab' style={this.props.style || {}}>
            <div className={'shy-tab-items' + (' shy-tab-items-' + (this.props.align ?? 'left'))}>
                {
                    React.Children.map(this.props.children, (element, index) => {
                        if (this.props.show == 'text') return <span style={{ display: (element as any).props.visible == false ? 'none' : undefined }} onClick={e => { this.onFocus(index) }} key={index} className={index == this.focusIndex ? "hover" : ""}>{(element as any).props.item}</span>
                        return <label style={{ display: (element as any).props.visible == false ? 'none' : undefined }} onClick={e => { this.onFocus(index) }} key={index} className={index == this.focusIndex ? "hover" : ""}>{(element as any).props.item}</label>
                    })
                }
            </div>
            {this.props.rightBtns && <div className='shy-tab-btns'>{this.props.rightBtns}</div>}
            <div className='shy-tab-pages'>{
                React.Children.map(this.props.children, (element, index) => {
                    if (this.props.keeplive == true) {
                        return <div className='shy-tab-page' key={index} style={{ display: index == this.focusIndex ? "block" : "none" }}>{(element as any).props.children}</div>
                    }
                    else {
                        if (index != this.focusIndex) return <div key={index} style={{ display: 'none' }}></div>
                        else return <div style={{ display: (element as any).props.visible == false ? 'none' : undefined }} className='shy-tab-page' key={index} >{(element as any).props.children}</div>
                    }
                })
            }</div>
        </div>
    }
}


