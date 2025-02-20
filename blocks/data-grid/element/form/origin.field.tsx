import React from "react";
import { HideSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../../src/block/enum";
import { prop } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { GetFieldTypeSvg } from "../../schema/util";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import lodash from "lodash";
import { channel } from "../../../../net/channel";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { util } from "../../../../util/util";
import "./style.less";

export class OriginFormField extends Block {
    display = BlockDisplay.block;
    value: any;
    get field() {
        if (this.page.schema) {
            return this.page.schema.fields.find(g => g.id == this.fieldId);
        }
    }
    get schema() {
        if (this.page.schema) return this.page.schema;
    }
    get fromType(): 'doc' | 'doc-add' | 'doc-detail' {
        if (this.page.pe.type == ElementType.SchemaData) return 'doc';
        if (!this.page.schema) return 'doc';
        if (this.page.pe.type == ElementType.SchemaRecordViewData) {
            var sv = this.schema.views.find(g => g.id == this.page.pe.id1);
            if (sv) return sv.formType || 'doc';
        }
        else if (this.page.pe.type == ElementType.SchemaRecordView) {
            var sv = this.schema.views.find(g => g.id == this.page.pe.id1);
            if (sv) return sv.formType || 'doc';
        }
        return 'doc';
    }
    @prop()
    fieldId: string;
    @prop()
    required: boolean = false;
    @prop()
    hidePropTitle: boolean = false;
    get isSupportTextStyle() {
        return false;
    }
    onInput(value: any) {
        this.value = value;
    }
    onChange(value: any) {
        this.value = value;
        this.forceManualUpdate();
    }
    async onUpdateCellInteractive(field: Field) {
        var r = await channel.patch('/interactive/emoji', {
            elementUrl: getElementUrl(
                field.type == FieldType.emoji ? ElementType.SchemaFieldData : ElementType.SchemaFieldNameData,
                this.page.schema.id,
                field.type == FieldType.emoji ? field.id : field.name,
                this.page.formRowData?.id
            ),
            fieldName: field.name
        });
        if (r.ok) {
            var other;
            var ov = lodash.cloneDeep(this.page.formRowData[field.name]);
            if (typeof ov == 'undefined' || lodash.isNull(ov)) ov = { count: 0 };
            if (typeof ov == 'number') ov = { count: ov };
            ov.count = r.data.count;
            var userid = this.page.user?.id;
            if (userid) {
                if (!Array.isArray(ov.users)) {
                    ov.users = []
                }
                if (r.data.exists) {
                    var ops = this.page.formUserEmojis[field.name];
                    if (!Array.isArray(ops)) this.page.formUserEmojis[field.name] = ops = []
                    if (!ops.exists(c => c == this.page.formRowData.id)) ops.push(this.page.formRowData.id);
                    if (!ov.users.exists(g => g == userid)) ov.users.push(userid)
                }
                else {
                    var ops = this.page.formUserEmojis[field.name];
                    if (!Array.isArray(ops)) this.page.formUserEmojis[field.name] = ops = []
                    if (ops.exists(c => c == this.page.formRowData.id)) lodash.remove(ops, c => c == this.page.formRowData.id);
                    lodash.remove(ov.users, g => (g as any) == userid);
                }
                if (typeof r.data.otherCount == 'number' && (field.name == 'like' || field.name == 'oppose')) {
                    var name = field.name == 'like' ? FieldType[FieldType.oppose] : FieldType[FieldType.like];
                    var occ = lodash.cloneDeep(this.page.formRowData[name]);
                    if (typeof occ == 'undefined' || lodash.isNull(occ)) occ = { count: 0 };
                    if (typeof occ == 'number') occ = { count: occ };
                    occ.count = r.data.otherCount;
                    if (!Array.isArray(occ.users)) occ.users = []
                    if (r.data.otherExists) {
                        var ops = this.page.formUserEmojis[name];
                        if (!Array.isArray(ops)) this.page.formUserEmojis[name] = ops = []
                        if (!ops.exists(c => c == this.page.formRowData.id)) ops.push(this.page.formRowData.id);
                        if (!occ.users.exists(g => g == userid)) occ.users.push(userid)
                    }
                    else {
                        var ops = this.page.formUserEmojis[name];
                        if (!Array.isArray(ops)) this.page.formUserEmojis[name] = ops = []
                        if (ops.exists(c => c == this.page.formRowData.id)) lodash.remove(ops, c => c == this.page.formRowData.id);
                        lodash.remove(occ.users, g => (g as any) == userid);
                    }
                    this.page.formRowData[name] = occ;
                    other = occ;
                }
                else if (typeof r.data.otherCount == 'number') {

                }
            }
            this.page.formRowData[field.name] = ov;
            return { data: ov, other: other };
        }
    }
    @prop()
    allowRemark: boolean = false;
    @prop()
    fieldRemark: string = '';
    fieldError: string = '';
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        lodash.remove(rs, c => c.name == 'color');
        var items: MenuItem<BlockDirective | string>[] = [];
        if (this.fromType == 'doc-add') {
            items.push({
                name: 'required',
                text: lst('必填'),
                type: MenuItemType.switch,
                checked: this.required,
                icon: { name: 'bytedance-icon', code: 'asterisk' }
            });
            items.push({
                name: 'allowRemark',
                text: lst('添加备注'),
                type: MenuItemType.switch,
                icon: { name: 'bytedance-icon', code: 'edit' },
                checked: this.allowRemark
            });
            items.push({
                type: MenuItemType.divide
            });
        }
        items.push({
            name: 'hidePropTitle',
            text: lst('隐藏属性名'),
            icon: HideSvg,
            type: MenuItemType.switch,
            checked: this.hidePropTitle
        })
        var cat = rs.findIndex(c => c.name == BlockDirective.comment);
        rs.splice(cat - 1, 0, ...items);
        return rs;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (['required', 'allowRemark', 'hidePropTitle'].includes(item.name as string)) {
            await this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self });
            return;
        }
        else await super.onContextMenuInput(item);
    }
    async onClickContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        if (item) {
            if (item.name == 'hide') await this.onDelete()
            else await super.onClickContextMenu(item, event);
        }
    }
    checkEdit() {
        if (!this.isCanEdit()) {
            return false;
        }
        return true;
    }
    getVisibleHandleCursorPoint() {
        var point = super.getVisibleHandleCursorPoint();
        if (this.fromType == 'doc') {
            point = point.move(0, 3);
        }
        else if (this.fromType == 'doc-add') {
            point = point.move(0, 15);
        }
        else {
            point = point.move(0, -3);
        }
        return point;
    }
    isCanEdit() {
        return this.page.isCanEditRow;
    }
}

