import lodash from "lodash";
import { Page } from "../..";
import { CloseShyAlert, ShyAlert } from "../../../../component/lib/alert";

import { channel } from "../../../../net/channel";
import { AnimatedScrollTo } from "../../../../util/animatedScrollTo";
import { Block } from "../../../block";
import { BlockChildKey, BlockUrlConstant } from "../../../block/constant";
import { Point, Rect } from "../../../common/vector/point";
import { ActionDirective, OperatorDirective} from "../../../history/declare";
import { LinkPageItem, PageLayoutType, PageTemplateTags, PageTemplateTypeGroups } from "../../declare";
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
import { BlockButton } from "../../../../blocks/interaction/button";
import { Title } from "../../../../blocks/interaction/title";
import { useForm } from "../../../../component/view/form/dialoug";
import { useExportFile } from "../../../../extensions/Import-export/export-file/lazy";
import { usePageHistoryStore } from "../../../../extensions/history";
import { usePagePublish } from "../../../../extensions/publish";
import { usePageTheme } from "../../../../extensions/theme";
import { getAiDefaultModel } from "../../../../net/ai/cost";
import { ElementType } from "../../../../net/element.type";
import { RobotInfo } from "../../../../types/user";
import { Head } from "../../../../blocks/general/head";


export class Page$Operator {
   
  
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
                if (this.pageLayout.type == PageLayoutType.ppt) {
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
                    if (this.pageLayout.type == PageLayoutType.ppt) {
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
                        if (this.pageLayout.type == PageLayoutType.ppt) {
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
        await usePagePublish({ roundArea: Rect.fromEvent(event) }, this)
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
        await channel.air('/robot/open', { robot });
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
            this.addPageUpdate();
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
                tags: tgd['tags'],
                description: tgd['description'],
                text: tgd['text'] || this.pageInfo?.text
            },
            fields: [
                { name: 'text', text: lst('标题'), type: 'input' },
                { name: 'description', text: lst('描述'), type: 'textarea' },
                {
                    name: 'tags',
                    text: lst('标签'),
                    multiple: true,
                    type: 'select',
                    options: PageTemplateTags.map(p => {
                        return {
                            text: p.text,
                            value: p.text,
                            type: p.type
                        }
                    })
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
                                config: {
                                    classify: rf.classify,
                                    tags: rf.tags
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
    async onToggleFieldView(this: Page, field: Field, checked: boolean) {
        await this.onAction('onToggleFieldView', async () => {
            if (checked) {
                var b = GetFieldFormBlockInfo(field);
                if (b) {
                    var view = this.views[0];
                    (b as any).fieldType = this.formType;
                    var newBlock = await this.createBlock(b.url, b, view, view.childs.length);
                    if (this.formRowData)
                        await newBlock.updateProps({ value: field.getValue(this.formRowData) })
                }
            }
            else {
                var f = this.find(c => (c instanceof OriginFormField) && c.field.id == field.id);
                if (f) await f.delete()
            }
        });
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
            this.addPageUpdate();
        }, { immediate: true })
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
            this.addPageUpdate();
        }, { immediate: true })
    }

   
}