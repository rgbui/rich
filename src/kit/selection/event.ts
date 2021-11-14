import { useTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { TextContent } from "../../block/element/text";
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
        if (this.currentSelectedBlocks.length > 0) {
            this.currentSelectedBlocks = [];
        }
        else {
            if (this.start && this.start != this.activeAnchor)
                this.start.dispose()
            if (this.end && this.end != this.activeAnchor)
                this.end.dispose()
        }
        this.renderSelection();
    }
    /**
     * 删除选区
     */
    async onDeleteSelection(this: SelectionExplorer) {
        await this.page.onAction(ActionDirective.onDeleteSelection, async () => {
            if (this.currentSelectedBlocks.length > 0) {
                await this.currentSelectedBlocks.eachAsync(async block => {
                    await block.delete();
                });
                this.onCancelSelection();
            }
            else {
                var newAnchor: { block: Block, at?: number } = { block: null };
                var bs = this.selectedBlocks;
                var start = this.start;
                var end = this.end;
                if (end.isBefore(start)) {
                    start = this.end;
                    end = this.start;
                }
                await bs.eachAsync(async (block) => {
                    if (!block.isOnlyElementText) await block.delete();
                    if (block == start.block && block == end.block) {
                        var ae = block.firstElementAppear;
                        var text = block[ae.prop];
                        text = text.slice(0, start.at) + text.slice(end.at);
                        block.updateProps({ [ae.prop]: text });
                        newAnchor = { block: start.block, at: start.at };
                    }
                    else if (block == start.block) {
                        var ae = block.firstElementAppear;
                        var text = block[ae.prop];
                        text = text.slice(0, start.at);
                        block.updateProps({ [ae.prop]: text });
                        newAnchor = { block: start.block, at: start.at };
                    }
                    else if (block == end.block) {
                        var ae = block.firstElementAppear;
                        var text = block[ae.prop];
                        text = text.slice(end.at);
                        block.updateProps({ [ae.prop]: text });
                        newAnchor = { block: end.block, at: 0 };
                    }
                    else {
                        await block.delete();
                    }
                });
            }
        })
        // await this.page.onAction(ActionDirective.onDeleteSelection, async () => {
        //     if (this.currentSelectedBlocks.length > 0) {
        //         await this.currentSelectedBlocks.eachAsync(async block => {
        //             await block.delete();
        //         });
        //         this.onCancelSelection();
        //     }
        //     else {
        //         var blocks = this.page.searchBlocksBetweenAnchor(this.start, this.end);
        //         await blocks.eachAsync(async block => {
        //             if (!block.isText) await block.delete();
        //             else if (block == this.start.block && block != this.end.block) {
        //                 if (this.start.isBefore(this.end)) {
        //                     this.page.onUpdated(async () => {
        //                         var newAnchor = this.createAnchor(this.start.block, this.start.at);
        //                         this.onFocusAnchor(newAnchor);
        //                     });
        //                 }
        //                 var content = this.start.isBefore(this.end) ? block.textContent.slice(0, this.start.at) : block.textContent.slice(this.start.at);
        //                 block.updateProps({ content }, BlockRenderRange.self);
        //             }
        //             else if (block == this.end.block && block != this.start.block) {
        //                 if (this.end.isBefore(this.start)) {
        //                     this.page.onUpdated(async () => {
        //                         var newAnchor = this.createAnchor(this.end.block, this.end.at);
        //                         this.onFocusAnchor(newAnchor);
        //                     });
        //                 }
        //                 var content = this.end.isBefore(this.start) ? block.textContent.slice(0, this.end.at) : block.textContent.slice(this.end.at);
        //                 block.updateProps({ content }, BlockRenderRange.self);
        //             }
        //             else if (block == this.end.block && block == this.start.block) {
        //                 var min = Math.min(this.start.at, this.end.at);
        //                 var max = Math.max(this.start.at, this.end.at);
        //                 var content = block.textContent.slice(0, min) + block.textContent.slice(max);
        //                 block.updateProps({ content }, BlockRenderRange.self);
        //                 this.page.onUpdated(async () => {
        //                     var newAnchor = this.createAnchor(block, min);
        //                     this.onFocusAnchor(newAnchor);
        //                 });
        //             }
        //             else {
        //                 await block.delete();
        //             }
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
                else if (arrow == KeyboardCode.ArrowLeft && anchor.isStart) newAnchor = anchor.block.visiblePrevAnchor;
                else if (arrow == KeyboardCode.ArrowRight && !anchor.isEnd) {
                    anchor.at += 1;
                    anchor.visible();
                    return;
                }
                else if (arrow == KeyboardCode.ArrowRight && anchor.isEnd) {
                    newAnchor = anchor.block.visibleNextAnchor;
                }
                else if (arrow == KeyboardCode.ArrowDown)
                    newAnchor = anchor.block.visibleInnerDownAnchor(anchor);
                else if (arrow == KeyboardCode.ArrowUp)
                    newAnchor = anchor.block.visibleInnerUpAnchor(anchor);
            }
            else if (anchor.isSolid) {
                if (arrow == KeyboardCode.ArrowLeft) {
                    newAnchor = anchor.block.visiblePrevAnchor;
                }
                else if (arrow == KeyboardCode.ArrowRight) {
                    newAnchor = anchor.block.visibleNextAnchor;
                }
                else if (arrow == KeyboardCode.ArrowDown) {
                    newAnchor = anchor.block.visibleDownAnchor(anchor);
                }
                else if (arrow == KeyboardCode.ArrowUp) {
                    newAnchor = anchor.block.visibleUpAnchor(anchor);
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
            var url = block.isContinuouslyCreated ? block.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = block.continuouslyProps;
            var newBlock = await block.visibleDownCreateBlock(url, { ...continuouslyProps });
            newBlock.mounted(() => {
                var anchor = newBlock.visibleHeadAnchor;
                this.onFocusAnchor(anchor);
            });
        })
    }
    async onEnterCutOff(this: SelectionExplorer) {
        await this.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
            var anchor = this.activeAnchor;
            var pos = anchor.at;
            var block = anchor.block;
            var gs = block.nexts;
            var rest = anchor.elementAppear.textContent.slice(0, pos);
            var text = anchor.elementAppear.textContent.slice(pos);
            block.updateProps({ [anchor.elementAppear.prop]: rest });
            if (block.isLine) block = block.closest(g => !g.isLine);
            var url = block.isContinuouslyCreated ? block.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = block.continuouslyProps;
            var newBlock: Block;
            if (gs.length > 0) {
                newBlock = await block.visibleDownCreateBlock(url, { ...continuouslyProps, childs: [{ url: BlockUrlConstant.Text, content: text }] });
                var tc = newBlock.find(g => g instanceof TextContent, true);
                for (let i = gs.length - 1; i >= 0; i--) {
                    let g = gs[i];
                    await g.insertAfter(tc);
                }
            }
            else {
                newBlock = await block.visibleDownCreateBlock(url, { ...continuouslyProps, content: text });
            }
            newBlock.mounted(() => {
                var anchor = newBlock.visibleHeadAnchor;
                this.onFocusAnchor(anchor);
            });
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
        await this.page.onAction(ActionDirective.onUpdatePattern, async () => {
            // var newStart: Block, newEnd: Block;
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
                     * 实际上选区没有选区任何当前block的同容
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
                                block.updateProps(props);
                            if (block == start.block) ns = { block: block, at: start.at }
                            if (block == end.block) ne = { block: block, at: end.at }
                            return;
                        }
                        var pattern = await block.pattern.cloneData();
                        var url = BlockUrlConstant.Text;
                        if (block.isTextContent) {
                            var at = block.at;
                            var pa = block.parent;
                            /**
                             * 说明当前的block是textContent
                             */
                            if (fissContent.before) {
                                block.updateProps({ content: fissContent.before });
                                var current = await (this.page.createBlock(url, { content: fissContent.current, pattern }, pa, (at += 1)));
                                if (styles)
                                    current.pattern.setStyles(styles);
                                if (props)
                                    current.updateProps(props);
                                if (block == this.start.block) ns = { block: current, at: 0 }
                                if (block == this.end.block) ne = { block: current, at: -1 }
                                if (fissContent.after)
                                    await (this.page.createBlock(url, { content: fissContent.after, pattern }, pa, (at += 1)))
                            }
                            else {
                                block.updateProps({ content: fissContent.current });
                                if (styles)
                                    block.pattern.setStyles(styles);
                                if (props)
                                    block.updateProps(props);
                                if (block == this.start.block) ns = { block: block, at: 0 }
                                if (block == this.end.block) ne = { block: block, at: -1 }
                                await (this.page.createBlock(url, { content: fissContent.after, pattern }, pa, (at += 1)))
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
                                    current.updateProps(props);
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
                /**
                * 这时的newStart
                * newEnd是现创建的，
                * 所以对光标的操作可能得在渲染之后才可以触发
                */
                this.page.onUpdated(async () => {
                    var newStartAnchor = this.createAnchor(ns.block, ns.at);
                    newStartAnchor.acceptView(this.start);
                    this.start = newStartAnchor;
                    var newEndAnchor = this.createAnchor(ne.block, ne.at);
                    newEndAnchor.acceptView(this.end);
                    this.end = newEndAnchor;
                    this.renderSelection();
                });
            }
        });
    }
    async onOpenTextTool(this: SelectionExplorer, event: MouseEvent) {
        if (!this.selectedBlocks.first()) return;
        var lineBlock = this.selectedBlocks.first().closest(x => !x.isLine);
        if (!lineBlock.isSupportTextStyle) return;
        while (true) {
            var result = await useTextTool(this.getSelectionPoint(), {
                block: lineBlock,
                style: this.page.pickBlocksTextStyle(this.selectedBlocks)
            });
            if (result) {
                if (result.command == 'setStyle') {
                    await this.onSelectionSetPatternOrProps(result.styles);
                }
                else if (result.command == 'setProp') {
                    await this.onSelectionSetPatternOrProps(undefined, result.props);
                }
                else if (result.command == 'turn') {
                    await lineBlock.onClickContextMenu(result.item, result.event);
                    break;
                }
            }
            else break;
        }

    }
}