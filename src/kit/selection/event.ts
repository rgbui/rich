import { forceCloseTextTool, useTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
import { BlockCssName } from "../../block/pattern/css";
import { KeyboardCode } from "../../common/keys";
import { Exception, ExceptionType } from "../../error/exception";
import { ActionDirective } from "../../history/declare";
import { Anchor } from "./anchor";
import { SelectionExplorer } from "./explorer";
export class SelectionExplorer$Events {
    /**
    * 取消选区
    */
    onCancelSelection(this: SelectionExplorer) {
        if (this.currentSelectedBlocks.length > 0)
            this.currentSelectedBlocks = [];
        if (this.start && this.end) {
            this.end.dispose();
            this.end = null;
        }
        this.renderSelection();
    }
    onClearAnchorAndSelection(this: SelectionExplorer) {
        if (this.currentSelectedBlocks.length > 0)
            this.currentSelectedBlocks = [];
        if (this.start) { this.start.dispose(); this.start = null }
        if (this.end) { this.end.dispose(); this.end = null; }
        if (this.activeAnchor) {
            this.activeAnchor.dispose(); this.activeAnchor = null;
        }
        this.renderSelection();
    }
    /**
     * 删除选区
     */
    async onDeleteSelection(this: SelectionExplorer) {
        // forceCloseTextTool();
        // await this.page.onAction(ActionDirective.onDeleteSelection, async () => {
        //     if (this.currentSelectedBlocks.length > 0) {
        //         await this.currentSelectedBlocks.eachAsync(async block => {
        //             await block.delete();
        //         });
        //         this.onCancelSelection();
        //     }
        //     else {
        //         var bs = this.selectedBlocks;
        //         var start = this.start;
        //         var end = this.end;
        //         if (end.isBefore(start)) {
        //             start = this.end;
        //             end = this.start;
        //         }
        //         var rowBlock = start.block.closest(x => x.isBlock);
        //         var point = start.bound.leftMiddle;
        //         await bs.eachAsync(async (block) => {
        //             if (!block.isOnlyElementText) await block.delete();
        //             if (block == start.block && block == end.block) {
        //                 var ae = block.firstElementAppear;
        //                 var text = block[ae.prop];
        //                 text = text.slice(0, start.at) + text.slice(end.at);
        //                 block.updateAppear(ae, text, BlockRenderRange.self);
        //                 // newAnchor = { block: start.block, at: start.at };
        //             }
        //             else if (block == start.block) {
        //                 var ae = block.firstElementAppear;
        //                 var text = block[ae.prop];
        //                 text = text.slice(0, start.at);
        //                 if (text) block.updateAppear(ae, text, BlockRenderRange.self);
        //                 else await block.delete();
        //                 // newAnchor = { block: start.block, at: start.at };
        //             }
        //             else if (block == end.block) {
        //                 var ae = block.firstElementAppear;
        //                 var text = block[ae.prop];
        //                 text = text.slice(end.at);
        //                 if (text) block.updateAppear(ae, text, BlockRenderRange.self);
        //                 else await block.delete()
        //                 // newAnchor = { block: end.block, at: 0 };
        //             }
        //             else {
        //                 await block.delete();
        //             }
        //         });
        //         this.onCancelSelection();
        //         this.page.addUpdateEvent(async () => {
        //             var anchor = rowBlock.visibleAnchor(point);
        //             this.page.kit.explorer.onFocusAnchor(anchor);
        //         })
        //     }
        // })
    }
    /**
     * 光标移动
     * @param arrow 
     * @returns 
     */
    onCursorMove(this: SelectionExplorer, arrow: KeyboardCode) {
        var anchor = this.activeAnchor;
        if (anchor) {
            var newAnchor: Anchor;
            if (anchor.isText) {
                if (arrow == KeyboardCode.ArrowLeft && !anchor.isStart) {
                    anchor.at -= 1;
                    anchor.visible();
                    return;
                }
                else if (arrow == KeyboardCode.ArrowLeft && anchor.isStart) newAnchor = anchor.prevAnchor;
                else if (arrow == KeyboardCode.ArrowRight && !anchor.isEnd) {
                    anchor.at += 1;
                    anchor.visible();
                    return;
                }
                else if (arrow == KeyboardCode.ArrowRight && anchor.isEnd) {
                    newAnchor = anchor.nextAnchor;
                }
                // else if (arrow == KeyboardCode.ArrowDown)
                //     newAnchor = anchor.block.visibleInnerDownAnchor(anchor);
                // else if (arrow == KeyboardCode.ArrowUp)
                //     newAnchor = anchor.block.visibleInnerUpAnchor(anchor);
            }
            else if (anchor.isSolid) {
                if (arrow == KeyboardCode.ArrowLeft) {
                    newAnchor = anchor.prevAnchor
                }
                else if (arrow == KeyboardCode.ArrowRight) {
                    newAnchor = anchor.nextAnchor
                }
                else if (arrow == KeyboardCode.ArrowDown) {
                   // newAnchor = anchor.block.visibleDownAnchor(anchor);
                }
                else if (arrow == KeyboardCode.ArrowUp) {
                   // newAnchor = anchor.block.visibleUpAnchor(anchor);
                }
            }
            if (newAnchor) {
                /***
                 * 挨的比较近的两个文标签，光标移动时，需要多向前或向后移一位，
                 * 这样就不会在视觉上发现光标在某个地方有停留了
                 */
                if (anchor.isText && newAnchor.isText && (arrow == KeyboardCode.ArrowLeft || arrow == KeyboardCode.ArrowRight)) {
                    if (arrow == KeyboardCode.ArrowRight) {
                        if (this.page.textAnchorIsAdjoin(anchor, newAnchor)) newAnchor.at += 1;
                    }
                    else {
                        if (this.page.textAnchorIsAdjoin(newAnchor, anchor)) newAnchor.at -= 1;
                    }
                }
                this.onFocusAnchor(newAnchor);
            }
        }
    }
    /**
     * 换行，有的创建block
     */
    async onEnter(this: SelectionExplorer,) {
        await this.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
            var block = this.activeAnchor.block;
            if (block.isLine) block = block.closest(g => !g.isLine);
            var newBlock: Block;
            if (block.isListBlock && block.getChilds(block.childKey).length > 0) {
                var fb = block.getChilds(block.childKey).first();
                var url = fb.isContinuouslyCreated ? fb.url : BlockUrlConstant.TextSpan;
                var continuouslyProps = fb.continuouslyProps;
                newBlock = await this.page.createBlock(url, { ...continuouslyProps }, fb.parent, 0, fb.parent.childKey)
            }
            else {
                var url = block.isContinuouslyCreated ? block.url : BlockUrlConstant.TextSpan;
                var continuouslyProps = block.continuouslyProps;
                newBlock = await block.visibleDownCreateBlock(url, { ...continuouslyProps });
            }
            newBlock.mounted(() => {
                // var anchor = newBlock.visibleHeadAnchor;
                // this.onFocusAnchor(anchor);
            });
        })
    }
    async onEnterCutOff(this: SelectionExplorer) {
        await this.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
            var anchor = this.activeAnchor;
            var pos = anchor.at;
            var block = anchor.block;
            var rowBlock = block.closest(x => !x.isLine);
            var gs = block.isLine ? block.nexts : [];
            var rest = anchor.elementAppear.textContent.slice(0, pos);
            var text = anchor.elementAppear.textContent.slice(pos);
            var childs = text ? [{ url: BlockUrlConstant.Text, content: text }] : [];
            if (rest || !block.isTextContent) block.updateAppear(anchor.elementAppear, rest, BlockRenderRange.self);
            else await block.delete();
            var newBlock: Block;
            if (rowBlock.isListBlock && rowBlock.getChilds(rowBlock.childKey).length > 0) {
                var fb = rowBlock.getChilds(rowBlock.childKey).first();
                var url = fb.isContinuouslyCreated ? fb.url : BlockUrlConstant.TextSpan;
                var continuouslyProps = fb.continuouslyProps;
                newBlock = await this.page.createBlock(url, { ...continuouslyProps, blocks: { childs } }, fb.parent, 0, fb.parent.childKey)
            }
            else {
                var url = rowBlock.isContinuouslyCreated ? rowBlock.url : BlockUrlConstant.TextSpan;
                var continuouslyProps = rowBlock.continuouslyProps;
                newBlock = await rowBlock.visibleDownCreateBlock(url, { ...continuouslyProps, blocks: { childs } });
            }
            if (gs.length > 0) {
                for (let i = 0; i < gs.length; i++) {
                    await newBlock.append(gs[i]);
                }
            }
            this.page.addUpdateEvent(async () => {
                // var anchor = newBlock.visibleHeadAnchor;
                // if (!anchor) {
                //     console.log(newBlock);
                // }
                // this.onFocusAnchor(anchor);
            })
        })
    }
    /**
     * 对选区执行一些样式
     */
    async onSelectionSetPatternOrProps(this: SelectionExplorer, styles: Record<BlockCssName, Record<string, any>>, props?: Record<string, any>) {
        if (!this.hasTextRange) throw new Exception(ExceptionType.notTextSelection);
        var bs = this.selectedBlocks;
        var start = this.start;
        var end = this.end;
        if (end.isBefore(start)) {
            start = this.end;
            end = this.start;
        }
        await this.page.onActionAsync(ActionDirective.onUpdatePattern, async () => {
            var ns: { block: Block, at?: number } = {} as any;
            var ne: { block: Block, at?: number } = {} as any;
            await bs.eachAsync(async block => {
                if (block.isLineSolid) {
                    /***
                    * 例如表情块
                    */
                    if (block == start.block) ns.block = block
                    if (block == end.block) ne.block = block
                }
                else {
                    var fissContent = this.page.fissionBlockBySelection(block, this.start, this.end);
                    /**
                     * 有可能anchor就是block的开头，而anchor是选区的结尾，
                     * 实际上选区没有选择任何当前block的内容
                     */
                    if (!fissContent.before && !fissContent.before && !fissContent.current) {
                        if (block == start.block) ns = { block: block, at: start.at }
                        if (block == end.block) ne = { block: block, at: end.at }
                    }
                    else {
                        if (!fissContent.after && !fissContent.before) {
                            /**
                             * 全选的操作
                             */
                            if (styles)
                                block.pattern.setStyles(styles);
                            if (props)
                                await block.updateProps(props);
                            if (block == start.block) ns = { block: block, at: start.at }
                            if (block == end.block) ne = { block: block, at: end.at }
                            return;
                        }
                        var pattern = await block.pattern.cloneData();
                        var url = BlockUrlConstant.Text;
                        if (block.isTextContent) {
                            var textBlock = block.asTextContent;
                            var textAttributes = textBlock.textContentAttributes;
                            var at = block.at;
                            var pa = block.parent;
                            /**
                             * 说明当前的block是textContent
                             */
                            if (fissContent.before) {
                                await block.updateProps({ content: fissContent.before });
                                var current = await (this.page.createBlock(url, { ...textAttributes, content: fissContent.current, pattern }, pa, (at += 1)));
                                if (styles)
                                    current.pattern.setStyles(styles);
                                if (props)
                                    await current.updateProps(props);
                                if (block == this.start.block) ns = { block: current, at: 0 }
                                if (block == this.end.block) ne = { block: current, at: -1 }
                                if (fissContent.after)
                                    await (this.page.createBlock(url, { ...textAttributes, content: fissContent.after, pattern }, pa, (at += 1)))
                            }
                            else {
                                await block.updateProps({ content: fissContent.current });
                                if (styles)
                                    block.pattern.setStyles(styles);
                                if (props)
                                    await block.updateProps(props);
                                if (block == this.start.block) ns = { block: block, at: 0 }
                                if (block == this.end.block) ne = { block: block, at: -1 }
                                await (this.page.createBlock(url, { ...textAttributes, content: fissContent.after, pattern }, pa, (at += 1)))
                            }
                        } else {
                            /**
                             * 说明当前的block是textspan
                             */
                            var at = -1;
                            var pa = block;
                            if (fissContent.before)
                                await (this.page.createBlock(url, { content: fissContent.before, pattern }, pa, (at += 1)))
                            if (fissContent.current) {
                                var current = await (this.page.createBlock(url, { content: fissContent.current, pattern }, pa, (at += 1)));
                                if (styles)
                                    current.pattern.setStyles(styles);
                                if (props)
                                    await current.updateProps(props);
                                if (block == this.start.block) ns = { block: current, at: 0 }
                                if (block == this.end.block) ne = { block: current, at: -1 }
                            }
                            if (fissContent.after)
                                await (this.page.createBlock(url, { content: fissContent.after, pattern }, pa, (at += 1)))
                        }
                    }
                }
            });
            if (ns && ne) {
                if (!ns.block) {
                    ns = { block: start.block, at: start.at };
                }
                if (!ne.block) {
                    ne = { block: end.block, at: end.at };
                }
                /**
                * 这时的newStart
                * newEnd是现创建的，
                * 所以对光标的操作可能得在渲染之后才可以触发
                */
                this.page.addUpdateEvent(async () => {
                    // var newStartAnchor = ns.block.createAnchor(ns.at);
                    // newStartAnchor.acceptView(this.start);
                    // this.start = newStartAnchor;
                    // var newEndAnchor = ne.block.createAnchor(ne.at);
                    // newEndAnchor.acceptView(this.end);
                    // this.end = newEndAnchor;
                    // this.renderSelection();
                });
            }
        });
    }
    async onOpenTextTool(this: SelectionExplorer, event: MouseEvent) {
        // if (this.selectedBlocks.length == 0) return;
        // var rowBlock = this.selectedBlocks.first().closest(x => !x.isLine);
        // if (!rowBlock.isSupportTextStyle) return;
        // while (true) {
        //     if (this.selectedBlocks.length == 0) break;
        //     var result = await useTextTool(this.getSelectionPoint(), {
        //         block: rowBlock,
        //         style: this.page.pickBlocksTextStyle(this.selectedBlocks)
        //     });
        //     if (result) {
        //         if (result.command == 'setStyle') {
        //             await this.onSelectionSetPatternOrProps(result.styles);
        //         }
        //         else if (result.command == 'setProp') {
        //             await this.onSelectionSetPatternOrProps(undefined, result.props);
        //         }
        //         else if (result.command == 'turn') {
        //             await rowBlock.onClickContextMenu(result.item, result.event);
        //             break;
        //         }
        //         else break;
        //     }
        //     else break;
        // }
    }
    async onSelectionInputText(this: SelectionExplorer, inputText: string) {
        forceCloseTextTool();
        await this.page.onAction(ActionDirective.onDeleteSelection, async () => {

            var start = this.start;
            var end = this.end;
            if (end.isBefore(start)) {
                start = this.end;
                end = this.start;
            }
            var rowBlock = start.block.closest(x => x.isBlock);
            var point = end.bound.leftMiddle;
            var bs = this.selectedBlocks;
            await bs.eachAsync(async (block) => {
                if (!block.isOnlyElementText) await block.delete();
                if (block == start.block && block == end.block) {
                    var ae = block.firstElementAppear;
                    var text = block[ae.prop];
                    text = text.slice(0, start.at) + inputText + text.slice(end.at);
                    block.updateAppear(ae, text, BlockRenderRange.self);
                    this.page.addUpdateEvent(async () => {
                        // var anchor = block.createAnchor(start.at + inputText.length);
                        // this.page.kit.explorer.onFocusAnchor(anchor);
                    })
                }
                else if (block == start.block) {
                    var ae = block.firstElementAppear;
                    var text = block[ae.prop];
                    text = text.slice(0, start.at);
                    if (text) block.updateAppear(ae, text, BlockRenderRange.self);
                    else await block.delete();
                    // newAnchor = { block: start.block, at: start.at };
                }
                else if (block == end.block) {
                    var ae = block.firstElementAppear;
                    var text = block[ae.prop];
                    text = text.slice(end.at);
                    var newBlock = await this.kit.page.createBlock(BlockUrlConstant.Text, { content: inputText }, block.parent, block.at + 1);
                    if (text) block.updateAppear(ae, text, BlockRenderRange.self);
                    else await block.delete();
                    this.page.addUpdateEvent(async () => {
                        // var anchor = newBlock.createBackAnchor();
                        // this.page.kit.explorer.onFocusAnchor(anchor);
                    })
                }
                else {
                    await block.delete();
                }
            });
            this.onCancelSelection();
            this.page.addUpdateEvent(async () => {
                // var anchor = rowBlock.visibleAnchor(point);
                // this.page.kit.explorer.onFocusAnchor(anchor);
            })

        })
    }
}