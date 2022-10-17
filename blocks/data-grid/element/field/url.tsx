import lodash from "lodash";
import React from "react";
import { EditSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { KeyboardCode } from "../../../../src/common/keys";
import { util } from "../../../../util/util";
import { OriginField } from "./origin.field";

@url('/field/url')
export class FieldUrl extends OriginField {
    isFocus: boolean = false;
    onEdit(event: React.MouseEvent) {
        event.stopPropagation();
        if (this.isFocus == false) {
            this.isFocus = true;
            this.view.forceUpdate(async () => {
                var input = this.el.querySelector('input');
                if (!input) {
                    await util.delay(100);
                    input = this.el.querySelector('input');
                    await util.delay(100);
                }
                else await util.delay(100);
                input.focus();
            })
        }
    }
}
@view('/field/url')
export class FieldUrlView extends BlockView<FieldUrl>{
    isCom: boolean = false;
    render() {
        var self = this;
        var save = lodash.debounce<(v) => void>((v) => {
            if (v) {
                self.block.onUpdateCellValue(v);
            }
            else {
                if (v == '') self.block.onUpdateCellValue(null);
            }
        }, 700);
        function keydown(event: React.KeyboardEvent) {
            var input = event.target as HTMLInputElement;
            var v = input.value.trim();
            if (event.key == KeyboardCode.Enter) {
                if (v) {
                    self.block.onUpdateCellValue(v);
                }
                else {
                    if (v == '') self.block.onUpdateCellValue(null);
                }
            }
        }
        function input(event) {
            if (self.isCom) return;
            var input = event.target as HTMLInputElement;
            var v = input.value.trim();
            save(v);
        }
        function paste(event) {
            var text = event.clipboardData.getData('text/plain');
            if (text) {
                event.preventDefault();
                var v = text.trim();
                if (v) {
                    self.block.onUpdateCellValue(v);
                }
                else {
                    if (v == '') self.block.onUpdateCellValue(null);
                }
            }
        }
        function keyup(event) {

        }
        function start(e) {
            self.isCom = true;
        }
        function end(e) {
            self.isCom = false;
        }
        function blur(event) {
            var input = event.target as HTMLInputElement;
            var v = input.value.trim();
            if (v) {
                self.block.onUpdateCellValue(v);
            }
            else {
                if (v == '') self.block.onUpdateCellValue(null);
            }
            self.block.isFocus = false;
            self.forceUpdate();
        }
        return <div className='sy-field-text f-14 relative visible-hover'>
            {this.block.isFocus && <input
                className="text-1 f-14"
                type='text'
                style={{
                    border: 0,
                    outline: 'none',
                    width: '100%',
                    padding: 0,
                    margin: 0
                }}
                placeholder="输入网址"
                defaultValue={this.block.value}
                onKeyDown={keydown}
                onInput={input}
                onKeyUp={keyup}
                onBlur={blur}
                onCompositionStart={start}
                onCompositionUpdate={start}
                onCompositionEnd={end}
                onPaste={paste}
            />}
            {!this.block.isFocus && <a className="underline text" href={this.block.value}>{this.block.value}</a>}
            {!this.block.isFocus && <div onMouseDown={e => this.block.onEdit(e)} className="bg-white visible flex-center size-24 round cursor border pos-top-right">
                <span className="item-hover size-24 flex-center"> <Icon icon={EditSvg} size={16}></Icon></span>
            </div>}
        </div>
    }
}