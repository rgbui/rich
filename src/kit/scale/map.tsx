import React, { CSSProperties } from "react";
import { Kit } from "..";
import { Matrix } from "../../common/matrix";
import lodash from 'lodash';
import { Point, Rect, RectUtility } from "../../common/vector/point";
import { MouseDragger } from "../../common/dragger";
import { CloseSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";

export class BoardMap extends React.Component<{ kit: Kit }> {
    open() {
        this.visible = !this.visible;
        this.forceUpdate();
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    visible: boolean = false;
    renderBlocks() {
        var view = this.props.kit.page.views[0];
        var cs = view.childs;
        return cs.map(c => {
            var size = c.fixedSize;
            if (!size) return <div key={c.id}></div>
            var blockStyle: CSSProperties = {
                width: size.width,
                height: size.height,
                ...c.currentMatrix.getCss(),
                transformOrigin: '0 0',
                top: 0,
                left: 0,
                position: 'absolute',
                backgroundColor: 'var(--text-p-color)',
                opacity: 0.5
            }
            return <div className="border" style={blockStyle} key={c.id}>
            </div>
        })
    }
    get page() {
        return this.props.kit.page;
    }
    onMove(e: React.MouseEvent) {
        var ma = this.page.matrix.clone();
        var p = Point.from(e);
        MouseDragger({
            event: e,
            moving: (event, data, isEnd, isMove) => {
                var dx = event.clientX - p.x;
                var dy = event.clientY - p.y;
                dx = -dx;
                dy = -dy;
                var newMatrix = ma.clone();
                newMatrix.translate(dx / this.scale, dy / this.scale);
                this.page.onSetMatrix(newMatrix);
            }
        })
    }
    renderWin() {
        var size = this.props.kit.page.bound;
        var rect = new Rect(0, 0, size.width, size.height);
        rect = rect.transformInverseToRect(this.props.kit.page.matrix);
        return <div className="cursor" onMouseDown={e => {
            e.stopPropagation();
            this.onMove(e)
        }} style={{
            position: 'absolute',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            border: `${2 / this.scale}px solid var(--text-p-color)`,
        }}>
        </div>
    }
    getBounds() {
        var view = this.props.kit.page.views[0];
        var cs = view.childs;
        var bs = cs.toArray(c => {
            var size = c.fixedSize;
            if (size) {
                var rect = new Rect(0, 0, size.width, size.height);
                var cm = c.currentMatrix.clone();
                cm = cm.append(c.contentMatrix);
                rect = rect.transformToBound(cm);
                return rect;
            }
        });
        lodash.remove(bs, g => g ? false : true);
        var points = bs.map(b => b.points).flat();
        if (points.length > 0)
            return RectUtility.getPointsBound(points)

        var size = this.props.kit.page.bound;
        var rect = new Rect(0, 0, size.width, size.height);
        return rect;
    }
    scale: number = 1;
    render() {
        if (this.visible == false) return <></>
        var winRect = new Rect(0, 0, 400, 250);
        var style: CSSProperties = {
            position: 'absolute',
            bottom: 70,
            right: 30,
            width: winRect.width,
            height: winRect.height,
            zIndex: 10003,
            overflow: 'hidden',
            userSelect: 'none'
        }
        var rect = this.getBounds();
        rect = rect.extend(Math.max(this.props.kit.page.bound.width, this.props.kit.page.bound.height) / 2);

        var scale = this.scale = Math.min(winRect.width / rect.width, winRect.height / rect.height);
        var matrix = new Matrix();
        matrix.scale(scale, scale, { x: 0, y: 0 });
        matrix.translate(-rect.x, -rect.y);
        return <div ref={e => this.el = e} onMouseDown={e => {
            this.onTo(matrix, e);
        }} data-wheel='disabled' className="card-border bg-white round" style={style}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transformOrigin: '0 0',
                ...matrix.getCss()
            }}><div>
                    {this.renderBlocks()}
                </div>
                {this.renderWin()}
            </div>
            <div
                style={{ top: 5, left: 5 }}
                onMouseDown={e => { e.stopPropagation(); this.close() }}
                className="pos size-20 round item-hover cursor remark flex-center"><Icon size={12} icon={CloseSvg}></Icon></div>
        </div>
    }
    el: HTMLElement;
    onTo(matrix: Matrix, e: React.MouseEvent) {
        e.stopPropagation();
        var p = Point.from(e);
        var erect = this.el.getBoundingClientRect();
        p.x -= erect.left;
        p.y -= erect.top;
        var op = p;
        var size = this.props.kit.page.bound;
        var rect = new Rect(0, 0, size.width, size.height);
        rect = rect.transformInverseToRect(this.props.kit.page.matrix);
        rect = rect.transformToRect(matrix);

        var dx = op.x - rect.middleCenter.x;
        var dy = op.y - rect.middleCenter.y;
        dx = -dx;
        dy = -dy;
        var newMatrix = new Matrix();
        newMatrix.translate(dx / this.scale, dy / this.scale);
        newMatrix = this.props.kit.page.matrix.clone().append(newMatrix);
        this.props.kit.page.onSetMatrix(newMatrix);
    }
}