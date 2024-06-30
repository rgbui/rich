import React from "react";
import { EventsComponent } from "../../lib/events.component";
import { Divider } from "../grid";
import { MenuItem } from "../menu/declare";
import { Input } from ".";
import { Icon } from "../icon";
import { KeyboardCode } from "../../../src/common/keys";
import { S } from "../../../i18n/view";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { CheckSvg } from "../../svgs";
import { toLower } from "lodash";

export class FilterInput extends EventsComponent {
    items: (MenuItem & { words: string[] })[] = [];
    options: (MenuItem & { words: string[] })[] = [];
    focusIndex: number = 1;
    word: string = '';
    placeholder = '';
    onSelect(item: MenuItem & { words: string[] }) {
        this.emit('select', item);
    }
    render() {
        return <div className="bg-white w-200 round">
            <div className="gap-w-5 gap-t-10">
                <Input
                    size="small"
                    placeholder={this.placeholder}
                    value={this.word}
                    clear
                    onClear={() => {
                        this.word = '';
                        this.items = this.options.map(o => o);
                        if (this.focusIndex >= this.items.length) this.focusIndex = 0;
                        this.forceUpdate();
                    }}
                    onKeydown={e => {
                        if (e.key == KeyboardCode.ArrowDown) {
                            this.focusIndex++;
                            if (this.focusIndex >= this.items.length) this.focusIndex = 0;
                            this.forceUpdate()
                        }
                        else if (e.key == KeyboardCode.ArrowUp) {
                            this.focusIndex--;
                            if (this.focusIndex < 0) this.focusIndex = this.items.length - 1;
                            this.forceUpdate()
                        }
                        else if (e.key == KeyboardCode.Enter) {
                            this.onSelect(this.items[this.focusIndex]);
                        }
                    }}
                    onChange={e => {
                        this.word = e;
                        this.items = this.options.filter(g => Array.isArray(g.words) && g.words.some(c => c, toLower().indexOf(e.toLowerCase()) > -1) || g.text.toLowerCase().indexOf(e.toLowerCase()) >= 0);
                        this.forceUpdate();
                    }}></Input>
            </div>

            <Divider></Divider>
            <div className="max-h-200 overflow-y">
                {this.items.length == 0 && <div className="padding-w-5 flex-center h-24 f-12 remark"><S>无匹配项</S></div>}
                {this.items.map((it, i) => {
                    return <div
                        className={" flex round h-28 gap-h-3 padding-w-10 gap-w-5 cursor " + (i == this.focusIndex ? "item-hover-light-focus" : "item-hover")}
                        key={i}
                        onMouseDown={e => this.onSelect(it)}
                    >
                        {it.icon && <span className="flex-fixed"><Icon size={16} icon={it.icon}></Icon></span>}
                        <span className="flex-auto text-overflow">{it.text}</span>
                        {it.checkLabel && <span className="flex-fixed">
                            <Icon icon={CheckSvg} size={16}></Icon>
                        </span>}

                    </div>
                })}
            </div>
        </div>
    }
    open(options: { options: MenuItem & { words: string[] }[], placeholder: string }) {
        this.options = options.options;
        this.placeholder = options.placeholder || '';
        this.items = this.options.map(o => o);
        this.word = '';
        this.focusIndex = 0;
        this.forceUpdate();
    }
}

export async function useFilterInput(pos: PopoverPosition, options: {
    options: (MenuItem & { words: string[] })[],
    placeholder: string
}) {
    let popover = await PopoverSingleton(FilterInput, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: MenuItem) => void, reject) => {
        fv.only('select', (value) => {
            popover.close();
            resolve(value);
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