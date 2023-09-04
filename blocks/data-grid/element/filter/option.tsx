import React from "react";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { Block } from "../../../../src/block";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";

@url('/field/filter/option')
export class FilterFieldOption extends OriginFilterField {
    values: string[] = [];
    @prop()
    isMultiple: boolean = false;
    @prop()
    format: 'select' | 'expose' = 'expose';
    onFilter(value, force?: boolean) {
        if (force == true) {
            this.values = value;
        }
        else {
            if (this.isMultiple) {
                if (!this.values.includes(value)) {
                    this.values.push(value)
                }
            }
            else this.values = [value];
        }
        if (this.refBlock) this.refBlock.onSearch();
        this.forceUpdate()
    }
    get filters() {
        if (this.values.length == 0) return null
        return [{
            field: this.field.name,
            operator: '$in',
            value: this.values
        }]
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var pos = rs.findIndex(g => g.name == 'showFieldText');
        if (pos > -1) {
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                name: 'isMultiple',
                text: lst('多选'),
                icon: { name: 'bytedance-icon', code: 'more-three' },
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
        // switch (item.name) {
        //     case 'text-center':
        //         await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
        //         return
        // }
        return await super.onClickContextMenu(item, e);
    }
}
@view('/field/filter/option')
export class FilterFieldOptionView extends BlockView<FilterFieldOption>{
    renderOptions() {
        var self = this;
        if (this.block.format == 'select') {
            async function select(event: React.MouseEvent) {
                var rs = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [
                    { text: lst('选择选项'), type: MenuItemType.text },
                    { text: lst('全部'), name: 'all', checkLabel: self.block.values.length == 0 ? true : false },
                    ...self.block.field.config.options.map(op => {
                        return {
                            text: op.text,
                            value: op.value,
                            checkLabel: self.block.values.includes(op.value)
                        }
                    })
                ]);
                if (rs?.item) {
                    if (rs.item.name == 'all') self.block.onFilter([], true)
                    else if (rs.item.value) self.block.onFilter(rs.item.value)
                }
            }
            var ops = this.block.field.config.options.findAll(g => this.block.values.includes(g.value));
            if (ops.length == 0) return <span onMouseDown={e => select(e)}><S>全部</S></span>
            else return <div onMouseDown={e => select(e)}>{ops.map(op => { return <span key={op.value}>{op.text}</span> })}</div>
        }
        else return <div className="inline">
            <span className={"gap-r-10 padding-w-5 padding-h-3  round cursor " + (!this.block.values.some(s => this.block.field?.config.options.some(c => c.value == s)) ? " text-white bg-primary" : "")} onClick={e => {
                this.block.onFilter([], true)
            }}><S>全部</S></span>
            {this.block.field?.config.options.map(g => {
                return <span className={"gap-r-10 padding-w-5 padding-h-3  round cursor " + (this.block.values.includes(g.value) ? " text-white bg-primary" : "")} key={g.value} onClick={e => {
                    this.block.onFilter(g.value);
                }}>{g.text}</span>
            })}</div>
    }
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle} filterField={this.block}>
            {this.renderOptions()}
        </OriginFilterFieldView></div>
    }
}