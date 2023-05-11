import lodash from "lodash";
import React from "react";
import { Icon } from "../../../../component/view/icon";
import { useRelationPickData } from "../../../../extensions/data-grid/relation.picker";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { PageLayoutType, getPageIcon } from "../../../../src/page/declare";
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
            return <div key={r.id}><a className="item-hover round padding-w-3 padding-h-2" href={url} onClick={e => e.preventDefault()}>
                <span className="size-24 flex-center flex-inline">
                    <Icon size={16} icon={getPageIcon({ pageType: PageLayoutType.doc, icon: r[icon.name] })}></Icon>
                </span>
                <span>{r[f?.name]}</span>
            </a></div>
        })}
        </div>
    }
    render() {
        return <div className='sy-field-relation' onMouseDown={e => this.block.onCellMousedown(e)}>
            {this.renderList()}
        </div>
    }
}

@url('/field/rollup')
export class FieldRollup extends OriginField {
    get relationList() {
        var gs = this.dataGrid.relationDatas.get(this.field.config?.rollupTableId) || [];
        var item: FieldRelation = this.item.childs.find(g => (g instanceof FieldRelation) && g.field.config.relationTableId == this.field.config?.rollupTableId) as any;
        if (item) {
            var vs: string[] = item.value;
            if (!Array.isArray(vs)) vs = [];
            if (vs.length == 0) return [];
            if (!item.field.config.isMultiple) {
                vs = vs.slice(0, 1);
            }
            return gs.findAll(g => vs.includes(g.id));
        }
        return []
    }
    get relationSchema() {
        return this.dataGrid.relationSchemas.find(g => g.id == this.field.config?.rollupTableId)
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {

    }
}
@view('/field/rollup')
export class FieldRollupView extends BlockView<FieldRollup>{
    render() {
        var str: string = '';
        var list = this.block.relationList;
        var field = this.block.relationSchema?.fields?.find(g => g.id == this.block.field.config?.rollupFieldId);
        if (this.block.field.config?.rollupStatistic == '$count') {
            str = list.length.toString();
        }
        else if (this.block.field.config?.rollupStatistic == '$sum') {
            str = lodash.sum(list.map(c => c[field?.name])).toString()
        } else if (this.block.field.config?.rollupStatistic == '$agv') {
            str = (lodash.sum(list.map(c => c[field?.name])) / list.length).toString()
        } else if (this.block.field.config?.rollupStatistic == '$min') {
            var va = list.min(g => g[field?.name])
            if (typeof va != 'undefined') str = va.toString()
        } else if (this.block.field.config?.rollupStatistic == '$max') {
            var va = list.max(g => g[field?.name])
            if (typeof va != 'undefined') str = va.toString()
        }

        return <div className='sy-field-relation' onMouseDown={e => this.block.onCellMousedown(e)}>
            {str}
        </div>
    }
}

