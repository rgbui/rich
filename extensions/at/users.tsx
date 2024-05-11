import React from "react";
import { Avatar } from "../../component/view/avator/face";
import { UserBasic } from "../../types/user"
import { channel } from "../../net/channel";
import { Spin } from "../../component/view/spin";
import { LinkWs } from "../../src/page/declare";
import { S } from "../../i18n/view";
import { Icon } from "../../component/view/icon";
import { CloseSvg } from "../../component/svgs";

export class OnlineUsers extends React.Component<{ ws: LinkWs, onClose: (e: React.MouseEvent) => void }> {
    componentDidMount(): void {
        this.loadUsers();
    }
    searchQuery: { list: UserBasic[], total: number, page: number, size: number, loading: boolean } = { loading: false, list: [], total: 0, page: 1, size: 200 }
    async loadUsers() {
        try {
            this.searchQuery.loading = true;
            this.forceUpdate()
            var r = await channel.get('/ws/members', {
                ws: this.props.ws,
                page: this.searchQuery.page,
                size: this.searchQuery.size
            });
            if (r.ok) {
                Object.assign(this.searchQuery, r.data)
            }
        }
        catch (ex) {

        }
        finally {
            this.searchQuery.loading = false;
            this.forceUpdate()
        }
    }
    render() {
        return <div className="h100 overflow-y padding-bottom-100 visible-hover">
            <div className="flex padding-w-10  gap-t-10">
                <span className="flex-auto remark f-12 bold"><S>在线</S></span>
                <span className="flex-fixed size-20 visible flex-center round item-hover cursor" onMouseDown={e => this.props.onClose && this.props.onClose(e)}><Icon size={12} icon={CloseSvg}></Icon></span>
            </div>
            {this.searchQuery.list.map(user => {
                return <div className="padding-w-5 gap-w-5 gap-h-10 cursor round item-hover padding-h-5"
                    key={(user as any).userid}><Avatar
                        showCard={true}
                        ws={this.props.ws}
                        size={30}
                        userid={(user as any).userid}
                        showName></Avatar></div>
            })}
            {this.searchQuery.loading && <Spin block></Spin>}
        </div>
    }
}