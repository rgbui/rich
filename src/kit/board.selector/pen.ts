
import { Kit } from "..";
import { Block } from "../../block";
import { ShySvg } from "../../block/svg";
import { ShyPath } from "../../block/svg/path";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point } from "../../common/vector/point";

import { ActionDirective } from "../../history/declare";
import { setBoardBlockCache } from "../../page/common/cache";
import { Pen } from "../../../blocks/board/pen";
import { Segment } from "../../block/svg/segment";


export function PenDraw(kit: Kit,
    block: Block,
    event: React.MouseEvent) {
    var newBlock: Pen;
    var isMounted: boolean = false;

    var svg: ShySvg = new ShySvg();
    var shyPath = new ShyPath();
    svg.childs.push(shyPath);

    var fra: Block = block ? block.frameBlock : kit.page.getPageFrame();
    var gm = fra.globalWindowMatrix;
    var lastP: Point = Point.from(event);
    var lastNewWidth = 2
    var re = gm.inverseTransform(lastP);
    var maxLineWidth = 20;
    var minLineWidth = 1;
    var strokeWidth = kit.boardSelector.currentSelector.data?.strokeWidth || 2;
    var points: Point[] = [re];
    async function createNewPenBlock() {
        await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
            var data = kit.boardSelector.currentSelector.data || {};
            newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra) as Pen;
            await setBoardBlockCache(newBlock);
            var strokeStyle = {} as Record<string, any>;
            if (typeof kit.boardSelector.currentSelector.data?.strokeWidth == 'number') {
                strokeStyle.strokeWidth = kit.boardSelector.currentSelector.data.strokeWidth;
            }
            if (typeof kit.boardSelector.currentSelector.data?.stroke == 'string') {
                strokeStyle.stroke = kit.boardSelector.currentSelector.data.stroke;
            }
            if (typeof kit.boardSelector.currentSelector.data?.strokeOpacity == 'number') {
                strokeStyle.strokeOpacity = kit.boardSelector.currentSelector.data.strokeOpacity;
            }
            if (Object.keys(strokeStyle).length > 0) {
                await newBlock.pattern.setSvgStyle(strokeStyle);
            }
            strokeWidth = newBlock.pattern?.getSvgStyle()?.strokeWidth || 2;
            newBlock.mounted(() => {
                isMounted = true;
            })
        });
    }
    MouseDragger({
        event,
        moveStart() {
            createNewPenBlock();
        },
        move(ev, data) {
            if (newBlock) {
                if (lastP && lastP?.x == ev.clientX && lastP?.y == ev.clientY) return;
                var currentPoint = Point.from(ev);
                var tr = gm.inverseTransform(currentPoint);
                var lr = gm.inverseTransform(lastP);
                var stopUpdateLast = false;
                if (newBlock.penType == 'pen') {
                    // 计算鼠标移动速度，用于模拟压力
                    var velocity = Math.sqrt(Math.pow(currentPoint.x - lastP.x, 2) + Math.pow(currentPoint.y - lastP.y, 2));
                    var newLineWidth = maxLineWidth - velocity / 5;
                    newLineWidth = Math.max(minLineWidth, newLineWidth); // 保证线条宽度不会小于1
                    if (lastNewWidth == newLineWidth) {
                        shyPath.draw(tr);
                    }
                    else {
                        var newShyPath = new ShyPath();
                        newShyPath.strokeWidth = newLineWidth;
                        svg.childs.push(newShyPath);
                        shyPath = newShyPath;
                        shyPath.draw(lr)
                        shyPath.draw(tr);
                    }
                    lastNewWidth = newLineWidth
                }
                else if (newBlock.penType == 'pencil') {
                    var velocity = Math.sqrt(Math.pow(currentPoint.x - lastP.x, 2) + Math.pow(currentPoint.y - lastP.y, 2));
                    if (velocity > 10 || points.length == 1) {
                        points.push(tr);
                        shyPath.draw(tr);
                        var newShyPath = new ShyPath();
                        newShyPath.strokeWidth = Math.max(minLineWidth, strokeWidth * Math.random());
                        newShyPath.strokeOpacity = Math.max(0.3, Math.ceil(Math.random() * 10) / 10);
                        svg.childs.push(newShyPath);
                        // 使用随机偏移模拟铅笔线条的不规则边缘
                        for (var i = 0; i < Math.random() * 3; i++) {
                            newShyPath.draw(gm.inverseTransform(
                                new Point(
                                    lastP.x + strokeWidth + (Math.random() - 0.5) * 0.5 * strokeWidth,
                                    lastP.y + strokeWidth + (Math.random() - 0.5) * 0.5 * strokeWidth
                                )
                            ))
                            newShyPath.draw(gm.inverseTransform(
                                new Point(
                                    currentPoint.x + strokeWidth + (Math.random() - 0.5) * 0.5 * strokeWidth,
                                    currentPoint.y + strokeWidth + (Math.random() - 0.5) * 0.5 * strokeWidth
                                )
                            ))
                        }
                    } else stopUpdateLast = true;
                }
                else {
                    var velocity = Math.sqrt(Math.pow(currentPoint.x - lastP.x, 2) + Math.pow(currentPoint.y - lastP.y, 2));
                    if (velocity > 10 || points.length == 1) {
                        points.push(tr);
                        if (points.length >= 2) {
                            var segs: Segment[] = [];
                            if (points.length == 2) {
                                segs = Segment.fromPoints(points);
                            }
                            else
                                for (let i = 0; i < points.length - 2; i++) {
                                    var seg = new Segment();
                                    if (i == 0) {
                                        seg.point = points[i];
                                        seg.handleOut = points[i + 1];
                                        i += 1
                                    }
                                    else {
                                        if (points[i + 1] && points[i + 2]) {
                                            seg.handleIn = points[i];
                                            seg.point = points[i + 1];
                                            seg.handleOut = points[i + 2];
                                        }
                                        else if (points[i + 1]) {
                                            seg.handleIn = points[i];
                                            seg.point = points[i + 1];
                                        }
                                        else {
                                            seg.point = points[i];
                                        }
                                        i += 2;
                                    }
                                    segs.push(seg);
                                }
                            shyPath.segments = segs;
                        }
                    }
                    else stopUpdateLast = true;
                }
                var bound = svg.getBound()
                if (bound) {
                    var s = newBlock.pattern?.getSvgStyle()?.strokeWidth || 2;
                    bound = bound.extend(s);
                    var ma = new Matrix();
                    ma.translate(bound.x, bound.y);
                    newBlock.matrix = ma;
                    newBlock.svg = svg;
                    if (isMounted) newBlock.forceManualUpdate();
                }
                if (stopUpdateLast == false)
                    lastP = currentPoint
            }
        },
        async moveEnd(ev, isMove, data) {
            var bound = svg.getBound()
            if (isMove && newBlock && bound) {
                await kit.page.onAction('onBoardToolCreateBlockResize', async () => {
                    var s = newBlock.pattern?.getSvgStyle()?.strokeWidth || 2;
                    bound = bound.extend(s);
                    var ma = new Matrix();
                    ma.translate(bound.x, bound.y);
                    newBlock.matrix = ma;
                    await newBlock.updateMatrix(new Matrix(), ma);
                    await newBlock.manualUpdateProps({
                        svg: new ShySvg(),
                    }, {
                        svg: svg,
                    })
                    if (isMounted) newBlock.forceManualUpdate();
                    kit.page.addActionAfterEvent(async () => {
                        kit.picker.onPicker([newBlock], { merge: true });
                    })
                });
            }
            else if (newBlock) {
                newBlock.onDelete()
            }
            kit.boardSelector.clearSelector();
        }
    })
}




