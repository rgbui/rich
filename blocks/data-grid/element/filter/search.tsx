import lodash from "lodash";
import React from "react";
import { Input } from "../../../../component/view/input";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { lst } from "../../../../i18n/store";

@url('/field/filter/search')
export class SearchText extends OriginFilterField {
    @prop()
    InputSize: 'default' | 'larger' = 'default';
    word: string = '';
    onInputValue = lodash.debounce((value) => {
        this.onForceInput(value);
    }, 1200)
    onForceInput(value: string) {
        this.word = value;
        if (this.refBlock)
            this.refBlock.onSearch();
    }
    get filters() {
        if (!this.word) return null
        return [{
            field: this.field.name,
            operator: '$startWith',
            value: this.word
        }]
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var pos = rs.findIndex(g => g.name == BlockDirective.link);
        if (pos > -1) {
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                name: 'InputSize',
                text: lst('搜索大小 '),
                icon: { name: 'bytedance-icon', code: 'zoom-in' },
                value: this.InputSize,
                type: MenuItemType.select,
                options: [
                    { text: lst('小'), value: 'default', checkLabel: this.InputSize == 'default' },
                    { text: lst('大'), value: 'larger', checkLabel: this.InputSize == 'larger' },
                ]
            })
            rs.splice(pos + 3, 0, ...ns)
        }
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>) {
        switch (item.name) {
            case 'InputSize':
                this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
}

@view('/field/filter/search')
export class SearchTextView extends BlockView<SearchText>{
    renderView() {
        var self = this;
        return <div style={this.block.visibleStyle}>
            <OriginFilterFieldView
                style={this.block.contentStyle}
                filterField={this.block}>
                <Input
                    style={{
                        background: '#fff',
                        borderRadius: this.block.InputSize == 'larger' ? 10 : undefined,
                    }}
                    // prefix={<span className="size-24 flex-center cursor"><Icon className={'remark'} size={16} icon={SearchSvg}></Icon></span>}
                    value={this.block.word}
                    onChange={e => {
                        this.block.onInputValue(e)
                    }}
                    placeholder={lst('搜索...')}
                    onEnter={e => { self.block.refBlock.onSearch() }}
                    clear
                    size={this.block.InputSize}
                    onClear={() => {
                        self.block.onForceInput('');
                    }}
                ></Input>
            </OriginFilterFieldView >
        </div>
    }
}