import React from "react";
import { Icon } from "../../../../component/view/icon";
import { getPageIcon } from "../../../../extensions/at/declare";
import { useRelationPickData } from "../../../../extensions/data-grid/relation.picker";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { PageLayoutType } from "../../../../src/page/declare";
import { FieldType } from "../../schema/type";
import { OriginField } from "./origin.field";

@url('/field/relation')
export class FieldRelation extends OriginField {
    get relationList() {
        var rs: any[] = [];
        var vs: string[] = this.value;
        if (!Array.isArray(vs)) vs = [];
        if (vs.length == 0) return [];
        if (!this.field.config.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var g = this.dataGrid.relationDatas.get(this.field.config?.relationTableId);
        if (Array.isArray(g)) {
            return g.findAll(g => vs.includes(g.id))
        }
        return rs;
    }
    get relationSchema() {
        return this.dataGrid.relationSchemas.find(g => g.id == this.field.config?.relationTableId)
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        var r = await useRelationPickData({ roundArea: Rect.fromEvent(event) }, {
            field: this.viewField.field,
            relationDatas: this.relationList,
            isMultiple: this.viewField.field.config.isMultiple,
            relationSchema: this.relationSchema
        });
        if (r) {
            var ids = r.map(r => r.id);
            await this.onUpdateCellValue(ids);
            await this.dataGrid.loadRelationDatas();
            this.forceUpdate();
        }
    }
}
@view('/field/relation')
export class FieldRelationView extends BlockView<FieldRelation>{
    renderList() {
        var rs = this.block.relationSchema;
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        var icon = rs?.fields.find(g => g.type == FieldType.icon);
        return <div className='sy-field-relation-items'>{this.block.relationList?.map(r => {
            var url = getElementUrl(ElementType.SchemaData, rs.id, r.id);
            return <a href={url} onClick={e => e.preventDefault()} key={r.id}>
                <span className="size-24 flex-center flex-inline">
                    <Icon size={16} icon={getPageIcon({ pageType: PageLayoutType.doc, icon: r[icon.name] })}></Icon>
                </span>
                <span>{r[f?.name]}</span>
            </a>
        })}
        </div>
    }
    render() {
        return <div className='sy-field-relation' onMouseDown={e => this.block.onCellMousedown(e)}>
            {this.renderList()}
        </div>
    }
}