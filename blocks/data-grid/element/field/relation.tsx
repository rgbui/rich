import lodash from "lodash";
import React from "react";
import { Icon } from "../../../../component/view/icon";
import { useRelationPickData } from "../../../../extensions/data-grid/relation.picker";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { Rect } from "../../../../src/common/vector/point";
import { PageLayoutType, getPageIcon, getPageText } from "../../../../src/page/declare";
import { FieldType } from "../../schema/type";
import { OriginField, OriginFileView } from "./origin.field";
import { FileSvg } from "../../../../component/svgs";
import { channel } from "../../../../net/channel";

@url('/field/relation')
export class FieldRelation extends OriginField {
    get relationList() {
        var rs: any[] = [];
        var vs: string[] = lodash.cloneDeep(this.value);
        if (!Array.isArray(vs)) vs = [];
        if (vs.length == 0) return [];
        if (!this.field.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var g = this.dataGrid.relationDatas.get(this.field.config?.relationTableId);
        if (Array.isArray(g)) {
            vs.forEach(v => {
                var r = g.find(g => g.id == v);
                if (r) rs.push(r)
            })
        }
        return rs;
    }
    get relationSchema() {
        return this.dataGrid.relationSchemas.find(g => g.id == this.field.config?.relationTableId)
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        if (this.checkEdit() === false) return;
        event.stopPropagation();
        var fn = async () => {
            var r = await useRelationPickData({ dist: 0, roundArea: Rect.fromEle(this.el as HTMLElement) }, {
                field: this.viewField.field,
                relationDatas: this.relationList,
                isMultiple: this.viewField.field.config?.isMultiple,
                relationSchema: this.relationSchema,
                page: this.page,
                fieldProps: this.viewField.field?.config?.fieldProps,
                changeFieldProps: this.dataGrid.isCanEditRow() ? async (props) => {
                    await this.onUpdateCellFieldSchema({ 'config.fieldProps': props })
                } : undefined
            });
            if (r) {
                console.log('gggg', r);
                var ids = r.map(r => r.id);
                await this.onUpdateCellValue(ids);
                await this.dataGrid.loadRelationDatas();
                this.forceManualUpdate();
            }
        }
        if (this.dataGrid) await this.dataGrid.onDataGridTool(fn)
        else await fn()
    }
}
@view('/field/relation')
export class FieldRelationView extends OriginFileView<FieldRelation> {
    renderList() {
        var rs = this.block.relationSchema;
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        var icon = rs?.fields.find(g => g.type == FieldType.icon);
        return <div className='sy-field-relation-items flex flex-wrap'>{this.block.relationList?.map(r => {
            var url = getElementUrl(ElementType.SchemaData, rs.id, r.id);
            return <div key={r.id} className="flex"><a style={{ color: 'inherit' }}
                className="item-hover round padding-w-3  flex"
                onMouseDown={e => {
                    e.stopPropagation()
                    channel.act('/page/dialog', { elementUrl: url })
                }}
                href={"/r?url=" + encodeURIComponent(url)}
                onClick={e => e.preventDefault()}>
                {r[icon.name] && <span className="size-24 remark flex-center flex-inline">
                    <Icon size={16} icon={getPageIcon({
                        pageType: PageLayoutType.doc,
                        icon: r[icon.name] || FileSvg
                    })}></Icon>
                </span>}
                <span style={{ maxWidth: Math.max(this.block.viewField.colWidth - 50, 60) }} className="flex-auto  text-overflow">{getPageText({ text: r[f?.name] })}</span>
            </a></div>
        })}
        </div>
    }
    renderFieldValue() {
        return <div className='sy-field-relation  f-14' onMouseDown={e => this.block.onCellMousedown(e)}>
            {this.renderList()}
        </div>
    }
}



