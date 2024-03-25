
import React from "react";
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SearchListType } from "../../component/types";
import { channel } from "../../net/channel";
import { Spin } from "../../component/view/spin";
import { Avatar } from "../../component/view/avator/face";
import { Pagination } from "../../component/view/pagination";
import "./style.less";

@url('/role/users')
export class RoleUsers extends Block {
    searchList: SearchListType<any, { roleId: string }> = {
        list: [],
        page: 1,
        size: 100,
        total: 0,
        word: '',
        roleId: '',
        loading: false,
        error: ''
    }
    async searchMembers() {
        this.searchList.loading = true;
        try {
            var r = await channel.get('/ws/members', {
                page: this.searchList.page,
                size: this.searchList.size,
                word: this.searchList.word || undefined,
                roleId: this.searchList.roleId || undefined,
                ws: undefined
            });
            if (r.ok) {
                Object.assign(this.searchList, r.data);
                console.log(JSON.stringify(this.searchList))
            }
        }
        catch (ex) {
            this.searchList.error = ex.toString();
        }
        finally {
            this.searchList.loading = false;
        }
    }
}

@view('/role/users')
export class PageOrNextView extends BlockView<RoleUsers>{
    renderView() {
        return <div className='flex' style={this.block.visibleStyle}>
            {this.block.searchList.loading && <div className='flex-center gap-h-20'><Spin></Spin></div>}
            {this.block.searchList.list.map(me => {
                return <div key={me.id} className='shy-ws-member flex round padding-10 visible-hover'>
                    <div className='flex-fixed w-240'>
                        <Avatar showName showSn={false} size={30} userid={me.userid}></Avatar>
                    </div>
                </div>
            })}
            <Pagination index={this.block.searchList.page}
                size={this.block.searchList.size}
                total={this.block.searchList.total} onChange={e => {
                    this.block.searchList.page = e;
                    this.block.searchMembers();
                }}></Pagination>
        </div>
    }
}