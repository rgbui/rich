import React from "react";
import { Kit } from "..";
import { Rect } from "../../common/vector/point";

export class BoardGrid extends React.Component<{ kit: Kit }> {
    open() {
        this.visible = !this.visible;
        this.forceUpdate();
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    visible: boolean = false;
    canvas: HTMLCanvasElement;
    render() {
        return <canvas style={{
            display: this.visible ? 'block' : 'none',
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 1
        }} ref={e => {
            this.canvas = e;
            if (this.autoDraw) {
                this.autoDraw();
                this.autoDraw = null
            }
        }}></canvas>
    }
    draw(visible: boolean) {
        this.visible = visible;
        var color = '#eee';
        if (this.canvas) {

            if (this.visible == false) return this.canvas.style.display = 'none';
            else this.canvas.style.display = 'block';

            var ctx = this.canvas.getContext('2d');
            var step = 100; // 网格间隔
            var realStep = step * this.props.kit.page.matrix.getScaling().x;
            if (realStep < 50) {
                step = Math.floor(100 / this.props.kit.page.matrix.getScaling().x);
            }
            else if (realStep > 150) {
                step = Math.floor(100 / this.props.kit.page.matrix.getScaling().x);
            }

            var size = this.props.kit.page.bound;
            var rect = new Rect(0, 0, size.width, size.height);
            var direct = Math.min(size.width, size.height) / 2;
            rect = rect.extend(direct);
            var newRect = rect.transformInverseToRect(this.props.kit.page.matrix);
            if (newRect.top % step != 0) {
                newRect.top = newRect.top + step - newRect.top % step;
            }
            if (newRect.left % step != 0) {
                newRect.left = newRect.left + step - newRect.left % step;
            }

            // 清空画布
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.canvas.style.top = (rect.y) + 'px';
            this.canvas.style.left = (rect.x) + 'px';

            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 绘制垂直线
            for (var x = newRect.x; x <= newRect.x + newRect.width; x += step) {
                ctx.beginPath();
                var p1 = this.props.kit.page.matrix.transform({ x: x, y: newRect.y });
                var p2 = this.props.kit.page.matrix.transform({ x: x, y: newRect.y + newRect.height });
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = color;
                ctx.stroke();
            }

            // 绘制水平线
            for (var y = newRect.y; y <= newRect.y + newRect.height; y += step) {
                ctx.beginPath();
                var p1 = this.props.kit.page.matrix.transform({ x: newRect.x, y: y });
                var p2 = this.props.kit.page.matrix.transform({ x: newRect.x + newRect.width, y: y });
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = color;
                ctx.stroke();
            }
        }
        else {
            this.autoDraw = () => this.draw(visible);
        }
    }
    autoDraw: () => void;
}