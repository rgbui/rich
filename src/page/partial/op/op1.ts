import lodash from "lodash";
import { Page } from "../..";
import { CloseShyAlert, ShyAlert } from "../../../../component/lib/alert";
import { channel } from "../../../../net/channel";
import { Block } from "../../../block";
import { BlockChildKey, BlockUrlConstant } from "../../../block/constant";
import { Point, Rect } from "../../../common/vector/point";
import { ActionDirective } from "../../../history/declare";
import { LinkPageItem, PageLayoutType, PageTemplateTypeGroups } from "../../declare";
import { PageDirective } from "../../directive";
import { useTemplateView } from "../../../../extensions/template";
import { lst } from "../../../../i18n/store";
import { Matrix } from "../../../common/matrix";
import { buildPage } from "../../common/create";
import { util } from "../../../../util/util";
import { useImportFile } from "../../../../extensions/Import-export/import-file/lazy";
import { OriginFormField } from "../../../../blocks/data-grid/element/form/origin.field";
import { GetFieldFormBlockInfo } from "../../../../blocks/data-grid/element/service";
import { Field } from "../../../../blocks/data-grid/schema/field";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { useForm } from "../../../../component/view/form/dialoug";
import { useExportFile } from "../../../../extensions/Import-export/export-file/lazy";
import { usePageHistoryStore } from "../../../../extensions/history";
import { usePagePermission } from "../../../../extensions/permission";
import { usePageTheme } from "../../../../extensions/theme";
import { getAiDefaultModel } from "../../../../net/ai/cost";
import { ElementType } from "../../../../net/element.type";
import { RobotInfo } from "../../../../types/user";
import { Head } from "../../../../blocks/general/head";
import { BlockRenderRange } from "../../../block/enum";
import { onceAutoScroll } from "../../../common/scroll";
import { getTemplateInstance } from "../../../../extensions/ai/prompt";
import { BlockButton } from "../../../../blocks/interaction/button";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import React from "react";
import { PopoverPosition } from "../../../../component/popover/position";
import { useWsPicker } from "../../../../extensions/ws";



export class Page$Operator {

