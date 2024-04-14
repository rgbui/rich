import React from "react";
import { EventsComponent } from "../../lib/events.component";
import { ChromePicker } from 'react-color';
export default class ColorPicker extends EventsComponent {
    constructor(props) {
        super(props);
    }
    color: string;
    render() {
        var color = this.color;
        if (color && color.startsWith('rgba')) {
            color = color.replace(/^rgba?[\s]*\(/g, '').replace(')', '');
            var rs = color.split(/\,/g);
            color = {
                r: parseFloat(rs[0]),
                g: parseFloat(rs[1]),
                b: parseFloat(rs[2]),
                a: rs.length == 3 ? 1 : parseFloat(rs[3])
            } as any;
        }
        return <ChromePicker color={color}
            onChangeComplete={e => {
                this.onChange(e);
            }}></ChromePicker>
    }
    onChange(color: any) {
        // color = {
        //   hex: '#333',
        //   rgb: {
        //     r: 51,
        //     g: 51,
        //     b: 51,
        //     a: 1,
        //   },
        //   hsl: {
        //     h: 0,
        //     s: 0,
        //     l: .20,
        //     a: 1,
        //   },
        // }
        this.isChange = true;
        this.color = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
        this.emit('change', this.color);
        this.forceUpdate();
    }
    isChange: boolean = false;
    open(color: string) {
        this.isChange = false;
        this.color = color;
        this.forceUpdate()
    }
}

