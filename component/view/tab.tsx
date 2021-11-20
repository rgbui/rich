import React, { CSSProperties } from "react";

function TabPage(props: { item?: React.ReactNode, style?: CSSProperties, children?: React.ReactNode }) {
    return <div className='shy-tab-page' style={props.style || {}}>{props.children}</div>
}
export class Tab extends React.Component<{
    index?: number,
    children?: React.ReactNode,
    rightBtns?: React.ReactNode,
    style?: CSSProperties,
    align?: 'left' | 'right' | 'center',
    keeplive?: boolean
}>{
    static get Page(): typeof TabPage {
        return TabPage;
    }
    constructor(props) {
        super(props);
        if (typeof this.props.index == 'number')
            this.focusIndex = this.props.index;
    }
    private focusIndex: number = 0;
    onFocus(index: number) {
        this.focusIndex = index;
        this.forceUpdate();
    }
    render() {
        return <div className='shy-tab' style={this.props.style || {}}>
            <div className={'shy-tab-items' + (' shy-tab-items-' + (this.props.align ?? 'left'))}>
                {
                    React.Children.map(this.props.children, (element, index) => {
                        return <label onClick={e => { this.onFocus(index) }} key={index} className={index == this.focusIndex ? "hover" : ""}>{(element as any).props.item}</label>
                    })
                }
            </div>
            {this.props.rightBtns && <div className='shy-tab-btns'>{this.props.rightBtns}</div>}
            <div className='shy-tab-pages'>{
                React.Children.map(this.props.children, (element, index) => {
                    if (this.props.keeplive == true) {
                        return <TabPage style={{ display: index == this.focusIndex ? "block" : "none" }}>{(element as any).props.children}</TabPage>
                    }
                    else {
                        if (index != this.focusIndex) return <></>
                        else return <TabPage>{(element as any).props.children}</TabPage>
                    }
                })
            }</div>
        </div>
    }
}


