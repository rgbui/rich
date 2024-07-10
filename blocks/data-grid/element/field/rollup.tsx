

import React from "react";
import { OriginField, OriginFileView } from "./origin.field";
import { FieldRelation } from "./relation";
import { url, view } from "../../../../src/block/factory/observable";
import lodash from "lodash";
import { util } from "../../../../util/util";
import dayjs from "dayjs";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { UserAvatars } from "../../../../component/view/avator/users";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { Tip } from "../../../../component/view/tooltip/tip";
import { Icon } from "../../../../component/view/icon";
import { DownloadSvg, FileSvg } from "../../../../component/svgs";
import { autoImageUrl } from "../../../../net/element.type";
import { CheckBox } from "../../../../component/view/checkbox";
import { GetFieldTypeSvg } from "../../schema/util";

@url('/field/rollup')
export class FieldRollup extends OriginField {
    get relationList() {
        var gs = this.dataGrid.relationDatas.get(this.field.config?.rollupTableId) || [];
        var item: FieldRelation = this.dataGridItem.childs.find(g => (g instanceof FieldRelation) && g.field.config.relationTableId == this.field.config?.rollupTableId) as any;
        if (item) {
            var vs: string[] = item.value;
            if (!Array.isArray(vs)) vs = [];
            if (vs.length == 0) return [];
            if (!item.field.config?.isMultiple) {
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
export class FieldRollupView extends OriginFileView<FieldRollup> {
    renderRefField(field: Field, values: any[]) {
        switch (field.type) {
            case FieldType.createDate:
            case FieldType.modifyDate:
            case FieldType.date:
                return <div>{values.map((c, i) => {
                    return <div key={i}>{dayjs(c).format('YYYY-MM-DD')}</div>
                })}</div>
                break;
            case FieldType.autoIncrement:
            case FieldType.number:
                return <div>{values.map((v, i) => {
                    return <div key={i}>{v}</div>
                })}</div>
            case FieldType.title:
            case FieldType.text:
            case FieldType.phone:
            case FieldType.email:
            case FieldType.link:
                return <div>{values.map((v, i) => {
                    return <div key={i}>{v}</div>
                })}</div>
                break;
            case FieldType.option:
            case FieldType.options:
                var ids = values.map(c => c.id).flat();
                ids = lodash.uniq(ids);
                var ops = field.config?.options;
                return <span>{
                    ids.map((id, i) => {
                        var op = ops?.find(g => g.value == id);
                        if (!op) return <em key={i}></em>
                        return <em key={i} className="round l-20 gap-r-5" style={{
                            backgroundColor: op.fill,
                            color: op.color || 'inherit',
                        }}>{op.text}</em>
                    })
                }</span>
                break;
            case FieldType.modifyer:
            case FieldType.user:
            case FieldType.creater:
                var userids = values.map(c => c.id).flat();
                userids = lodash.uniq(userids);
                return <UserAvatars users={userids}></UserAvatars>
                break;
            case FieldType.image:
                var images = values as ResourceArguments[];
                return <div>{images.map((img, i) => {
                    return <div className="sy-field-image-item" key={i}>
                        <img className="round" src={autoImageUrl(img.url, 250)} />
                    </div>
                })}</div>
                break;
            case FieldType.audio:
            case FieldType.video:
            case FieldType.file:
                var images = values as ResourceArguments[];
                return <div>{images.map((img, i) => {
                    return <div className={" padding-w-3 text-1 flex item-hover-light-focus round " + (i == images.length - 1 ? "" : "gap-b-5")} key={i}>
                        <span className="flex-fixed size-16  flex-center gap-r-2"><Icon size={16} icon={FileSvg}></Icon></span>
                        <span className="cursor text-overflow flex-auto" >{img.filename}</span>
                        <Tip text={'下载文件'}><span onMouseDown={e => { e.stopPropagation(); util.downloadFile(img.url, img.filename) }} className="gap-l-5 visible size-16 flex-center item-hover round cursor flex-fixed"><Icon size={14} icon={DownloadSvg}></Icon></span></Tip>
                    </div>
                })}</div>
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
        if (this.block.field.config?.rollupStatistic) {
            switch (this.block.field.config?.rollupStatistic) {
                case 'origin':
                    str = <>{this.renderRefField(field, list.map(r => r[field.name]))}</>
                    break;
                case 'uniqueOrigin':
                    str = <>{this.renderRefField(field, lodash.uniq(list.map(r => r[field.name])))}</>
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