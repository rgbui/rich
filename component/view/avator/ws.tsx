import React from "react";
import { channel } from "../../../net/channel";
export class WsAvatar extends React.Component<{
    wsId: string,
}> {
    ws;
    async componentDidMount() {
        if (!this.ws) {
            var r = await channel.get('/ws/basic', { wsId: this.props.wsId });
            if (r.ok) {
                this.ws = r.data.workspace;
                this.forceUpdate();
            }
        }
    }
    render() {
        return <div className="shy-ws-avatar">

        </div>
    }
}