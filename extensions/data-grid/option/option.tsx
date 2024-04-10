import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";

import DragHandle from "../../../src/assert/svg/dragHandle.svg";
import Dots from "../../../src/assert/svg/dots.svg";
import { MenuItemType } from "../../../component/view/menu/declare";
import { CheckSvg, CloseSvg, TrashSvg } from "../../../component/svgs";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Point } from "../../../src/common/vector/point";
import { Icon } from "../../../component/view/icon";

import { util } from "../../../util/util";
import { Confirm } from "../../../component/lib/confirm";
import { ShyAlert } from "../../../component/lib/alert";
import { DragList } from "../../../component/view/drag.list";
import { DataGridOptionType } from "../../../blocks/data-grid/schema/field";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import { OptionBackgroundColorList } from "../../color/data";
import './style.less';

export class TableStoreOption extends EventsComponent {
    render() {
        var self = this;
        function keydown(event: KeyboardEvent) {
            if (event.key == 'Enter') {
                if (self.isEdit) self.onCreateOption();
            }
            else if (event.key.toLowerCase() == 'backspace') {
                if (!self.value) {
                    self.onlyClearOption();
                }
            }
        }
        function changeInput(event: React.FormEvent<HTMLInputElement>) {
            self.value = (event.target as HTMLInputElement).value;
            self.value = self.value.trim();
            self.forceUpdate()
        }
        function change(to: number, from: number) {
            var fs = self.filterOptions;
            var t = fs[from];
            fs.splice(from, 1);
            var pre = to == 0 ? null : fs[to - 1];
            var ops = lodash.cloneDeep(self.options);
            ops.remove(o => o.value == t.value);
            if (lodash.isNull(pre)) ops.insertAt(0, t);
            else {
                var at = ops.findIndex(g => g.value == pre.value);
                ops.insertAt(at + 1, t);
            }
            self.options = ops;
            self.forceUpdate()
            self.emit('changeOptions', lodash.cloneDeep(self.options))
        }
        return <div className="shy-tablestore-option-selector">
            {!(this.isEdit == false && this.multiple == false) && <div className="shy-tablestore-option-selector-input">
                {this.ovs.map(ov => {
                    return <a key={ov.value} className="gap-r-5 gap-h-3" style={{ backgroundColor: ov.color }}>
                        <span className="max-w-80 text-overflow inline-block">{ov.text}</span>
                        <span className={'gap-l-5 cursor remark flex-center item-hover round'} >
                            <Icon icon={CloseSvg} size={10}
                                onClick={e => {
                                    if (self.multiple) {
                                        lodash.remove(self.ovs, o => o.value == ov.value);
                                        self.forceUpdate()
                                    }
                                    else self.onlyClearOption();
                                }}
                            ></Icon>
                        </span>
                    </a>
                })}
                <div className={(this.ovs.length > 0 ? "gap-l-5" : "")}><input
                    ref={e => this.input = e}
                    placeholder={lst("请输入选项")}
                    maxLength={this.value.length + 3}
                    value={this.value}
                    className="input-placeholder-remark"
                    onInput={e => changeInput(e)} onKeyDown={e => keydown(e.nativeEvent)} /></div>
            </div>}
            <div className="shy-tablestore-option-selector-drop overflow-y max-h-180">
                {this.isEdit && <div className="remark gap-h-8 padding-w-10 h-20 f-12">{this.filterOptions.length > 0 ? lst('选择或创建一个选项') : lst('暂无选项')}</div>}
                <DragList
                    onChange={change}
                    isDragBar={e => e.closest('.shy-tablestore-option-item-icon') ? true : false}>
                    {this.filterOptions.map(op => {
                        return <div className="shy-tablestore-option-item" key={op.text} onClick={e => this.setOption(op)} >
                            {this.isEdit && <span className="shy-tablestore-option-item-icon"><DragHandle></DragHandle></span>}
                            <span className="shy-tablestore-option-item-text text-overflow"><em className=" f-14 padding-h-2  l-16 " style={{ backgroundColor: op.color }}>{op.text}</em></span>
                            {this.ovs.some(c => c.value == op.value) && <span className="flex-fixed size-20 flex-center gap-r-3 text-1"><Icon size={16} icon={CheckSvg}></Icon></span>}
                            {this.isEdit && <span className="shy-tablestore-option-item-property" onClick={e => this.configOption(op, e)}><Dots></Dots></span>}
                        </div>
                    })}
                </DragList>
                {this.isNeedCreated && self.isEdit && <div className="shy-tablestore-option-item-create box-border" onClick={e => this.onCreateOption()}><em><S>创建</S></em><span style={{ backgroundColor: this.optionColor }}>{this.value}</span></div>}
            </div>
        </div>
    }
    get isNeedCreated() {
        return this.value && !(this.options.length > 0 && this.options.some(s => s.text == this.value)) ? true : false;
    }
    get optionColor() {
        var oc = OptionBackgroundColorList().findAll(g => !this.options.some(o => o.color == g.color)).randomOf()?.color;
        if (oc) return oc;
        else {
            return OptionBackgroundColorList().randomOf()?.color;
        }
    }
    get filterOptions() {
        return this.options.filter(g => g.text == this.value || !this.value);
    }
    onCreateOption() {
        var text = this.value.trim();
        this.value = '';
        if (!this.options.some(s => s.text == text)) {
            var op = { value: util.guid(), text: text, color: this.optionColor };
            this.options.push(op);
            this.emit('changeOptions', lodash.cloneDeep(this.options))
            this.setOption(op);
        }
        else if (this.value != text) {
            this.forceUpdate();
        }
    }
    setOption(option: DataGridOptionType) {
        if (this.multiple) {
            if (!this.ovs.includes(option)) this.ovs.push(option);
            else lodash.remove(this.ovs, o => o.value == option.value);
        }
        else this.ovs = [option];
        this.forceUpdate();
        if (!this.multiple) this.emit('save', this.ovs.map(v => v.value));
    }
    onlyClearOption() {
        this.value = '';
        this.ovs = [];
        this.forceUpdate();
    }
    clearOption() {
        this.value = '';
        this.ovs = [];
        this.forceUpdate();
        this.emit('save', []);
    }
    private value: string = '';
    private options: DataGridOptionType[] = [];
    ovs: DataGridOptionType[] = [];
    input: HTMLInputElement;
    multiple: boolean = false;
    isEdit: boolean = false;
    open(value, data: { isEdit: boolean, multiple: boolean, options: DataGridOptionType[] }) {
        this.multiple = data.multiple ? true : false;
        if (this.multiple) {
            var v = util.covertToArray(value);
            this.ovs = data.options.filter(g => v.some(s => s == g.value));
        }
        else this.ovs = data.options.filter(g => g.value == value);
        this.options = data.options;
        this.isEdit = data.isEdit || false;
        this.value = '';
        this.forceUpdate(async () => {
            await util.delay(10);
            if (this.input) this.input.focus();
            this.emit('update');
        });
    }
    async configOption(option: DataGridOptionType, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            { text: lst('标签'), name: 'name', value: option.text, type: MenuItemType.input },
            { type: MenuItemType.divide },
            { name: 'delete', icon: TrashSvg, text: lst('删除') },
            { type: MenuItemType.divide },
            { type: MenuItemType.text, text: lst('颜色') },
            ...OptionBackgroundColorList().map(b => {
                return {
                    name: 'color',
                    value: b.color,
                    text: b.text,
                    type: MenuItemType.custom,
                    render(item) {
                        return <div className="flex gap-w-5 padding-w-5 round h-30 item-hover cursor">
                            <span className="flex-fixed size-20 gap-l-3 round gap-r-10 border" style={{ backgroundColor: item.value }}></span>
                            <span className="flex-auto text f-14 text-overflow">{b.text}</span>
                            {option.color == item.value &&
                                <span className="flex-fixed size-24 flex-center"><Icon size={16} icon={CheckSvg}></Icon></span>
                            }
                        </div>
                    }
                }
            })
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um) {
            if (um.item.name == 'color') {
                option.color = um.item.value;
                this.emit('changeOptions', lodash.cloneDeep(this.options));
                this.forceUpdate();
            }
            else if (um.item.name == 'delete') {
                if (await Confirm(lst('确认删除标签项吗?'))) {
                    this.options.remove(o => o === option);
                    this.emit('changeOptions', lodash.cloneDeep(this.options));
                    this.forceUpdate();
                }
            }
        }
        var name = menus[0].value;
        if (name && name != option.text) {
            if (this.options.some(s => s.text == name && s !== option)) {
                ShyAlert(lst('当前标签项已存在。'))
            }
            else {
                option.text = name;
                this.emit('changeOptions', lodash.cloneDeep(this.options));
                this.forceUpdate();
            }
        }
    }
}

/***
 * 返回的是选项
 * [{option}...]
 */
export async function useTableStoreOption(pos: PopoverPosition,
    value: any,
    options: {
        isEdit: boolean,
        multiple: boolean,
        options: DataGridOptionType[],
        changeOptions?: (options: DataGridOptionType[]) => void,
        input?: (value: DataGridOptionType[]) => void
    }) {
    let popover = await PopoverSingleton(TableStoreOption, { mask: true });
    let fv = await popover.open(pos);
    fv.only('update', () => {
        console.log('update layout');
        popover.updateLayout()
    })
    fv.open(value, options);
    return new Promise((resolve: (data: DataGridOptionType[]) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(fv.ovs);
        });
        fv.only('input', (ops: TableStoreOption[]) => {

        });
        fv.only('changeOptions', (ops: DataGridOptionType[]) => {
            if (options.changeOptions)
                options.changeOptions(ops);
        });
        fv.only('close', () => {
            popover.close();
            resolve(fv.ovs);
        });
        popover.only('close', () => {
            resolve(fv.ovs);
        });
    })
}


