import React, { CSSProperties } from "react";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { SchemaFilter } from "../schema/filter";
import { DataGridView } from "../view/base";
import lodash from "lodash";
import { DuplicateSvg, LinkSvg, TrashSvg } from "../../../component/svgs";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { Icon } from "../../../component/view/icon";
import { useDataGridFilterList } from "../../../extensions/data-grid/view.config/filter/list";
import { SelectBox } from "../../../component/view/select/box";
import { SelectButtons } from "../../../component/view/button/select";
import { SelectItems } from "../../../component/view/button/item";
import { CheckBoxList } from "../../../component/view/checkbox/list";
import { util } from "../../../util/util";
import { S } from "../../../i18n/view";

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
    optionRules: { id: string, text: string, visible: boolean, filter: SchemaFilter }[] = [];
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
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            name: BlockDirective.copy,
            text: lst('拷贝副本'),
            label: "Ctrl+D",
            icon: DuplicateSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.link,
            text: lst('拷贝块链接'),
            icon: LinkSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            text: lst("编辑规则"),
            name: 'editRule',
            icon: { name: 'bytedance-icon', code: 'association' }
        });
        items.push({
            name: 'isMultiple',
            text: lst('多选'),
            icon: { name: 'bytedance-icon', code: 'more-two' },
            checked: this.isMultiple,
            type: MenuItemType.switch,
        })

        items.push({ type: MenuItemType.divide })

        items.push({
            text: lst('对齐'),
            icon: { name: 'bytedance-icon', code: 'align-text-both' },
            childs: [
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-left' },
                    text: lst('居左'),
                    value: 'left',
                    checkLabel: this.align == 'left'
                },
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-center' },
                    text: lst('居中'), value: 'center', checkLabel: this.align == 'center'
                },
                {
                    name: 'align',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'align-text-right'
                    },
                    text: lst('居右'),
                    value: 'right',
                    checkLabel: this.align == 'right'
                }
            ]
        });
        items.push({
            name: 'format',
            text: lst('格式'),
            icon: { name: 'bytedance-icon', code: 'components' },
            type: MenuItemType.select,
            options: [
                { text: lst('下拉列表'), value: 'select' },
                { text: lst('行内列表'), value: 'listLine' },
                { text: lst('列表'), value: 'list' },
                { text: lst('选择选择'), value: 'listCheck' }
            ],
            value: this.format
        })

        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: lst('删除'),
            label: "Del"
        });
        return items;
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'editRule':
                return this.onOpenRule();
                return;
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
        var self = this;
        if (this.block.format == 'select') {
            return <div>
                <SelectBox inline multiple={this.block.isMultiple} value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : this.block.values[0] || "")} border
                    options={[{ text: lst('全部'), value: '' }, ...this.block.optionRules.map(c => {
                        return {
                            text: c.text,
                            value: c.id
                        }
                    })]}
                    onChange={e => {
                        this.block.onSetRule(e);
                    }}></SelectBox>
            </div>
        }
        else if (this.block.format == 'listLine') {
            return <div className="inline">
                <SelectButtons gap={10} multiple={this.block.isMultiple} value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : (this.block.values[0] || ""))}
                    options={[{ text: lst('全部'), value: '' }, ...this.block.optionRules.map(c => {
                        return {
                            text: c.text,
                            value: c.id
                        }
                    })]} onChange={e => {
                        this.block.onSetRule(e);
                    }}></SelectButtons>
            </div>
        }
        else if (this.block.format == 'list') {
            return <div>
                <SelectItems
                    gap={5}
                    multiple={this.block.isMultiple}
                    value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : (this.block.values[0] || ""))}
                    options={[...this.block.optionRules.map(c => {
                        return {
                            text: c.text,
                            value: c.id
                        }
                    })]} onChange={e => {
                        this.block.onSetRule(e);
                    }}></SelectItems>
            </div>
        }
        else if (this.block.format == 'listCheck') {
            return <div>
                <CheckBoxList direction={'y'} multiple={this.block.isMultiple} value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : this.block.values[0] || "")}
                    options={[...this.block.optionRules.map(c => {
                        return {
                            text: c.text,
                            value: c.id
                        }
                    })]}
                    onChange={e => {
                        this.block.onSetRule(e);
                    }}></CheckBoxList>
            </div>
        }
    }
    renderView() {
        var style: CSSProperties = {};
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end';
        else style.justifyContent = 'flex-start';
        return <div style={this.block.visibleStyle}>
            {this.block.optionRules.length == 0 && <div onMouseDown={e => { e.stopPropagation(); this.block.onOpenRule() }} className="flex remark round padding-h-3 padding-r-10" style={{ backgroundColor: 'rgb(242, 241, 238)' }}>
                <span className="size-30 gap-l-5 flex-center cursor item-hover"><Icon size={20} icon={{ name: 'bytedance-icon', code: 'association' }}></Icon></span>
                <span ><S>添加查询规则</S></span>
            </div>}
            {this.block.optionRules.length > 0 && <div style={style}>
                {this.renderOptions()}
            </div>}
        </div>
    }
}
