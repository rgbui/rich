import React from "react";
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { PageLocation } from "../../src/page/directive";
import { LinkPageItem } from "../../src/page/declare";
import { Point } from "../../src/common/vector/point";
import lodash from "lodash";
import { TextArea } from "../../src/block/view/appear";
import { lst } from "../../i18n/store";

@url('/pageDescription')
export class PageDescription extends Block {
    pageInfo: LinkPageItem = null;
    async changeAppear(appear) {
        if (appear.prop == 'pageInfo.description.text') {
            await this.page.onUpdateDescription(this.pageInfo.description?.text, PageLocation.pageEditDescription);
        }
    }
    loadPageInfo(isUpdate?: boolean) {
        var r = this.page.getPageDataInfo();
        if (r) {
            this.pageInfo = lodash.cloneDeep(r);
        }
        if (isUpdate) this.forceManualUpdate();
    }
    get isSupportTextStyle() {
        return false;
    }

    get isEnterCreateNewLine() {
        return false;
    }
    async getMd() {
        return `${this.page.getPageDataInfo()?.description?.text}`
    }
    get isContentEmpty() {
        return !this.pageInfo?.description?.text
    }
    isVisiblePlus() {
        return false
    }
    getVisibleHandleCursorPoint(): Point {
        return null
    }
    get isCanDrag() { return false; }
}

@view('/pageDescription')
export class TitleView extends BlockView<PageDescription> {
    async didMount() {
        this.block.loadPageInfo();
    }
    renderView() {
        var pd = this.block.page.getPageDataInfo();
        return <div style={this.block.visibleStyle}>
            <div className="f-14" style={this.block.contentStyle}>
                <TextArea
                    block={this.block}
                    placeholder={lst('描述...')}
                    prop='pageInfo.description.text'
                    className={'shy-text-empty-font-inherit'}
                    placeholderEmptyVisible
                    plain
                    html={pd?.description?.text}
                ></TextArea>
            </div>
        </div>
    }
}