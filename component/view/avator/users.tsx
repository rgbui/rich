import React from "react";
import { Avatar } from "./face";


export class UserAvatars extends React.Component<{ users: string[] }>{

    render(): React.ReactNode {
        return <div className="flex">
            {this.props.users.map(u => <Avatar key={u} userid={u}></Avatar>)}
        </div>
    }
}