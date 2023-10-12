import React from "react";
import { Avatar } from "./face";

export class UserAvatars extends React.Component<{
    size?: number,
    users: (string[]) | Set<string>,
    children?: JSX.Element | string | React.ReactNode,
    limit?: number
}>{
    render(): React.ReactNode {
        var us = Array.isArray(this.props.users) ? this.props.users : Array.from(this.props.users);
        if (this.props.limit) us = us.slice(us.length - this.props.limit)
        return <div className="flex">
            {us.map(u => <Avatar key={u} size={this.props.size} userid={u}></Avatar>)}
            {this.props.children && <><em className={us.length > 0 ? "gap-r-10" : ""}></em>{this.props.children}</>}
        </div>
    }
}