import React from "react";
import { RenameSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/url')
export class FieldUrl extends OriginField {

}
@view('/field/url')
export class FieldUrlView extends BlockView<FieldUrl>{
    private isOver: boolean = false;
    private isEdit: boolean = false;
    render() {
        var self = this;
        async function save(event: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) {
            if (self.isEdit == true) {
                self.isEdit = false;
                var value = (event.target as HTMLInputElement).value;
                await self.block.onUpdateProps({ value });
                self.forceUpdate();
            }
        }
        async function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
            if (event.key == 'Enter') {
                await save(event);
            }
        }
        return <div className='sy-field-url' >
            {!this.isEdit && <div
                onMouseEnter={e => { this.isOver == true; this.forceUpdate() }}
                onMouseLeave={e => { this.isOver == false; this.forceUpdate() }}
            ><a href={this.block.value}>{this.block.value}</a>
                {this.isOver && <Icon mousedown={e => { e.stopPropagation(); this.isEdit = true; this.forceUpdate() }} icon={RenameSvg}></Icon>}
            </div>}
            {this.isEdit && <div>
                <input value={this.block.value} onKeyDown={e => keydown(e)} onBlur={e => save(e)}></input>
            </div>}
        </div>
    }
}