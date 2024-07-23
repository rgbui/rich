import React from "react";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { BlockDirective } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { util } from "../../../../util/util";
import { DataGridView } from "../base";
import { createFieldBlock } from "./service";

import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../gallery";
import { autoImageUrl, ElementType, getElementUrl } from "../../../../net/element.type";
import { DropDirection } from "../../../../src/kit/handle/direction";
import { Field } from "../../schema/field";
import { channel } from "../../../../net/channel";
import { FieldType } from "../../schema/type";
import lodash from "lodash";
import { OriginField } from "../../element/field/origin.field";
import { DotsSvg, DuplicateSvg, Edit1Svg, EmojiSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import "./style.less";
import { lst } from "../../../../i18n/store";
import { CopyAlert } from "../../../../component/copy";
import { useIconPicker } from "../../../../extensions/icon";
import { Rect } from "../../../../src/common/vector/point";
import { TableStoreBoard } from "../board";
import { SearchListType } from "../../../../component/types";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreCalendar } from "../calendar";
import dayjs from "dayjs";
import { ToolTip } from "../../../../component/view/tooltip";
import { S } from "../../../../i18n/view";
import { SnapRecordPage } from "../../../../src/page/common/snap";

@url('/data-grid/item')
export class TableGridItem extends Block {
    dataId: string;
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get elementUrl() {
        return getElementUrl(ElementType.SchemaData, this.dataGrid.schema.id, this.dataId)
    }
    get dataRow() {
        if (Array.isArray(this.dataGrid.data)) return this.dataGrid.data.find(g => g.id == this.dataId);
        else return null;
    }
    get dataLink() {
        return this.page.ws.resolve({ elementUrl: this.elementUrl });
    }
    get dataIndex() {
        if (Array.isArray(this.dataGrid.data))
            return this.dataGrid.data.findIndex(g => g.id == this.dataId);
        else return -1;
    }
    get schema() {
        return this.dataGrid.schema;
    }
    get fields() {
        return this.dataGrid.fields;
    }
    get dataGrid() {
        if (this.parent instanceof DataGridView) {
            return this.parent;
        }
        else {
            var c = this.closest(g => g instanceof DataGridView) as DataGridView;
            return c
        }
    }
    async createElements(isForce?: boolean) {
        this.blocks.childs = [];
        if (this.url == '/data-grid/calendar/item') return
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            if (field) {
                var block = await createFieldBlock(field, this);
                if (block) this.blocks.childs.push(block);
                else {
                    console.log('not found field', field);
                }
            }
            else {
                console.log(this, this.fields);
            }
        }
        if (isForce) {
            await this.forceManualUpdate();
        }
    }
    async onUpdateCellValue(field: Field, value: any) {
        value = util.clone(value);
        var oldValue = lodash.cloneDeep(this.dataRow[field.name]);
        this.dataRow[field.name] = value;
        await this.schema.rowUpdate({
            dataId: this.dataRow.id,
            data: { [field.name]: value }
        }, this.dataGrid?.id || (this.id + 'TableStoreItem'))
        /**
         * 当更新值时，需要更新公式字段值
         */
        var ffs = this.fields.filter(g => g.field?.type == FieldType.formula);
        if (ffs.length > 0) {
            this.childs.forEach(cc => {
                // c.childs.forEach(cc => {
                if (cc instanceof OriginField) {
                    if (cc.url == '/field/formula') {
                        if (typeof cc['cacFieldValue'] == 'function') {
                            cc['cacFieldValue']();
                        }
                    }
                }
                // })
            })
        }
        /**
         * 如果是关联更新，需要考虑是否为双向的关联关系
         */
        if (field.type == FieldType.relation && field.config?.relationDouble == true) {
            var rs = this.dataGrid.relationSchemas.find(g => g.id == field.config.relationTableId);
            if (rs) {
                if (!Array.isArray(oldValue)) oldValue = [];
                var newValue = lodash.cloneDeep(value);
                if (!Array.isArray(newValue)) newValue = [];
                var ps: { id: string, count: number, refId: string }[] = [];
                (oldValue as string[]).forEach(od => {
                    ps.push({
                        id: od,
                        count: -1,
                        refId: this.dataRow.id
                    })
                });
                (newValue as string[]).forEach(nd => {
                    var nf = ps.find(c => c.id == nd);
                    if (nf) nf.count += 1;
                    else {
                        ps.push({
                            id: nd,
                            count: 1,
                            refId: this.dataRow.id
                        })
                    }
                })
                lodash.remove(ps, c => c.count == 0);
                var rf = rs.fields.find(c => c.id == field.config?.relationFieldId);
                if (rf) {
                    await rs.onDataStoreOperate([{
                        name: 'updateDoubleRelation',
                        fieldName: rf.name,
                        isMultiple: rf.config?.isMultiple,
                        data: ps
                    }], this.dataGrid?.id || (this.id + 'TableStoreItem'))
                }
            }


        }
        /**
         * 如果是关联表，那么此时需要同步更新关联引用的字段数据
         */
        if (field.type == FieldType.relation) {
            this.childs.forEach(c => {
                if (c.url == '/field/rollup') {
                    if ((c as any).field?.config?.rollupRelationFieldId == field.id) {
                        c.forceManualUpdate()
                    }
                }
            })
        }
    }
    async onOnlyUpdateCellValue(field: Field, value: any) {
        this.dataRow[field.name] = value;
    }
    async onUpdateCellProps(props: Record<string, any>) {
        Object.assign(this.dataRow, props);
        await this.schema.rowUpdate({
            dataId: this.dataRow.id,
            data: { ...props }
        }, this.dataGrid?.id || (this.id + 'TableStoreItem'))
    }
    async onUpdateCellInteractive(field: Field) {
        var r = await channel.patch('/interactive/emoji', {
            elementUrl: getElementUrl(
                field.type == FieldType.emoji ? ElementType.SchemaFieldData : ElementType.SchemaFieldNameData,
                this.dataGrid.schema.id,
                field.type == FieldType.emoji ? field.id : field.name,
                this.dataRow.id
            ),
            fieldName: field.name
        });
        if (r.ok) {
            var ov = lodash.cloneDeep(this.dataRow[field.name]);
            if (typeof ov == 'undefined' || lodash.isNull(ov)) ov = { count: 0 };
            if (typeof ov == 'number') ov = { count: ov };
            ov.count = r.data.count;
            var userid = this.page.user?.id;
            if (userid) {
                if (!Array.isArray(ov.users)) {
                    ov.users = []
                }
                if (r.data.exists) {
                    var ops = this.dataGrid.userEmojis[field.name];
                    if (!Array.isArray(ops)) this.dataGrid.userEmojis[field.name] = ops = []
                    if (!ops.exists(c => c == this.dataRow.id)) ops.push(this.dataRow.id);
                    if (!ov.users.exists(g => g == userid)) ov.users.push(userid)
                }
                else {
                    var ops = this.dataGrid.userEmojis[field.name];
                    if (!Array.isArray(ops)) this.dataGrid.userEmojis[field.name] = ops = []
                    if (ops.exists(c => c == this.dataRow.id)) lodash.remove(ops, c => c == this.dataRow.id);
                    lodash.remove(ov.users, g => (g as any) == userid);
                }
                if (typeof r.data.otherCount == 'number' && (['like', 'oppose'].includes(field.name))) {
                    var name = field.name == 'like' ? FieldType[FieldType.oppose] : FieldType[FieldType.like];
                    this.dataRow[name] = r.data.otherCount;
                    var cs = this.childs.findAll(g => (g instanceof OriginField) && g.field?.name == name);
                    if (!r.data.otherExists) {
                        var ops = this.dataGrid.userEmojis[name];
                        if (!Array.isArray(ops)) this.dataGrid.userEmojis[name] = ops = []
                        if (ops.exists(c => c == this.dataRow.id)) lodash.remove(ops, c => c == this.dataRow.id);
                    }
                    if (cs.length > 0) {
                        for (var i = 0; i < cs.length; i++) {
                            (cs[i] as any).value = r.data.otherCount;
                            cs[i].forceManualUpdate();
                        }
                    }
                }
                else if (r.data.otherId && field.name == 'vote') {
                    this.dataGrid.userEmojis[field.name] = [this.dataRow.id]
                }
            }
            this.dataRow[field.name] = ov;
            return ov;
        }
    }
    async onUpdateFieldSchema(field: Field, data) {
        data = util.clone(data);
        field.update(data);
        await this.schema.fieldUpdate({ fieldId: field.id, data }, this.dataGrid?.id || '')
        if (this.dataGrid) {
            this.dataGrid.onNotifyReferenceBlocks()
        }
    }
    async onGetContextMenus() {
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            name: 'open',
            icon: Edit1Svg,
            text: lst('打开'),
        })
        items.push({
            name: 'openSlide',
            icon: { name: 'byte', code: 'logout' },
            text: lst('右侧边栏打开'),
        })
        items.push({ type: MenuItemType.divide })
        items.push({
            name: 'duplicate',
            icon: DuplicateSvg,
            text: lst('复制'),
        })
        items.push({
            name: 'copyID',
            text: lst('复制数据ID'),
            icon: { name: 'byte', code: 'adobe-indesign' }
        })
        items.push({
            name: 'copyUrl',
            text: lst('复制数据网址'),
            icon: { name: 'byte', code: 'copy-link' }
        })
        items.push({ type: MenuItemType.divide })
        items.push({
            name: 'addIcon',
            text: lst('添加图标...'),
            icon: EmojiSvg
        })
        items.push({ type: MenuItemType.divide })
        items.push({
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: lst('删除'),
            label: "Delete"
        });
        if (this.dataRow.modifyer) {
            items.push({
                type: MenuItemType.divide,
            });
            var r = await channel.get('/user/basic', { userid: this.dataRow.modifyer });
            if (r?.data?.user) items.push({
                type: MenuItemType.text,
                text: lst('编辑人') + ' ' + r.data.user.name
            });
            if (this.dataRow.modifyDate) items.push({
                type: MenuItemType.text,
                text: lst('编辑于') + ' ' + util.showTime(new Date(this.dataRow.modifyDate))
            });
        }
        return items;
    }
    async onClickContextMenu(item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                await this.dataGrid.onRemoveRow(this.dataRow.id);
                break;
            case 'open':
                await this.dataGrid.onOpenEditForm(this.dataRow.id);
                break;
            case 'openSlide':
                await this.dataGrid.onOpenEditForm(this.dataRow.id, '/page/slide');
                break;
            case 'duplicate':
                await this.dataGrid.onCloneRow(this.dataRow);
                break;
            case 'copyID':
                CopyAlert(this.dataRow.id, lst('复制ID成功'));
                break;
            case 'copyUrl':
                CopyAlert(this.page.ws.resolve({ elementUrl: this.elementUrl }), lst('复制网址成功'));
                break;
            case 'addIcon':
                await this.openAddIcon();
                break;
        }
    }
    async onHandlePlus() {
        await this.dataGrid.onSyncAddRow({}, this.dataRow.id, 'after', true);
    }
    get isAllowDrop(): boolean {
        return true;
    }
    isAllowDrops(dragBlocks: Block[]) {
        if (dragBlocks.length == 1) {
            var dg = dragBlocks[0];
            if (dg instanceof TableGridItem && dg.dataGrid?.schemaId === this.dataGrid?.schemaId) {
                if (dg === this) return false;
                return true;
            }
        }
        return false;
    }
    isCanDropHere(dropBlock: Block) {
        if (dropBlock instanceof TableGridItem && dropBlock.dataGrid?.schemaId == this.dataGrid?.schemaId) {
            return true;
        }
        return false
    }
    canDropDirections() {
        return [
            DropDirection.top,
            DropDirection.bottom
        ]
    }
    async drop(blocks: Block[],
        direction: DropDirection,
        dropData?: Record<string, any>) {
        var dragRow = blocks[0] as TableGridItem;
        switch (direction) {
            case DropDirection.bottom:
            case DropDirection.top:
                var props: Record<string, any> = {};
                if (this.dataGrid?.url == BlockUrlConstant.DataGridBoard) {
                    try {
                        /**
                         * 将看板中的某一组option拖到另一组option
                         */
                        var db = (this.dataGrid as TableStoreBoard)
                        var name = db.groupField?.name;
                        var panel = blocks[0].el.closest('[data-block-drop-panel]') as HTMLElement;
                        var pd = JSON.parse(panel.getAttribute('data-block-drop-panel'));
                        var old = pd[name];
                        var dragOptions = lodash.cloneDeep(dragRow[name]) || [];
                        if (dragOptions.includes(old)) {
                            dragOptions = dragOptions.filter(c => c !== old);
                        }
                        var dg = db.groupStats.find(c => c.groupId === old);
                        if (dg && typeof dg.count == 'number') dg.count -= 1;
                        var newPanel = this.el.closest('[data-block-drop-panel]') as HTMLElement;
                        var newPd = JSON.parse(newPanel.getAttribute('data-block-drop-panel'));
                        var newG = newPd[name];
                        var ng = db.groupStats.find(c => c.groupId === newG);
                        if (ng && typeof ng.count == 'number') ng.count += 1;
                        if (!dragOptions.includes(newG)) {
                            if (lodash.isNull(newG)) dragOptions = []
                            else dragOptions.push(newG);
                        }
                        props[name] = dragOptions
                    }
                    catch (ex) {

                    }
                }
                else if (this.dataGrid?.url == BlockUrlConstant.DataGridCalendar) {
                    var name = (this.dataGrid as TableStoreCalendar).dateField?.name;
                    var d = dayjs(dragRow.dataRow[name]);
                    var c = dayjs(this.dataRow[name]);
                    d = d.year(c.year());
                    d = d.month(c.month());
                    d = d.date(c.date());
                    props[name] = d.toDate()
                }
                if (this.dataGrid.schema.allowSubs) {
                    if ([BlockUrlConstant.DataGridList, BlockUrlConstant.DataGridTable].includes(this.dataGrid.url as any)) {
                        if (this.subSpread) {
                            props.parentId = this.dataRow.id;
                        }
                        else {
                            if (dragRow.dataRow.parentId != this.dataRow.parentId) {
                                props.parentId = this.dataRow.parentId ?? null;
                            }
                        }
                    }
                }
                var result = await this.schema.rowRank({
                    id: dragRow.dataRow.id,
                    data: props,
                    pos: {
                        id: this.dataRow.id,
                        pos: DropDirection.bottom == direction ? "after" : 'before',
                    }
                }, this.dataGrid?.id || (this.id + 'TableStoreItem'));
                if (result) {
                    if (result?.isCacSort)
                        this.page.addActionCompletedEvent(async () => {
                            this.dataGrid.onReloadData()
                        })
                    else {
                        if (Object.keys(props).length > 0)
                            Object.assign(dragRow.dataRow, props);
                        dragRow.dataRow.sort = result.sort;
                        this.page.addActionCompletedEvent(async () => {
                            this.dataGrid.onSortRank()
                        })
                    }
                }
                break;
            case DropDirection.inner:
                if (dropData && Object.keys(dropData).length > 0) {
                    var props = dropData;

                    if (this.dataGrid?.url == BlockUrlConstant.DataGridBoard) {

                        var db = (this.dataGrid as TableStoreBoard);
                        var name = db.groupField?.name;
                        var panel = blocks[0].el.closest('[data-block-drop-panel]') as HTMLElement;
                        var pd = JSON.parse(panel.getAttribute('data-block-drop-panel'));
                        var old = pd[name];
                        var dragOptions = lodash.cloneDeep(dragRow[name]) || [];
                        if (dragOptions.includes(old)) {
                            dragOptions = dragOptions.filter(c => c !== old);
                        }
                        var dg = db.groupStats.find(c => c.groupId === old);
                        if (dg && typeof dg.count == 'number') dg.count -= 1;
                        var newG = dropData[name];
                        var ng = db.groupStats.find(c => c.groupId === newG);
                        if (ng && typeof ng.count == 'number') ng.count += 1;
                        if (!dragOptions.includes(newG)) {
                            if (lodash.isNull(newG)) dragOptions = []
                            else dragOptions.push(newG);
                        }
                        props[name] = dragOptions;
                    }
                    var r = await this.schema.rowUpdate({ dataId: dragRow.dataRow.id, data: props }, this.dataGrid?.id || (this.id + 'TableStoreItem'));
                    if (r) {
                        Object.assign(dragRow.dataRow, props);
                        dragRow.dataGrid.createOneItem(dragRow.dataRow, true);
                        // dragRow.dataGrid.forceManualUpdate()
                    }
                }
                break;
        }
    }
    get isShowHandleBlock(): boolean {
        return false;
    }
    async onOpenMenu(event: React.MouseEvent) {
        this.dataGrid.onDataGridTool(async () => {
            await this.page.onOpenMenu([this], event.nativeEvent);
        })
    }
    async openAddIcon() {
        var icon = await useIconPicker({ roundArea: Rect.fromEle(this.el) }, this.dataRow.icon);
        if (typeof icon != 'undefined') {
            await this.dataGrid.onRowUpdate(this.dataRow.id, { icon })
            this.dataRow.icon = icon;
            this.childs.forEach(c => {
                c.forceManualUpdate();
            })
        }
    }
    subDeep: number = 0;
    subList: SearchListType<Record<string, any>, { loaded: boolean }> = { loaded: false, list: [], loading: false, error: '', total: 0, size: 200, page: 1, word: '' };
    get subDataList() {
        return this.dataGrid.data.filter(g => g.parentId == this.dataId);
    }
    get subSpread() {
        return this.dataGrid.subMapSpread.get(this.dataId) == true ? true : false
    }
    async onLoadSubs(force?: boolean) {
        if (this.subList.loaded && force != true) return;
        this.subList.loading = true;
        this.forceManualUpdate();
        try {
            var r = await this.dataGrid.schema.gridSubList({
                parentId: this.dataId,
                page: this.subList.page,
                size: this.subList.size,
                filter: this.dataGrid.getSearchFilter(),
            }, this.dataGrid.page.ws)
            if (r.ok) {
                r.data.list.forEach(g => {
                    if (!this.dataGrid.data.exists(c => c.id == g.id))
                        this.dataGrid.data.push(g);
                })
                await this.dataGrid.loadRelationDatas(this.dataId);
                await this.dataGrid.loadDataInteraction(this.dataId);
                this.subList.total = r.data.total;
                this.subList.loaded = true;
                await this.createSubItems();
            }
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            this.subList.loading = false;
        }
    }
    async onSpreadSub() {
        this.dataGrid.subMapSpread.set(this.dataId, !this.subSpread);
        await this.onLoadSubs();
        this.forceManualUpdate();
    }
    async createSubItems(isForce?: boolean) {
        this.blocks.subChilds = [];
        var list = this.subDataList;
        for (let i = 0; i < list.length; i++) {
            var row = list[i];
            var rowBlock: TableGridItem = await BlockFactory.createBlock(this.url, this.page, {
                mark: i,
                subDeep: this.subDeep + 1,
                dataId: row.id
            }, this) as TableGridItem;
            this.blocks.subChilds.push(rowBlock);
            await rowBlock.createElements();
        }
        if (isForce) {
            this.forceManualUpdate();
        }
    }
    async onAddSub(event: React.MouseEvent) {
        var data = {
            parentId: this.dataId
        }
        var id = this.subDataList.last()?.id;
        var r = await this.schema.rowAdd({ data, pos: { id: id, pos: 'after' } }, this.id);
        if (r) {
            var newRow = r.data;
            this.dataRow.subCount = (this.dataRow.subCount || 0) + 1;
            this.dataGrid.data.push(newRow);
            await this.createSubItems(true)
        }
    }
}

