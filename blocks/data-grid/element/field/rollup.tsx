

import React from "react";
import { OriginField, OriginFileView } from "./origin.field";
import { url, view } from "../../../../src/block/factory/observable";
import lodash from "lodash";
import { util } from "../../../../util/util";
import dayjs from "dayjs";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { UserAvatars } from "../../../../component/view/avator/users";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { Icon } from "../../../../component/view/icon";
import { FileSvg } from "../../../../component/svgs";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { CheckBox } from "../../../../component/view/checkbox";
import { GetFieldTypeSvg } from "../../schema/util";
import { getPageIcon, PageLayoutType } from "../../../../src/page/declare";
import { channel } from "../../../../net/channel";
import { renderFieldElement } from "./origin.render";

@url('/field/rollup')
export class FieldRollup extends OriginField {
    get relationList() {
        var rf = this.dataGrid.schema.fields.find(g => g.id == this.field.config?.rollupRelationFieldId);
        if (!rf) return []
        var gs = this.dataGrid.relationDatas.get(rf.config?.relationTableId) || [];
        var vs = this.dataGridItem.dataRow[rf.name] || [];
        if (!rf.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        return gs.findAll(g => vs.includes(g.id));
    }
    get relationSchema() {
        var rf = this.dataGrid.schema.fields.find(g => g.id == this.field.config?.rollupRelationFieldId);
        if (rf)
            return this.dataGrid.relationSchemas.find(g => g.id == rf.config?.relationTableId)
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {

    }
}

@view('/field/rollup')
export class FieldRollupView extends OriginFileView<FieldRollup> {
    renderRefField(field: Field, values: any[], list?: any[]) {
        if (Array.isArray(values)) lodash.remove(values, v => lodash.isNull(v) || lodash.isUndefined(v) || v === '');
        switch (field.type) {
            case FieldType.createDate:
            case FieldType.modifyDate:
            case FieldType.date:
                var format = field?.config?.dateFormat || 'YYYY-MM-DD';
                return <div className="flex flex-wrap">{values.map((c, i) => {
                    return <div className="flex" key={i}>
                        <span>{dayjs(c).format(format)}</span>
                        <em className="gap-w-3">{i < values.length - 1 ? "," : ""}</em>
                    </div>
                })}</div>
                break;
            case FieldType.autoIncrement:
            case FieldType.number:
                var f = field?.config?.numberDisplay?.display || 'auto';
                if (f == 'auto') {
                    return <div className="flex" >{values.map((v, i) => {
                        return <div className="flex" key={i}>
                            <span>{renderFieldElement(field, v)}</span>
                            <em className="gap-w-3">{i < values.length - 1 ? "," : ""}</em>
                        </div>
                    })}</div>
                }
                else {
                    return <div>
                        {values.map((v, i) => {
                            return <div className="gap-h-5" key={i}>{renderFieldElement(field, v)}</div>
                        })}
                    </div>
                }
            case FieldType.title:
                return <div className="flex" >{list.map((v, i) => {
                    return <div onMouseDown={e => {
                        var eleUrl = getElementUrl(ElementType.SchemaData, this.block.relationSchema.id, v.id);
                        channel.act('/page/dialog', { elementUrl: eleUrl });
                    }} className="item-hover round padding-w-3  flex cursor" key={i}>
                        {v.icon && <span className="size-24 remark flex-center flex-inline">
                            <Icon size={16} icon={getPageIcon({
                                pageType: PageLayoutType.doc,
                                icon: v.icon || FileSvg
                            })}></Icon>
                        </span>}
                        <span className="b-500" style={{
                            textDecoration: 'underline',
                            textDecorationColor: 'rgba(22, 22, 22, 0.2)',
                            marginRight: i < list.length - 1 ? 5 : 0
                        }}>{v.title}</span>
                    </div>
                })}</div>
                break;
            case FieldType.text:
            case FieldType.phone:
            case FieldType.email:
            case FieldType.link:
                return <div className="flex" >{values.map((v, i) => {
                    return <div className="flex" key={i}>
                        <span>{v}</span>
                        <em className="gap-w-3">{i < values.length - 1 ? "," : ""}</em>
                    </div>
                })}</div>
                break;
            case FieldType.option:
            case FieldType.options:
                var ids = values.map(c => Array.isArray(c) ? c : (c ? [c] : [])).flat();
                ids = lodash.uniq(ids);
                var ops = field.config?.options;
                return <span>{
                    ids.map((id, i) => {
                        var op = ops?.find(g => g.value == id);
                        if (!op) return <em key={i}></em>
                        return <em key={i} className="text-overflow  padding-w-6 round f-14 padding-h-2  l-16 gap-r-3" style={{
                            backgroundColor: op.fill || op.color,
                            color: op.textColor || 'inherit',
                            display: 'inline-block',
                        }}>{op.text}</em>
                    })
                }</span>
                break;
            case FieldType.modifyer:
            case FieldType.user:
            case FieldType.creater:
                var userids = values.map(c => Array.isArray(c) ? c : (c ? [c] : [])).flat();
                userids = lodash.uniq(userids);
                return <UserAvatars users={userids}></UserAvatars>
            case FieldType.image:
                var images = values as ResourceArguments[];
                images = images.map(c => Array.isArray(c) ? c : (c ? [c] : [])).flat();
                return <div
                    className={"sy-field-images" + (images.length > 1 && field?.config?.imageFormat?.display == 'thumb' ? " flex flex-wrap r-gap-r-10 r-gap-b-10" : " r-gap-h-10 r-gap-w-5")}
                >{renderFieldElement(field, images)}</div>;
            case FieldType.audio:
            case FieldType.video:
            case FieldType.file:
                var images = values as ResourceArguments[];
                images = images.map(c => Array.isArray(c) ? c : (c ? [c] : [])).flat();
                return renderFieldElement(field, images);
                break;
            case FieldType.emoji:
                return <div>{values.map((v, i) => {
                    return <div key={i}>{field.config?.emoji?.code}<span>{v?.count || ''}</span></div>
                })}</div>
                break;
            case FieldType.comment:
            case FieldType.browse:
            case FieldType.love:
            case FieldType.like:
                var pref = <span>评论</span>;
                if (field.type == FieldType.browse) pref = <span>浏览</span>;
                if (field.type == FieldType.love) pref = <span>{GetFieldTypeSvg(field)}</span>;
                if (field.type == FieldType.like) pref = <span>{GetFieldTypeSvg(field)}</span>;
                return <div>{values.map((v, i) => {
                    return <div key={i}>{pref}<span>{v?.count || ''}</span></div>
                })}</div>
            case FieldType.bool:
                return <span>{values.map((v, i) => {
                    return <CheckBox key={i} checked={v} readOnly></CheckBox>
                })}</span>
                break;
            case FieldType.formula:
                return <span>{values.join(',')}</span>
                break;
            default:
                return <span>{values.join(',')}</span>
        }
    }
    renderFieldValue() {
        var str: JSX.Element = <span></span>;
        var list = this.block.relationList;
        var field = this.block.relationSchema?.fields?.find(g => g.id == this.block.field.config?.rollupFieldId);
        if (this.block.field.config?.rollupStatistic&&field&&list) {
            switch (this.block.field.config?.rollupStatistic) {
                case 'origin':
                    str = <>{this.renderRefField(field, list.map(r => r[field.name]), list)}</>
                    break;
                case 'uniqueOrigin':
                    if (field.type == FieldType.title) {
                        var rs = lodash.uniq(list.map(g => g.id));
                        str = <>{this.renderRefField(field, rs.map(r => list.find(g => g.id == r)?.[field.name]), list.findAll(c => rs.includes(c.id)))}</>
                    }
                    else str = <>{this.renderRefField(field, lodash.uniq(list.map(r => r[field.name])))}</>
                    break;
                case 'total':
                    str = <span>{list.length}</span>
                    break;
                case 'uniqueValue':
                    str = <span>{lodash.uniq(list.map(r => r[field.name])).length}</span>
                    break;
                case 'notFilled':
                    str = <span>{list.map(c => c[field.name]).filter(g => lodash.isUndefined(g) || !lodash.isNull(g) || g && Array.isArray(g) && (g as any[]).length == 0 || g === '').length}</span>
                    break;
                case 'filled':
                    str = <span>{list.map(c => c[field.name]).filter(g => !lodash.isUndefined(g) && !lodash.isNull(g) && !(g && Array.isArray(g) && (g as any[]).length == 0) && g !== '').length}</span>
                    break;
                case 'notFilledPercent':
                    var total = list.length;
                    var notFilled = list.map(c => c[field.name]).filter(g => lodash.isUndefined(g) || !lodash.isNull(g) || g && Array.isArray(g) && (g as any[]).length == 0 || g === '').length;
                    str = <span>{util.toPercent(notFilled, total, 2)}</span>
                    break;
                case 'filledPercent':
                    var total = list.length;
                    var filled = list.map(c => c[field.name]).filter(g => !lodash.isUndefined(g) && !lodash.isNull(g) && !(g && Array.isArray(g) && (g as any[]).length == 0) && g !== '').length;
                    str = <span>{util.toPercent(filled, total, 2)}</span>
                    break;
                case 'checked':
                    var t = list.map(r => r[field.name]).filter(g => g === true).length;
                    str = <span>{t}</span>
                    break;
                case 'notChecked':
                    var t = list.map(r => r[field.name]).filter(g => g !== true).length;
                    str = <span>{t}</span>
                    break;
                case 'checkedPercent':
                    var total = list.length;
                    var checked = list.map(r => r[field.name]).filter(g => g === true).length;
                    str = <span>{util.toPercent(checked, total, 2)}</span>
                    break;
                case 'notCheckedPercent':
                    var total = list.length;
                    var notChecked = list.map(r => r[field.name]).filter(g => g !== true).length;
                    str = <span>{util.toPercent(notChecked, total, 2)}</span>
                    break;
                case 'dateMin':
                    var c = list.map(g => g[field.name]).findMin(c => c instanceof Date ? c.getTime() : null)
                    if (c) str = <span>{dayjs(c).format('YYYY-MM-DD')}</span>
                    break;
                case 'dateMax':
                    var c = list.map(g => g[field.name]).findMax(c => c instanceof Date ? c.getTime() : null)
                    if (c) str = <span>{dayjs(c).format('YYYY-MM-DD')}</span>
                    break;
                case 'dateRange':
                    var min = list.map(g => g[field.name]).findMin(c => c instanceof Date ? c.getTime() : null)
                    var max = list.map(g => g[field.name]).findMax(c => c instanceof Date ? c.getTime() : null)
                    if (min && max) str = <span>{dayjs(min).format('YYYY-MM-DD')} ~ {dayjs(max).format('YYYY-MM-DD')}</span>
                    break;
                case 'sum':
                    var t = lodash.sum(list.map(c => c[field.name]));
                    str = <span>{t}</span>
                    break;
                case 'agv':
                    var t = lodash.sum(list.map(c => c[field.name])) / list.length;
                    str = <span>{t}</span>
                    break;
                case 'min':
                    var tc = list.map(c => c[field.name]).findMin(c => c);
                    str = <span>{tc}</span>
                    break;
                case 'max':
                    var tc = list.map(c => c[field.name]).findMax(c => c);
                    str = <span>{tc}</span>
                    break;
                case 'range':
                    var min = list.map(c => c[field.name]).findMin(c => c);
                    var max = list.map(c => c[field.name]).findMax(c => c);
                    if (min && max) str = <span>{min} ~ {max}</span>
                    break;
                default:
                    break;
            }
        }
        return <div className='sy-field-relation f-14' onMouseDown={e => this.block.onCellMousedown(e)}>
            {str}
        </div>
    }
}