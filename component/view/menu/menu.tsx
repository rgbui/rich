import React, { CSSProperties } from "react";
import { MenuItem } from "./declare";
import { MenuItemView } from "./item";
export class MenuView extends React.Component<{
    items: MenuItem[],
    style?: CSSProperties,
    input?: (item: MenuItem) => void,
    select?: (item: MenuItem, event?: MouseEvent) => void,
    click?: (item: MenuItem, event?: React.MouseEvent, name?: string) => void
}>{
    render() {
        return <div className='shy-menu-view' style={{
            ...(this.props.style || {}),
        }}>{this.props.items.map((item, index) => {
            return <MenuItemView key={index}
                item={item}
                deep={0}
                select={this.props.select}
                input={this.props.input}
                click={this.props.click}
            ></MenuItemView>
        })}
        </div>
    }
}