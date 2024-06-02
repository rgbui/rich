import React, { ReactNode } from "react";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Icon } from "../../../../component/view/icon";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { Divider } from "../../../../component/view/grid";
import { CloseSvg, DragHandleSvg, PlusSvg } from "../../../../component/svgs";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import lodash from "lodash";
import { SelectBox } from "../../../../component/view/select/box";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DragList } from "../../../../component/view/drag.list";
import { util } from "../../../../util/util";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { HelpText } from "../../../../component/view/text";

export class TableSortView extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    oldSorts: {
        field: string;
        sort: number;
    }[];
    onOpen(block: DataGridView) {
        this.block = block;
        this.oldSorts = lodash.cloneDeep(this.block.sorts || []);
        this.forceUpdate();
    }
    getFields() {
        var rs = this.schema.allowSortFields.map(fe => {
            var text = fe.text;
            var name = fe.id;
            if (fe.type == FieldType.browse) {
                text = text + "." + lst('浏览量')
                name = fe.id + ".count"
            }
            else if (fe.type == FieldType.comment) {
                text = text + "." + lst('评论数')
                name = fe.id + ".count"
            }
            else if (fe.type == FieldType.like) {
                text = text + "." + lst('点赞数')
                name = fe.id + ".count"
            }
            else if (fe.type == FieldType.love) {
                text = text + "." + lst('喜欢数')
                name = fe.id + ".count"
            }
            else if (fe.type == FieldType.vote) {
                text = text + "." + lst('投票数')
                name = fe.id + ".count"
            }
            else if (fe.type == FieldType.emoji) {
                text = text + "." + lst('表情数')
                name = fe.id + ".count"
            }
            else if ([FieldType.file, FieldType.audio, FieldType.image, FieldType.video].includes(fe.type)) {

            }
            else if ([fe.type].includes(FieldType.user)) {
                // text = text + "." + lst('用户数')
            }
            else if (fe.type == FieldType.relation) {
                // text = text + "." + lst('关联记录数')
            }

            return {
                text,
                value: name,
                icon: GetFieldTypeSvg(fe),
            }
        })
        return rs.flat(3)
    }
    getFieldSortOptions(so: {
        id: string;
        field: string;
        sort: number;
    }) {
        var name = so.field;
        if (name.indexOf('.') > -1) {
            name = name.split('.')[0];
        }
        var ff = this.schema.fields.find(g => g.id == name);
        if(!ff)return[]
        if ([
            FieldType.autoIncrement,
            FieldType.number,
            FieldType.price,
            FieldType.comment,
            FieldType.browse,
            FieldType.like,
            FieldType.love,
            FieldType.vote,
            FieldType.emoji,
            FieldType.user,
            FieldType.image,
            FieldType.file,
            FieldType.video,
            FieldType.audio
        ].includes(ff.type)) {
            return [{ text: '9 → 1', value: -1 },
            { text: '1 → 9', value: 1 }]
        }
        else if ([FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(ff.type)) {
            return [{ text: lst('日期降序'), value: -1 },
            { text: lst('日期升序'), value: 1 }]
        }
        return [
            { text: lst('Z → A 降序'), value: -1 },
            { text: lst('A → Z 升序'), value: 1 }
        ]
    }
    onStore = lodash.debounce(async () => {
        await this.block.onManualUpdateProps({ sorts: this.oldSorts }, { sorts: this.block.sorts }, {});
        this.oldSorts = lodash.cloneDeep(this.block.sorts);
    }, 800);
    onForceStore = async () => {
        await this.block.onManualUpdateProps({ sorts: this.oldSorts }, { sorts: this.block.sorts }, {});
        this.oldSorts = lodash.cloneDeep(this.block.sorts);
        this.forceUpdate();
    }
    render() {
        if (!this.block) return <></>;
        var self = this;
        if (!Array.isArray(this.block.sorts)) this.block.sorts = [];
        async function addSort() {
            var f = self.schema.fields.find(g => g.type == FieldType.title);
            if (!f) f = self.schema.fields.findAll(g => g.text ? true : false).first();
            self.block.sorts.push({ id: util.guid(), field: f.id, sort: 1 });
            await self.block.onReloadData();
            self.onForceStore();
        }
        async function removeSort(at: number) {
            self.block.sorts.splice(at, 1);
            await self.block.onReloadData();
            self.onForceStore();
        }
        async function change(to, from) {
            var f = self.block.sorts[from];
            self.block.sorts.splice(from, 1);
            self.block.sorts.splice(to, 0, f);
            await self.block.onReloadData();
            self.onForceStore();
        }
        var hasSorts = Array.isArray(self.block.sorts) && self.block.sorts.length > 0;
        return <div className="f-14">
            <div className="max-h-300 overflow-y">
                {hasSorts && <DragList onChange={change} isDragBar={e => e.closest('.shy-table-sorts-view-item') && !e.closest('.btn-icon') ? true : false}>{self.block.sorts.map((so, i) => {
                    return <div className="shy-table-sorts-view-item flex max-h-30 padding-w-10 gap-h-10" key={i}>
                        <div className="flex-auto flex">
                            <span className="cursor size-24 drag gap-r-5 text-1 round flex-center flex-fixed item-hover">
                                <Icon size={14} icon={DragHandleSvg}></Icon>
                            </span>
                            <SelectBox className={'gap-r-10 '} border value={so.field} options={this.getFields()} onChange={e => { so.field = e; self.onForceStore(); }}></SelectBox>
                            <SelectBox className={'gap-r-10'} border value={so.sort} options={this.getFieldSortOptions(so)} onChange={e => {
                                so.sort = e;
                                self.onForceStore();
                            }}>
                            </SelectBox>
                        </div>
                        <span className="flex-fixed flex-center size-24 round item-hover cursor  remark btn-icon"><Icon size={12} onMousedown={e => removeSort(i)} icon={CloseSvg} ></Icon></span>
                    </div>
                })}</DragList>}
            </div>
            <Divider style={{ visibility: hasSorts ? "visible" : 'hidden' }}></Divider>
            <div onClick={e => addSort()} className="h-30  flex cursor item-hover    padding-w-5 gap-w-5 round text-1 f-14">
                <span className="size-24 round flex-center flex-fixed cursor">
                    <Icon size={18} icon={PlusSvg}></Icon>
                </span>
                <span className="flex-auto"><S>添加排序</S></span>
            </div>
            <Divider></Divider>
            <div className="h-30 padding-w-10 flex">
                <HelpText align="left" block url={window.shyConfig?.isUS ? "https://shy.red/ws/help/page/47" : "https://shy.live/ws/help/page/1874"}><S>了解如何使用数据表排序</S></HelpText>
            </div>
        </div>
    }
}
