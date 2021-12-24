import lodash from "lodash";
import React from "react";
import { FieldType } from "../../blocks/table-store/schema/field.type";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import CloseTick from "../../src/assert/svg/CloseTick.svg";
import './style.less';
import { Remark } from "../../component/view/text";
/**
 * 背景色
 */
var BackgroundColorList = [
    { color: 'rgba(247,214,183,0.5)', text: '幼杏' },
    { color: 'rgba(255,193,153,0.5)', text: '鲜橘' },
    { color: 'rgba(252,246,189,0.5)', text: '淡黄' },
    { color: 'rgba(205,243,220,0.5)', text: '浅绿' },
    { color: 'rgba(169,222,249,0.5)', text: '天蓝' },
    { color: 'rgba(189,201,255,0.5)', text: '雾蓝' },
    { color: 'rgba(239,218,251,0.5)', text: '轻紫' },
    { color: 'rgba(234,202,220,0.5)', text: '熏粉' },
    { color: 'rgba(237,233,235,0.5)', text: '白灰' },
    { color: 'rgba(217,211,215,0.5)', text: '暗银' },
    { color: 'rgba(253,198,200,0.5)', text: '将红' },
]
export interface TableStoreOptionType {
    text: string,
    color: string;
}
export class TableStoreOption extends EventsComponent {
    render() {
        var self = this;
        function keydown(event: KeyboardEvent) {
            if (event.key == 'Enter') {
                self.onCreateOption();
            }
        }
        function changeInput(event: React.FormEvent<HTMLInputElement>) {
            self.value = (event.target as HTMLInputElement).value;
            self.forceUpdate()
        }
        return <div className="shy-tablestore-option-selector">
            <div className="shy-tablestore-option-selector-input">
                {this.option && <a style={{ backgroundColor: this.option.color }}><span>{this.option.text}</span><em><CloseTick></CloseTick></em></a>}
                <input value={this.value} onInput={e => changeInput(e)} onKeyDown={e => keydown(e.nativeEvent)} />
            </div>
            <Remark size="middle" style={{ height: 20 }}>{this.filterOptions.length > 0 ? '选择或创建一个选项' : '暂无选项'}</Remark>
            <div className="shy-tablestore-option-selector-drop">
                {this.filterOptions.map(op => {
                    return <div className="shy-tablestore-option-item" key={op.text} onMouseDown={e => this.setOption(op)} ><span style={{ backgroundColor: op.color }}>{op.text}</span></div>
                })}
                {this.isNeedCreated && <div className="shy-tablestore-option-item-create" onClick={e => this.onCreateOption()}><em>创建</em><span style={{ backgroundColor: this.optionColor }}>{this.value}</span></div>}
            </div>
        </div>
    }
    get isNeedCreated() {
        return this.value && !(this.options.length > 0 && this.options.some(s => s.text == this.value)) ? true : false;
    }
    get optionColor() {
        return BackgroundColorList.find(g => !this.options.some(o => o.color == g.color))?.color;
    }
    get filterOptions() {
        return this.options.filter(g => g.text == this.value);
    }
    onCreateOption() {
        var text = this.value.trim();
        if (!this.options.some(s => s.text == text)) {
            this.value = text;
            this.option = { text, color: this.optionColor };
            this.options.push(this.option);
            this.emit('changeOptions', lodash.cloneDeep(this.options))
            this.forceUpdate();
        }
        else if (this.value != text) {
            this.value = text;
            this.forceUpdate();
        }
    }
    setOption(option: TableStoreOptionType) {
        this.option = option;
        this.forceUpdate();
        this.emit('save', this.option.text);
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
    value: any, options: {
        multiple: boolean,
        options: TableStoreOptionType[],
        changeOptions: (options: TableStoreOptionType[]) => void
    }) {
    let popover = await PopoverSingleton(TableStoreOption);
    let fv = await popover.open(pos);
    fv.open(value, options);
    return new Promise((resolve: (data: { text: string, type: FieldType }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('input', (ops: TableStoreOption[]) => {

        });
        fv.only('changeOptions', (ops: TableStoreOptionType[]) => {
            options.changeOptions(ops);
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


