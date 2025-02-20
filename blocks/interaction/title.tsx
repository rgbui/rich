import React from "react";
import { Block } from "../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/view/appear";
import { BlockView } from "../../src/block/view";
import { channel } from "../../net/channel";
import { Icon } from "../../component/view/icon";
import { AlignTextCenterSvg, EmojiSvg, HideSvg, LinkSvg, PicSvg } from "../../component/svgs";
import lodash from "lodash";
import { Spin } from "../../component/view/spin";
import { LinkPageItem, PageLayoutType, getPageText } from "../../src/page/declare";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { Rect } from "../../src/common/vector/point";
import { UA } from "../../util/ua";
import { util } from "../../util/util";
import { PageLocation } from "../../src/page/directive";
import "./style.less";
import { ElementType } from "../../net/element.type";

@url('/title')
export class Title extends Block {
    display = BlockDisplay.block;
    pageInfo: LinkPageItem = null;
    loadPageInfo(isUpdate?: boolean) {
        var r = this.page.getPageDataInfo();
        if (r) {
            this.pageInfo = lodash.cloneDeep(r);
        }
        if (isUpdate) this.forceManualUpdate();
    }
    @prop()
    align: 'left' | 'center' = 'left';
    async changeAppear(appear) {
        if (appear.prop == 'pageInfo.text') {
            await this.page.onUpdatePageTitle(this.pageInfo.text, PageLocation.pageEditTitle);
        }
    }
    get isSupportTextStyle() {
        return false;
    }
    get isDisabledInputLine() {
        return true;
    }
    onFocusPageTitle() {
        if (this.page?.pageInfo) {
            this.page.kit.anchorCursor.onFocusBlockAnchor(this, { disabledStore: true, render: true });
        }
    }
    get isCanEmptyDelete() {
        return false
    }
    async getMd() {
        return `# ${this.page.getPageDataInfo()?.text}`
    }
    get isContentEmpty() {
        return !this.pageInfo?.text
    }
    async onGetContextMenus() {
        var pd = this.page.getPageDataInfo();
        var rs: MenuItem<string | BlockDirective>[] = [];
        rs.push({
            name: BlockDirective.link,
            text: lst('复制块链接'),
            icon: LinkSvg,
            label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L"
        })

        rs.push({ type: MenuItemType.divide })
        rs.push({
            name: 'addIcon',
            text: lst('添加图标...'),
            type: MenuItemType.switch,
            checked: pd?.icon ? false : true,
            icon: EmojiSvg
        })
        rs.push({
            name: 'addCover',
            text: lst('添加封面...'),
            type: MenuItemType.switch,
            checked: pd?.cover?.abled ? false : true,
            icon: PicSvg
        })
        rs.push({
            name: 'text-center',
            type: MenuItemType.switch,
            checked: (this as any).align == 'center',
            text: lst('居中'),
            icon: AlignTextCenterSvg
        });
        rs.push({
            text: lst('隐藏'),
            name: 'hidden',
            icon: HideSvg
        });
        rs.push({ type: MenuItemType.divide })
        rs.push({
            name: BlockDirective.comment,
            text: lst('评论'),
            icon: { name: 'byte', code: 'message' },
            label: UA.isMacOs ? "⌘+Opt+M" : "Ctrl+Alt+M"
        })
        rs.push({
            type: MenuItemType.divide
        });
        rs.push({
            type: MenuItemType.help,
            text: lst('了解如何使用页面标题'),
            url: window.shyConfig?.isUS ? "https://help.shy.live/page/1835" : "https://help.shy.live/page/1835"
        });
        if (this.page.pageInfo?.editor) {
            rs.push({
                type: MenuItemType.divide,
            });
            var r = await channel.get('/user/basic', { userid: this.page.pageInfo?.editor });
            if (r?.data?.user) rs.push({
                type: MenuItemType.text,
                text: lst('编辑人 ') + r.data.user.name
            });
            if (this.page.pageInfo?.editDate) rs.push({
                type: MenuItemType.text,
                text: lst('编辑于 ') + util.showTime(new Date(this.page.pageInfo?.editDate))
            });
        }
        return rs;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item.name == 'addIcon') {
            if (item.checked) await this.page.onAddIcon()
            else await this.page.onUpdatePageData({ icon: null });
            return;
        }
        else if (item.name == 'addCover') {
            if (item.checked) await this.page.onAddCover()
            else await this.page.onUpdatePageCover({ 'abled': false }, true);
            return;
        }
        else if (item.name == 'text-center') {
            await this.onUpdateProps({ align: item.checked ? 'center' : 'left' },
                { range: BlockRenderRange.self }, undefined, async () => {
                    this.page.notifyActionPageUpdate()
                }
            )
            return;
        }
        await super.onContextMenuInput(item);
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        switch (item.name) {
            case 'hidden':
                await this.page.onUpdateProps({ hideDocTitle: this.page.hideDocTitle ? false : true }, true)
                return;
            case 'move':
                await this.page.onPageMove();
                return;
            case 'export':
                await this.page.onExport();
                return;
        }
        return await super.onClickContextMenu(item, e);
    }
    getVisibleHandleCursorPoint() {
        var r = super.getVisibleHandleCursorPoint();
        var el = this.el.querySelector('.sy-block-page-info-head-title');
        if (el) {
            var rect = Rect.fromEle(el as HTMLElement);
            return rect.leftMiddle;
        }
        return r;
    }
    /**
    * 当页面是数据表格时，数据表格页面不能插入其它块，
    * 所以+号图标不在显示
    * @returns 
    */
    isVisiblePlus() {
        if (this.page.pageLayout?.type == PageLayoutType.db) {
            return false;
        }
        else return super.isVisiblePlus();
    }
    get isCanDrag() {
        if (this.page.pageLayout?.type == PageLayoutType.db) {
            return false;
        }
        else return false;
    }
    isCanEdit(): boolean {
        return this.page.isCanEditRow;
    }
}
@view('/title')
export class TitleView extends BlockView<Title> {
    async didMount() {
        this.block.loadPageInfo();
        this.forceUpdate(() => {
            this.block.onFocusPageTitle();
        })
    }
    renderView() {
        var isAdd: boolean = this.block.page.isSupportCover;
        if (!this.block.page.isCanEdit) isAdd = false;
        var pd = this.block.page.getPageDataInfo();
        var placeholder = getPageText({ pageType: this.block?.pageInfo?.pageType })
       
        if (this.block.page.pe.type == ElementType.SchemaRecordView) {
            var sv = this.block.page.schema.recordViews.find(x => x.id == this.block.page.pe.id1); 
            if (this.block.page.isSchemaRecordViewTemplate) {
                placeholder = lst('数据模板名')
            }
            else {
                placeholder = lst('添加{text}记录', { text: this.block.page.schema.text })
            }
        }
        else if (this.block.page.pe.type == ElementType.SchemaData || this.block.page.pe.type == ElementType.SchemaRecordViewData) {
            placeholder = lst('添加{text}记录', { text: this.block.page.schema.text })
        }

        if (this.block.page.hideDocTitle) return <div className="sy-block-page-info visible-hover" style={{
            ...this.block.visibleStyle,
            display: 'none'
        }}></div>
        var classList: string[] = ['sy-block-page-info visible-hover'];
        if (this.block.align == 'center') classList.push('flex-center flex-col');
        return <div className={classList.join(" ")} style={this.block.visibleStyle}>
            {pd?.icon && pd.cover?.abled !== true && <div className="min-h-72"> <div onMouseDown={e => this.block.page.onChangeIcon(e)} className="sy-block-page-info-icon">
                <Icon size={72} icon={pd?.icon}></Icon>
            </div></div>}
            {isAdd && (!pd?.icon || !pd.cover?.abled) && <div className='flex h-24 visible r-item-hover f-14 r-cursor r-gap-r-10 r-padding-w-6 r-padding-h-3 r-round remark r-flex-center gap-b-10' >
                {!pd?.icon && <a className="remark" onMouseDown={e => { this.block.page.onAddIcon(); this.forceUpdate() }}><Icon size={16} icon={EmojiSvg}></Icon><span className="gap-l-5"><S>添加图标</S></span></a>}
                {!pd.cover?.abled && <a className="remark" onMouseDown={e => this.block.page.onAddCover()}><Icon size={16} icon={PicSvg}></Icon><span className="gap-l-5"><S>添加封面</S></span></a>}
                {this.block.page.pageLayout.type == PageLayoutType.db && <a className="remark" onMouseDown={e => this.block.page.onAddDescription(pd?.description?.abled == false ? true : false)}><Icon size={16} icon={{ name: "byte", code: 'attention' }}></Icon><span className="gap-l-5">{pd?.description?.abled ? <S>隐藏描述</S> : <S>添加描述</S>}</span></a>}
            </div>}
            {!pd && <div className='sy-block-page-info-loading'>
                <Spin></Spin>
            </div>}
            {pd && <div className='sy-block-page-info-head'>
                <span className='sy-block-page-info-head-title'><TextArea
                    block={this.block}
                    placeholder={placeholder}
                    prop='pageInfo.text'
                    className={'shy-text-empty-font-inherit'}
                    placeholderEmptyVisible
                    plain
                    html={pd?.text || ''}
                ></TextArea></span>
            </div>}
            {this.renderComment()}
        </div>
    }
}