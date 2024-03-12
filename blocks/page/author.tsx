import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import React from "react";
import { UserAvatars } from "../../component/view/avator/users";
import { S } from "../../i18n/view";
import dayjs from "dayjs";
import { Rect } from "../../src/common/vector/point";

@url('/page/author')
export class PageAuthor extends Block {
    @prop()
    align: 'left' | 'center' | 'right' = 'left';
    getVisibleHandleCursorPoint() {
        if (!this.el) return;
        var c = this.el.querySelector('.sy-page-author-avatars') as HTMLElement;
        if (c) {
            var rect = Rect.fromEle(c);
            var p = rect.leftMiddle;
            return p;
        }
    }
}
@view('/page/author')
export class PageAuthorView extends BlockView<PageAuthor>{
    renderView() {
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
        var contentStyle = this.block.contentStyle;
        if (this.block.align == 'center')
            contentStyle.justifyContent = 'center';
        else if (this.block.align == 'right')
            contentStyle.justifyContent = 'flex-end';

        return <div style={this.block.visibleStyle}>
            <div className={'flex'} style={contentStyle}>
                <span className="sy-page-author-avatars flex-fixed gap-r-10 flex-center"><UserAvatars size={24} users={authors}></UserAvatars></span>
                {editDate && <span className="flex-fixed remark f-12 gap-r-10" style={{ lineHeight: 1.3 }} ><S>编辑于</S>&nbsp;{dayjs(editDate).format("YYYY-MM-DD HH:mm")}</span>}
                {viewCount && viewCount > 0 && <span className="flex-fixed remark f-12" style={{ lineHeight: 1.3 }}><S>浏览</S>&nbsp;{viewCount}</span>}
            </div>
        </div>
    }
}