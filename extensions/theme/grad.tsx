import React from "react";
import { PageThemeStyle } from "../../src/page/declare";
import { ColorUtil } from "../../util/color";
import { DiceSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { SelectBox } from "../../component/view/select/box";
import { lst } from "../../i18n/store";
import { Point } from "../../src/common/vector/point";
import { Matrix } from "../../src/common/matrix";
import { MouseDragger } from "../../src/common/dragger";
import lodash from "lodash";
import { util } from "../../util/util";

export class GradColor extends React.Component<{
    grad: PageThemeStyle['bgStyle']['grad'],
    onChange: (e: PageThemeStyle['bgStyle']['grad']) => void
}> {
    constructor(props) {
        super(props);
        this.grad = lodash.cloneDeep(props.grad);
        if (!this.grad) this.grad = {};
        if (!this.grad.name) this.grad.name = 'soft';
        if (typeof this.grad.x == 'undefined') {
            this.grad.x = 0;
            this.grad.y = 100;
        }
    }
    componentDidUpdate(prevProps: Readonly<{ grad: PageThemeStyle['bgStyle']['grad']; onChange: (e: PageThemeStyle['bgStyle']['grad']) => void; }>, prevState: Readonly<{}>, snapshot?: any): void {
        if (!lodash.isEqual(prevProps.grad, this.props.grad)) {
            this.grad = lodash.cloneDeep(this.props.grad);
            if (!this.grad) this.grad = {};
            if (!this.grad.name) this.grad.name = 'soft';
            if (typeof this.grad.x == 'undefined') {
                this.grad.x = 0;
                this.grad.y = 100;
            }
            this.forceUpdate();
        }
    }
    renderGrad() {
        return <div className="pos pos-inset" ref={e => this.el = e} onMouseDown={e => this.mousedown(e.clientX, e.clientY, true)}>
            <div className="circle pos pos-inset w100 h100 z-2" style={{
                background: 'radial-gradient(circle closest-side, rgb(255, 255, 255), transparent)'
            }}></div>
            <div className="circle pos pos-inset w100 h100  z-1" style={{
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                transform: 'rotateZ(270deg)'
            }}></div>
        </div>
    }
    el: HTMLElement;
    mousedown(cx, cy, isSync?: boolean) {
        var rect = this.el.getBoundingClientRect();
        var x = cx - rect.left;
        var y = cy - rect.top;
        var r = Math.sqrt((x - 100) * (x - 100) + (y - 100) * (y - 100));
        if (r <= 100) {
            this.grad.x = x;
            this.grad.y = y;
        }
        else {
            var d = 180 / Math.PI;
            var angle = Math.atan2(y - 100, x - 100) * d + 180;
            this.grad.x = 100 - Math.cos(angle / d) * 100;
            this.grad.y = 100 - Math.sin(angle / d) * 100;
        }
        this.grad.bg = this.getColors();
        this.forceUpdate()
        if (isSync) this.props.onChange(lodash.cloneDeep(this.grad))
    }
    mv(e: React.MouseEvent) {
        var self = this;
        MouseDragger({
            event: e,
            moving(ev, data, isEnd) {
                self.mousedown(ev.clientX, ev.clientY, isEnd);
            }
        })
    }
    color: string = '#fff';
    grad: PageThemeStyle['bgStyle']['grad'] = { name: '', bg: '', x: 0, y: 0 }
    getPoints() {
        var ps: { color?: { r: number, g: number, b: number }, point: Point, type: 'main' | 'port' }[] = [];
        ps.push({ point: new Point(this.grad.x, this.grad.y), type: 'main' });
        switch (this.grad.name) {
            case 'soft':
                var ma = new Matrix();
                ma.rotate(45, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(-90, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                break;
            case 'duo':
                var ma = new Matrix();
                ma.rotate(180, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                break;
            case 'crescent':
                var ma = new Matrix();
                ma.rotate(45, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(45, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(-135, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(-45, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                break;
            case 'wisp':
                var ma = new Matrix();
                ma.rotate(60, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(-210, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                break;
            case 'mono':
                var ma = new Matrix();
                ma.scale(0.5, 0.5, { x: 100, y: 100 });
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.scale(0.2, 0.2, { x: 100, y: 100 });
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                break;
            case 'cosmos':
                var ma = new Matrix();
                ma.rotate(360 / 5, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(360 / 5, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(360 / 5, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                ma.rotate(360 / 5, 100, 100);
                ps.push({
                    point: ma.transform(new Point(this.grad.x, this.grad.y)),
                    type: 'port'
                })
                break;
        }
        ps.forEach(p => {
            p.color = this.getColor(p.point.x, p.point.y);
        })
        return ps;
    }
    renderDots() {
        var ps = this.getPoints();
        return <div className="pos pos-inset z-4" style={{ pointerEvents: 'none' }}>
            {ps.map((p, i) => {
                var size = p.type == 'main' ? 28 : 10;
                return <div
                    className={"pos z-4 circle" + (p.type == 'main' ? " cursor" : "")}
                    onMouseDown={e => this.mv(e)}
                    style={{
                        border: '1px solid #fff',
                        left: p.point.x - size / 2,
                        top: p.point.y - size / 2,
                        width: size,
                        height: size,
                        pointerEvents: p.type == 'main' ? 'visible' : 'none',
                        background: ColorUtil.toRGBA(p.color),
                    }}
                    key={i}>
                </div>
            })}
        </div>
    }
    getColors() {
        var ps = this.getPoints();
        var colors = [];
        colors.push(`radial-gradient(circle at 0% 0%, ${ColorUtil.toRGBA(Object.assign({ a: 50 }, ps[0].color))} 0px, ${ColorUtil.toRGBA(Object.assign({ a: 0 }, ps[0].color))} 50%)`);
        for (var i = 1; i < ps.length; i++) {
            colors.push(`radial-gradient(circle at ${Math.abs(ps[i].point.x / 2)}% ${Math.abs(ps[i].point.y / 2)}%, ${ColorUtil.toRGBA(Object.assign({ a: 50 }, ps[i].color))} 0px, ${ColorUtil.toRGBA(Object.assign({ a: 0 }, ps[i].color))} ${100 - Math.abs(ps[i].point.x / 2)}%)`);
        }
        colors.push(`linear-gradient(0deg, ${ColorUtil.toRGBA(Object.assign({ a: 50 }, ps[0].color))} 0%, ${ColorUtil.toRGBA(Object.assign({ a: 50 }, ps[0].color))} 100%)`);
        return colors.join(",");
    }
    getColor(x: number, y: number) {
        var d = 180 / Math.PI;
        var angle = Math.atan2(y - 100, x - 100) * d + 180;
        var r = Math.sqrt((x - 100) * (x - 100) + (y - 100) * (y - 100));
        var color = ColorUtil.hsv2rgb(angle, r, 100);
        return color;
    }
    render() {
        return <div>
            <div className="flex-center">
                <div className="w-200 h-200 relative">
                    {this.renderGrad()}
                    {this.renderDots()}
                </div>
            </div>
            <div className="h-60 round gap-h-10" style={{ background: this.grad.bg, boxShadow: ' 0 4px 6px -1px rgba(0, 0, 0, 0.1),0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}></div>
            <div className="flex">
                <div className="flex-auto">
                    <SelectBox border options={[
                        { text: lst('柔软'), value: 'soft' },
                        { text: lst('适当'), value: 'duo' },
                        { text: lst('新月'), value: 'crescent' },
                        { text: lst('小束'), value: 'wisp' },
                        { text: lst('莫诺'), value: 'mono' },
                        { text: lst('宇宙'), value: 'cosmos' },
                    ]} value={this.grad.name} onChange={e => {
                        this.grad.name = e;
                        this.props.onChange(this.grad)
                    }}></SelectBox>
                </div>
                <span onMouseDown={e => {
                    var rect = this.el.getBoundingClientRect();
                    this.mousedown(util.getRandom(0, 200) + rect.left, util.getRandom(0, 200) + rect.top, true)
                }} className="flex-fixed flex-center size-24 cursor item-hover round gap-l-10"><Icon size={20} icon={DiceSvg}></Icon></span>
            </div>
        </div>
    }
}

