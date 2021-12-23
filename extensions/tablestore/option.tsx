import lodash from "lodash";
import React from "react";
import { FieldType } from "../../blocks/table-store/schema/field.type";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

/**
 * 背景色
 */
var BackgroundColorList = [
    { color: 'rgb(255,255,255)', text: '默认' },
    { color: 'rgba(237,233,235,0.5)', text: '白灰' },
    { color: 'rgba(217,211,215,0.5)', text: '暗银' },
    { color: 'rgba(247,214,183,0.5)', text: '幼杏' },
    { color: 'rgba(255,193,153,0.5)', text: '鲜橘' },
    { color: 'rgba(252,246,189,0.5)', text: '淡黄' },
    { color: 'rgba(205,243,220,0.5)', text: '浅绿' },
    { color: 'rgba(169,222,249,0.5)', text: '天蓝' },
    { color: 'rgba(189,201,255,0.5)', text: '雾蓝' },
    { color: 'rgba(239,218,251,0.5)', text: '轻紫' },
    { color: 'rgba(234,202,220,0.5)', text: '熏粉' },
    { color: 'rgba(253,198,200,0.5)', text: '将红' },
]
export interface TableStoreOptionType {
    text: string,
    color: string;
}
export class TableStoreOption extends EventsComponent {
    render() {
        function keydown(event: KeyboardEvent) {
            if (event.key == 'Enter') {

            }
        }
        return <div className="shy-tablestore-option-selector">
            <div className="shy-tablestore-option-selector-input">
                <a style={{ backgroundColor: this.option.color }}><span>{this.option.text}</span><em></em></a>
                <input value={this.value} onKeyDown={e => keydown(e.nativeEvent)} />
            </div>
            <div className="shy-tablestore-option-selector-drop">
                {this.filterOptions.map(op => {
                    return <a key={op.text} onMouseDown={e => this.setOption(op)} ><span style={{ backgroundColor: op.color }}>{op.text}</span></a>
                })}
                {this.isNeedCreated && <a onMouseDown={e => this.onCreateOption()}><em>创建</em><span style={{ backgroundColor: this.optionColor }}>{this.value}</span></a>}
            </div>
        </div>
    }
    get isNeedCreated() {
        return this.value && this.options.some(s => s.text == this.value) ? true : false;
    }
    get optionColor() {
        return BackgroundColorList.find(g => !this.options.some(o => o.color == g.color))?.color;
    }
    get filterOptions() {
        return this.options.filter(g => g.text == this.value);
    }
    onCreateOption() {
        this.options.push({ text: this.value, color: this.optionColor });
        this.emit('changeOptions', lodash.cloneDeep(this.options))
        this.forceUpdate();
    }
    setOption(option: TableStoreOptionType) {
        this.option = option;
        this.forceUpdate();
        this.emit('save', this.option.text);
    }
    onSave() {

    }
    private value: string = '';
    private options: TableStoreOptionType[] = [];
    private option: TableStoreOptionType = null;
    open(value, data: { multiple: boolean, options: TableStoreOptionType[] }) {
        this.option = data.options.find(g => g.text == value);
        if (!this.option) this.option = data.options[0];
        this.options = data.options;
        this.value = '';
        this.forceUpdate();
    }
}



export async function useTableStoreOption(pos: PopoverPosition,
    value: any, options: { multiple: boolean, options: TableStoreOptionType[] }) {
    let popover = await PopoverSingleton(TableStoreOption);
    let fv = await popover.open(pos);
    fv.open(value, options);
    return new Promise((resolve: (data: { text: string, type: FieldType }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('input', (options: TableStoreOption[]) => {

        });
        fv.only('changeOptions', (options: TableStoreOptionType[]) => {

        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}


