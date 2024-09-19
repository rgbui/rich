import React from "react";
import { channel } from "../../../net/channel";
import { UserBasic } from "../../../types/user";

export class UserBox extends React.Component<{
    userid: string,
    children?: (user: UserBasic) => React.ReactNode
}> {
    private user: UserBasic;
    async componentDidMount() {
        this.willUnmount = false;
        if (!this.user) {
            if (!this.props.userid) {
                return;
            }
            var r = await channel.get('/user/basic', { userid: this.props.userid });
            if (r.ok) {
                this.user = r.data.user as any;
                if (this.willUnmount == false)
                    this.forceUpdate()
            }
        }
    }
    willUnmount: boolean = false;
    componentWillUnmount(): void {
        this.willUnmount = true;
    }
    render() {
        if (!this.user) return <></>
        return this.user && this.props.children(this.user)
    }
}


export class UserBoxs extends React.Component<{
    userids: string[],
    children?: (users: UserBasic[]) => React.ReactNode
}> {
    private users: UserBasic[];
    async componentDidMount() {
        this.willUnmount = false;
        if (!this.users) {
            var r = await channel.get('/users/basic', { ids: this.props.userids });
            if (r.ok) {
                this.users = r.data.list as any;
                if (this.willUnmount == false)
                    this.forceUpdate()
            }
        }
    }
    willUnmount: boolean = false;
    componentWillUnmount(): void {
        this.willUnmount = true;
    }
    render() {
        if (!this.users) return <></>
        return this.users && this.props.children(this.users)
    }
}

