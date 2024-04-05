import React from "react";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { BlockDirective } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { util } from "../../../../util/util";
import { ViewField } from "../../schema/view";
import { DataGridView } from "../base";
import { createFieldBlock } from "./service";
import trash from "../../../../src/assert/svg/trash.svg";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../gallery";
import { autoImageUrl, ElementType, getElementUrl } from "../../../../net/element.type";
import { DropDirection } from "../../../../src/kit/handle/direction";
import { Field } from "../../schema/field";
import { channel } from "../../../../net/channel";
import { FieldType } from "../../schema/type";
import lodash from "lodash";
import { OriginField } from "../../element/field/origin.field";
import { DotsSvg, DuplicateSvg, Edit1Svg, EmojiSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import "./style.less";
import { lst } from "../../../../i18n/store";

import { CopyAlert } from "../../../../component/copy";
import { useIconPicker } from "../../../../extensions/icon";
import { Rect } from "../../../../src/common/vector/point";

@url('/data-grid/item')
export class TableStoreItem extends Block {
    dataId: string;
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
        return (this.parent as DataGridView).schema;
    }
    get fields() {
        return (this.parent as DataGridView).fields;
    }
    get dataGrid() {
        if (this.parent instanceof DataGridView) {
            return this.parent;
        }
    }
    async createElements() {
        this.blocks.childs = [];
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            if (field) {
                var block = await createFieldBlock(field, this);
                if (block) this.blocks.childs.push(block);
            }
            else {
                console.log(this, this.fields);
            }
        }
    }
    async onUpdateCellValue(field: Field, value: any) {
        value = util.clone(value);
        this.dataRow[field.name] = value;
        var dr = this.dataGrid.data.find(g => g.id == this.dataRow.id);
        dr[field.name] = value;
        await this.schema.rowUpdate({
            dataId: this.dataRow.id,
            data: { [field.name]: value }
        })
    }
    async onUpdateCellProps(props: Record<string, any>) {
        Object.assign(this.dataRow, props);
        var dr = this.dataGrid.data.find(g => g.id == this.dataRow.id);
        if (dr) Object.assign(dr, props)
        await this.schema.rowUpdate({
            dataId: this.dataRow.id,
            data: { ...props }
        })
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
                            cs[i].forceUpdate();
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
    async onUpdateFieldSchema(viewField: ViewField, data) {
        data = util.clone(data);
        viewField.field.update(data);
        await this.schema.fieldUpdate({ fieldId: viewField.field.id, data })
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
            icon: trash,
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
        await this.dataGrid.onSyncAddRow({}, this.dataRow.id, 'after');
    }
    get isAllowDrop(): boolean {
        return true;
    }
    isAllowDrops(dragBlocks: Block[]) {
        if (dragBlocks.length == 1) {
            var dg = dragBlocks[0];
            if (dg instanceof TableStoreItem && dg.dataGrid === this.dataGrid) {
                if (dg === this) return false;
                return true;
            }
        }
        return false;
    }
    isCanDropHere(dropBlock: Block) {
        if (dropBlock instanceof TableStoreItem && dropBlock.dataGrid == this.dataGrid) {
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
    async drop(blocks: Block[], direction: DropDirection) {
        var dragRow = blocks[0] as TableStoreItem;
        switch (direction) {
            case DropDirection.bottom:
            case DropDirection.top:
                var result = await this.schema.rowRank({
                    id: dragRow.dataRow.id,
                    pos: {
                        id: this.dataRow.id,
                        pos: DropDirection.bottom == direction ? "after" : 'before'
                    }
                });
                if (result.ok) {
                    if (result.data?.isCacSort)
                        this.page.addUpdateEvent(async () => {
                            this.dataGrid.onReloadData()
                        })
                    else {
                        dragRow.dataRow.sort = result.data.sort;
                        this.page.addUpdateEvent(async () => {
                            this.dataGrid.onSortRank()
                        })
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
            this.forceUpdate();
        }
    }
}
@view('/data-grid/item')
export class TableStoreItemView extends BlockView<TableStoreItem>{
    renderItems() {
        return <div className='sy-data-grid-item relative'>
            <div className="r-gap-b-10">
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
            {this.block.isCanEdit() && <div onMouseDown={e => this.block.onOpenMenu(e)} className="pos visible top-5 right-5 flex-center  size-24 round item-hover bg-white cursor">
                <Icon size={20} icon={DotsSvg}></Icon>
            </div>}
        </div>
    }
    renderCards() {
        var ga = this.block.dataGrid as TableStoreGallery;
        if (ga.cardConfig.showCover) {
            var field = this.block.schema.fields.find(g => g.id == ga.cardConfig.coverFieldId);
            var imageData;
            if (field) imageData = this.block.dataRow[field.name];
            if (Array.isArray(imageData)) imageData = imageData[0];
            return <div className='sy-data-grid-item sy-data-grid-card visible-hover'>
                <div className="sy-data-grid-card-cover">
                    {imageData && <img style={{ maxHeight: ga.cardConfig.coverAuto ? "auto" : 200 }} src={autoImageUrl(imageData.url, 500)} />}
                </div>
                <div className="sy-data-grid-card-items r-gap-b-10">
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
                {this.block.isCanEdit() && <div onMouseDown={e => this.block.onOpenMenu(e)} className="pos visible top-5 right-5 flex-center size-24 round item-hover bg-white cursor">
                    <Icon size={20} icon={DotsSvg}></Icon>
                </div>}
            </div>
        }
        else {
            return <div className='sy-data-grid-item visible-hover'>
                <div className="r-gap-b-10">
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
                {this.block.isCanEdit() && <div onMouseDown={e => this.block.onOpenMenu(e)} className="pos visible top-5 right-5 flex-center size-24 visible round item-hover bg-white cursor">
                    <Icon size={20} icon={DotsSvg}></Icon>
                </div>
                }
            </div>
        }
    }
    renderView() {
        if (!this.block.dataGrid) return <></>
        if ([BlockUrlConstant.DataGridGallery, BlockUrlConstant.DataGridBoard].includes(this.block.dataGrid?.url as any)) return this.renderCards()
        else return this.renderItems();
    }
}


