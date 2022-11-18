import React from "react";

import { TableStoreGallery } from "../view/gallery";
import { TableStoreItem } from "../view/item";
import { DataGridItemRecord } from "../element/record";
import { useImageFilePicker } from "../../../extensions/file/image.picker";
import { Rect } from "../../../src/common/vector/point";
import { DataGridView } from "../view/base";
import { Field } from "../schema/field";

export class CardView extends React.Component<{ item: DataGridItemRecord | TableStoreItem, dataGrid: DataGridView | DataGridItemRecord }> {

    CardConfig() {
        if (this.props.dataGrid instanceof TableStoreGallery) {
            return this.props.dataGrid.cardConfig;
        }
    }
    get schema() {
        if (this.props.dataGrid instanceof TableStoreGallery) {
            return this.props.dataGrid.schema;
        }
    }
    getField(name: string) {
        var n = this.CardConfig().templateProps.props?.find(g => g.name == name);
        if (n) {
            var f = this.schema.fields.find(c => c.id == n.bindFieldId);
            if (f) return f;
        }
    }
    getValue<T = string>(name: string): T {
        var f = this.getField(name);
        if (f) {
            return this.props.item.dataRow[f.name];
        }
    }
    async uploadImage(name: string, event: React.MouseEvent | MouseEvent | Rect) {
        if (typeof (event as any).stopPropagation == 'function') (event as any).stopPropagation()
        var resource = await useImageFilePicker({ roundArea: Rect.fromEvent(event) });
        if (resource) {
            var field = this.getField(name);
            if (this.props.item instanceof TableStoreItem) {
                await this.props.item.onUpdateCellValue(field, [resource]);
                this.forceUpdate()
            }
        }
    }
    async deleteItem() {
        if (this.props.item instanceof TableStoreItem) {
            await (this.props.dataGrid as DataGridView).onRemoveRow(this.props.item.dataRow.id);
        }
    }
    async openEdit(event: React.MouseEvent) {
        if (this.props.dataGrid instanceof TableStoreGallery) {
            this.props.dataGrid.onOpenEditForm(this.props.item.dataRow.id)
        }
    }
    isEmoji(name: string) {
        var field: Field = this.getField(name);
        if (this.props.dataGrid instanceof TableStoreGallery) {
            var r = this.props.dataGrid.isEmoji(field, this.props.item.dataRow.id);
            return r;
        }
    }
    async onUpdateCellInteractive(event: React.MouseEvent, name: string) {
        event.stopPropagation()
        var field: Field = this.getField(name);
        if (this.props.item instanceof TableStoreItem) {
            await this.props.item.onUpdateCellInteractive(field);
            this.forceUpdate()
        }
    }
}