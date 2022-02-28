import React from "react";
import { useRelationPickData } from "../../../../extensions/tablestore/relation.picker";
import { channel } from "../../../../net/channel";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/relation')
class FormFieldRelation extends OriginFormField {
    relationSchema: TableSchema;
    relationList: any[] = [];
    async loadFieldData() {
        var relationTable = this.field.config?.relationTableId;
        var sea = await channel.get('/schema/query', { id: relationTable });
        if (sea.ok) {
            this.relationSchema = new TableSchema(sea.data.schema);
            if (Array.isArray(this.value) && this.value.length > 0) {
                var d = await this.relationSchema.all({ page: 1, filter: { id: { $in: this.value } } });
                if (d.ok) {
                    this.relationList = d.data.list;
                }
            }
        }
    }
    async didMounted(): Promise<void> {
        await this.loadFieldData();
        this.view.forceUpdate()
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        var r = await useRelationPickData({ roundArea: Rect.fromEvent(event) }, {
            field: this.field,
            relationDatas: this.relationList,
            isMultiple: this.field.config.isMultiple,
            relationSchema: this.relationSchema
        });
        if (r) {
            var ids = r.map(r => r.id);
            this.value = ids;
            this.forceUpdate();
        }
    }
}
@view('/form/relation')
class FormFieldRelationView extends BlockView<FormFieldRelation>{
    renderList() {
        var rs = this.block.relationSchema;
        if (!rs) return <></>
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        return <div className='sy-field-relation-items'>{this.block.relationList?.map(r => {
            var url = getElementUrl(ElementType.SchemaRecord, rs.id, r.id);
            return <a href={url} onClick={e => e.preventDefault()} key={r.id}>{r[f?.name]}</a>
        })}
        </div>
    }
    render() {
        return <FieldView block={this.block}>
            <div onMouseDown={e => { this.block.onCellMousedown(e) }}>
                {this.renderList()}
            </div>
        </FieldView>
    }
}
