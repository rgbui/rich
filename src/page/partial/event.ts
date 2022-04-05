
import React from "react";
import { Page } from "..";
import { Matrix } from "../../common/matrix";
import { Point, Rect } from "../../common/vector/point";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { PageLayoutType } from "../../layout/declare";

export class PageEvent {
    /**
     * 鼠标点击页面,
     * 点的过程中有可能有按下不松开选择一个较大的区域情况，
     * 这个区域可以触发文字的选中效果，
     * 也可以按一定的条件触发矩形选择范围，例如图像或文本
     * 是否选择文字还是仅仅选择block对象取决于block本身
     * 点在空白处，在鼠标up时，可以检测，看有没有必要创建一个空白输入文本框
     * @param this 
     * @param event 
     * 
     */
    onMousedown(this: Page, event: MouseEvent) {
        if (this.readonly == false)
            this.kit.mouse.onMousedown(event);
    }
    onMousemove(this: Page, event: MouseEvent) {
        if (this.readonly == false)
            this.kit.mouse.onMousemove(event);
    }
    onMouseup(this: Page, event: MouseEvent) {
        if (this.readonly == false)
            this.kit.mouse.onMouseup(event);
    }
    onFocusCapture(this: Page, event: FocusEvent) {
        if (this.readonly) return;
        var ele = event.target as HTMLElement;
        var e = ele.closest('[data-shy-page-no-focus]');
        if (e) return;
        this.onFocus(event);
    }
    onBlurCapture(this: Page, event: FocusEvent) {
        if (this.readonly) return;
        if (this.kit && this.kit.mouse.isDown) {
            /*** 说明鼠标是处于down下，这个不可能失焦
            * 如果当前的元素中有一些节点发生了改变，那么此时event.relatedTarget是空的，这很蛋疼
             * 这里通过鼠标状态的来纠正一下
             */
            return
        }
        var el = event.relatedTarget as Node;
        /**
         * 例如textTool操作时，页面是不能失焦的
         */
        if (el && (el as HTMLElement).getAttribute('data-shy-page-unselect')) return;
        if (!el || el && (!this.root.contains(el) || el === this.root)) {
            this.onBlur(event);
        }
    }

