
import React from "react";
import { Icon } from "../../component/view/icon";
import { channel } from "../../net/channel";
import { Block } from "../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import lodash from "lodash";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { Rect } from "../../src/common/vector/point";
import { S } from "../../i18n/view";
import { PopoverPosition } from "../../component/popover/position";
import { useLinkPicker } from "../../extensions/link/picker";
import { PageLink } from "../../extensions/link/declare";
import { CopyAlert } from "../../component/copy";
import { RefreshSvg } from "../../component/svgs";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { lst } from "../../i18n/store";
import "./style.less";


@url('/link')
export class Link extends Block {
    /**
     * 废弃
     */
    @prop()
    pageId: string;
    display = BlockDisplay.block;
    pageInfo: LinkPageItem;
    @prop()
    link: PageLink = null;
    get isSupportTextStyle() {
        return false;
    }
    async didMounted() {
        if (this.createSource == 'InputBlockSelector') {
            await this.onSelectPage({ roundArea: Rect.fromEle(this.el) })
        }
    }
    /**
     * 为了兼容老的pageId，这里不能直接调用link
     * @returns 
     */
    getLink() {
        return this.link || (this.pageId ? { type: 'page', pageId: this.pageId } as PageLink : null);
    }
    async loadPageInfo() {
        var link = this.getLink();
        if (link && link.pageId) {
            var r = await channel.get('/page/query/info', { ws: this.page.ws, id: link.pageId });
            if (r?.ok) {
                this.pageInfo = lodash.cloneDeep(r.data);
                this.forceUpdate();
            }
        }
    }
    async openPage(event?: React.MouseEvent) {
        if (event)
            event.preventDefault();
        var link = this.getLink();
        if (link?.pageId)
            channel.air('/page/open', { item: link?.pageId });
        else if (link?.url) {
            window.open(link.url, link.target || '_blank');
        }
    }
    async getMd() {
        var ws = this.page.ws;
        return `[${this.pageInfo?.text}](${ws.url + '/page/' + this.pageInfo?.sn})`
    }
    async onSelectPage(pos: PopoverPosition) {
        var li = this.getLink();
        var r = await useLinkPicker(pos, li, { allowCreate: false });
        if (r) {
            var link = Array.isArray(r.refLinks) ? r.refLinks[0] : r.link;
            await this.onUpdateProps({ link: link }, { range: BlockRenderRange.self });
        }
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var link = this.getLink();
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({
            text: lst('打开页面'),
            icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
            disabled: link ? false : true,
            name: 'open'
        })
        ns.push({
            text: lst('打开新页面'),
            icon: { name: 'bytedance-icon', code: 'circle-right-up' },
            disabled: link ? false : true,
            name: 'newOpen'
        })
        ns.push({ name: 'copyLink', disabled: link ? false : true, text: lst('复制页面网址'), icon: { name: 'byte', code: 'copy-link' } });
        ns.push({
            name: 'reload',
            text: link ? lst('更换页面') : lst('添加页面'),
            icon: RefreshSvg
        });
        ns.push({ type: MenuItemType.divide });
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        rs.splice(at - 1, 0, ...ns);
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'reload') {
            this.onSelectPage({ roundArea: Rect.fromEle(this.el) })
            return;
        }
        if (item.name == 'copyLink') {
            var link = this.getLink();
            var url = link?.pageId ? this.page.ws.resolve({ pageId: link.pageId }) : link.url;
            CopyAlert(url, lst('已复制页面网址'))
            return;
        }
        if (item.name == 'open') {
            this.openPage()
            return;
        }
        else if (item.name == 'newOpen') {
            var link = this.getLink();
            var url = link?.pageId ? this.page.ws.resolve({ pageId: link.pageId }) : link.url;
            window.open(url, '_blank');
            return;
        }
        return await super.onClickContextMenu(item, event);
    }
    getVisibleHandleCursorPoint() {
        var el = this.el;
        var rect = Rect.fromEle(el);
        return rect.leftMiddle;
    }
}
@view('/link')
export class LinkView extends BlockView<Link> {
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
    }
    updatePageInfo = (data: { id: string, pageInfo: LinkPageItem }) => {
        var { id, pageInfo } = data;
        var link = this.block.getLink();
        if (link?.pageId == id) {
            var isUpdate: boolean = false;
            if (!lodash.isEqual(lodash.pick(this.block.pageInfo, ['text', 'icon']), lodash.pick(pageInfo, ['text', 'icon']))) {
                isUpdate = true;
                this.block.pageInfo = lodash.cloneDeep(pageInfo);
            }
            if (isUpdate)
                this.forceUpdate();
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    renderView() {
        var link = this.block.getLink();
        return <div style={this.block.visibleStyle}><div
            style={this.block.contentStyle}
            className='sy-block-link'>
            {this.block.pageInfo &&
                <a  draggable={false} style={this.block.contentStyle} href={this.block.pageInfo.url + (this.block.refBlockId ? "#" + this.block.refBlockId : "")} onClick={e => this.block.openPage(e)}>
                    <SolidArea block={this.block} prop='text'>
                        <div className="flex">
                            <i className="flex-fixed text flex-inline flex-center size-24 gap-r-5"><Icon size={20} icon={getPageIcon(this.block.pageInfo)}></Icon></i>
                            <div className="flex-auto"><span className="sy-block-link-text text-overflow" style={{ height: this.block.page.lineHeight, lineHeight: this.block.page.lineHeight + 'px' }}>
                                {getPageText(this.block.pageInfo)}
                            </span>
                            </div>
                        </div>
                    </SolidArea>
                </a>
            }
            {link?.url && <a  draggable={false} style={this.block.contentStyle} href={link?.url}><SolidArea line block={this.block} prop='outsideUrl'><span>{link?.url}</span></SolidArea></a>}
            {!link && <div
                onMouseDown={e => { this.block.onSelectPage({ roundArea: Rect.fromEle((e.currentTarget as HTMLElement)) }) }}
                className="item-hover-light-focus remark cursor item-hover round padding-h-3 padding-w-5 flex" style={this.block.contentStyle}>
                <Icon icon={{ name: "byte", code: 'link' }}></Icon>
                <span className="gap-l-3 f-14"><S>添加链接</S></span>
            </div>}
        </div>
        </div>
    }
}