@view('/data-grid/item')
export class TableStoreItemView extends BlockView<TableGridItem> {
    getFields() {
        return this.block.childs.findAll(g => g instanceof OriginField && (g as OriginField).isFieldEmpty ? false : true)
    }
    renderItems() {
        return <div className='sy-data-grid-item relative'>
            <div className="r-gap-b-10">
                <ChildsArea childs={this.getFields()}></ChildsArea>
            </div>
            {this.block.isCanEdit() && <div onMouseDown={e => this.block.onOpenMenu(e)} className="pos visible top-5 right-5 flex-center  size-24 round item-hover bg-white cursor">
                <Icon size={20} icon={DotsSvg}></Icon>
            </div>}
        </div>
    }
    renderCards() {
        var ga = this.block.dataGrid as TableStoreGallery;
        if (ga.cardConfig.showCover) {
            if (ga.cardConfig.coverFieldId == 'pageContent') {
                var pd = this.block.dataRow.pageContentPreview;
                if (typeof pd == 'string') pd = JSON.parse(pd);
                return <div className='sy-data-grid-item sy-data-grid-card visible-hover'>
                    <div className="h-180"
                        style={{
                            overflow: 'hidden',
                            background: 'rgba(55, 53, 47, 0.024)',
                            boxShadow: 'rgba(55, 53, 47, 0.09) 0px -1px 0px 0px inset'
                        }}>
                        {pd && <SnapRecordPage content={pd}
                            elementUrl={getElementUrl(ElementType.SchemaData, this.block.dataGrid.schema.id, this.block.dataRow.id)}>
                        </SnapRecordPage>}
                    </div>
                    <div className="sy-data-grid-card-items padding-w-10 padding-h-5 r-gap-h-5 ">
                        <ChildsArea childs={this.getFields()}></ChildsArea>
                    </div>
                    <div></div>
                    {this.block.isCanEdit() && <div style={{ zIndex: "100" }} className="pos visible top-5 right-5 remark flex-center round  shadow-s border cursor">
                        <ToolTip overlay={<S>编辑</S>}><span onMouseDown={e => { e.stopPropagation(); this.block.dataGrid.onOpenEditForm(this.block.dataRow.id); }} className="round-l-4 bg-hover size-24 flex-center cursor border-right"><Icon size={16} icon={{ name: 'byte', code: 'write' }}></Icon></span></ToolTip>
                        <ToolTip overlay={<S text="复制删除">复制、删除</S>}><span onMouseDown={e => { e.stopPropagation(); this.block.onOpenMenu(e); }} className="round-r-4 bg-hover size-24 flex-center cursor"><Icon size={20} icon={DotsSvg}></Icon></span></ToolTip>
                    </div>}
                </div>
            }
            var field = this.block.schema.fields.find(g => g.id == ga.cardConfig.coverFieldId);
            var imageData, top = 50;
            if (field?.type == FieldType.image) {
                if (field) imageData = this.block.dataRow[field.name];
                if (Array.isArray(imageData)) imageData = imageData[0];
            }
            else if (field?.type == FieldType.rollup) {
                var v = this.block.dataGrid.getRollupValue(this.block.dataRow, field);
                if (Array.isArray(v)) imageData = v[0];
                if (Array.isArray(imageData)) imageData = imageData[0];
            }
            else if (ga.cardConfig.coverFieldId == 'pageCover') {
                if (this.block.dataRow.cover && this.block.dataRow.cover['url'] && this.block.dataRow.cover.abled) {
                    imageData = { url: this.block.dataRow.cover['url'] };
                    top = this.block.dataRow.cover['top'] || 50;
                }
            }
            else if (ga.cardConfig.coverFieldId == 'pageIllustration') {
                imageData = this.block.dataRow.thumb;
                if (Array.isArray(imageData)) imageData = imageData[0];
                if (!imageData) imageData = null;
                top = 50;
            }
            return <div className='sy-data-grid-item sy-data-grid-card visible-hover'>
                {imageData && <div className="sy-data-grid-card-cover border-light-b">
                    <img onDragStart={e => false} style={{
                        objectFit: 'cover',
                        objectPosition: '50% ' + (top) + '%',
                        maxHeight: ga.cardConfig.coverAuto ? "auto" : 180
                    }} src={autoImageUrl(imageData.url, 500)} />
                </div>}
                <div className="sy-data-grid-card-items padding-w-10 padding-h-5 r-gap-h-5 ">
                    <ChildsArea childs={this.getFields()}></ChildsArea>
                </div>
                <div></div>
                {this.block.isCanEdit() && <div className="pos visible top-5 right-5 remark flex-center round  shadow-s border cursor">
                    <ToolTip overlay={<S>编辑</S>}><span onMouseDown={e => { e.stopPropagation(); this.block.dataGrid.onOpenEditForm(this.block.dataRow.id); }} className="round-l-4 bg-hover size-24 flex-center cursor border-right"><Icon size={16} icon={{ name: 'byte', code: 'write' }}></Icon></span></ToolTip>
                    <ToolTip overlay={<S text="复制删除">复制、删除</S>}><span onMouseDown={e => { e.stopPropagation(); this.block.onOpenMenu(e); }} className="round-r-4 bg-hover size-24 flex-center cursor"><Icon size={20} icon={DotsSvg}></Icon></span></ToolTip>
                </div>}
            </div>
        }
        else {
            return <div className='sy-data-grid-item visible-hover'>
                <div className="r-gap-h-5 padding-w-10 padding-h-5 r-gap-h-5">
                    <ChildsArea childs={this.getFields()}></ChildsArea>
                </div>
                {this.block.isCanEdit() && <div className="pos visible top-5 right-5 remark flex-center round  shadow-s border cursor">
                    <ToolTip overlay={<S>编辑</S>}><span onMouseDown={e => { e.stopPropagation(); this.block.dataGrid.onOpenEditForm(this.block.dataRow.id); }} className="round-l-4 bg-hover size-24 flex-center cursor border-right"><Icon size={16} icon={{ name: 'byte', code: 'write' }}></Icon></span></ToolTip>
                    <ToolTip overlay={<S text="复制删除">复制、删除</S>}><span onMouseDown={e => { e.stopPropagation(); this.block.onOpenMenu(e); }} className="round-r-4 bg-hover size-24 flex-center cursor"><Icon size={20} icon={DotsSvg}></Icon></span></ToolTip>
                </div>}
            </div>
        }
    }
    renderView() {
        if (!this.block.dataGrid) return <></>
        if ([BlockUrlConstant.DataGridGallery, BlockUrlConstant.DataGridBoard].includes(this.block.dataGrid?.url as any)) return this.renderCards()
        else return this.renderItems();
    }
}