// 道格拉斯-普克算法简化点的函数
function simplify(points, tolerance) {
    var simplified = [];
    if (points.length <= 2) {
        return points;
    }

    // 找到距离折线最远的点
    var maxDistance = 0;
    var index = 0;
    for (var i = 1; i < points.length - 1; i++) {
        var distance = perpendicularDistance(points[i], [points[0], points[points.length - 1]]);
        if (distance > maxDistance) {
            maxDistance = distance;
            index = i;
        }
    }

    // 如果最远点的距离大于容忍度，则将其加入到简化后的点集中
    if (maxDistance > tolerance) {
        // 递归地简化折线段
        var recResults1 = simplify(points.slice(0, index + 1), tolerance);
        var recResults2 = simplify(points.slice(index), tolerance);

        // 合并结果，不包括最后一个重复的点
        simplified = recResults1.slice(0, recResults1.length - 1).concat(recResults2);
    } else {
        // 如果所有点的距离都小于容忍度，只保留起点和终点
        simplified = [points[0], points[points.length - 1]];
    }

    return simplified;
}

// 计算点到线段的最短距离的函数
function perpendicularDistance(point, line) {
    var px = point.x;
    var py = point.y;
    var ax = line[0].x;
    var ay = line[0].y;
    var bx = line[1].x;
    var by = line[1].y;
    var A = px - ax;
    var B = py - ay;
    var C = bx - ax;
    var D = by - ay;

    var dot = A * C + B * D;
    var lenSq = C * C + D * D;
    var param = dot / lenSq;

    var xx, yy;

    if (param < 0) {
        xx = ax;
        yy = ay;
    } else if (param > 1) {
        xx = bx;
        yy = by;
    } else {
        xx = ax + param * C;
        yy = ay + param * D;
    }

    var dx = px - xx;
    var dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// // 示例使用简化函数
// var points = [
//     {x: 0, y: 0},
//     {x: 1, y: 1},
//     {x: 2, y: 2},
//     {x: 3, y: 2},
//     {x: 4, y: 3},
//     {x: 5, y: 3},
//     {x: 6, y: 4}
// ];

// var tolerance = 1; // 容忍度，可以根据需要调整
// var simplifiedPoints = simplify(points, tolerance);

// // 使用简化后的点绘制线条
//  var canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
//  var ctx = canvas.getContext('2d');
//  var gradient = ctx.createLinearGradient(0,0,1,1Y);
//  gradient.addColorStop(0, 'rgba(' + color + ', ' + opacity + ')');
//  gradient.addColorStop(1, 'rgba(' + color + ', 0)');
// ctx.beginPath();
// ctx.moveTo(simplifiedPoints[0].x, simplifiedPoints[0].y);
// for (var i = 1; i < simplifiedPoints.length; i++) {
//     ctx.lineTo(simplifiedPoints[i].x, simplifiedPoints[i].y);
// }
// ctx.stroke();
