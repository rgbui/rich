
import React from "react";
import { Page } from "..";
import { closeBoardEditTool } from "../../../extensions/board.edit.tool";
import { emojiStore } from "../../../extensions/emoji/store";
import { useIconPicker } from "../../../extensions/icon";
import { channel } from "../../../net/channel";
import { Matrix } from "../../common/matrix";
import { Point, Rect, RectUtility } from "../../common/vector/point";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { onPastePage } from "../../kit/write/paste";
import { PageLayoutType } from "../declare";
import { PageDirective, PageLocation } from "../directive";
import { BlockUrlConstant } from "../../block/constant";
import { ElementType } from "../../../net/element.type";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { lst } from "../../../i18n/store";
import { Block } from "../../block";
import { AnimatedScrollTo } from "../../../util/animatedScrollTo";
import { GalleryPics } from "../../../extensions/image/store";
import { forceCloseTextTool } from "../../../extensions/text.tool";
import { ShyAlert } from "../../../component/lib/alert";
import { UA } from "../../../util/ua";
import { MouseDragger } from "../../common/dragger";
import lodash from "lodash";
import { IconArguments } from "../../../extensions/icon/declare";

export class Page$ViewEvent {
    /**
     * 鼠标点击页面,
     * 点的过程中有可能有按下不松开选择一个较大的区域情况，
     * 这个区域可以触发文字的选中效果，
     * 也可以按一定的条件触发矩形选择范围，例如图像或文本
     * 是否选择文字还是仅仅选择block对象取决于block本身
     * 点在空白处，在鼠标up时，可以检测，看有没有必要创建一个空白输入文本框
     * @param this 
     * @param event 
     * 
     */
    onMousedown(this: Page, event: React.MouseEvent) {
        if (this.isDeny) return;
        if (event.button == 2 && UA.isWindows && this.isBoard) {
            this.onDragMousedown(event);
            return;
        }
        if (this.pageLayout && this.pageLayout.type == PageLayoutType.board) {
            if (this.kit.page.isCanEdit)
                this.kit.boardSelector.onShow(this.root, { page: this.kit.page });
        }
        this.kit.operator.mousedown(event);
    }
    onDoubleClick(this: Page, event: React.MouseEvent) {
        if (this.isDeny) return;
        this.kit.operator.dblclick(event);
    }
    onMouseDownCapture(this: Page, event: React.MouseEvent) {
        if (this.isDeny) return;
        /**
         * 部分块的mousedown事件被拦截了，此时通过onMouseDownCapture优先处理一些动作
         */
        if (this.kit.anchorCursor.currentSelectedBlocks.length > 0) {
            if (event.target && this.kit.handle.view.handleEle.contains(event.target as HTMLElement)) return;
        }
    }
    onMousemove(this: Page, event: MouseEvent) {
        if (this.isDeny) return;
        this.kit.operator.mousemove(event);
    }
    onMouseup(this: Page, event: MouseEvent) {
        if (this.isDeny) return;
        this.kit.operator.mouseup(event);
    }
    onFocusCapture(this: Page, event: FocusEvent) {
    }
    onBlurCapture(this: Page, event: FocusEvent) {

    }
    onPaste(this: Page, event: ClipboardEvent) {
        if (this.isDeny) return;
        if (this.isPageOff) return;
        onPastePage(this.kit, event);
    }
    /**
     * 
     * https://www.zhangxinxu.com/wordpress/2020/06/mobile-event-touches-zoom-sacle/
     * 
     */
    private lastTriggerTime;
    onWheel(this: Page, event: React.WheelEvent) {
        // if (this.readonly) return;
        // if (this.isDeny) return;
        this.kit.handle.onCloseBlockHandle();
        if (this.isBoard) {

            var ele = event.target as HTMLElement;
            var disabledWheel = ele?.closest('[data-wheel="disabled"]');
            if (disabledWheel) return;

            var block = this.getEleBlock(ele);
            var bpc: Block;
            if (block && block.url != BlockUrlConstant.BoardPageCard) {
                var c = block.closest(g => g.url == BlockUrlConstant.BoardPageCard);
                if (c) {
                    bpc = c;
                }
            }
            if (event.ctrlKey == true) {
                event.preventDefault();
                if (this.lastTriggerTime && (Date.now() - this.lastTriggerTime < 60)) return;
                this.lastTriggerTime = Date.now();
                var ma = this.matrix.clone();
                var ro = this.globalMatrix.inverseTransform(new Point(event.pageX, event.pageY));
                if (event.deltaY > 0) {
                    //缩小
                    ma.scale(0.8, 0.8, ro);
                    if (ma.getScaling().x * 100 < 1) return;
                    this.onSetMatrix(ma);
                }
                else {
                    //放大
                    ma.scale(1.2, 1.2, ro);
                    if (ma.getScaling().x * 100 > 300) return;
                    this.onSetMatrix(ma);
                }
            }
            else {
                var g = (x) => {
                    if (x > 0) return 0 - x;
                    else if (x < 0) return 0 - x;
                    else return 0;
                }
                var r = 1 / this.scale;
                var dx = g(event.deltaX) * r;
                var dy = g(event.deltaY) * r;
                if (bpc) {
                    var sc = bpc.getScrollDiv();
                    if (sc && dy != 0 && sc.scrollHeight > sc.clientHeight) {
                        if (sc.scrollTop > 0 && sc.scrollTop < sc.scrollHeight - sc.clientHeight || sc.scrollTop == 0 && dy < 0 || sc.scrollTop == sc.scrollHeight - sc.clientHeight && dy > 0) {
                            return;
                        }
                    }
                }
                event.preventDefault();
                var ma = this.matrix.clone();
                ma.translate(dx, dy);
                this.onSetMatrix(ma);
            }
        }
    }
    onDragMousedown(this: Page, event: React.MouseEvent) {
        var ma = this.matrix.clone();
        var self = this;
        MouseDragger({
            event,
            moving(ev, data, isEnd, isMove) {
                var dx = ev.clientX - event.clientX;
                var dy = ev.clientY - event.clientY;
                dx = dx / self.scale;
                dy = dy / self.scale;
                var mc = ma.clone();
                mc.translate(dx, dy);
                self.onSetMatrix(mc);
            },
        })
    }
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this 
     * @param event 
     */
    onKeydown(this: Page, event: KeyboardEvent) {
        if (this.isPageOff == true) return;
        if (this.readonly) return;
        if (this.isDeny) return;
        var ele = event.target as HTMLElement;
        if (ele && (ele === document.body || this.view.el === ele || this.view.el.contains(ele))) {
            this.keyboardPlate.keydown(event);
        }
    }
    onKeyup(this: Page, event: KeyboardEvent) {
        if (this.readonly) return;
        if (this.isDeny) return;
        // console.log(event,event.key,event.code,this.keyboardPlate.keys,'keyup');
        this.keyboardPlate.keyup(event);
    }
    onGlobalMousedown(this: Page, event: MouseEvent) {

    }
    async onUndo(this: Page) {
        if (this.readonly) return;
        if (this.isDeny) return;
        forceCloseTextTool()
        closeBoardEditTool();
        if (this.snapshoot.historyRecord.isCanUndo)
            await this.onAction(ActionDirective.onUndo, async () => {
                await this.snapshoot.undo();
            }, {
                disabledJoinHistory: true
            })
        else ShyAlert(lst('没有可撤销的操作'))
    }
    async onRedo(this: Page) {
        if (this.readonly) return;
        if (this.isDeny) return;
        forceCloseTextTool()
        closeBoardEditTool();
        if (this.snapshoot.historyRecord.isCanRedo)
            await this.onAction(ActionDirective.onRedo, async () => {
                await this.snapshoot.redo();
            }, {
                disabledJoinHistory: true
            })
        else ShyAlert(lst('没有可恢复的操作'))
    }
    async turnLayout(this: Page,
        layoutType: PageLayoutType) {
        await this.updateProps({ requireSelectLayout: false })
        var old_page = await this.get();
        switch (layoutType) {
            case PageLayoutType.doc:
                this.pageLayout.type = layoutType;
                break;
            case PageLayoutType.db:
                this.pageLayout.type = layoutType;
                var view = this.views[0];
                var schema = await TableSchema.onCreate({
                    id: this.pageInfo.id,
                    text: this.pageInfo?.text || lst('表格'),
                    url: BlockUrlConstant.DataGridTable
                });
                await schema.cacPermissions();
                await this.createBlock('/data-grid/table', {
                    schemaId: schema.id,
                    syncBlockId: schema.views.find(g => ![BlockUrlConstant.RecordPageView].includes(g.url as any))?.id
                }, view);
                break;
            case PageLayoutType.ppt:
                this.pageLayout.type = layoutType;
                this.views = [];
                await this.loadDefaultData();
                break;
            case PageLayoutType.board:
                var view = this.views[0];
                await view.childs.eachAsync(async block => {
                    await block.delete()
                })
                this.pageLayout.type = layoutType;
                break;
            case PageLayoutType.textChannel:
                this.pageLayout.type = layoutType;
                var view = this.views[0];
                await view.childs.eachAsync(async block => {
                    await block.delete()
                })
                await this.createBlock(BlockUrlConstant.TextChannel, {}, view);
                break;
        }
        var new_page = await this.get();
        this.snapshoot.record(OperatorDirective.pageTurnLayout, {
            old: PageLayoutType.doc,
            new: layoutType,
            old_page_data: old_page,
            new_page_data: new_page,
        }, this);
    }
    async onPageTurnLayout(this: Page,
        layoutType: PageLayoutType,
        actions?: () => Promise<void>) {
        await this.onAction(ActionDirective.onPageTurnLayout, async () => {
            await this.turnLayout(layoutType);
            await channel.air('/page/update/info', {
                id: this.pageInfo?.id,
                pageInfo: { pageType: this.pageLayout.type }
            });
            this.emit(PageDirective.changePageLayout);
            if (typeof actions == 'function') await actions();
        }, { immediate: true, disabledJoinHistory: true });
    }
    /**
     * 
     * @param this 
     * @param zoom 1,-1,100
     * 1 放大
     * -1 缩小
     * 100是放大至100%
     * @param point 
     */
    onZoom(this: Page, zoom: number, point?: Point) {
        if (!point) {
            var rect = Rect.from(this.root.getBoundingClientRect());
            point = rect.middleCenter;
        }

        var zs = [1, 2, 3, 5, 10, 15, 20, 33, 50, 75, 100, 125, 150, 200, 250, 300];
        var current = zs.findMin(x => Math.abs(x - this.scale * 100));
        var at = zs.findIndex(g => g == current);

        var ro = this.globalMatrix.inverseTransform(point);
        var r = 1;
        var current = this.scale * 100;
        if (zoom == 1) {
            if (at < zs.length - 1) {
                var next = zs[at + 1];
                r = next / current;
            }
        }
        else if (zoom == -1) {
            if (at > 0) {
                var next = zs[at - 1];
                r = next / current;
            }
        }
        else if (zoom == 100) {
            r = 100 / current;
        }
        r = Math.round(r * 100) / 100;
        this.matrix.scale(r, r, ro);
        this.onSetMatrix(this.matrix);
    }
    onSetMatrix(this: Page, matrix: Matrix) {
        this.matrix = matrix;
        this.view.forceUpdate();
        if (this.kit.boardMap.visible == true)
            this.kit.boardMap.forceUpdate();
        if (this.kit.borardGrid) {
            this.kit.borardGrid.draw(true);
        }
        closeBoardEditTool();
        forceCloseTextTool();
    }
    onFitZoom(this: Page) {
        closeBoardEditTool();
        forceCloseTextTool();
        var cs = this.views.first().childs;
        var bs = cs.map(c => {
            var size = c.fixedSize;
            if (!size) return;
            var rect = new Rect(0, 0, size.width, size.height);
            // var gm = this.matrix.appended(c.currentMatrix);
            rect = rect.transformToBound(c.currentMatrix);
            return rect;
        });
        lodash.remove(bs, g => g ? false : true);
        var points = bs.map(b => b.points).flat();
        var bound = RectUtility.getPointsBound(points);
        bound = bound.extend(100);
        var matrix = new Matrix();
        var rect = Rect.fromEle(this.viewEl);
        rect = rect.transformToRect(this.windowMatrix.inverted());
        var visibleCenter = rect.middleCenter;
        matrix.translate(visibleCenter.x - bound.middleCenter.x, visibleCenter.y - bound.middleCenter.y);
        var wr = bound.width / rect.width;
        var hr = bound.height / rect.height;
        var r = Math.max(wr, hr);
        if (r > 1) {
            r = 1 / r;
        }
        else if (r < 0.3) {
            r = 0.7
        }
        else r = 1;
        var p = matrix.inverseTransform(visibleCenter);
        matrix.scale(r, r, p);
        this.onSetMatrix(matrix);
    }
    onMouseenter(this: Page, event: React.MouseEvent) {
        if (this.isBoard) {
            // getBoardTool().then(r => {
            //     r.onShow(true);
            // })
        }
    }
    onMouseleave(this: Page, event: React.MouseEvent) {
        if (this.isBoard) {
            // getBoardTool().then(r => {
            //     r.onShow(false);
            // })
        }
    }
    async onContextMenu(this: Page, event: React.MouseEvent) {
        if (!this.isCanEdit) return;
        event.preventDefault();
    }
    async onAddCover(this: Page, toggle = true) {
        if (!this.isCanEdit) return;
        var pd = this.getPageDataInfo();
        if (pd.cover?.abled && toggle !== false) {
            this.onUpdatePageCover({ 'abled': false }, true);
        }
        else {
            if (pd.cover?.url) {
                this.onUpdatePageCover({ 'abled': true }, true);
            }
            else {
                var g = GalleryPics().randomOf().childs.randomOf();
                this.onUpdatePageCover({
                    abled: true,
                    url: g.url,
                    thumb: g.thumb,
                    top: 50
                }, true);
            }
        }
    }
    async onAddDescription(this: Page, toggle?: boolean) {
        var pd = this.getPageDataInfo();
        var des = lodash.cloneDeep(pd.description);
        if (!des) {
            des = { abled: toggle, text: '' }
        }
        else {
            if (typeof toggle == 'undefined') toggle = des?.abled ? false : true;
            if (typeof des == 'string') des = {
                text: des,
                abled: true
            }
            des.abled = toggle;
        }
        await this.onAction('onAddDescription', async () => {
            var title = this.find(c => c.url == BlockUrlConstant.Title);
            if (des.abled == true) {
                var b = this.find(c => c.url == BlockUrlConstant.PageDescription);
                if (!b) {
                    await this.createBlock(BlockUrlConstant.PageDescription, {}, title.parent, title.at + 1, title.parentKey)
                }
            }
            else {
                var b = this.find(c => c.url == BlockUrlConstant.PageDescription);
                if (b) await b.delete()
            }
            await this.onUpdatePageData({ description: des });
            if (des.abled) {
                b = this.find(c => c.url == BlockUrlConstant.PageDescription);
                this.addActionCompletedEvent(async () => {
                    this.kit.anchorCursor.onFocusBlockAnchor(b, { merge: true, last: true, render: true })
                })
            }
            else {
                this.addActionCompletedEvent(async () => {
                    if (this.hideDocTitle !== true)
                        this.kit.anchorCursor.onFocusBlockAnchor(title, { merge: true, render: true })
                })
            }
        })
    }
    async onAddIcon(this: Page) {
        if (!this.isCanEdit) return;
        var codes = await emojiStore.get();
        var g = codes.randomOf().childs.randomOf();
        await this.onUpdatePageData({
            icon: { name: "emoji", code: g.code }
        })
    }
    async onChangeIcon(this: Page, event: React.MouseEvent) {
        if (this.isCanEdit == false) return;
        event.stopPropagation();
        var pd = this.getPageDataInfo();
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) }, pd.icon);
        if (typeof icon != 'undefined') {
            await this.onUpdatePageData({ icon })
        }
    }
    async onUpdatePageTitle(
        this: Page,
        text: string,
        locationId?: PageLocation
    ) {
        if (!this.isSchemaRecordViewTemplate && [
            ElementType.SchemaRecordView,
            ElementType.SchemaRecordViewData,
            ElementType.SchemaData
        ].includes(this.pe.type)) {
            if (this.pe.type == ElementType.SchemaRecordView && this.isForm('doc-add')) {
                await this.schema.onSchemaOperate([{
                    name: 'updateSchemaView',
                    id: this.pe.id1,
                    data: { text }
                }], locationId || PageLocation.pageUpdateInfo)
                if (this.isFormPageItem()) {
                    await channel.air('/page/update/info', {
                        elementUrl: this.elementUrl,
                        pageInfo: {
                            text: text
                        }
                    }, { locationId: locationId || PageLocation.pageUpdateInfo })
                }
            }
            else {
                this.formRowData.title = text;
                await this.onUpdatePageData({ title: text }, locationId || PageLocation.pageUpdateInfo);
                if (this.view.pageBar) this.view.pageBar.forceUpdate()
            }
        }
        else if (this.isSchemaRecordViewTemplate) {
            var sr = this.schema.views.find(g => g.id == this.pe.id1);
            if (sr) {
                await this.schema.onSchemaOperate([{
                    name: 'updateSchemaView',
                    id: this.pe.id1,
                    data: { text }
                }], locationId || PageLocation.pageUpdateInfo)
                if (this.view.pageBar) this.view.pageBar.forceUpdate()
            }
        }
        else {
            if (this.pe.type == ElementType.Schema) {
                var schema = await TableSchema.loadTableSchema(this.pe.id, this.ws);
                if (schema)
                    await schema.update({ text }, locationId || PageLocation.pageUpdateInfo)
            }
            await channel.air('/page/update/info', {
                elementUrl: this.elementUrl,
                pageInfo: {
                    text: text
                }
            }, { locationId: locationId || PageLocation.pageUpdateInfo })
        }
    }
    async onUpdateDescription(
        this: Page,
        text: string,
        locationId?: PageLocation
    ) {
        await this.onUpdatePageData({ description: { text } }, locationId);
        if (this.view.pageBar) this.view.pageBar.forceUpdate()
    }
    async onUpdatePageCover(this: Page, data: Record<string, any>, isUpdate?: boolean) {
        var c = this.getPageDataInfo().cover;
        if (!c) c = {} as any
        c = lodash.cloneDeep(c);
        Object.assign(c, data);
        await this.onUpdatePageData({ cover: c });
    }
    getPageDataInfo(this: Page): {
        id: string,
        text: string,
        icon: IconArguments,
        cover: {
            abled: boolean,
            url: string,
            thumb: string,
            top: number
        },
        description: {
            abled: boolean,
            text: string
        }
    } {
        if ([
            ElementType.SchemaData,
            ElementType.SchemaRecordViewData,
            ElementType.SchemaRecordView,
        ].includes(this.pe.type) && !this.isSchemaRecordViewTemplate) {
            if (this.pe.type == ElementType.SchemaRecordView) {
                var sr = this.schema.views.find(g => g.id == this.pe.id1);
                if (sr && (sr.formType == 'doc-add' || sr.formType == 'doc-detail')) {
                    return {
                        id: sr.id,
                        text: sr.text,
                        icon: sr.icon,
                        cover: sr.cover,
                        description: sr.description
                    }
                }
            }
            return {
                id: this.formRowData?.id,
                text: this.formRowData?.title,
                icon: this.formRowData?.icon,
                cover: this.formRowData?.cover,
                description: this.formRowData?.description
            }
        }
        else if (this.pe.type == ElementType.SchemaRecordView && this.isSchemaRecordViewTemplate) {
            var sr = this.schema.views.find(g => g.id == this.pe.id1);
            if (sr) {
                return {
                    id: sr.id,
                    text: sr.text,
                    icon: sr.icon,
                    cover: sr.cover,
                    description: sr.description
                }
            }
        }
        return {
            id: this.pageInfo?.id,
            text: this.pageInfo?.text,
            icon: this.pageInfo?.icon,
            cover: this.pageInfo?.cover,
            description: this.pageInfo?.description
        }
    }
    async loadPageParents(this: Page) {
        var c = await channel.get('/page/query/parents',
            {
                ws: this.ws,
                id: this.getPageDataInfo()?.id
            });
        if (c?.ok) {
            this.parentItems = c.data.items.reverse();
        }
        else this.parentItems = [];
        return this.parentItems
    }
    async onSaveAndPublish(this: Page) {

    }
    async onUpdatePermissions(this: Page, data: Record<string, any>) {
        if ([
            ElementType.SchemaRecordView,
        ].includes(this.pe.type)) {
            var sv = this.schema.views.find(g => g.id == this.pe.id1);
            if (sv) {
                await this.schema.onSchemaOperate([{ name: 'updateSchemaView', id: sv.id, data: data }], 'onUpdatePermissions')
            }
        }
        else if ([ElementType.SchemaData, ElementType.SchemaRecordViewData].includes(this.pe.type)) {
            if (typeof this.formRowData.config == 'undefined') this.formRowData.config = {};
            var cfg = lodash.cloneDeep(this.formRowData.config);
            Object.assign(cfg, data);
            await this.schema.rowUpdate({ dataId: this.formRowData.id, data: { config: cfg } }, 'onUpdatePermissions')
        }
        else {
            await this.onUpdatePageData(data);
        }
        await this.cacCurrentPermissions();
    }
    getPermissions(this: Page) {
        if ([
            ElementType.SchemaRecordView,
            // ElementType.SchemaView
        ].includes(this.pe.type)) {
            var sv = this.schema.views.find(g => g.id == this.pe.id1);
            return {
                share: sv.share,

                /**
                 * 互联网是否公开，如果公开的权限是什么
                 */
                netPermissions: sv.netPermissions,
                netCopy: sv.netCopy,
                /**
                 * 外部邀请的用户权限
                 */
                inviteUsersPermissions: sv.inviteUsersPermissions,
                /**
                 * 空间成员权限，
                 * 可以指定角色，也可以指定具体的人
                 */
                memberPermissions: sv.memberPermissions
            }
        }
        else if ([
            ElementType.SchemaData,
            ElementType.SchemaRecordViewData
        ].includes(this.pe.type)) {
            return {
                share: this.formRowData?.config?.share,

                /**
                 * 互联网是否公开，如果公开的权限是什么
                 */
                netPermissions: this.formRowData?.config?.netPermissions,
                netCopy: this.formRowData?.config?.netCopy,
                /**
                 * 外部邀请的用户权限
                 */
                inviteUsersPermissions: this.formRowData?.config?.inviteUsersPermissions,
                /**
                 * 空间成员权限，
                 * 可以指定角色，也可以指定具体的人
                 */
                memberPermissions: this.formRowData?.config?.memberPermissions
            }
        }
        return {
            share: this._pageItem.share,

            /**
             * 互联网是否公开，如果公开的权限是什么
             */
            netPermissions: this._pageItem.netPermissions,
            netCopy: this._pageItem.netCopy,
            /**
             * 外部邀请的用户权限
             */
            inviteUsersPermissions: this._pageItem.inviteUsersPermissions,
            /**
             * 空间成员权限，
             * 可以指定角色，也可以指定具体的人
             */
            memberPermissions: this._pageItem.memberPermissions
        }
    }
    async onPageScroll(this: Page, block: Block) {
        try {
            var panelEl = this.getScrollDiv();
            var offset = panelEl.scrollTop;
            var blockRect = block.getVisibleBound();
            var panelElRect = Rect.fromEle(panelEl);
            var d = blockRect.top - panelElRect.top;
            AnimatedScrollTo(panelEl, offset + d)
        }
        catch (ex) {
            console.error(ex);
            this.onError(ex);
        }
    }

}

