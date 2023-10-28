import { ReactNode } from "react";
import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import React from "react";
import { UserAvatars } from "../../component/view/avator/users";
import { S } from "../../i18n/view";
import dayjs from "dayjs";

@url('/page/author')
export class PageAuthor extends Block {
    @prop()
    align: 'left' | 'center' = 'left';
}
@view('/page/author')
export class PageAuthorView extends BlockView<PageAuthor>{
    renderView(): ReactNode {
        var authors: string[] = [];
        var editDate: Date = null;
        var viewCount: number;
        if (this.block.page.formRowData) {
            authors = [...(this.block.page.formRowData.edit?.users || [])]
            editDate = this.block.page.formRowData.modifyDate
            if (this.block.page.formRowData.modifyer && authors.length == 0) authors.push(this.block.page.formRowData.modifyer)
            if (this.block.page.formRowData.browse?.count) viewCount = this.block.page.formRowData.browse.count
        }
        else if (this.block.page.pageInfo) {
            authors = [...(this.block.page.pageInfo.edit?.users || [])]
            editDate = this.block.page.pageInfo?.editDate;
            if (this.block.page.pageInfo?.editor && authors.length == 0) authors.push(this.block.page.pageInfo?.editor)
            if (this.block.page.pageInfo.browse?.count) viewCount = this.block.page.pageInfo.browse.count
        }
        if (authors.length == 0) return <></>
        return <div style={this.block.visibleStyle}>
            <div className={this.props.block.align == 'center' ? "flex-center" : "flex"}>
                <span className="flex-fixed gap-r-10 flex-center"><UserAvatars size={24} users={authors}></UserAvatars></span>
                {editDate && <span className="flex-fixed remark f-12 gap-r-10" style={{lineHeight:1.3}} ><S>编辑于</S>&nbsp;{dayjs(editDate).format("YYYY-MM-DD HH:mm")}</span>}
                {viewCount && viewCount > 0 && <span className="flex-fixed remark f-12" style={{lineHeight:1.3}}><S>浏览</S>&nbsp;{viewCount}</span>}
            </div>
        </div>
    }
}