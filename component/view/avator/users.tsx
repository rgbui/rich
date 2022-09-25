import React from "react";
import { Avatar } from "./face";


export class UserAvatars extends React.Component<{size?:number, users: (string[]) | Set<string> }>{

    render(): React.ReactNode {
        var us = Array.isArray(this.props.users) ? this.props.users : Array.from(this.props.users);
        return <div className="flex">
            {us.map(u =><Avatar key={u} size={this.props.size} userid={u}></Avatar>)}
        </div>
    }
}