import React from "react";
import { Avatar } from "../../component/view/avator/face";
import { UserBasic } from "../../types/user"

export class OnlineUsers extends React.Component {
    componentDidMount(): void {

    }
    users: UserBasic[] = [];
    render(): React.ReactNode {
        return <div className="shy-online-users">
            {this.users.map(user => {
                <Avatar key={user.id} userid={user.id} size={40} showName></Avatar>
            })}
        </div>
    }
}