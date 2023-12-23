import React from "react";
import { CheckBox } from "../../../../component/view/checkbox";
import { Switch } from "../../../../component/view/switch";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { TextArea } from "../../../../src/block/view/appear";
import { lst } from "../../../../i18n/store";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";

@url('/field/filter/check')
export class FilterFieldCheck extends OriginFilterField {
    checked: boolean = false;
    @prop()
    format: 'checkbox' | 'toggle' = 'checkbox';
    @prop()
    checkLabel: string = '';
    onFilter(checked: boolean) {
        this.checked = checked;
        if (this.refBlock) this.refBlock.onSearch();
    }
    get filters() {
        if (this.checked)
            return [{
                field: this.field.name,
                value: this.checked,
                operator: '$eq'
            }]
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var pos = rs.findIndex(g => g.name == 'fieldTextDisplay');
        if (pos > -1) {
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({ type: MenuItemType.divide })
            // ns.push({
            //     name: 'isMultiple',
            //     text: lst('多选'),
            //     icon: { name: 'bytedance-icon', code: 'more-three' },
            //     checked: this.isMultiple,
            //     type: MenuItemType.switch,
            // })
            ns.push({
                name: 'format',
                text: lst('格式'),
                icon: { name: 'bytedance-icon', code: 'config' },
                type: MenuItemType.select,
                options: [
                    { text: lst('复选框'), value: 'checkbox' },
                    { text: lst('开关'), value: 'toggle' },
                    // { text: lst('列表'), value: 'list' },
                    // { text: lst('复选选择'), value: 'listCheck' }
                ],
                value: this.format
            })
            // ns.push({
            //     name: 'isStat',
            //     text: lst('分类统计'),
            //     icon: { name: 'bytedance-icon', code: 'chart-pie' },
            //     checked: this.isStat,
            //     type: MenuItemType.switch,
            // })
            rs.splice(pos + 1, 0, ...ns)
        }
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>) {
        switch (item.name) {
            case 'format':
                await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {

        return await super.onClickContextMenu(item, e);
    }
}
@view('/field/filter/check')
export class FilterFieldCheckView extends BlockView<FilterFieldCheck>{
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle} filterField={this.block}>
            <div className="flex">
                {this.block.format == 'checkbox' && <CheckBox block checked={this.block.checked}
                    onChange={e => {
                        this.block.onFilter(e)
                    }}></CheckBox>}
                {this.block.format == 'toggle' && <Switch checked={this.block.checked}
                    onChange={e => {
                        this.block.onFilter(e)
                    }}></Switch>}
                <TextArea className={'flex-fixed gap-l-5 text-overflow'} placeholderSmallFont plain placeholder={lst("是否核查")} prop="checkLabel" block={this.block} ></TextArea>
            </div>
        </OriginFilterFieldView></div>
    }
}