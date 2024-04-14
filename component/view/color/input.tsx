import React from "react";
import { Rect } from "../../../src/common/vector/point";
import { CheckIsColor } from "./util";
import { useColorPicker } from "./lazy";

export class ColorInput extends React.Component<{
    color: string,
    onChange: (color: string) => void
}>{
    input: HTMLInputElement;
    change() {
        var value = this.input.value as string;
        if (CheckIsColor(value) == 'valid') {
            this.props.onChange && this.props.onChange(value);
        }
    }
    shouldComponentUpdate(nextProps: Readonly<{ color: string; onChange: (color: string) => void; }>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (this.props.color != nextProps.color) {
            if (this.input) this.input.value = nextProps.color;
            return true;
        }
        return false
    }
    async onPicker(event: React.MouseEvent) {
        var r = await useColorPicker(
            { roundArea: Rect.fromEvent(event) },
            { color: this.props.color }
        );
        if (r) {
            this.input.value = r;
            this.props.onChange && this.props.onChange(r);
        }
    }
    render(): React.ReactNode {
        return <div className="flex border round h-30">
            <div className="flex-fixed size-20 border-light round cursor gap-r-5 gap-l-5" onMouseDown={e => this.onPicker(e)} style={{ backgroundColor: this.props.color }}>

            </div>
            <div className="flex-auto"><input
                spellCheck={false}
                style={{ fontSize: 14, outline: 'none', border: 0, height: 24 }}
                ref={e => this.input = e}
                defaultValue={this.props.color}
                onKeyDown={e => {
                    // if (e.key.toLowerCase() == 'enter')
                    //     this.change()
                }}
                onInput={e => {
                    this.change()
                }}></input></div>
        </div>
    }
}