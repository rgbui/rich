import React from "react";
import { useRelationPickData } from "../../../../extensions/data-grid/relation.picker";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { TableSchema } from "../../schema/meta";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { CloseSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import lodash from "lodash";
import { getPageIcon, getPageText } from "../../../../src/page/declare";

@url('/field/filter/relation')
export class FilterRelation extends OriginFilterField {
    @prop()
    isMultiple: boolean = false;
    selectDataIds: { id: string, title: string }[] = [];
    get filters() {
        if (this.selectDataIds.length == 0) return null
        return [{
            field: this.field.name,
            operator: '$in',
            value: this.selectDataIds.map(c => c.id)
        }]
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var pos = rs.findIndex(g => g.name == 'fieldTextDisplay');
        if (pos > -1) {
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                name: 'isMultiple',
                text: lst('多选'),
                icon: { name: 'bytedance-icon', code: 'more-two' },
                checked: this.isMultiple,
                type: MenuItemType.switch,
            })
            rs.splice(pos + 1, 0, ...ns)
        }
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>) {
        switch (item.name) {
            case 'isMultiple':
                this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        return await super.onClickContextMenu(item, e);
    }
}

@view('/field/filter/relation')
export class FilterRelationView extends BlockView<FilterRelation>{
    relationSchema: TableSchema;
    async mousedown(event: React.MouseEvent) {
        if (!this.relationSchema) {
            this.relationSchema = await TableSchema.loadTableSchema(this.block.field.config.relationTableId, this.block.page.ws);
        }
        var g = await useRelationPickData({
            roundArea: Rect.fromEvent(event)
        }, {
            relationDatas: this.block.selectDataIds.map(s => { return { id: s.id, title: s.title } }),
            relationSchema: this.relationSchema,
            field: this.block.field,
            isMultiple: this.block.isMultiple,
            page: this.block.page
        });
        if (g) {
            this.block.selectDataIds = g.map(c => {
                return { id: c.id, title: c.title }
            })
            if (this.block.refBlock) this.block.refBlock.onSearch();
            this.forceUpdate()
        }
    }
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle}
            filterField={this.block}>
            <div className="flex">
                <div
                    onMouseDown={e => this.mousedown(e)}
                    className="flex-line flex round relative visible-hover padding-l-5" style={{
                        height: 28,
                        width: '100%',
                        boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset',
                        // background: 'rgba(242, 241, 238, 0.6)',
                        background: '#fff',
                        borderRadius: 4,
                        lineHeight: '26px'
                    }}>
                    {this.block.selectDataIds.map(s => {
                        return <span className="f-12 flex-center item-hover l-20 cursor round padding-w-5 " key={s.id}>
                            <span className="flex-fixed size-16 flex-center remark "><Icon icon={getPageIcon(s)}></Icon></span>
                            <span className="flex-auto text-overflow max-w-80 text">{getPageText({ text: s.title })}</span>
                            <em className="flex-fixed gap-l-2 size-12 flex-center cursor round visible remark " onMouseDown={e => {
                                e.stopPropagation();
                                lodash.remove(this.block.selectDataIds, g => g.id == s.id)
                                if (this.block.refBlock) this.block.refBlock.onSearch();
                                this.forceUpdate()
                            }}><Icon icon={CloseSvg} size={10}></Icon></em>
                        </span>
                    })}
                </div>
            </div>
        </OriginFilterFieldView ></div>
    }
}