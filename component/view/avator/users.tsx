import React from "react";
import { Avatar } from "./face";

export class UserAvatars extends React.Component<{
    size?: number,
    showName?: boolean,
    users: (string[]) | Set<string>,
    limit?: number,
    hideStatus?: boolean
}> {
    render(): React.ReactNode {
        var size = this.props.size || 30;
        var us = Array.isArray(this.props.users) ? this.props.users : Array.from(this.props.users);
        if (this.props.limit) us = us.slice(us.length - this.props.limit)
        if (us.length > 1) {
            return <div style={{
                position: 'relative',
                height: size,
                width: size * us.length / 2 + size / 2
            }}>
                {us.map(u => {
                    return <div className="flex-center" style={{
                        position: 'absolute',
                        left: size * us.indexOf(u) / 2,
                        width: size, height: size,
                        zIndex: us.length - us.indexOf(u)
                    }} key={u}>
                        <Avatar hideStatus={this.props.hideStatus} showName={this.props.showName} size={size} userid={u}></Avatar>
                    </div>
                })}
            </div>
        }
        return <div className="flex">
            {us.map(u => <Avatar key={u} hideStatus={this.props.hideStatus} showName={us.length == 1 && this.props.showName ? true : false} size={size} userid={u}></Avatar>)}
        </div>
    }
}