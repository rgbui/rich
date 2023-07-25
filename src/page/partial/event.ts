
import React from "react";
import { Page } from "..";
import { forceCloseBoardEditTool } from "../../../extensions/board.edit.tool";
import { emojiStore } from "../../../extensions/emoji/store";
import { useIconPicker } from "../../../extensions/icon";
import { GalleryPics } from "../../../extensions/image/gellery";
import { channel } from "../../../net/channel";
import { util } from "../../../util/util";
import { Matrix } from "../../common/matrix";
import { Point, Rect } from "../../common/vector/point";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { onPasteBlank } from "../../kit/write/paste";
import { PageLayoutType } from "../declare";
import { PageDirective } from "../directive";
import { BlockUrlConstant } from "../../block/constant";
import { ElementType } from "../../../net/element.type";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import lodash from "lodash";

export class PageEvent {
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
        if (this.pageLayout.type == PageLayoutType.board) {
            this.kit.boardSelector.onShow(this.root);
        }
        this.kit.operator.mousedown(event);
    }
    onMouseDownCapture(this: Page, event: React.MouseEvent) {
        /**
         * 部分块的mousedown事件被拦截了，此时通过onMouseDownCapture优先处理一些动作
         */
        if (this.kit.anchorCursor.currentSelectedBlocks.length > 0) {
            if (event.target && this.kit.handle.view.handleEle.contains(event.target as HTMLElement)) return;
            this.kit.anchorCursor.onClearSelectBlocks();
        }
    }
    onMousemove(this: Page, event: MouseEvent) {
        this.kit.operator.mousemove(event);
    }
    onMouseup(this: Page, event: MouseEvent) {
        this.kit.operator.mouseup(event);
    }
    onFocusCapture(this: Page, event: FocusEvent) {
    }
    onBlurCapture(this: Page, event: FocusEvent) {

    }
    onPaste(this: Page, event: ClipboardEvent) {
        if (this.pageLayout?.type == PageLayoutType.board) {
            if (this.isOff == false)
                onPasteBlank(this.kit, event);
        }
    }
    /**
     * 
     * https://www.zhangxinxu.com/wordpress/2020/06/mobile-event-touches-zoom-sacle/
     * 
     */
    private lastTriggerTime;
    onWheel(this: Page, event: React.WheelEvent) {
        if (this.readonly) return;
        this.kit.handle.onCloseBlockHandle();
        if (this.isBoard) {
            event.preventDefault();
            if (event.ctrlKey == true) {
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
                var ma = this.matrix.clone();
                ma.translate(dx, dy);
                this.onSetMatrix(ma);
            }
        }
    }
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this 
     * @param event 
     */
    onKeydown(this: Page, event: KeyboardEvent) {
        this.keyboardPlate.keydown(event);
    }
    onKeyup(this: Page, event: KeyboardEvent) {
        this.keyboardPlate.keyup(event);
    }
    onGlobalMousedown(this: Page, event: MouseEvent) {

    }
    async onUndo(this: Page) {
        if (this.snapshoot.historyRecord.isCanUndo)
            await this.onAction(ActionDirective.onUndo, async () => {
                await this.snapshoot.undo();
            })
    }
    async onRedo(this: Page) {
        if (this.snapshoot.historyRecord.isCanRedo)
            await this.onAction(ActionDirective.onRedo, async () => {
                await this.snapshoot.redo();
            })
    }
    async turnLayout(this: Page,
        layoutType: PageLayoutType) {
        this.updateProps({ requireSelectLayout: false })
        var old_page = await this.get();
        switch (layoutType) {
            case PageLayoutType.doc:
                this.pageLayout.type = layoutType;
                break;
            case PageLayoutType.db:
                this.pageLayout.type = layoutType;
                var view = this.views[0];
                var schema = await TableSchema.onCreate({
                    text: this.pageInfo?.text || '表格',
                    url: BlockUrlConstant.DataGridTable
                });
                await this.createBlock('/data-grid/table', {
                    schemaId: schema.id,
                    syncBlockId: schema.views.find(g => ![BlockUrlConstant.RecordPageView, BlockUrlConstant.FormView].includes(g.url as any))?.id
                }, view);
                break;
            case PageLayoutType.docCard:
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
            await channel.air('/page/update/info', { id: this.pageInfo?.id, pageInfo: { pageType: this.pageLayout.type } });
            this.emit(PageDirective.changePageLayout);
            if (typeof actions == 'function') await actions();
            this.addPageUpdate();
        });
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
        forceCloseBoardEditTool();
    }
    onFitZoom(this: Page) {
        this.gridMap.start();
        var bound = this.gridMap.gridRange();
        var matrix = new Matrix();
        var center = bound.middleCenter;
        var point = bound.leftTop;
        var from = center;
        var rect = Rect.fromEle(this.root);
        rect = this.getRelativeRect(rect);
        var wr = Math.abs((point.x - from.x) * 2 / rect.width);
        var hr = Math.abs((point.y - from.y) * 2 / rect.height);
        var r = Math.min(wr, hr);
        r = 1 / r;
        var currentVisible = rect.middleCenter;
        matrix.scale(r, r, { x: from.x, y: from.y });
        var to = matrix.inverseTransform(currentVisible.x, currentVisible.y);
        matrix.translate(to.x - from.x, to.y - from.y);
        this.matrix = matrix;
        this.view.forceUpdate()
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
    async onContextmenu(this: Page, event: React.MouseEvent) {
        event.preventDefault();
        if (!this.isCanEdit) return;
    }
    async onAddCover(this: Page) {
        if (!this.isCanEdit) return;
        var pd = this.getPageDataInfo();
        if (pd.cover?.abled) {
            this.onUpdatePageCover({ 'cover.abled': false }, true);
        }
        else {
            if (pd.cover?.url) {
                this.onUpdatePageCover({ 'cover.abled': true }, true);
            }
            else {
                var g = GalleryPics.randomOf().childs.randomOf();
                this.onUpdatePageCover({
                    cover: {
                        abled: true,
                        url: g.url,
                        thumb: g.thumb,
                        top: 50
                    }
                }, true);
            }
        }
    }
    async onAddIcon(this: Page) {
        if (!this.isCanEdit) return;
        var codes = await emojiStore.get();
        var g = codes.randomOf().childs.randomOf();
        this.onUpdatePageData({
            icon: { name: "emoji", code: g.code }
        })
    }
    async onUpdatePageData(this: Page, data: Record<string, any>) {
        if ([
            ElementType.SchemaData,
            ElementType.SchemaRecordView,
            ElementType.SchemaView
        ].includes(this.pe.type) && !this.isSchemaRecordViewTemplate) {
            Object.assign(this.formRowData, data);
            this.forceUpdate();
        }
        else if (this.isSchemaRecordViewTemplate) {
            var sr = this.schema.views.find(g => g.id == this.pe.id1);
            if (sr) {
                await this.schema.onSchemaOperate([{
                    name: 'updateSchemaView',
                    data: data,
                    id: this.pe.id1,
                }])
                this.forceUpdate();
            }
        }
        else {
            if (this.pe.type == ElementType.Schema) {
                var schema = await TableSchema.loadTableSchema(this.pe.id, this.ws);
                console.log(schema, this.pe.id);
                var props = lodash.pick(data, ['icon', 'description', 'text'])
                if (schema && Object.keys(props).length > 0)
                    schema.update(props)
            }
            channel.air('/page/update/info', {
                elementUrl: this.elementUrl,
                pageInfo: data
            })
        }
    }
    async onUpdatePageTitle(this: Page, text: string) {
        this.onceStopRenderByPageInfo = true;
        if (!this.isSchemaRecordViewTemplate && [ElementType.SchemaRecordView, ElementType.SchemaData, ElementType.SchemaView].includes(this.pe.type)) {
            this.formRowData.title = text;
            if (this.view.pageBar) this.view.pageBar.forceUpdate()
        }
        else if (this.isSchemaRecordViewTemplate) {
            var sr = this.schema.views.find(g => g.id == this.pe.id1);
            if (sr) {
                await this.schema.onSchemaOperate([{
                    name: 'updateSchemaView',
                    id: this.pe.id1,
                    data: { text }
                }])
                if (this.view.pageBar) this.view.pageBar.forceUpdate()
            }
        }
        else {
            window.shyLog('ep', this.elementUrl, this.pageInfo, this.pageInfo?.id, this.pe.id);
            if (this.pe.type == ElementType.Schema) {
                var schema = await TableSchema.loadTableSchema(this.pe.id, this.ws);
                window.shyLog('sche', this.schema, schema);
                if (schema)
                    schema.update({ text })
            }
            channel.air('/page/update/info', {
                elementUrl: this.elementUrl,
                pageInfo: {
                    text: text
                }
            })
        }
    }
    async onUpdateDescription(this: Page, text: string) {
        this.onUpdatePageData({ description: text });
        if (this.view.pageBar) this.view.pageBar.forceUpdate()
    }
    async onUpdatePageCover(this: Page, data: Record<string, any>, isUpdate?: boolean) {
        var c = this.getPageDataInfo().cover;
        if (!c) c = {}
        else c = { cover: c };
        util.setKey(c, data);
        await this.onUpdatePageData(c);
    }
    getPageDataInfo(this: Page) {
        if ([ElementType.SchemaData, ElementType.SchemaRecordView, ElementType.SchemaView].includes(this.pe.type) && !this.isSchemaRecordViewTemplate) {
            return {
                id: this.formRowData.id,
                text: this.formRowData.title,
                icon: this.formRowData.icon,
                cover: this.formRowData.cover,
                description: this.formRowData.description
            }
        }
        else if (this.isSchemaRecordViewTemplate) {
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
    async onChangeIcon(this: Page, event: React.MouseEvent) {
        if (this.isCanEdit == false) return;
        event.stopPropagation();
        var pd = this.getPageDataInfo();
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) }, pd.icon);
        if (typeof icon != 'undefined') {
            this.onUpdatePageData({ icon })
        }
    }
    async onSaveAndPublish(this: Page) {

    }
    async onUpdatePermissions(this: Page, data: Record<string, any>) {
        if ([
            ElementType.SchemaData,
            ElementType.SchemaRecordView,
            ElementType.SchemaView
        ].includes(this.pe.type) && !this.isSchemaRecordViewTemplate) {
            var sv = this.schema.views.find(g => g.id == this.pe.id1);
            if (sv) {
                await this.schema.onSchemaOperate([{ id: sv.id, name: 'updateSchemaView', data }])
                Object.assign(sv, data);
            }
        }
        else if ([ElementType.SchemaData].includes(this.pe.type)) {
            if (typeof this.formRowData.config == 'undefined') this.formRowData.config = {};
            Object.assign(this.formRowData.config, data);
        }
        else {
            Object.assign(this._pageItem, data);
            await this.onUpdatePageData(data);
        }
        await this.cachCurrentPermissions();
    }
    getPermissions(this: Page) {
        if ([
            ElementType.SchemaRecordView,
            ElementType.SchemaView
        ].includes(this.pe.type) && !this.isSchemaRecordViewTemplate) {
            console.log(this.schema, 'sss', this.elementUrl, this.pe);
            var sv = this.schema.views.find(g => g.id == this.pe.id1);
            return {
                share: sv.share,

                /**
                 * 互联网是否公开，如果公开的权限是什么
                 */
                netPermissions: sv.netPermissions,
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
        else if ([ElementType.SchemaData].includes(this.pe.type)) {
            return {
                share: this.formRowData.share,

                /**
                 * 互联网是否公开，如果公开的权限是什么
                 */
                netPermissions: this.formRowData.netPermissions,
                /**
                 * 外部邀请的用户权限
                 */
                inviteUsersPermissions: this.formRowData.inviteUsersPermissions,
                /**
                 * 空间成员权限，
                 * 可以指定角色，也可以指定具体的人
                 */
                memberPermissions: this.formRowData.memberPermissions
            }
        }
        return {
            share: this._pageItem.share,

            /**
             * 互联网是否公开，如果公开的权限是什么
             */
            netPermissions: this._pageItem.netPermissions,
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
}

