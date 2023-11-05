import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Textarea } from "../../component/view/input/textarea";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { Button } from "../../component/view/button";
import { S } from "../../i18n/view";
import { Divider } from "../../component/view/grid";
import { UA } from "../../util/ua";
import { HelpText } from "../../component/view/text";
import { lst } from "../../i18n/store";
import { Rect } from "../../src/common/vector/point";
import { closeKatexSelector, useKatexSelector } from "./selector";
import { Katex } from "../../component/view/katex";
import { ToolTip } from "../../component/view/tooltip";

class KatexInput extends EventsComponent {
    content: string;
    open(content: string) {
        this.content = content;
        this.forceUpdate();
    }
    onSave() {
        this.emit('save', this.content);
    }
    render() {
        var self = this;
        function change(content: string) {
            self.content = content;
            self.emit('input', self.content);
        }
        var types: { latex: string, tip: string, type: string }[] = [
            { type: 'ab', tip: lst('希腊字母'), latex: '\\alpha\\beta' },
            { type: 'logic', tip: lst('运算符'), latex: '\\times\\div' },
            { type: 'relation', tip: lst('关系运算符'), latex: '\\leq\\geq' },
            { type: 'formual', tip: lst('式子'), latex: 'x_{a}' },
            { type: 'arrow', tip: lst('箭头'), latex: '\\uparrow\\downarrow' },
            // { type: 'h2o', tip: lst('化学'), latex: 'H2O' }
        ];
        return <div className="bg-white w-450 padding-h-5">
            <div className="flex padding-w-10 gap-b-5">
                <div className="flex-auto flex">
                    {types.map((t, i) => {
                        return <span className="flex" key={t.latex} >
                            <ToolTip overlay={t.tip}>
                                <Katex className={'item-hover padding-w-3 padding-h-2 round cursor  '} latex={t.latex} onMouseDown={e => this.onOpen(t, e)}  ></Katex>
                            </ToolTip>
                            {i !== types.length - 1 && <span className="border-right-light gap-l-5 gap-r-5">&nbsp;</span>}
                        </span>
                    })}
                </div>
                <HelpText className='flex-fixed' url={'https://help.shy.live/page/261'}><S>了解如何使用数学公式</S></HelpText>
            </div>
            <Divider></Divider>
            <Textarea
                round={false}
                placeholder={lst('输入数学公式')}
                value={this.content}
                onChange={e => change(e)}
                ctrlEnter={UA.isMacOs ? false : true}
                metaEnter={UA.isMacOs ? true : false}
                transparent={true}
                autoHeight={true}
                ref={e => this.textarea = e}
                onEnter={e => {
                    this.content = e;
                    this.onSave()
                }}
            ></Textarea>
            <Divider></Divider>
            <div className="flex padding-w-10">
                <span className="flex-auto flex-end">
                    <span className="remark gap-r-5">{UA.isMacOs ? "⌘" : "Ctrl"}+Enter</span>
                    <Button onClick={e => this.onSave()}><S>确定</S></Button>
                </span>
            </div>
        </div>
    }
    textarea: Textarea;
    async onOpen(data: { latex: string, type: string }, event: React.MouseEvent) {
        closeKatexSelector()
        var r = await useKatexSelector({ direction: 'top', roundArea: Rect.fromEvent(event) }, data.type, e => {
            this.content += e;
            this.emit('input', this.content)
        });
        if (r) {
            this.content += r;
            this.textarea.updateValue(this.content);
            this.emit('input', this.content)
        }
    }
}



export async function useKatexInput(pos: PopoverPosition, content: string, listen?: (data) => void) {
    let popover = await PopoverSingleton(KatexInput);
    let katexInput = await popover.open(pos);
    katexInput.open(content);
    return new Promise((resolve: (data: string) => void, reject) => {
        katexInput.only('input', (data) => {
            if (listen) listen(data)
        })
        katexInput.only('save', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(katexInput.content)
        })
    })
}