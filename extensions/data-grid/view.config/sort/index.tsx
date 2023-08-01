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
        return this.schema.allowSortFields.map(fe => {
            return {
                text: fe.text,
                value: fe.id,
                icon: GetFieldTypeSvg(fe.type),
            }
        })
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
    render(): ReactNode {
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
                    return <div className="shy-table-sorts-view-item flex max-h-30 padding-w-14 gap-h-10" key={i}>
                        <div className="flex-auto flex">
                            <span className="cursor size-24 drag gap-r-5 text-1 round flex-center flex-fixed item-hover">
                                <Icon size={14} icon={DragHandleSvg}></Icon>
                            </span>
                            <SelectBox small className={'gap-r-10 min-w-80'} border value={so.field} options={this.getFields()} onChange={e => { so.field = e; self.onForceStore(); }}></SelectBox>
                            <SelectBox small className={'gap-r-10'} border value={so.sort} options={[
                                { text: lst('降序'), value: -1 },
                                { text:lst( '升序'), value: 1 }
                            ]} onChange={e => { so.sort = e; self.onForceStore(); }}>
                            </SelectBox>
                        </div>
                        <span className="flex-fixed flex-center size-24 round item-hover cursor btn-icon"><Icon size={12} onMousedown={e => removeSort(i)} icon={CloseSvg} ></Icon></span>
                    </div>
                })}</DragList>}
                {!hasSorts && <div className="remark padding-w-14 f-12 h-30 flex"><S>还没有添加排序</S></div>}
            </div>
            <Divider></Divider>
            <div onClick={e => addSort()} className="h-30  flex cursor item-hover padding-w-14">
                <Icon size={18} style={{ marginRight: 5 }} icon={PlusSvg}></Icon><S>添加排序</S>
            </div>
        </div>
    }
}
