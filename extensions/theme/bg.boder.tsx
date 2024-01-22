import React from "react";
import { PageThemeStyle } from "../../src/page/declare";
import { Input } from "../../component/view/input";
import { InputNumber } from "../../component/view/input/number";
import { S } from "../../i18n/view";
import lodash from "lodash";

export class BgBorder extends React.Component<{
    contentStyle: PageThemeStyle['contentStyle'],
    onChange(e: PageThemeStyle['contentStyle']): void
}>{
    constructor(props) {
        super(props);
        this.contentStyle = props.contentStyle;
    }
    contentStyle: PageThemeStyle['contentStyle'];
    shouldComponentUpdate(nextProps: Readonly<{ contentStyle: PageThemeStyle['contentStyle']; onChange(e: PageThemeStyle['contentStyle']): void; }>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (lodash.isEqual(nextProps.contentStyle, this.contentStyle)) return false;
        this.contentStyle = nextProps.contentStyle;
        return true;
    }
    render() {
        var cs = this.contentStyle as PageThemeStyle['contentStyle'];
        var style: React.CSSProperties = {}
        if (cs.round) style.borderRadius = cs.round;
        if (cs.border) {
            if (typeof cs.border == 'string' && cs.border.includes(';')) {
                var ccs = cs.border.split(';');
                style.borderTop = ccs[0];
                style.borderRight = ccs[1];
                style.borderBottom = ccs[2];
                style.borderLeft = ccs[3];
            }
            else style.border = cs.border;
        }
        if (cs.shadow) {
            style.boxShadow = cs.shadow;
        }
        return <div>
            <div className="flex-center gap-h-20">
                <div className="w-120 h-60" style={style}></div>
            </div>
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>圆角</S>
            </div>
            <div className="flex flex-wrap text-1">
                <Input value={(this.contentStyle.round).toString()} onChange={e => {
                    this.contentStyle.round = e;
                    this.props.onChange(lodash.cloneDeep(this.contentStyle))
                }}></Input>
            </div>
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>边框</S>
            </div>
            <div className="flex flex-wrap text-1">
                <Input value={this.contentStyle.border} onChange={e => {
                    this.contentStyle.border = e;
                    this.props.onChange(lodash.cloneDeep(this.contentStyle))
                }}></Input>
            </div>
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>阴影</S>
            </div>
            <div className="flex flex-wrap text-1">
                <Input value={this.contentStyle.shadow} onChange={e => {
                    this.contentStyle.shadow = e;
                    this.props.onChange(lodash.cloneDeep(this.contentStyle))
                }}></Input>
            </div>
        </div>
    }
}