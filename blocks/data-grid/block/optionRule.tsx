import React, { CSSProperties } from "react";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { SchemaFilter } from "../schema/filter";
import { DataGridView } from "../view/base";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { Icon } from "../../../component/view/icon";
import { useDataGridFilterList } from "../../../extensions/data-grid/view.config/filter/list";
import { SelectBox } from "../../../component/view/select/box";
import { SelectButtons } from "../../../component/view/button/select";
import { util } from "../../../util/util";
import { S } from "../../../i18n/view";
import { IconArguments } from "../../../extensions/icon/declare";

@url('/data-grid/OptionRule')
export class OptionDefineRule extends Block {
    display = BlockDisplay.block;
    @prop()
    isMultiple: boolean = false;
    @prop()
    align: 'left' | 'right' | 'center' = 'left';
    get refBlock(): DataGridView {
        return super.refBlock as DataGridView;
    }
    @prop()
    optionRules: { id: string, text: string, icon: IconArguments, visible: boolean, filter: SchemaFilter }[] = [];
    @prop()
    format: 'select' | 'listLine' | 'list' | 'listCheck' = 'listLine';
    values: string[] = [];
    async onSetRule(value) {
        var vs = util.covertToArray(value);
        if (!this.values.includes('')) {
            if (vs.includes('')) vs = ['']
        }
        else {
            if (vs.includes('')) lodash.remove(vs, g => g === '');
        }
        if (vs.length == 0) vs = [''];
        this.values = vs;
        if (this.refBlock) await this.refBlock.onSearch();
        this.forceUpdate()
    }
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rs = await super.onGetContextMenus();
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({ type: MenuItemType.divide })
        items.push({
            text: lst("编辑规则"),
            name: 'editRule',
            icon: { name: 'bytedance-icon', code: 'association' }
        });
        items.push({ type: MenuItemType.divide })
        items.push({
            name: 'format',
            text: lst('格式'),
            icon: { name: 'bytedance-icon', code: 'components' },
            type: MenuItemType.select,
            options: [
                { text: lst('下拉框'), value: 'select', icon: { name: 'byte', code: 'drop-down-list' } },
                { text: lst('按钮'), value: 'listLine', icon: { name: 'byte', code: 'link-four' } },
                // { text: lst('列表'), value: 'list' },
                // { text: lst('选择列表'), value: 'listCheck' }
            ],
            value: this.format
        })
        items.push({
            name: 'isMultiple',
            text: lst('多选'),
            icon: { name: 'bytedance-icon', code: 'more-two' },
            checked: this.isMultiple,
            type: MenuItemType.switch,
        })
        var at = rs.findIndex(c => c.name == 'text-center');
        rs[at].text = lst('对齐');
        rs.splice(at - 1, 0, ...items);
        lodash.remove(rs, c => c.name == 'color');
        var dat = rs.findIndex(c => c.name == BlockDirective.delete);
        rs.splice(dat + 1, 0,
            { type: MenuItemType.divide },
            { type: MenuItemType.help, url: window.shyConfig?.isUS ? "https://help.shy.red/page/50" : "https://shy.live/ws/help/page/1878", text: lst('了解数据表规则查询按钮') }
        )
        return rs;
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'editRule':
                return this.onOpenRule();
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
        }
        await super.onClickContextMenu(item, event);
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>): Promise<void> {
        switch (item.name) {
            case 'isMultiple':
                await this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self })
                return;
            case 'format':
                await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
    async onOpenRule() {
        var r = await useDataGridFilterList({ roundArea: this.getVisibleBound() }, {
            schema: this.refBlock.schema,
            ws: this.page.ws,
            formSchema: this.page.schema,
            filters: lodash.cloneDeep(this.optionRules),
        });
        if (r) {
            await this.onUpdateProps({ optionRules: r }, { range: BlockRenderRange.self });
        }
    }
    getFilters(): SchemaFilter[] {
        var fs = this.optionRules.findAll(g => this.values.includes(g.id)).map(v => v.filter);
        if (fs.length > 0) {

            if (this.isMultiple)
                return [{
                    logic: 'or',
                    items: fs
                }]
        }
        return fs;
    }
}

@view('/data-grid/OptionRule')
export class OptionDefineRuleView extends BlockView<OptionDefineRule>{
    renderOptions() {
        if (this.block.format == 'select') {
            return <div>
                <SelectBox
                    inline
                    multiple={this.block.isMultiple}
                    value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : this.block.values[0] || "")}
                    border
                    options={[
                        { text: lst('全部'), value: '' },
                        ...this.block.optionRules.map(c => {
                            return {
                                text: c.text,
                                value: c.id,
                                icon: c.icon || undefined
                            }
                        })]}
                    onChange={e => {
                        this.block.onSetRule(e);
                    }}></SelectBox>
            </div>
        }
        else if (this.block.format == 'listLine') {
            return <div className="inline">
                <SelectButtons gap={10}
                    multiple={this.block.isMultiple}
                    value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : (this.block.values[0] || ""))}
                    options={[
                        { text: lst('全部'), value: '' },
                        ...this.block.optionRules.map(c => {
                            return {
                                text: c.text,
                                value: c.id,
                                icon: c.icon || undefined
                            }
                        })]}
                    onChange={e => {
                        this.block.onSetRule(e);
                    }}
                ></SelectButtons>
            </div>
        }
    }
    renderView() {
        var style: CSSProperties = this.block.contentStyle;
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end';
        else style.justifyContent = 'flex-start';
        return <div style={this.block.visibleStyle}>
            {this.block.optionRules.length == 0 && <div onMouseDown={e => { e.stopPropagation(); this.block.onOpenRule() }} className="flex cursor  remark round padding-h-3" style={{ ...this.block.contentStyle, backgroundColor: 'rgb(242, 241, 238)' }}>
                <span className="size-24 round gap-l-5 flex-center item-hover"><Icon size={16} icon={{ name: 'bytedance-icon', code: 'association' }}></Icon></span>
                <span ><S>添加查询规则</S></span>
            </div>}
            {this.block.optionRules.length > 0 && <div style={style}>
                {this.renderOptions()}
            </div>}
        </div>
    }
}
