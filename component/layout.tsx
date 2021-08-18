
import React, { CSSProperties } from "react";

export class Layout extends React.Component {
    render() {
        return <div className='shy-layout'>
            {React.Children.map(this.props.children, (element, index) => {
                if (element instanceof Slide) return element
                else return <div className='shy-layout-item'>{element}</div>
            })}
        </div>
    }
}
export class Slide extends React.Component<{ width: number, props: React.ReactNode }> {
    render() {
        var style: CSSProperties = {
            flexShrink: 0,
            width: this.props.width || 200
        }
        return <div className='shy-layout-slide' style={style}>{this.props.children}</div>
    }
}

