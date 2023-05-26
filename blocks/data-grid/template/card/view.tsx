
import React from "react";
import { TableStoreGallery } from "../../view/gallery";
import { TableStoreItem } from "../../view/item";
import { DataGridItemRecord } from "../../element/record";
import { useImageFilePicker } from "../../../../extensions/file/image.picker";
import { Rect } from "../../../../src/common/vector/point";
import { DataGridView } from "../../view/base";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";

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
    getRowIndex() {
        if (this.props.item instanceof TableStoreItem) return this.props.item.dataIndex;
        else return -1;
    }
    getField(name: string) {
        var n = this.CardConfig().templateProps.props?.find(g => g.name == name);
        if (n) {
            var f = this.schema.fields.find(c => c.id == n.bindFieldId);
            if (f) return f;
        }
    }
    getValue<T = string>(name: string, safeType?: FieldType): T {
        var f = this.getField(name);
        if (f) {
            var value = this.props.item.dataRow[f.name];
            if (typeof safeType != 'undefined') {
                switch (safeType) {
                    case FieldType.comment:
                    case FieldType.like:
                    case FieldType.love:
                    case FieldType.oppose:
                        if (typeof value?.count == 'number' && Array.isArray(value?.users)) {
                            return value;
                        }
                        else return { count: 0, users: [] } as any
                        break
                }
            }
            return value;
        }
        else {
            if (typeof safeType != 'undefined') {
                switch (safeType) {
                    case FieldType.comment:
                    case FieldType.like:
                    case FieldType.love:
                    case FieldType.oppose:
                        return { count: 0, users: [] } as any
                }
            }
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
        if (this.props.dataGrid instanceof TableStoreGallery && field) {
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