export function FieldView(props: { block: OriginFormField, className?: string | string[], children?: JSX.Element | string | React.ReactNode }) {
    var block = props.block;
    var classList = util.covertToArray(props.className);
    if (!block.field) return <div className="flex bg-error cursor round gap-h-5" onMouseDown={e => { block.onDelete() }} style={block.visibleStyle}>
        <span className="f-14"><S>该字段不存在</S></span>
        <span className="gap-l-5 size-20 flex-center"><Icon icon={TrashSvg} size={16}></Icon></span>
    </div>
    if (block.fromType == 'doc-detail') {
        return <div className={"sy-form-field-detail " + classList.join(' ')} style={block.visibleStyle}>
            {
                props.block.hidePropTitle == true && <div className="sy-form-field-detail-flag flex flex-inline  border-light  h-20 l-20 remark round bg-white">
                    <span className="size-20 flex-center gap-l-5"><Icon size={16} icon={GetFieldTypeSvg(block.field)}></Icon></span>
                    <span className="l-20 h-20 f-14 gap-r-5" >{block.field.text}</span>
                </div>
            }
            {props.block.hidePropTitle == true && <div>
                {props.children}
            </div>}
            {props.block.hidePropTitle !== true && <div className="gap-h-5 flex flex-top">
                <div onMouseDown={e => {
                    if (block.isCanEdit()) block.onContextmenu(e.nativeEvent)
                }} className="flex-fixed  h-30 w-120 flex text-1 f-14 item-hover round gap-r-10 cursor">
                    <span className="flex-fixed size-20 flex-center  gap-l-5"><Icon size={16} icon={GetFieldTypeSvg(block.field)}></Icon></span>
                    <span className="flex-auto l-30 h-30 text-overflow">{block.field.text}</span>
                </div>
                <div className="flex-auto">
                    {props.children}
                </div>
            </div>}
            {block.view.renderComment()}
        </div>
    }
    if (block.fromType == 'doc') {
        return <div className={"sy-form-field-detail " + classList.join(' ')}
            style={block.visibleStyle}>
            <div className="gap-h-5 flex flex-top">
                <div onMouseDown={e => {
                    if (block.isCanEdit()) block.onContextmenu(e.nativeEvent)
                }} className="flex-fixed  h-30 w-120 flex text-1 f-14 item-hover round gap-r-10 cursor">
                    <span className="flex-fixed size-20 flex-center  gap-l-5"><Icon size={16} icon={GetFieldTypeSvg(block.field)}></Icon></span>
                    <span className="flex-auto l-30 h-30 text-overflow">{block.field.text}</span>
                </div>
                <div className="flex-auto">
                    {props.children}
                </div>
            </div>
            {block.view.renderComment()}
        </div>
    }
    return <div style={block.visibleStyle} className={'sy-form-field ' + classList.join(' ')} onMouseDown={e => {

    }}>
        <div className="gap-t-20">
            {block.field && <div className="sy-form-field-box">
                <div className="flex gap-t-5">
                    {props.block.hidePropTitle !== true && <label className="b-500 f-16">{block.field.text}</label>}
                    {block.required && <em className="text-primary f-12 l-16 round-4 gap-l-5 padding-w-5 "
                        style={{ backgroundColor: 'rgba(207,86,89,.16)' }}
                    ><S>必填</S></em>}
                </div>
                {block.allowRemark && <div className="sy-form-field-remark remark f-12">
                    <TextArea plain placeholderEmptyVisible={true} placeholder={lst("输入说明介绍")} prop="fieldRemark" block={block} ></TextArea>
                </div>}
                <div className="sy-form-field-control gap-t-5" onMouseDown={e => { e.stopPropagation() }}>{props.children}</div>
            </div>}
            {!block.field && <div onClick={e => props.block.onDelete()} className="sy-form-field-tip round padding-w-10 min-h-30 f-14 item-hover-focus flex">
                <span className="remark"><S>表单字段不存在</S></span>
                <a className="link flex cursor gap-l-10"><span className="size-24 flex-center"><Icon size={14} icon={TrashSvg}></Icon></span><span><S>移除</S></span></a>
            </div>}
            {block.fieldError && <div className="sy-form-field-error">{block.fieldError}</div>}
        </div>
        {block.view.renderComment()}
    </div>
}