    private lastTriggerTime;
    onWheel(this: Page, event: React.WheelEvent) {
        if (this.readonly) return;
        this.kit.handle.onCloseBlockHandle();
        if (this.isBoard) {
            event.preventDefault();
            if (event.ctrlKey == true) {
                if (this.lastTriggerTime && (Date.now() - this.lastTriggerTime < 60)) return;
                this.lastTriggerTime = Date.now();
                var ma = this.matrix.clone();
                var ro = this.globalMatrix.inverseTransform(new Point(event.pageX, event.pageY));
                if (event.deltaY > 0) {
                    //缩小
                    ma.scale(0.8, 0.8, ro);
                    if (ma.getScaling().x * 100 < 1) return;
                    this.onSetMatrix(ma);
                }
                else {
                    //放大
                    ma.scale(1.2, 1.2, ro);
                    if (ma.getScaling().x * 100 > 300) return;
                    this.onSetMatrix(ma);
                }
            }
            else {
                var g = (x) => {
                    if (x > 0) return 0 - x;
                    else if (x < 0) return 0 - x;
                    else return 0;
                }
                var r = 1 / this.scale;
                var dx = g(event.deltaX) * r;
                var dy = g(event.deltaY) * r;
                var ma = this.matrix.clone();
                ma.translate(dx, dy);
                this.onSetMatrix(ma);
            }
        }
    }
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this 
     * @param event 
     */
    onKeydown(this: Page, event: KeyboardEvent) {
        if (this.readonly) return;
        this.keyboardPlate.keydown(event);
    }
    onKeyup(this: Page, event: KeyboardEvent) {
        if (this.readonly) return;
        this.keyboardPlate.keyup(event);
    }
    onGlobalMousedown(this: Page, event: MouseEvent) {

    }
    async onUndo(this: Page) {
        if (this.snapshoot.historyRecord.isCanUndo)
            await this.onAction(ActionDirective.onUndo, async () => {
                await this.snapshoot.undo();
            })
    }
    async onRedo(this: Page) {
        if (this.snapshoot.historyRecord.isCanRedo) await this.onAction(ActionDirective.onRedo, async () => {
            await this.snapshoot.redo();
        })
    }
    async onPageTurnLayout(this: Page, layoutType: PageLayoutType) {
        this.requireSelectLayout = false;
        await this.onAction(ActionDirective.onPageTurnLayout, async () => {
            this.snapshoot.record(OperatorDirective.pageTurnLayout, {
                old: PageLayoutType.doc,
                new: layoutType
            }, this);
            switch (layoutType) {
                case PageLayoutType.doc:
                    this.pageLayout.type = layoutType;
                    break;
                case PageLayoutType.db:
                    this.pageLayout.type = layoutType;
                    break;
                case PageLayoutType.board:
                    var view = this.views[0];
                    var view = this.views[0];
                    await view.childs.eachAsync(async block => {
                        await block.delete()
                    })
                    this.pageLayout.type = layoutType;
                    break;
                case PageLayoutType.textBroadcast:
                    this.pageLayout.type = layoutType;
                    var view = this.views[0];
                    await view.childs.eachAsync(async block => {
                        await block.delete()
                    })
                    break;
                case PageLayoutType.textChannel:
                    this.pageLayout.type = layoutType;
                    var view = this.views[0];
                    await view.childs.eachAsync(async block => {
                        await block.delete()
                    })
                    await this.createBlock('/channel/text', {}, view);
                    break;
            }
        });
        this.view.forceUpdate();
    }
    onZoom(this: Page, zoom: number, point?: Point) {
        if (!point) {
            var rect = Rect.from(this.root.getBoundingClientRect());
            point = rect.middleCenter;
        }
        var zs = [1, 2, 3, 5, 10, 15, 20, 33, 50, 75, 100, 125, 150, 200, 250, 300];
        var current = zs.findMin(x => Math.abs(x - this.scale * 100));
        var at = zs.findIndex(g => g == current);
        var ro = this.globalMatrix.inverseTransform(point);
        var r = 1;
        var current = this.scale * 100;
        if (zoom > 0) {
            if (at < zs.length - 1) {
                var next = zs[at + 1];
                r = next / current;
            }
        }
        else {
            if (at > 0) {
                var next = zs[at - 1];
                r = next / current;
            }
        }
        r = Math.round(r * 100) / 100;
        this.matrix.scale(r, r, ro);
        this.onSetMatrix(this.matrix);
    }
    onSetMatrix(this: Page, matrix: Matrix) {
        this.matrix = matrix;
        this.view.forceUpdate()
    }
    onFitZoom(this: Page) {
        var bound = this.grid.gridRange();
        var matrix = new Matrix();
        var center = bound.middleCenter;
        var point = bound.leftTop;
        var from = center;
        var rect = Rect.fromEle(this.root);
        rect = rect.relative(rect.leftTop);
        var wr = Math.abs((point.x - from.x) * 2 / rect.width);
        var hr = Math.abs((point.y - from.y) * 2 / rect.height);
        var r = Math.max(wr, hr);
        r = 1 / r;
        var currentVisible = rect.middleCenter;
        matrix.scale(r, r, { x: from.x, y: from.y });
        var to = matrix.inverseTransform(currentVisible.x, currentVisible.y);
        matrix.translate(to.x - from.x, to.y - from.y);
        this.matrix = matrix;
        this.view.forceUpdate()
    }
    onMouseenter(this: Page, event: React.MouseEvent) {
        if (this.isBoard) {
            // getBoardTool().then(r => {
            //     r.onShow(true);
            // })
        }
    }
    onMouseleave(this: Page, event: React.MouseEvent) {
        if (this.isBoard) {
            // getBoardTool().then(r => {
            //     r.onShow(false);
            // })
        }
    }
}

