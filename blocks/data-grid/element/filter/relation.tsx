import React from "react";
import { useRelationPickData } from "../../../../extensions/data-grid/relation.picker";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { TableSchema } from "../../schema/meta";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

@url('/field/filter/relation')
export class FilterRelation extends OriginFilterField {
    @prop()
    isMultiple: boolean = false;
    selectDataIds: { id: string, title: string }[] = [];
    onFilter() {

    }
    get filters() {
        if (this.selectDataIds.length == 0) return {}
        return {
            [this.field.name]: {
                $in: this.selectDataIds.map(c=>c.id)
            }
        }
    }
}

@view('/field/filter/relation')
export class FilterRelationView extends BlockView<FilterRelation>{
    relationSchema: TableSchema;
    async mousedown(event: React.MouseEvent) {
        if (!this.relationSchema) {
            this.relationSchema = await TableSchema.loadTableSchema(this.block.field.config.relationTableId);
        }
        var g = await useRelationPickData({
            roundArea: Rect.fromEvent(event)
        }, {
            relationDatas: this.block.selectDataIds.map(s => { return { id: s.id } }),
            relationSchema: this.relationSchema, field: this.block.field, isMultiple: true
        });
        if (g) this.block.selectDataIds = g.map(c => {
            return { id: c.id, title: c.title }
        })
    }
    render() {
        return <OriginFilterFieldView
            filterField={this.block}>
            <span onMouseDown={e => this.mousedown(e)} >{this.block.selectDataIds.map(s => { return <em id={s.id}>{s.title}</em> })}</span>
        </OriginFilterFieldView >
    }
}