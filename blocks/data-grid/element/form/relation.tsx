import lodash from "lodash";
import React from "react";
import { CloseSvg, PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useRelationPickData } from "../../../../extensions/data-grid/relation.picker";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { getPageIcon, getPageText } from "../../../../src/page/declare";
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { FieldView, OriginFormField } from "./origin.field";
import { S } from "../../../../i18n/view";
import { Tip } from "../../../../component/view/tooltip/tip";


@url('/form/relation')
class FormFieldRelation extends OriginFormField {
    relationSchema: TableSchema;
    relationList: any[] = [];
    async loadFieldData() {
        this.relationSchema = await TableSchema.loadTableSchema(this.field.config?.relationTableId, this.page.ws);
        if (Array.isArray(this.value) && this.value.length > 0) {
            var d = await this.relationSchema.all({
                page: 1,
                filter: { id: { $in: this.value } }
            }, this.page.ws);
            if (d.ok) {
                this.relationList = d.data.list;
            }
        }
    }
    async didMounted(): Promise<void> {
        await this.loadFieldData();
        this.view.forceUpdate()
    }
    async onSelectData(event: React.MouseEvent<Element, MouseEvent>) {
        if (this.checkEdit() === false) return;
        var r = await useRelationPickData({ roundArea: Rect.fromEvent(event) }, {
            field: this.field,
            relationDatas: this.relationList,
            isMultiple: this.field.config?.isMultiple,
            relationSchema: this.relationSchema,
            page: this.page
        });
        if (r) {
            var ids = r.map(r => r.id);
            this.onChange(ids);
        }
    }
    async onDeleteData(event: React.MouseEvent, id: string) {
        if (this.checkEdit() === false) return;
        event.stopPropagation()
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        lodash.remove(vs, c => c == id);
        lodash.remove(this.relationList, c => c.id == id);
        this.onChange(vs);
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
        return <div>
            {this.block.relationList?.length > 0 && <div className="gap-b-5 item-hover-light-focus round ">
                {this.block.relationList?.map(r => {
                    return <div className="padding-h-2 padding-w-10   item-hover-light   round cursor flex  visible-hover"
                        onClick={e => e.preventDefault()}
                        key={r.id}
                    >
                        <span className="flex-fixed size-20  flex-center flex-inline cursor">
                            <Icon size={16} icon={getPageIcon({ icon: r[icon.name] })}></Icon>
                        </span>
                        <span className="flex-auto f-14 text-overflow">{getPageText({ text: r[f?.name] })}</span>
                        {this.block.fieldType != 'doc-detail' && <Tip text='移除'><span onClick={e => this.block.onDeleteData(e, r.id)} className="flex-fixed size-20 item-hover  flex-center visible round">
                            <Icon size={12} icon={CloseSvg}></Icon>
                        </span></Tip>}
                    </div>
                })}
            </div>}
            {this.block.relationList.length == 0 && <span className="f-14 remark"><S>空内容</S></span>}
            {(this.block.field.config?.isMultiple || (!(this.block.relationList.length > 0))) && this.block.fieldType != 'doc-detail' && <div className={"flex " + (this.block.relationList.length > 0 ? " visible" : "")}><span className={"item-hover-light-focus item-hover round padding-w-5 f-12   cursor flex text-1"} onClick={e => this.block.onSelectData(e)}><Icon size={16} icon={PlusSvg}></Icon><span ><S>添加关联</S></span></span></div>}
        </div>
    }
    renderView() {
        return <FieldView block={this.block} className={'visible-hover'}>
            <div className={this.block.fieldType == 'doc' ? "gap-w-10" : ""}>
                {this.renderList()}
            </div>
        </FieldView>
    }
}
