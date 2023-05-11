import lodash from "lodash";
import React from "react";
import { CloseSvg } from "../../../../component/svgs";
import { Button } from "../../../../component/view/button";
import { Icon } from "../../../../component/view/icon";
import { useRelationPickData } from "../../../../extensions/data-grid/relation.picker";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { PageLayoutType, getPageIcon } from "../../../../src/page/declare";
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/relation')
class FormFieldRelation extends OriginFormField {
    relationSchema: TableSchema;
    relationList: any[] = [];
    async loadFieldData() {
        this.relationSchema = await TableSchema.loadTableSchema(this.field.config?.relationTableId);
        if (Array.isArray(this.value) && this.value.length > 0) {
            var d = await this.relationSchema.all({
                page: 1,
                filter: { id: { $in: this.value } }
            });
            if (d.ok) {
                this.relationList = d.data.list;
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
    async onDeleteData(event: React.MouseEvent, id: string) {
        event.stopPropagation()
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        lodash.remove(vs, c => c == id);
        lodash.remove(this.relationList, c => c.id == id);
        this.value = vs;
        this.forceUpdate()
    }
}
@view('/form/relation')
class FormFieldRelationView extends BlockView<FormFieldRelation>{
    renderList() {
        var rs = this.block.relationSchema;
        if (!rs) return <></>
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        var icon = rs?.fields.find(g => g.type == FieldType.icon);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        return <div>{this.block.relationList?.map(r => {
            var url = getElementUrl(ElementType.SchemaData, rs.id, r.id);
            return <a className="flex no-underline text-1 min-h-30 flex-block round item-hover visible-hover"
                href={url}
                onClick={e => e.preventDefault()}
                key={r.id}
            >
                <span className="flex-fixed size-24 flex-center flex-inline">
                    <Icon size={18} icon={getPageIcon({ pageType: PageLayoutType.doc, icon: r[icon.name] })}></Icon>
                </span>
                <span className="flex-auto text-overflow">{r[f?.name]}</span>
                <span onClick={e => this.block.onDeleteData(e, r.id)} className="flex-fixed size-24 item-hover flex-center visible round">
                    <Icon size={16} icon={CloseSvg}></Icon>
                </span>
            </a>
        })}
            {(this.block.field.config.isMultiple || (!(this.block.relationList.length > 0))) && <div>
                <Button onMouseDown={e => { this.block.onCellMousedown(e) }} ghost>选择{this.block.relationSchema?.text}</Button>
            </div>}
        </div>
    }
    render() {
        return <FieldView block={this.block}>
            <div>
                {this.renderList()}
            </div>
        </FieldView>
    }
}
