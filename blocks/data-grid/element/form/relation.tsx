import lodash from "lodash";
import React, { CSSProperties } from "react";
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
import { ToolTip } from "../../../../component/view/tooltip";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { channel } from "../../../../net/channel";

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
    async didMounted() {
        await this.loadFieldData();
        this.view.forceUpdate()
    }
    async onSelectData(event: React.MouseEvent<Element, MouseEvent>) {
        if (this.checkEdit() === false) return;
        if (this.fromType == 'doc-detail') return;
        var r = await useRelationPickData({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
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
class FormFieldRelationView extends BlockView<FormFieldRelation> {
    renderView() {
        return <FieldView block={this.block} className={'visible-hover'}>
            {this.block.fromType == 'doc-detail' && this.renderDetail()}
            {this.block.fromType == 'doc-add' && this.renderForm()}
            {this.block.fromType == 'doc' && this.renderField()}
        </FieldView>
    }
    renderDetail() {
        var rs = this.block.relationSchema;
        if (!rs) return <></>
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        var icon = rs?.fields.find(g => g.type == FieldType.icon);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        var textStyle: CSSProperties = {

        }
        textStyle.textDecoration = 'underline';
        textStyle.textDecorationColor = 'rgba(22, 22, 22, 0.2)';
        return <div>
            {this.block.relationList?.length > 0 && <div className="gap-b-5 item-hover-light-focus round ">
                {this.block.relationList?.map(r => {
                    return <div className={"h-30 item-hover padding-w-5 round gap-w-5 cursor flex  visible-hover  "}
                        onClick={e => {
                            e.preventDefault();
                            var url = getElementUrl(ElementType.SchemaData, rs.id, r.id);
                            channel.act('/page/dialog', { elementUrl: url, config: { force: true } })
                        }}
                        key={r.id}
                    >
                        <span className="flex-fixed size-20  remark flex-center flex-inline cursor">
                            <Icon size={18} icon={getPageIcon({ icon: r[icon.name] })}></Icon>
                        </span>
                        <span className={"f-14 gap-l-3 text-overflow  " + "flex-auto "}>
                            <span className="b-500" style={textStyle}>{getPageText({ text: r[f?.name] })}</span>
                        </span>
                    </div>
                })}
            </div>}
            {this.block.relationList.length == 0 && this.block.isCanEdit() && <div
                className={"f-14 min-h-30 cursor f-14 flex  remark"}><S>空内容</S></div>
            }
        </div>
    }
    renderForm() {
        var rs = this.block.relationSchema;
        if (!rs) return <></>
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        var icon = rs?.fields.find(g => g.type == FieldType.icon);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        var textStyle: CSSProperties = {

        }
        textStyle.textDecoration = 'underline';
        textStyle.textDecorationColor = 'rgba(22, 22, 22, 0.2)';
        return <div>
            {this.block.relationList?.length > 0 && <div className="gap-b-5 ">
                {this.block.relationList?.map(r => {
                    return <div className={"h-30  round  cursor flex  visible-hover " + (this.block.fromType != 'doc-add' && this.block.fromType != 'doc-detail' ? " padding-w-10 item-hover-light" : " item-hover-light")}
                        onClick={e => e.preventDefault()}
                        key={r.id}
                    >
                        <span className="flex-fixed size-20  text-1 flex-center flex-inline cursor">
                            <Icon size={18} icon={getPageIcon({ icon: r[icon.name] })}></Icon>
                        </span>

                        <span className={"f-14 gap-l-3 text-overflow " + (this.block.fromType == 'doc-add' ? " gap-r-10 flex-auto" : "flex-auto ")}>
                            <span className="b-500" style={textStyle}>{getPageText({ text: r[f?.name] })}</span>
                        </span>
                        {this.block.fromType != 'doc-detail' && <Tip text='移除记录'><span onClick={e => this.block.onDeleteData(e, r.id)} className="flex-fixed visible size-20 round cursor flex-center border shadow-s bg-hover gap-r-5">
                            <Icon size={12} icon={CloseSvg}></Icon>
                        </span></Tip>}
                        <ToolTip overlay={<S>添加记录</S>}><span
                            onClick={e => this.block.onSelectData(e)}
                            className="flex-fixed visible size-20 round cursor flex-center border shadow-s bg-hover  "><Icon size={16} icon={PlusSvg}></Icon>
                        </span></ToolTip>
                    </div>
                })}
            </div>}
            {this.block.relationList.length == 0 && <div
                onClick={e => this.block.onSelectData(e)}
                className={"f-14 min-h-30 cursor f-14 flex  remark" + (this.block.fromType == 'doc' ? " item-hover-light padding-w-10" : (this.block.fromType == 'doc-add' ? " round item-hover inline-flex padding-w-5 cursor" : ""))}>{this.block.fromType == 'doc-add' ? <S>添加记录</S> : <S>空内容</S>}</div>}
        </div>
    }
    renderField() {
        var rs = this.block.relationSchema;
        if (!rs) return <></>
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        var icon = rs?.fields.find(g => g.type == FieldType.icon);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        var textStyle: CSSProperties = {

        }
        textStyle.textDecoration = 'underline';
        textStyle.textDecorationColor = 'rgba(22, 22, 22, 0.2)';
        return <div>
            {this.block.relationList?.length > 0 && <div className="gap-b-5 ">
                {this.block.relationList?.map(r => {
                    return <div className={"h-30  round  cursor flex  visible-hover " + (this.block.fromType != 'doc-add' && this.block.fromType != 'doc-detail' ? " padding-w-10 item-hover-light" : " item-hover-light")}
                        onClick={e => e.preventDefault()}
                        key={r.id}
                    >
                        <span className="flex-fixed size-20  text-1 flex-center flex-inline cursor">
                            <Icon size={18} icon={getPageIcon({ icon: r[icon.name] })}></Icon>
                        </span>

                        <span className={"f-14 gap-l-3 text-overflow " + (this.block.fromType == 'doc-add' ? " gap-r-10 flex-auto" : "flex-auto ")}>
                            <span className="b-500" style={textStyle}>{getPageText({ text: r[f?.name] })}</span>
                        </span>
                        {this.block.fromType != 'doc-detail' && <Tip text='移除记录'><span onClick={e => this.block.onDeleteData(e, r.id)} className="flex-fixed visible size-20 round cursor flex-center border shadow-s bg-hover gap-r-5">
                            <Icon size={12} icon={CloseSvg}></Icon>
                        </span></Tip>}
                        <ToolTip overlay={<S>添加记录</S>}><span
                            onClick={e => this.block.onSelectData(e)}
                            className="flex-fixed visible size-20 round cursor flex-center border shadow-s bg-hover  "><Icon size={16} icon={PlusSvg}></Icon>
                        </span></ToolTip>
                    </div>
                })}
            </div>}
            {this.block.relationList.length == 0 && <div
                onClick={e => this.block.onSelectData(e)}
                className={"f-14 min-h-30 cursor f-14 flex  remark" + (this.block.fromType == 'doc' ? " item-hover-light padding-w-10" : (this.block.fromType == 'doc-add' ? " round item-hover inline-flex padding-w-5 cursor" : ""))}>{this.block.fromType == 'doc-add' ? <S>添加记录</S> : <S>空内容</S>}</div>}
        </div>
    }
}
