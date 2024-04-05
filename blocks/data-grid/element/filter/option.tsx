import React from "react";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { SelectBox } from "../../../../component/view/select/box";
import lodash from "lodash";
import { SelectButtons } from "../../../../component/view/button/select";
import { util } from "../../../../util/util";

@url('/field/filter/option')
export class FilterFieldOption extends OriginFilterField {
    values: string[] = [];
    @prop()
    isMultiple: boolean = false;
    @prop()
    format: 'select' | 'listLine' | 'list' | 'listCheck' = 'listLine';
    @prop()
    isStat: boolean = false;
    async onFilter(value) {
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
    get filters() {
        var vs = lodash.cloneDeep(this.values);
        if (vs.includes('')) return null;
        if (vs.length == 0) return null
        if (vs.length == 1)
            return [{
                field: this.field.name,
                operator: '$eq',
                value: vs[0]
            }]
        else
            return [{
                field: this.field.name,
                operator: '$in',
                value: this.values
            }]
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var pos = rs.findIndex(g => g.name == BlockDirective.link);
        if (pos > -1) {
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({ type: MenuItemType.divide })
            ns.push({
                name: 'isMultiple',
                text: lst('多选'),
                icon: { name: 'bytedance-icon', code: 'more-two' },
                checked: this.isMultiple,
                type: MenuItemType.switch,
            })
            ns.push({
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
            ns.push({
                type: MenuItemType.divide
            })
            ns.push({
                name: 'isStat',
                text: lst('分类统计'),
                icon: { name: 'bytedance-icon', code: 'chart-pie' },
                checked: this.isStat,
                type: MenuItemType.switch,
            })
            rs.splice(pos + 3, 0, ...ns)
        }
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>) {
        switch (item.name) {
            case 'isMultiple':
            case 'isStat':
                if (item.name == 'isStat') await this.cacStat();
                await this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self })
                return;
            case 'format':
                await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        return await super.onClickContextMenu(item, e);
    }
    async didMounted() {
        this.cacStat(true);
    }
    async cacStat(force?: boolean) {
        if (this.isStat) {
            var s = this.refBlock?.schema;
            var willCac = async () => {
                if (this.refBlock?.schema) {
                    var r = await this.refBlock?.schema.group({ group: this.field.name }, this.page.ws);
                    if (r.data) {
                        this.statOptions = r.data.list.map(c => {
                            return {
                                value: c[this.field.name],
                                count: c.count
                            }
                        });
                        if (force)
                            this.forceUpdate()
                        return;
                    }
                }
                this.statOptions = [];
            }
            if (s) {
                willCac();
            }
            else this.refBlock.once('loadDataGrided', () => {
                willCac();
            })
        }
    }
    statOptions: { value: string, count: number }[] = [];
}
@view('/field/filter/option')
export class FilterFieldOptionView extends BlockView<FilterFieldOption>{
    renderOptions() {
        var self = this;
        function gs(v) {
            if (self.block.isStat) {
                var s = 0;
                if (v == '') {
                    s = self.block.statOptions.sum(c => c.count)
                }
                else {
                    var g = self.block.statOptions.find(c => typeof c.value == 'string' && c.value == v || Array.isArray(c.value) && c.value.includes(v));
                    if (g) s = g.count;
                }
                return ` (${s})`
            }
            else return '';
        }
        if (this.block.format == 'select') {
            return <div className="flex">
                <SelectBox inline multiple={this.block.isMultiple} value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : this.block.values[0] || "")} border
                    options={[{ text: lst('全部') + gs(''), value: '' }, ...this.block.field.config.options.map(c => {
                        return {
                            text: c.text + gs(c.value),
                            value: c.value
                        }
                    })]}
                    onChange={e => {
                        this.block.onFilter(e);
                    }}></SelectBox>
            </div>
        }
        else if (this.block.format == 'listLine') return <div className="inline">
            <SelectButtons gap={5} multiple={this.block.isMultiple} value={this.block.isMultiple ? this.block.values : (this.block.values.length == 0 ? "" : (this.block.values[0] || ""))}
                options={[{ text: lst('全部') + gs(''), value: '' }, ...this.block.field.config.options.map(c => {
                    return {
                        text: c.text + gs(c.value),
                        value: c.value
                    }
                })]} onChange={e => {
                    this.block.onFilter(e);
                }}></SelectButtons>
        </div>
    }
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView top={this.block.format == 'list' || this.block.format == 'listCheck'} style={this.block.contentStyle} filterField={this.block}>
            {this.block.field?.config?.options && this.renderOptions()}
        </OriginFilterFieldView></div>
    }
}