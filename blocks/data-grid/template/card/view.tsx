
import React from "react";
import { TableStoreGallery } from "../../view/gallery";
import { TableStoreItem } from "../../view/item";
import { DataGridItemRecord } from "../../element/record";
import { useImageFilePicker } from "../../../../extensions/file/image.picker";
import { Rect } from "../../../../src/common/vector/point";
import { DataGridView } from "../../view/base";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { TableStoreList } from "../../view/list";
import lodash from "lodash";
import { ShyAlert } from "../../../../component/lib/alert";
import { lst } from "../../../../i18n/store";

export class CardView extends React.Component<{ item: DataGridItemRecord | TableStoreItem, dataGrid: DataGridView | DataGridItemRecord }> {
    cardConfig() {
        if ((this.props.dataGrid instanceof TableStoreGallery) || (this.props.dataGrid instanceof TableStoreList)) {
            return this.props.dataGrid.cardConfig;
        }
    }
    get schema() {
        if ((this.props.dataGrid instanceof TableStoreGallery) || (this.props.dataGrid instanceof TableStoreList)) {
            return this.props.dataGrid.schema;
        }
    }
    getRowIndex() {
        if (this.props.item instanceof TableStoreItem) return this.props.item.dataIndex;
        else return -1;
    }
    getField(name: string) {
        var n = this.cardConfig().templateProps.props?.find(g => g.name == name);
        if (n) {
            var f = this.schema.fields.find(c => c.id == n.bindFieldId);
            if (f) return f;
        }
    }
    getValue<T = string>(name: string, safeType?: FieldType): T {
        var f = this.getField(name);
        if (f && this.props.item.dataRow) {
            var value = this.props.item.dataRow[f.name];
            if (typeof safeType != 'undefined') {
                switch (safeType) {
                    case FieldType.comment:
                    case FieldType.like:
                    case FieldType.love:
                    case FieldType.oppose:
                    case FieldType.browse:
                        if (typeof value?.count == 'number' && Array.isArray(value?.users)) return value;
                        else return { count: 0, users: [] } as any
                        break
                    case FieldType.option:
                    case FieldType.options:
                        if (lodash.isUndefined(value) || lodash.isNull(value)) return [] as any;
                        var v = Array.isArray(value) ? value : [value];
                        return v.map(g => {
                            var op = f.config.options.find(c => c.value == g);
                            if (op?.text) return { text: op.text, color: op.color };
                            else return { text: g };
                        }) as any
                        break;
                    case FieldType.image:
                    case FieldType.cover:
                        if (lodash.isUndefined(value) || lodash.isNull(value)) return [] as any;
                        var v = Array.isArray(value) ? value : [value];
                        return v as any;
                        break;
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
                    case FieldType.browse:
                        return { count: 0, users: [] } as any
                    case FieldType.option:
                    case FieldType.options:
                        return [] as any
                    case FieldType.image:
                    case FieldType.cover:
                        return [] as any
                }
            }
        }
    }
    async uploadImage(name: string, event: React.MouseEvent | MouseEvent | Rect, updateFileName?: string) {
        if (typeof (event as any).stopPropagation == 'function') (event as any).stopPropagation()
        var resource = await useImageFilePicker({ roundArea: event instanceof Rect ? event : Rect.fromEle(event.currentTarget as HTMLElement) });
        if (resource) {
            var field = this.getField(name);
            if (this.props.item instanceof TableStoreItem) {
                if (updateFileName) {
                    var uf = this.getField(updateFileName);
                    var filename = resource.filename;
                    var filename = filename.slice(0, filename.lastIndexOf('.'))
                    await this.props.item.onUpdateCellProps({
                        [field.name]: [resource],
                        [uf.name]: filename
                    })
                }
                else {
                    await this.props.item.onUpdateCellValue(field, [resource]);
                }
                this.forceUpdate()
            }
        }
    }
    async deleteItem() {
        if (this.props.item instanceof TableStoreItem || this.props.dataGrid instanceof TableStoreList) {
            await (this.props.dataGrid as DataGridView).onRemoveRow(this.props.item.dataRow.id);
        }
    }
    async openEdit(event: React.MouseEvent, forceUrl?: '/page/open' | '/page/dialog' | '/page/slide') {
        if (this.props.dataGrid instanceof TableStoreGallery || this.props.dataGrid instanceof TableStoreList) {
            this.props.dataGrid.onOpenEditForm(this.props.item.dataRow.id, forceUrl)
        }
    }
    get isCanEdit() {
        return this.props.dataGrid.isCanEdit();
    }
    isEmoji(name: string) {
        if (!this.props.item.dataRow) return false;
        var field: Field = this.getField(name);
        if ((this.props.dataGrid instanceof TableStoreGallery || this.props.dataGrid instanceof TableStoreList) && field) {
            var r = this.props.dataGrid.isEmoji(field, this.props.item.dataRow.id);
            return r;
        }
    }
    async onUpdateCellInteractive(event: React.MouseEvent, name: string) {
        event.stopPropagation()
        if (!this.props.dataGrid.page.isSign) {
            ShyAlert(lst('请先登录'))
            return
        }
        var field: Field = this.getField(name);
        if (this.props.item instanceof TableStoreItem) {
            await this.props.item.onUpdateCellInteractive(field);
            this.forceUpdate()
        }
    }
}