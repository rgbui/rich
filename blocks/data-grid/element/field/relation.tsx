import React from "react";
import { useRelationPickData } from "../../../../extensions/datagrid/relation.picker";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldType } from "../../schema/type";
import { OriginField } from "./origin.field";

@url('/field/relation')
export class FieldRelation extends OriginField {
    get relationList() {
        var rs: any[] = [];
        var vs: string[] = this.value;
        if (!Array.isArray(vs)) vs = [];
        if (vs.length == 0) return [];
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
            var rs = this.dataGrid.relationDatas.get(this.relationSchema.id);
            if (!Array.isArray(rs)) {
                rs = [];
                this.dataGrid.relationDatas.set(this.relationSchema.id, rs)
            }
            r.each(g => {
                if (!rs.some(c => c.id == g.id)) rs.push(g)
            });
            var ids = r.map(r => r.id);
            this.value = ids;
            await this.onUpdateCellValue(ids);
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
        return <div className='sy-field-relation-items'>{this.block.relationList?.map(r => {
            var url = getElementUrl(ElementType.SchemaRecord, rs.id, r.id);
            return <a href={url} onClick={e => e.preventDefault()} key={r.id}>{r[f?.name]}</a>
        })}
        </div>
    }
    render() {
        return <div className='sy-field-relation' onMouseDown={e => this.block.onCellMousedown(e)}>
            {this.renderList()}
        </div>
    }
}