    async onToggleOutline(this: Page, d: { nav: boolean }) {
        await this.onAction('onToggleOutline', async () => {
            await this.updateProps({ nav: d.nav });
            if (this.requireSelectLayout == true) {
                await this.updateProps({ requireSelectLayout: false, 'pageLayout.type': PageLayoutType.doc });
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
                await this.updateProps({
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
                if (this.pageLayout.type == PageLayoutType.ppt) {
                    view = view.childs.last();
                    if ((view as any)?.board == true) view = null;
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
                    if (this.pageLayout.type == PageLayoutType.ppt) {
                        view = view.childs.last();
                        if ((view as any)?.board == true) view = null;
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
                        if (this.pageLayout.type == PageLayoutType.ppt) {
                            view = view.childs.last();
                            if ((view as any)?.board == true) view = null;
                            if (!view) view = await this.createBlock(BlockUrlConstant.CardBox, { url: BlockUrlConstant.CardBox }, view);
                        }
                        await this.createBlock(BlockUrlConstant.PageAuthor, {}, view);
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
                        if (this.pageLayout.type == PageLayoutType.ppt) {
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
                    if (this.pageLayout.type == PageLayoutType.ppt) {
                        view = view.childs.last();
                        if ((view as any)?.board == true) view = null;
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

    async onChangeTextChannelSpeak(this: Page, speak: LinkPageItem['speak']) {
        await channel.air('/page/update/info', {
            id: this.pageInfo.id,
            pageInfo: {
                speak: speak,
                speakDate: new Date()
            }
        })
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
                if (this.requireSelectLayout == true) {
                    await this.updateProps({
                        requireSelectLayout: false,
                        'pageLayout.type': PageLayoutType.doc
                    });
                }
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
                await this.updateProps(d);
            })
            this.emit(PageDirective.save);
        }
    }
    async onGridAlign(this: Page, blocks: Block[], value: string) {
        if (value == 'y' || value == 'x') {
            if (blocks.length <= 2) return;
        }
        await this.onAction('onGridAlign', async () => {
            if (['left', 'center', 'right'].includes(value)) {
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
            else if (['top', 'middle', 'bottom'].includes(value)) {
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
            else if (['x', 'y'].includes(value)) {
                if (value == 'y') {

                    blocks = blocks.sort((x, y) => {
                        var xb = x.getVisibleBound();
                        var yb = y.getVisibleBound();
                        if (xb.top < yb.top) return -1;
                        else return 1;
                    })

                    var first = blocks.first().getVisibleBound();
                    var second = blocks[1].getVisibleBound();
                    var d: number;

                    if (second.top < first.bottom) d = 40;
                    else d = second.top - first.bottom;

                    var top = second.bottom;
                    for (let i = 2; i < blocks.length; i++) {
                        var block = blocks[i];
                        var cb = block.getVisibleBound();
                        var gm = block.globalWindowMatrix;
                        var from: Point;
                        var to: Point;
                        from = gm.inverseTransform(cb.leftTop);
                        to = gm.inverseTransform(cb.leftTop.setY(top + d));

                        var moveMatrix = new Matrix();
                        moveMatrix.translateMove(from, to)
                        var newMatrix = block.currentMatrix.clone();
                        newMatrix.append(moveMatrix);
                        newMatrix.append(block.selfMatrix.inverted());
                        await block.updateMatrix(block.matrix, newMatrix);
                        block.moveMatrix = new Matrix();
                        top += d;
                        top += cb.height;
                    }
                }
                else if (value == 'x') {

                    blocks = blocks.sort((x, y) => {
                        var xb = x.getVisibleBound();
                        var yb = y.getVisibleBound();
                        if (xb.left < yb.left) return -1;
                        else return 1;
                    })
                    var first = blocks.first().getVisibleBound();
                    var second = blocks[1].getVisibleBound();
                    var d: number;

                    if (second.left < first.right) d = 40;
                    else d = second.left - first.right;

                    var left = second.right;
                    for (let i = 2; i < blocks.length; i++) {
                        var block = blocks[i];
                        var cb = block.getVisibleBound();
                        var gm = block.globalWindowMatrix;
                        var from: Point;
                        var to: Point;
                        from = gm.inverseTransform(cb.leftTop);
                        to = gm.inverseTransform(cb.leftTop.setX(left + d));
                        var moveMatrix = new Matrix();
                        moveMatrix.translateMove(from, to)
                        var newMatrix = block.currentMatrix.clone();
                        newMatrix.append(moveMatrix);
                        newMatrix.append(block.selfMatrix.inverted());
                        await block.updateMatrix(block.matrix, newMatrix);
                        left += d;
                        left += cb.width;
                    }
                }
            }
        });
    }
    async onGridRank(this: Page, blocks: Block[], value: string) {
        if (blocks.length <= 1) return;

        await this.onAction('onGridRank', async () => {
            var gap = 40;
            if (value == 'x') {
                blocks = blocks.sort((x, y) => {
                    var xb = x.getVisibleBound();
                    var yb = y.getVisibleBound();
                    if (xb.left < yb.left) return -1;
                    else return 1;
                })

                var first = blocks.first().getVisibleBound();
                var left = first.right;
                for (let i = 1; i < blocks.length; i++) {
                    var block = blocks[i];
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var from: Point;
                    var to: Point;
                    from = gm.inverseTransform(cb.leftTop);
                    var toPoint = cb.leftTop;
                    toPoint.setX(left + gap);
                    toPoint.setY(first.top);
                    to = gm.inverseTransform(toPoint);
                    var moveMatrix = new Matrix();
                    moveMatrix.translateMove(from, to)
                    var newMatrix = block.currentMatrix.clone();
                    newMatrix.append(moveMatrix);
                    newMatrix.append(block.selfMatrix.inverted());
                    await block.updateMatrix(block.matrix, newMatrix);
                    left += gap;
                    left += cb.width;
                }

            }
            else if (value == 'y') {

                blocks = blocks.sort((x, y) => {
                    var xb = x.getVisibleBound();
                    var yb = y.getVisibleBound();
                    if (xb.top < yb.top) return -1;
                    else return 1;
                })

                var first = blocks.first().getVisibleBound();
                var top = first.bottom;
                for (let i = 1; i < blocks.length; i++) {
                    var block = blocks[i];
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var from: Point;
                    var to: Point;
                    from = gm.inverseTransform(cb.leftTop);
                    var toPoint = cb.leftTop;
                    toPoint.setX(first.left)
                    toPoint.setY(top + gap);
                    to = gm.inverseTransform(toPoint);

                    var moveMatrix = new Matrix();
                    moveMatrix.translateMove(from, to)
                    var newMatrix = block.currentMatrix.clone();
                    newMatrix.append(moveMatrix);
                    newMatrix.append(block.selfMatrix.inverted());
                    await block.updateMatrix(block.matrix, newMatrix);
                    block.moveMatrix = new Matrix();
                    top += gap;
                    top += cb.height;
                }
            }
            else if (value == 'type') {
                blocks = blocks.sort((x, y) => {
                    var xb = x.getVisibleBound();
                    var yb = y.getVisibleBound();
                    if (xb.left < yb.left) return -1;
                    else return 1;
                })
                var types = blocks.distinct(x => x.url);
                var first = blocks.first().getVisibleBound();
                var left = first.left;
                var top = first.top;
                var maxHeight = -1;

                for (let i = 0; i < types.length; i++) {
                    var typeBlocks = blocks.filter(g => g.url == types[i]);
                    for (let j = 0; j < typeBlocks.length; j++) {
                        var block = typeBlocks[j];
                        var cb = block.getVisibleBound();
                        var gm = block.globalWindowMatrix;
                        var from: Point;
                        var to: Point;
                        from = gm.inverseTransform(cb.leftTop);
                        var toPoint = cb.leftTop;
                        toPoint.setY(top);
                        toPoint.setX(left);

                        to = gm.inverseTransform(toPoint);
                        var moveMatrix = new Matrix();
                        moveMatrix.translateMove(from, to)
                        var newMatrix = block.currentMatrix.clone();
                        newMatrix.append(moveMatrix);
                        newMatrix.append(block.selfMatrix.inverted());
                        await block.updateMatrix(block.matrix, newMatrix);
                        maxHeight = Math.max(cb.height, maxHeight);
                        left += gap;
                        left += cb.width;
                    }
                    left = first.left;
                    top += gap;
                    top += maxHeight;
                    maxHeight = -1;
                }

            }
            else if (value == 'grid') {

                blocks = blocks.sort((x, y) => {
                    var xb = x.getVisibleBound();
                    var yb = y.getVisibleBound();
                    if (xb.left < yb.left) return -1;
                    else return 1;
                })
                var max = 4;
                var first = blocks.first().getVisibleBound();
                var col = 0;
                var left = first.right + gap;
                var top = first.top;
                var maxHeight = -1;
                for (let i = 1; i < blocks.length; i++) {
                    if (i == 1) col = 1;
                    var block = blocks[i];
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var from: Point;
                    var to: Point;
                    from = gm.inverseTransform(cb.leftTop);
                    var toPoint = cb.leftTop;
                    toPoint.setY(top);
                    toPoint.setX(left);

                    to = gm.inverseTransform(toPoint);
                    var moveMatrix = new Matrix();
                    moveMatrix.translateMove(from, to)
                    var newMatrix = block.currentMatrix.clone();
                    newMatrix.append(moveMatrix);
                    newMatrix.append(block.selfMatrix.inverted());
                    await block.updateMatrix(block.matrix, newMatrix);
                    maxHeight = Math.max(cb.height, maxHeight);

                    if (col == max - 1) {
                        left = first.left;
                        top += gap;
                        top += maxHeight;
                        col = 0;
                        maxHeight = -1;
                    }
                    else {

                        left += gap;
                        left += cb.width;
                        col += 1;
                    }

                }



            }
        });
    }
    async onAIText(this: Page, blocks: Block[], command: string) {

        await this.onAction('onAiText', async () => {
            for (let i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                var content = block.getBlockContent();
                if (content) {
                    var text = await new Promise((resolve: (r: string) => void, reject) => {
                        var prompt = getTemplateInstance(command, { content: content });
                        var anwser = '';
                        var appears = block.findAll(c => c.appearAnchors.length > 0, true).map(c => c.appearAnchors).flat();
                        if (appears.length > 0) {
                            for (let i = 1; i < appears.length; i++)
                                appears[i].setContent('')
                            channel.post('/text/ai/stream', {
                                question: prompt,
                                model: getAiDefaultModel(this?.ws?.aiConfig?.text),
                                async callback(str, done, contoller) {
                                    if (typeof str == 'string') {
                                        anwser += str;
                                    }
                                    appears[0].setContent(anwser);
                                    if (block.page.kit.picker.blocks.some(s => s == block)) {
                                        block.page.kit.picker.onRePicker()
                                    }
                                    if (done) {
                                        resolve(anwser)
                                    }
                                }
                            });
                        }
                    })
                    await block.replaceTextContent(text);
                }
            }
        })
    }
    async onAIMind(this: Page, blocks: Block[], command: string) {
        await this.onAction('onAiText', async () => {
            for (let i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                var content = block.getBlockContent();
                if (content) {
                    await (block as any).mindAI(command, content);
                }
                else {
                    if (blocks.length == 1) {
                        ShyAlert(lst('请先输入思维导图主题'), 'warn', 1000 * 4);
                    }
                }
            }
        })
    }
    onSpreadMenu(this: Page,) {
        this.emit(PageDirective.spreadSln)
    }

    async onOpenHistory(this: Page) {
        var result = await usePageHistoryStore(this);
        if (result) {
            this.emit(PageDirective.rollup, result);
        }
    }
    async onPageCopy(this: Page) {
        await channel.act('/current/page/copy');
    }
    async onPageMove(this: Page) {
        await channel.act('/current/page/move');
    }
    async onOpenPublish(this: Page, event: React.MouseEvent) {
        await usePagePermission({ roundArea: Rect.fromEvent(event) }, this)
    }

    async onOpenMember(this: Page, event: React.MouseEvent) {
        this.showMembers = this.showMembers ? false : true;
        this.forceUpdate()
    }

    async onOpenTheme(this: Page) {
        await usePageTheme(this);
    }
    async onPageRemove(this: Page) {
        channel.air('/page/remove', { item: this.pageInfo.id });
    }
    async onOpenRobot(this: Page, robot: RobotInfo) {
        await channel.act('/robot/open', { robot });
    }
    async onSyncAi(this: Page, robot: RobotInfo, isTurn?: boolean) {
        ShyAlert(lst('正在同步中...'), 'warn', isTurn ? 1000 * 60 * 10 : 1000 * 4);
        try {
            var r = await channel.put('/sync/wiki/doc', {
                robotId: robot.robotId,
                elementUrl: this.customElementUrl,
                pageText: this.getPageDataInfo()?.text,
                contents: [{ id: util.guid(), content: await this.getMd() }]
            })
            if (isTurn) {
                if (r.ok) {
                    ShyAlert(lst('正在微调中...'), 'warn', isTurn ? 1000 * 60 * 10 : 1000 * 60 * 2);
                    await new Promise((resolve, reject) => {
                        channel.post('/fetch', {
                            url: '/robot/doc/embedding/stream',
                            data: {
                                id: r.data.doc.id,
                                model: getAiDefaultModel(robot.embeddingModel, 'embedding')
                            },
                            method: 'post',
                            callback: (str, done) => {
                                if (done) {
                                    resolve(done);
                                }
                            }
                        })
                    })

                }
            }
        }
        catch (ex) {
            this.onError(ex)
        }
        finally {
            if (isTurn)
                CloseShyAlert()
        }
    }
    async onLockPage(this: Page, lock?: boolean) {
        await this.onAction(ActionDirective.onPageLock, async () => {
            await this.updateProps({
                locker: {
                    userid: this.user?.id,
                    date: Date.now(),
                    lock: this.locker?.lock ? false : true
                }
            });
            this.notifyActionPageUpdate();
        })
    }
    async onExport(this: Page) {
        if (this.pe.type == ElementType.Schema) {
            var dg: DataGridView = this.find(g => g instanceof DataGridView) as DataGridView;
            if (dg) {
                dg.onExport()
            }
        }
        else await useExportFile({ page: this });
    }
    async onRequireTemplate(this: Page) {
        var ws = this.ws;
        var tg = await channel.get('/get/workspace/template', {
            wsId: ws.id,
            pageId: this.pageInfo?.id,
            elementUrl: this.elementUrl,
        });
        var tgd = tg.data?.template || {};
        var rf = await useForm({
            maskCloseNotSave: true,
            deleteButton: true,
            title: lst('申请模板'),
            model: {
                classify: tgd['classify'],
                tags: Array.isArray(tgd['tags']) ? tgd['tags'].join(',') : (tgd['tags'] || ''),
                description: tgd['description'],
                text: tgd['text'] || this.pageInfo?.text
            },
            fields: [
                { name: 'text', text: lst('标题'), type: 'input' },
                { name: 'description', text: lst('描述'), type: 'textarea' },
                {
                    name: 'tags',
                    text: lst('标签'), type: 'input',
                    placeholder: lst('请输入标签，用逗号或空格隔开')
                },
                {
                    name: 'classify',
                    text: lst('分类'),
                    type: 'select',
                    multiple: true,
                    options: PageTemplateTypeGroups.map(c => {
                        return {
                            text: c.text,
                            icon: c.icon,
                            value: c.text
                        }
                    })
                }
            ]
        })
        if (rf) {
            ShyAlert(rf && rf.delete == true ? lst('正在删除中...') : lst('正在申请中...'), 'warn', 1000 * 60 * 10);
            try {
                if (rf && rf.delete == true) {
                    await channel.del('/del/workspace/template', { id: tg.data.template.id });
                }
                else {
                    var g = await channel.post('/create/template', { config: { pageId: this.pageInfo?.id } })
                    if (g.ok) {
                        var r = await channel.post('/download/file', { url: g.data.file.url });
                        if (r.ok) {
                            var ts = (rf.tags || '').split(/,|，|\s/).filter(c => c);
                            lodash.remove(ts, c => c == ' ');
                            var childs = this._pageItem ? await this._pageItem.getSubItems() : [];
                            var newChilds = childs.arrayJsonToArray('childs', g => {
                                return {
                                    wsId: ws.id,
                                    pageId: g.id,
                                    mime: g.mime,
                                    pageType: g.pageType,
                                    sn: g.sn,
                                    text: g.text,
                                    icon: g.icon,
                                    elementUrl: g.elementUrl
                                }
                            });
                            console.log('newChilds', newChilds);
                            await channel.post('/create/workspace/template', {
                                wsId: ws.id,
                                pageId: this.pageInfo?.id,
                                type: 'page',
                                templateUrl: r.data.file.url,
                                elementUrl: this.elementUrl,
                                text: rf.text,
                                description: rf.description,
                                file: r.data.file,
                                icon: this.pageInfo?.icon,
                                childs: newChilds,
                                pageType: this.pageInfo?.pageType,
                                config: {
                                    classify: rf.classify,
                                    tags: ts
                                }
                            });
                        }
                    }
                }
            }
            catch (ex) {

            }
            finally {
                CloseShyAlert()
            }
        }
    }
    async onCopyPage(this: Page) {
        await channel.act('/current/page/copy');
    }
    async onMovePage(this: Page, event: React.MouseEvent) {
        await channel.act('/current/page/move', { event: event } as any);
    }

    async onTurnToPPT(this: Page) {
        await this.onAction('onTrunToPPT', async () => {

            var view = this.views.first();
            var cs = view.childs.map(v => v);
            var ns: (Block[])[] = [];
            var lastLevel = -1;
            var lastRs: Block[] = [];
            for (let i = 0; i < cs.length; i++) {
                if (cs[i].url == BlockUrlConstant.Title || cs[i].url == BlockUrlConstant.Head) {
                    if (cs[i].url == BlockUrlConstant.Title) {
                        lastLevel = -1;
                        lastRs.push(cs[i]);
                    }
                    else {
                        var level = parseFloat((cs[i] as Head).level.replace('h', ''));;
                        if (lastLevel == -1 || level >= lastLevel) {
                            lastLevel = level;
                            ns.push(lastRs);
                            lastRs = [];
                            lastRs.push(cs[i]);
                        }
                        else {
                            lastRs.push(cs[i])
                        }
                    }
                }
                else {
                    lastRs.push(cs[i])
                }
            }
            if (lastRs.length > 0) {
                ns.push(lastRs);
            }
            var ds = ns.map(c => ({ url: BlockUrlConstant.CardBox }));
            var bs = await view.appendArrayBlockData(ds, view.childs.length, BlockChildKey.childs);
            for (let j = 0; j < bs.length; j++) {
                await bs[j].appendArray(ns[j], 0, BlockChildKey.childs);
            }
            await this.updateProps({
                pageLayout: {
                    type: PageLayoutType.ppt
                }
            })
            await channel.air('/page/update/info', { id: this.pageInfo?.id, pageInfo: { pageType: this.pageLayout.type } });
            this.notifyActionPageUpdate();
        }, { immediate: true, disabledJoinHistory: true })
    }
    async onTurnToDoc(this: Page) {
        await this.onAction('onTurnToDoc', async () => {
            var view = this.views[0];
            var cs = view.childs.findAll(c => c.url == BlockUrlConstant.CardBox);
            for (let i = 0; i < cs.length; i++) {
                await view.appendArray(cs[i].childs, view.childs.length, BlockChildKey.childs);
            }
            for (let j = 0; j < cs.length; j++) {
                await cs[j].delete();
            }
            await this.updateProps({
                pageLayout: {
                    type: PageLayoutType.doc
                }
            })
            await channel.air('/page/update/info', { id: this.pageInfo?.id, pageInfo: { pageType: this.pageLayout.type } });
            this.notifyActionPageUpdate();
        }, { immediate: true, disabledJoinHistory: true })
    }

    async onTab(this: Page, blocks: Block[], isShift: boolean = false) {
        var min = blocks.findMin(c => c.at);
        var max = blocks.findMax(c => c.at);
        var prev = min.prev;
        var isWillTab = false;

        var hs = (b: Block) => {
            if (!b) return false;
            if (b.hasSubChilds) return true;
            else {
                if (b.url == BlockUrlConstant.TextSpan) return true;
            }
            return false;
        }
        if (isShift && hs(min.parent)) {
            isWillTab = true;
        }
        else if (prev && hs(prev)) {
            isWillTab = true;
        }
        if (isWillTab) {

            await this.onAction('onTab', async () => {
                if (isShift) {
                    if (hs(max)) {
                        var pa = min.parent;
                        var rest = pa.subChilds.findAll((item, i) => i > max.at);
                        await pa.parent.appendArray(blocks, pa.at + 1, pa.parentKey);
                        await max.appendArray(rest, 0, 'subChilds');
                    }
                    else {
                        var pa = min.parent;
                        await pa.parent.appendArray(blocks, pa.at + 1, pa.parentKey);
                    }
                }
                else {
                    await prev.appendArray(blocks, 0, 'subChilds');
                }
                this.addActionAfterEvent(async () => {
                    this.kit.anchorCursor.onSelectBlocks(blocks, { render: true, merge: true });
                })
            })
        }
    }

    async onInterchange(this: Page, blocks: Block[], arrow: 'down' | 'up'
    ) {
        var first = blocks.first();
        var last = blocks.last();
        if (first?.url == BlockUrlConstant.Title || last?.url == BlockUrlConstant.Title) return;
        await this.onAction('onInterchange', async () => {
            if (first !== last) {
                if (first.el && last.el && first.getVisibleBound().top > last.getVisibleBound().top) {
                    [first, last] = [last, first]
                }
            }
            // console.log(arrow)
            if (arrow == 'down') {
                var block = last;
                var next = block.nextFind(x => x.isContentBlock);
                // console.log(next);
                if (next) {
                    var br = next?.closest(x => x.isContentBlock)?.frameBlock;
                    if (!br) onceAutoScroll({ el: next.el, feelDis: 60, dis: 120 })
                    await next.parent.appendArray(blocks, next.at + 1, next.parentKey);

                }
            }
            else if (arrow == 'up') {
                var block = first;
                var pre = block.prevFind(x => x.isContentBlock);
                if (pre) {
                    var br = pre?.closest(x => x.isContentBlock)?.frameBlock;
                    if (!br) onceAutoScroll({ el: pre.el, feelDis: 60, dis: 120 })
                    await pre.parent.appendArray(blocks, pre.at, pre.parentKey);
                }
            }
            this.addActionAfterEvent(async () => {
                this.kit.anchorCursor.onSelectBlocks(blocks, {
                    render: true,
                    merge: true,
                    scroll: arrow == 'down' ? "bottom" : 'top'
                });
            })
        });
    }
    async onBlocksToggle(this: Page, blocks: Block[]) {
        var bs = blocks.findAll(g => g.url == BlockUrlConstant.List && (g as any).listType == 2 || g.url == BlockUrlConstant.Head && (g as any).toggle == true);
        if (bs.length > 0) {
            await this.onAction('BlocksToggle', async () => {
                for (let i = 0; i < bs.length; i++) {
                    await bs[i].updateProps({ expand: !(bs[i] as any).expand }, BlockRenderRange.self);
                }
                this.addActionAfterEvent(async () => {
                    this.kit.anchorCursor.onSelectBlocks(bs)
                })
            })
        }
    }
    onBlocksSolidInput(this: Page, blocks: Block[]) {
        var b = blocks.find(g =>
            g.url == BlockUrlConstant.List && (g as any).listType == 2
            ||
            g.url == BlockUrlConstant.Head && (g as any).toggle == true
            || g.url == BlockUrlConstant.Todo
            || g.url == BlockUrlConstant.Image
            || g.url == BlockUrlConstant.Video
            || g.url == BlockUrlConstant.Link
        );
        if (b) {
            if (b.url == BlockUrlConstant.List || b.url == BlockUrlConstant.Head) {
                (b as any).onExpand();
            }
            else if (b.url == BlockUrlConstant.Todo) {
                (b as any).onChange();
            }
            else if (b.url == BlockUrlConstant.Link) {
                (b as any).openPage();
            }
            else if (b.url == BlockUrlConstant.Image) {
                (b as any).openPreview()
            }
            else if (b.url == BlockUrlConstant.Video) {

            }
            return true;
        }
    }
    async onMergeBlocks(this: Page, blocks: Block[]) {
        this.onAction('onMergeBlocks', async () => {
            var first = blocks.first();
            var newBlock = await this.createBlock(BlockUrlConstant.Group, {
            },
                first.parent,
                first.at,
                first.parentKey
            );
            await (newBlock as any).mergeBlocks(blocks);
            newBlock.mounted(() => {
                this.kit.picker.onPicker([newBlock], { disabledOpenTool: false, merge: true })
            })
        })
    }
    async onCopyPageTemplate(this: Page, event: React.MouseEvent) {
        var pos: PopoverPosition;
        if (!this.pageInfo) {
            ShyAlert(lst('无法复制模板'), 'warn');
            return;
        }
        pos = { center: true, centerTop: 100 };
        var r = await useWsPicker(pos);
        if (r) {
            ShyAlert(lst('正在复制拷贝中...'), 'warn', 1000 * 60 * 5);
            var g = await channel.post('/create/template', {
                wsId: this.ws?.id,
                config: { pageId: this.pageInfo?.id }
            })
            if (g.ok) {
                var rr = await channel.post('/import/page', {
                    text: this.pageInfo?.text,
                    templateUrl: g.data.file.url,
                    wsId: r.id
                });
                if (rr.ok) {
                    ShyAlert(lst('复制拷贝成功'))
                    return;
                }
            }
            CloseShyAlert();
        }
    }
}