import React from "react";
import { Avatar } from "../../component/view/avator/face";
import { UserBasic } from "../../types/user"
import { channel } from "../../net/channel";
import { Spin } from "../../component/view/spin";

export class OnlineUsers extends React.Component {
    componentDidMount(): void {
        this.loadUsers();
    }
    searchQuery: { list: UserBasic[], total: number, page: number, size: number, loading: boolean } = { loading: false, list: [], total: 0, page: 1, size: 200 }
    async loadUsers() {
        try {
            this.searchQuery.loading = true;
            this.forceUpdate()
            var r = await channel.get('/ws/members', {
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
    render(): React.ReactNode {
        return <div className="h100 overflow-y padding-bottom-100">
            <div className="remark f-12 padding-w-14 bold gap-t-14">在线</div>
            {this.searchQuery.list.map(user => {
                return <div className="padding-w-14 margin-h-10 cursor round item-hover padding-h-5"
                    key={(user as any).userid}><Avatar
                        showCard={true}
                        size={30}
                        userid={(user as any).userid}
                        showName></Avatar></div>
            })}
            {this.searchQuery.loading && <Spin block></Spin>}
        </div>
    }
}