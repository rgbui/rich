import React from "react";
import { channel } from "../../../net/channel";
import { UserBasic } from "../../../types/user";

export class UserBox extends React.Component<{
    userid: string,
    children?: (user: UserBasic) => React.ReactNode
}> {
    private user: UserBasic;
    async componentDidMount() {
        if (!this.user) {
            if (!this.props.userid) {
                return;
            }
            var r = await channel.get('/user/basic', { userid: this.props.userid });
            if (r.ok) {
                this.user = r.data.user as any;
                this.forceUpdate()
            }
        }
    }
    render() {
        if(!this.user)return <></>
        return this.user && this.props.children(this.user)
    }
}
