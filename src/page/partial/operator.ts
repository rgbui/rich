import lodash from "lodash";
import { Page } from "..";
import { CopyText } from "../../../component/copy";
import { CloseShyAlert, ShyAlert } from "../../../component/lib/alert";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem } from "../../../component/view/menu/declare";
import { channel } from "../../../net/channel";
import { AnimatedScrollTo } from "../../../util/animatedScrollTo";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockChildKey, BlockUrlConstant } from "../../block/constant";
import { BlockDirective } from "../../block/enum";
import { BlockFactory } from "../../block/factory/block.factory";
import { Point, Rect } from "../../common/vector/point";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { storeCopyBlocks } from "../common/copy";
import { LinkPageItem, PageLayoutType } from "../declare";
import { PageDirective } from "../directive";
import { useTemplateView } from "../../../extensions/template";
import { lst } from "../../../i18n/store";
import { Matrix } from "../../common/matrix";
import { useImportFile } from "../../../extensions/import-file";
import { buildPage } from "../common/create";

export class Page$Operator {
    /**
    * 创建一个block
    * @param url 
    * @param data 
    * @param parent 
    * @param at 
    * 
    */
    async createBlock(this: Page, url: string, data: Record<string, any>, parent: Block, at?: number, childKey?: string) {
        var block = await BlockFactory.createBlock(url, this, data, parent);
        if (parent) {
            if (typeof childKey == 'undefined') childKey = block.isLine ? BlockChildKey.childs : (parent?.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
            if (!parent.allBlockKeys.some(s => s == childKey)) {
                console.error(`${parent.url} not support childKey:${childKey}`);
                childKey = parent.allBlockKeys[0];
            }
            var bs = parent.blocks[childKey];
            if (!Array.isArray(bs)) parent.blocks[childKey] = bs = [];
            if (typeof at == 'undefined' || at == -1) at = bs.length;
            bs.insertAt(at, block);
            await block.created();
            this.snapshoot.record(OperatorDirective.$create, {
                pos: block.pos,
                data: await block.get()
            }, block);
            this.monitorBlockOperator(block, 'create');
            this.addBlockUpdate(parent);
            this.addBlockChange(block);
        }
        else {
            if (typeof at == 'undefined')
                this.views.push(block);
            else this.views.splice(at, 0, block);
            await block.created();
            this.snapshoot.record(OperatorDirective.$create, {
                pos: block.pos,
                data: await block.get()
            }, block);
            this.monitorBlockOperator(block, 'create');
            this.addPageUpdate();
        }
        await block.loadSyncBlock();
        return block;
    }
    async onCreateTailTextSpan(this: Page, panel?: Block) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.onAction(ActionDirective.onCreateTailTextSpan, async () => {
                    panel = panel || this.views[0];
                    var lastBlock = panel.findReverse(g => g.isBlock);
                    var newBlock: Block;
                    if (lastBlock && lastBlock.parent == panel) {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, lastBlock.parent, lastBlock.at + 1);
                    }
                    else {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, panel);
                    }
                    newBlock.mounted(() => {
                        this.kit.anchorCursor.onFocusBlockAnchor(newBlock, { last: true, render: true, merge: true });
                        resolve(true);
                    })
                })
            }
            catch (ex) {
                this.onError(ex);
                reject(ex);
            }
        })
    }
    async onBatchDelete(this: Page, blocks: Block[]) {
        blocks = blocks.toArray(c => c);
        lodash.remove(blocks, c => c.url == BlockUrlConstant.Title);
        if (blocks.length > 0)
            await this.onAction(ActionDirective.onBatchDeleteBlocks, async () => {
                var pre = blocks.first().prevFind(c => c.isVisible && !blocks.includes(c) && !blocks.some(s => s.exists(g => g.id == c.id)) && c.isBlock);
                if (!pre) blocks.first().nextFind(c => c.isVisible && !blocks.includes(c) && !blocks.some(s => s.exists(g => g.id == c.id)) && c.isBlock);
                if (pre) {
                    this.kit.anchorCursor.focusBlockAnchor(pre, { last: true, render: true })
                }
                if (this.kit.picker.blocks.some(s => blocks.some(c => c == s))) {
                    this.kit.picker.blocks.removeAll(s => blocks.includes(s));
                    if (this.kit.picker.blocks.length == 0) {
                        this.kit.picker.onCancel();
                    }
                    else this.kit.picker.onRePicker();
                }
                await blocks.eachAsync(async bl => {
                    await bl.delete()
                });

            })
    }
    async onTurn(this: Page, block: Block, url: string, callback: (newBlock: Block, oldBlock: Block) => void) {
        await this.onAction(ActionDirective.onTurn, async () => {
            var oldBlock = block;
            var newBlock = await block.turn(url);
            callback(newBlock, oldBlock);
        });
    }
    async onReplace(this: Page, block: Block, blockData: (Record<string, any> | Block) | ((Record<string, any> | Block)[])) {
        if (!Array.isArray(blockData)) blockData = [blockData];
        await this.onAction(ActionDirective.onReplace, async () => {
            if (blockData[0] instanceof Block) await await block.replace(blockData as Block[]);
            else await block.replaceDatas(blockData as Record<string, any>[]);
        });
    }
    async onBatchTurn(this: Page, blocks: Block[], url: string) {
        var bs: Block[] = [];
        await this.onAction(ActionDirective.onBatchTurn, async () => {
            await blocks.eachAsync(async bl => {
                var newBlock = await bl.turn(url);
                bs.push(newBlock);
            })
        });
        return bs;
    }
    async onCombineLikeTextSpan(this: Page, block: Block, willCombineBlock: Block, after?: () => Promise<void>) {
        await this.onAction(ActionDirective.combineTextSpan, async () => {
            if (willCombineBlock.childs.length > 0) {
                if (block.content && block.childs.length == 0) {
                    await this.createBlock(BlockUrlConstant.Text, { content: block.content }, block, 0);
                    await block.updateProps({ content: '' });
                }
                var cs = willCombineBlock.childs.map(c => c);
                await cs.eachAsync(async (c) => {
                    await block.append(c)
                })
            }
            else {
                if (block.content && block.childs.length == 0) {
                    await this.createBlock(BlockUrlConstant.Text, { content: block.content }, block, 0);
                    await block.updateProps({ content: '' });
                }
                if (willCombineBlock.content) {
                    await this.createBlock(BlockUrlConstant.Text, { content: willCombineBlock.content }, block, block.childs.length);
                }
            }
            if (willCombineBlock.hasSubChilds && willCombineBlock.subChilds.length > 0) {
                if (block.hasSubChilds) {
                    await block.appendArray(willCombineBlock.subChilds, undefined, BlockChildKey.subChilds)
                }
                else {
                    await block.parent.appendArray(willCombineBlock.subChilds, block.at + 1, block.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs)
                }
            }
            await willCombineBlock.delete();
            if (typeof after == 'function') {
                await after();
            }
        });
    }
    onBlurAnchor(this: Page, anchor: AppearAnchor) {
        if (anchor.block) {
            anchor.block.blurAnchor(anchor);
        }
        this.emit(PageDirective.blurAnchor, anchor);
    }
    onFocusAnchor(this: Page, anchor: AppearAnchor) {
        if (anchor.block) {
            anchor.block.focusAnchor(anchor);
        }
        this.emit(PageDirective.focusAnchor, anchor);
    }
    /**
     * 批量将block拖到另一个block
     * @param this 
     * @param blocks 
     * @param to 
     * @param arrow 
     */
    async onBatchDragBlocks(this: Page, blocks: Block[], to: Block, direction: DropDirection) {
        /**
         * 就是将blocks append 到to 下面
         */
        await this.onAction(ActionDirective.onBatchDragBlocks, async () => {
            if (this.keyboardPlate.isAlt()) {
                var blockDatas = await blocks.asyncMap(async b => b.cloneData());
                var bs = await to.dropBlockDatas(blockDatas, direction);
                this.addUpdateEvent(async () => {
                    this.kit.anchorCursor.onSelectBlocks(bs, { render: true, merge: true });
                })
            }
            else {
                await to.drop(blocks, direction);
                this.addUpdateEvent(async () => {
                    this.kit.anchorCursor.onSelectBlocks(blocks, { render: true, merge: true });
                })
            }
        })
    }
    async onBatchDragCreateBlocks(this: Page, blocks: any[], to: Block, direction: DropDirection) {
        /**
        * 就是将blocks append 到to 下面
        */
        await this.onAction(ActionDirective.onBatchDragBlockDatas, async () => {
            await to.dropBlockDatas(blocks, direction);
        })
    }
    /**
     * 对block打开右键菜单
     * @param this 
     * @param blocks 
     * @param event 
     */
    async onOpenMenu(this: Page, blocks: Block[], event: MouseEvent | Point) {
        if (!(event instanceof Point))
            event.preventDefault();
        if (blocks.length == 1) {
            console.log('gggg', blocks);
            try {
                return await blocks[0].onContextmenu(event);
            }
            catch (ex) {
                console.error(ex)
                return;
            }
        }
        var re = await useSelectMenuItem(
            {
                roundPoint: event instanceof Point ? event : Point.from(event),
                direction: 'left'
            },
            await blocks[0].onGetContextMenus(),
            {
                input: (e) => {
                    blocks[0].onContextMenuInput(e)
                }
            }
        );
        if (re) {
            if (blocks.length == 1) await blocks[0].onClickContextMenu(re.item, re.event);
            else await this.onClickBatchBlocksContextMenu(blocks, re.item, re.event)
        }
    }
    async onClickBatchBlocksContextMenu(this: Page, blocks: Block[], item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                this.onBatchDelete(blocks);
                break;
            case BlockDirective.copy:
                /**
                 * 复制块
                 */
                this.onAction(ActionDirective.onCopyBlock, async () => {
                    var bs = await blocks.asyncMap(async b => b.cloneData());
                    var at = blocks[0].at;
                    var to = blocks.last().at;
                    var pa = blocks[0].parent;
                    var newBlocks = await pa.appendArrayBlockData(bs, Math.max(at, to) + 1, blocks.first().parentKey);
                    this.addUpdateEvent(async () => {
                        this.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true, merge: true });
                    })
                });
                break;
            case BlockDirective.link:
                CopyText(blocks[0].blockUrl);
                ShyAlert(lst('块的链接已复制'))
                break;
            case BlockDirective.trun:
                this.onBatchTurn(blocks, item.url);
                break;
            case BlockDirective.trunIntoPage:
                break;
            case 'fontColor':
                this.onAction('setFontStyle', async () => {
                    await blocks.eachAsync(async (block) => {
                        block.pattern.setFontStyle({ color: item.value });
                        this.addBlockUpdate(block);
                    })
                })
                break;
            case 'fillColor':
                this.onAction('setFillStyle', async () => {
                    await blocks.eachAsync(async (block) => {
                        block.pattern.setFillStyle({ mode: 'color', color: item.value })
                        this.addBlockUpdate(block);
                    })
                })
                break;
            case 'askAi':
                this.kit.writer.onAskAi(blocks)
                break;
        }
    }
    async onToggleOutline(this: Page, d: { nav: boolean }) {
        await this.onAction('onToggleOutline', async () => {
            await this.updateProps({ nav: d.nav });
            if (this.requireSelectLayout == true) {
                this.updateProps({ requireSelectLayout: false, 'pageLayout.type': PageLayoutType.doc });
            }
            if (d.nav == false) {
                if (this.views.length > 1)
                    await this.views.findAll((g, i) => i > 0).eachReverseAsync(async (b) => {
                        await b.delete()
                    })
            }
            else {
                if (this.views.length == 1)
                    await this.createBlock(BlockUrlConstant.View,
                        {
                            url: BlockUrlConstant.View,
                            blocks: { childs: [{ url: BlockUrlConstant.Outline }] }
                        },
                        undefined,
                        undefined,
                        undefined
                    )
                else {
                    await this.createBlock(BlockUrlConstant.Outline,
                        { url: BlockUrlConstant.Outline },
                        this.views[1]
                    )
                }
            }
        })
        this.forceUpdate();
    }
    async onToggleRefPages(this: Page, d: { refPages: boolean }) {
        await this.onAction('onToggleRefPages', async () => {
            await this.updateProps({ autoRefPages: d.refPages });
            if (this.requireSelectLayout == true) {
                this.updateProps({
                    requireSelectLayout: false,
                    'pageLayout.type': PageLayoutType.doc
                });
            }
            if (d.refPages == false) {
                var r = this.find(g => g.url == BlockUrlConstant.RefLinks);
                if (r) await r.delete()
            }
            else {
                var view = this.views[0];
                if (this.pageLayout.type == PageLayoutType.docCard) {
                    view = view.childs.last();
                    if (!view) view = await this.createBlock(BlockUrlConstant.CardBox, { url: BlockUrlConstant.CardBox }, view);
                }
                await this.createBlock(BlockUrlConstant.RefLinks, { url: BlockUrlConstant.RefLinks }, view, view.childs.length, 'childs');
            }
        })
        this.forceUpdate();
    }
    async onToggleComments(this: Page, toggle: boolean) {
        var cs = this.findAll(c => c.url == BlockUrlConstant.Comment);
        if (toggle == true && cs.length == 1) return;
        if (toggle == false && cs.length == 0) return;
        await this.onAction('onToggleComments', async () => {
            if (toggle == true) {
                if (cs.length == 0) {
                    var view = this.views[0];
                    if (this.pageLayout.type == PageLayoutType.docCard) {
                        view = view.childs.last();
                        if (!view) view = await this.createBlock(BlockUrlConstant.CardBox, { url: BlockUrlConstant.CardBox }, view);
                    }
                    await this.createBlock(BlockUrlConstant.Comment, {}, view);
                }
                else if (cs.length > 1) {
                    await cs.findAll((g, i) => i > 0).eachAsync(async c => c.delete());
                }
            }
            else if (toggle == false) {
                await cs.eachAsync(async c => c.delete())
            }
        })
    }
    async onTogglePageAuthor(this: Page, toggle: boolean) {
        var cs = this.findAll(c => c.url == BlockUrlConstant.PageAuthor);
        if (toggle == true && cs.length == 1) return;
        if (toggle == false && cs.length == 0) return;
        await this.onAction('onTogglePageAuthor', async () => {
            if (toggle == true) {
                if (cs.length == 0) {
                    var view = this.views[0];
                    var title = view.find(g => g.url == BlockUrlConstant.Title);
                    if (title) {
                        await title.visibleDownCreateBlock(BlockUrlConstant.PageAuthor, {})
                    }
                    else {
                        if (this.pageLayout.type == PageLayoutType.docCard) {
                            view = view.childs.last();
                            if (!view) view = await this.createBlock(BlockUrlConstant.CardBox, { url: BlockUrlConstant.CardBox }, view);
                        } await this.createBlock(BlockUrlConstant.PageAuthor, {}, view);
                    }
                }
                else if (cs.length > 1) {
                    await cs.findAll((g, i) => i > 0).eachAsync(async c => c.delete());
                }
            }
            else if (toggle == false) {
                await cs.eachAsync(async c => c.delete())
            }
        })
    }
    async onToggleUpvotedOrShared(this: Page, toggle: boolean) {
        var cs = this.findAll(c => c.url == BlockUrlConstant.PageUpvotedOrShared);
        if (toggle == true && cs.length == 1) return;
        if (toggle == false && cs.length == 0) return;
        await this.onAction('onToggleUpvotedOrShared', async () => {
            if (toggle == true) {
                if (cs.length == 0) {
                    var view = this.views[0];
                    var comment = view.find(c => c.url == BlockUrlConstant.Comment);
                    if (comment) {
                        await comment.visibleUpCreateBlock(BlockUrlConstant.PageUpvotedOrShared, {})
                    }
                    else {
                        if (this.pageLayout.type == PageLayoutType.docCard) {
                            view = view.childs.last();
                            if (!view) view = await this.createBlock(BlockUrlConstant.CardBox, { url: BlockUrlConstant.CardBox }, view);
                        } await this.createBlock(BlockUrlConstant.PageUpvotedOrShared, {}, view);
                    }
                }
                else if (cs.length > 1) {
                    await cs.findAll((g, i) => i > 0).eachAsync(async c => c.delete());
                }
            }
            else if (toggle == false) {
                await cs.eachAsync(async c => c.delete())
            }
        })
    }
    async onTogglePrevOrNext(this: Page, toggle: boolean) {
        var cs = this.findAll(c => c.url == BlockUrlConstant.PagePreOrNext);
        if (toggle == true && cs.length == 1) return;
        if (toggle == false && cs.length == 0) return;
        await this.onAction('onToggleComments', async () => {
            if (toggle == true) {
                if (cs.length == 0) {
                    var view = this.views[0];
                    if (this.pageLayout.type == PageLayoutType.docCard) {
                        view = view.childs.last();
                        if (!view) view = await this.createBlock(BlockUrlConstant.CardBox, { url: BlockUrlConstant.CardBox }, view);
                    }
                    await this.createBlock(BlockUrlConstant.PagePreOrNext, {}, view);
                }
                else if (cs.length > 1) {
                    await cs.findAll((g, i) => i > 0).eachAsync(async c => c.delete());
                }
            }
            else if (toggle == false) {
                await cs.eachAsync(async c => c.delete())
            }
        })
    }
    async onCopyBlocks(this: Page, blocks: Block[]) {
        await storeCopyBlocks(blocks);
    }
    async onCutBlocks(this: Page, blocks: Block[]) {
        await storeCopyBlocks(blocks);
        await this.onBatchDelete(blocks);
    }
    async onChangeTextChannel(this: Page, mode: LinkPageItem['textChannelMode']) {
        await channel.air('/page/update/info', {
            id: this.pageInfo.id,
            pageInfo: {
                textChannelMode: mode
            }
        })
        this.forceUpdate()
    }
    async onChangeTextChannelSpeak(this: Page, speak: LinkPageItem['speak']) {
        await channel.air('/page/update/info', {
            id: this.pageInfo.id,
            pageInfo: {
                speak: speak,
                speakDate: new Date()
            }
        })
    }
    async onPageScroll(this: Page, block: Block) {
        try {
            var panelEl = this.getScrollDiv();
            var offset = panelEl.scrollTop;
            var blockRect = block.getVisibleBound();
            var panelElRect = Rect.fromEle(panelEl);
            var d = blockRect.top - panelElRect.top;
            AnimatedScrollTo(panelEl, offset + d)
        }
        catch (ex) {
            console.error(ex);
            this.onError(ex);
        }
    }
    async onOpenTemplate(this: Page) {
        var ut = await useTemplateView();
        if (ut) {
            ShyAlert(lst('正在创建中...'), 'warn', 1000 * 60 * 10);
            try {
                var rr = await channel.post('/import/page', {
                    templateUrl: ut.file?.url,
                    wsId: this.ws.id,
                    pageId: this.pageInfo?.id
                });
                if (rr.ok) {
                    if (!this.pageInfo?.text) {
                        await channel.air('/page/update/info', {
                            id: this.pageInfo.id,
                            pageInfo: {
                                text: ut.text
                            }
                        })
                    }
                    this.emit(PageDirective.syncItems)
                }
            }
            catch (ex) {
                this.onError(ex);
            }
            finally {
                CloseShyAlert()
            }
        }
    }
    async onOpenImport(this: Page) {
        var r = await useImportFile({ page: this });
        if (r?.blocks) {
            var pa = await buildPage(r.blocks, { isTitle: true }, this.ws);
            var d = await pa.get();
            await this.onAction('onOpenImport', async () => {
                var vs = lodash.cloneDeep(d.views);
                var vo = vs[0];
                delete d.views;
                delete d.id;
                delete d.sourceItemId;
                delete d.loadElementUrl;
                var view = this.views.first();
                for (let v of view.childs) {
                    await v.delete();
                }
                await this.createBlock(vo.url, vo, view, 0, BlockChildKey.childs);
                if (r.text && !this.getPageDataInfo()?.text) {
                    await this.onUpdatePageTitle(r.text);
                }
                await this.onUpdateProps(d, true);
            })
            this.emit(PageDirective.save);
        }
    }
    async onGridAlign(this: Page, blocks: Block[], command: string, value: string) {
        await this.onAction('onGridAlign', async () => {
            if (command == 'grid-align') {
                var b = blocks.first().getVisibleBound();
                for (let i = 1; i < blocks.length; i++) {
                    var block = blocks[i]
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var from: Point;
                    var to: Point;
                    if (value == 'left') {
                        from = gm.inverseTransform(cb.leftTop);
                        to = gm.inverseTransform(b.leftTop.setY(cb.top));
                    }
                    else if (value == 'center') {
                        from = gm.inverseTransform(cb.topCenter);
                        to = gm.inverseTransform(b.topCenter.setY(cb.top));
                    }
                    else if (value == 'right') {
                        from = gm.inverseTransform(cb.rightTop);
                        to = gm.inverseTransform(b.rightTop.setY(cb.top));
                    }
                    var moveMatrix = new Matrix();
                    moveMatrix.translateMove(from, to)
                    var newMatrix = block.currentMatrix.clone();
                    newMatrix.append(moveMatrix);
                    newMatrix.append(block.selfMatrix.inverted());
                    await block.updateMatrix(block.matrix, newMatrix);
                    block.moveMatrix = new Matrix();
                }
            }
            else if (command == 'grid-valign') {
                var b = blocks.first().getVisibleBound();
                for (let i = 1; i < blocks.length; i++) {
                    var block = blocks[i]
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var from: Point;
                    var to: Point;
                    if (value == 'top') {
                        from = gm.inverseTransform(cb.leftTop);
                        to = gm.inverseTransform(b.leftTop.setX(cb.left));
                    }
                    else if (value == 'middle') {
                        from = gm.inverseTransform(cb.topCenter);
                        to = gm.inverseTransform(b.topCenter.setX(cb.left));
                    }
                    else if (value == 'bottom') {
                        from = gm.inverseTransform(cb.leftBottom);
                        to = gm.inverseTransform(b.leftBottom.setX(cb.left));
                    }
                    var moveMatrix = new Matrix();
                    moveMatrix.translateMove(from, to)
                    var newMatrix = block.currentMatrix.clone();
                    newMatrix.append(moveMatrix);
                    newMatrix.append(block.selfMatrix.inverted());
                    await block.updateMatrix(block.matrix, newMatrix);
                    block.moveMatrix = new Matrix();
                }
            }
            else if (command == 'grid-distribute') {
                if (value == 'y') {
                    var first = blocks.first().getVisibleBound();
                    var second = blocks[1].getVisibleBound();
                    var d = second.top - first.bottom;
                    var h = first.height + d + second.height;
                    for (let i = 2; i < blocks.length; i++) {
                        var block = blocks[i];
                        var cb = block.getVisibleBound();
                        var gm = block.globalWindowMatrix;
                        var cb = block.getVisibleBound();
                        var gm = block.globalWindowMatrix;
                        var from: Point;
                        var to: Point;
                        from = gm.inverseTransform(cb.leftTop);
                        to = gm.inverseTransform(cb.leftTop.setY(h + d));
                        var moveMatrix = new Matrix();
                        moveMatrix.translateMove(from, to)
                        var newMatrix = block.currentMatrix.clone();
                        newMatrix.append(moveMatrix);
                        newMatrix.append(block.selfMatrix.inverted());
                        await block.updateMatrix(block.matrix, newMatrix);
                        block.moveMatrix = new Matrix();
                        h += d;
                        h += cb.height;
                    }
                }
                else if (value == 'x') {
                    var first = blocks.first().getVisibleBound();
                    var second = blocks[1].getVisibleBound();
                    var d = second.left - first.left;
                    var h = first.width + d + second.width;
                    for (let i = 2; i < blocks.length; i++) {
                        var block = blocks[i];
                        var cb = block.getVisibleBound();
                        var gm = block.globalWindowMatrix;
                        var cb = block.getVisibleBound();
                        var gm = block.globalWindowMatrix;
                        var from: Point;
                        var to: Point;
                        from = gm.inverseTransform(cb.leftTop);
                        to = gm.inverseTransform(cb.leftTop.setX(h + d));
                        var moveMatrix = new Matrix();
                        moveMatrix.translateMove(from, to)
                        var newMatrix = block.currentMatrix.clone();
                        newMatrix.append(moveMatrix);
                        newMatrix.append(block.selfMatrix.inverted());
                        await block.updateMatrix(block.matrix, newMatrix);
                        block.moveMatrix = new Matrix();
                        h += d;
                        h += cb.width;
                    }
                }
            }
        });
    }
}