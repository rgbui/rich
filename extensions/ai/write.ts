import lodash from "lodash";
import { Block } from "../../src/block";
import { Page } from "../../src/page";
import { BlockUrlConstant } from "../../src/block/constant";
import { AppearAnchor } from "../../src/block/appear";
import { AITool } from ".";
import { InputForceStore, InputStore } from "../../src/kit/write/store";
import { ListType } from "../../blocks/present/list/list";
import { TextCode } from "../../blocks/media/code/code";
import { util } from "../../util/util";
import { mergeCode } from "./util";
import { ResourceArguments } from "../icon/declare";

export class AiWrite {
    parentBlock: Block = null;
    block: Block;
    page: Page;
    aa: AppearAnchor;
    tool: AITool;
    constructor(tool: AITool) {
        this.tool = tool;
    }
    open(block: Block) {
        this.writedBlocks = [];
        this.text = '';
        this.willWriteBlock = false;
        this.aa = null;
        this.block = block;
        this.page = block.page;
        if (this.block.isContentEmpty) {
            this.aa = this.block.appearAnchors.last()
            this.writedBlocks.push(this.block);
        }
    }
    selection(blocks: Block[]) {
        this.writedBlocks = [];
        this.text = '';
        this.willWriteBlock = false;
        this.aa = null;
        this.block = null;
        this.page = blocks[0].page;
    }
    text: string = '';
    willWriteBlock: boolean = false;
    writedBlocks: Block[] = [];
    currentTable: { head: string[], isWriteTable: boolean } = { head: [], isWriteTable: false }
    async write() {
        try {
            if (this.willWriteBlock) return;
            if (!this.text) return;
            if (window.shyConfig.isDev)
                console.log('will write', this.text);
            var text = '';
            /**
             * 这里表示正在写入表格，
             * 需要判断是否当前行，读完，还是表格本身是完毕了。
             */
            if (this.currentTable.isWriteTable) {
                if (await this.writeTableRow() === false) return;
            }
            if (this.text.indexOf('|') > 0) {
                var at = this.text.indexOf('|')
                text = this.text.slice(0, at);
                this.text = this.text.slice(at);
            }
            else if (this.text.startsWith('|')) {
                //说明有可能是表格
                // | 年份 | GDP增长率 |\n| ---- | ---------- |\n
                var table_lines = this.text.split(/\r\n|\n\n|\n\r|\n|\r/g);
                var isH = false, isR = false;
                var head = (table_lines[0] || '').trim();
                var row = (table_lines[1] || '').trim()
                if (head.match(/^\|([^\|]+\|)+$/)) isH = true
                if (row.match(/^\|( *[\-:]+ *\|)+$/)) isR = true;
                var isNotLikeTable = false;
                if (isH && isR) {
                    //说明满足表格的条件
                    var hs = head.slice(1, -1).split(`|`).map(g => g.trim());
                    var ts = row.slice(1, -1).split(`|`).map(g => g.trim());
                    if (ts.length < hs.length) return;
                    if (ts.length == hs.length) {
                        this.currentTable.isWriteTable = true;
                        this.currentTable.head = hs;
                        this.text = table_lines.slice(2).join("\n") || '';
                        this.willWriteBlock = true;
                        this.page.onAction('AIWriteTable', async () => {
                            var block = this.block;
                            var at = block.at;
                            var bs = await block.parent.appendArrayBlockData([{
                                url: BlockUrlConstant.Table,
                                cols: hs.map(c => { return { width: 150 } }),
                                blocks: {
                                    childs: [{
                                        url: '/table/row',
                                        blocks: {
                                            childs: hs.map(c => {
                                                return {
                                                    url: '/table/cell',
                                                    blocks: {
                                                        childs: [{
                                                            url: BlockUrlConstant.TextSpan,
                                                            content: c
                                                        }]
                                                    }
                                                }
                                            })
                                        }
                                    }]
                                }
                            }], at + 1, block.parent.hasSubChilds ? 'subChilds' : 'childs');
                            this.writedBlocks.push(...bs);
                            if (block.isContentEmpty) await block.delete()
                            lodash.remove(this.writedBlocks, c => c === block);
                            this.block = bs.last();
                            this.page.addUpdateEvent(async () => {
                                this.tool.updatePosition({ pos: { relativeEleAutoScroll: this.block.el, roundArea: this.block.getVisibleBound() } })
                                await util.delay(100)
                                this.willWriteBlock = false;
                            })
                        })
                        return;
                    }
                }
                else {
                    //说明不满足表格，这里需要判断是否是表格特征，如果不是放行
                    if (row && !isH) isNotLikeTable = true;
                    if (table_lines.length >= 3 && (!isR || !isH)) isNotLikeTable = true;
                    if (!isNotLikeTable) return;
                    text = this.text;
                    this.text = '';
                }
            }
            else {
                text = this.text;
                this.text = '';
            }
            this.willWriteBlock = true;
            var ts = text.split(/\r\n|\n\n|\n\r|\n|\r/g);
            lodash.remove(ts, g => typeof g == 'undefined');
            if (ts.length == 0) return;
            if (this.block && (this.block as any).codeFinished !== true && this.block.url == BlockUrlConstant.Code) {
                // console.log('collect code', ts);
                var at = ts.findIndex(g => g.match(/```/) ? true : false)
                if (at > -1) {
                    var tg = ts[at];
                    var prev = '', next = '';
                    if (tg !== '```') {
                        prev = tg.slice(0, tg.indexOf('```'));
                        next = tg.slice(tg.indexOf('```') + 3);
                    }
                    await this.block.onUpdateProps({ content: this.block.content.trimStart() + ts.slice(0, at).join("\n") + (prev ? "\n" + prev : "") });
                    (this.block as any).codeFinished = true;
                    (this.block as TextCode).renderValue()
                    this.tool.updatePosition({ pos: { relativeEleAutoScroll: this.block.el, roundArea: this.block.getVisibleBound() } })
                    ts = ts.slice(at + 1)
                    if (next) ts.splice(0, 0, next)
                }
                else {
                    await this.block.onUpdateProps({ content: this.block.content.trimStart() + ts.join("\n") });
                    (this.block as TextCode).renderValue();
                    this.tool.updatePosition({ pos: { relativeEleAutoScroll: this.block.el, roundArea: this.block.getVisibleBound() } })
                    await util.delay(200)
                    this.willWriteBlock = false;
                    return;
                }
            }
            ts = mergeCode(ts);
            if (this.aa) {
                var isWillSave = false;
                if (typeof ts[0] != 'undefined') {
                    var c = ts[0];
                    if (this.block.isContentEmpty) {
                        if (c.match(/^[\d]+[\.、 ]/)) {
                            var d = c.match(/^[\d]+[\.、 ]/)[0]
                            isWillSave = true;
                            await new Promise((resolve: (block: Block) => void, reject) => {
                                this.page.onTurn(this.block, BlockUrlConstant.List, async (newBlock: Block, oldBlock) => {
                                    if (oldBlock) lodash.remove(this.writedBlocks, g => g == oldBlock)
                                    await newBlock.updateProps({ listType: ListType.number, content: c.slice(d.length) })
                                    newBlock.mounted(() => {
                                        // console.log('gggg');
                                        this.block = newBlock;
                                        this.aa = newBlock.appearAnchors.last()
                                        if (!this.writedBlocks.includes(newBlock)) this.writedBlocks.push(newBlock);
                                        resolve(newBlock)
                                    })
                                })
                            })
                        }
                        else if (c.startsWith('```')) {
                            var d = c.match(/^```/)[0]
                            var codeFinished = false;
                            var ma = c.match(/^```[\w]+/)
                            if (!ma) ma = c.match(/^```/)
                            var lang = ma[0].slice(3);
                            var code = c.slice(ma[0].length);
                            if (c.endsWith('\n```')) {
                                codeFinished = true;
                                code = code.slice(0, -4)
                            }
                            isWillSave = true;
                            await new Promise((resolve: (block: Block) => void, reject) => {
                                this.page.onTurn(this.block, BlockUrlConstant.Code, async (newBlock: Block, oldBlock) => {
                                    if (oldBlock) lodash.remove(this.writedBlocks, g => g == oldBlock)
                                    await newBlock.updateProps({ language: lang, content: code.trimStart() });
                                    (newBlock as any).codeFinished = codeFinished;
                                    newBlock.mounted(() => {
                                        this.block = newBlock;
                                        this.aa = newBlock.appearAnchors.last()
                                        if (!this.writedBlocks.includes(newBlock)) this.writedBlocks.push(newBlock);
                                        resolve(newBlock)
                                    })
                                })
                            })
                        }
                        else if (c.match(/^[一二三四五六七八九十]+[\.、 ]/)) {
                            isWillSave = true;
                            await new Promise((resolve: (block: Block) => void, reject) => {
                                this.page.onTurn(this.block, BlockUrlConstant.Head, async (newBlock: Block, oldBlock) => {
                                    if (oldBlock) lodash.remove(this.writedBlocks, g => g == oldBlock)
                                    await newBlock.updateProps({ content: c })
                                    newBlock.mounted(() => {
                                        this.block = newBlock;
                                        this.aa = newBlock.appearAnchors.last()
                                        if (!this.writedBlocks.includes(newBlock)) this.writedBlocks.push(newBlock);
                                        resolve(newBlock)
                                    })
                                })
                            })
                        }
                        else if (c.startsWith('---')) {
                            isWillSave = true;
                            await new Promise((resolve: (block: Block) => void, reject) => {
                                this.page.onTurn(this.block, BlockUrlConstant.Divider, async (newBlock: Block, oldBlock) => {
                                    if (oldBlock) lodash.remove(this.writedBlocks, g => g == oldBlock)
                                    await newBlock.updateProps({ listType: ListType.circle, content: c.slice(d.length) })
                                    newBlock.mounted(() => {
                                        this.block = newBlock;
                                        this.aa = newBlock.appearAnchors.last()
                                        if (!this.writedBlocks.includes(newBlock)) this.writedBlocks.push(newBlock);
                                        resolve(newBlock)
                                    })
                                })
                            })
                        }
                        else if (c.match(/^[#]+/)) {
                            isWillSave = true;
                            var d = c.match(/^[#]+/)[0];
                            var level = 'h' + (d.length >= 4 ? 4 : d.length);
                            await new Promise((resolve: (block: Block) => void, reject) => {
                                this.page.onTurn(this.block, BlockUrlConstant.Head, async (newBlock: Block, oldBlock) => {
                                    if (oldBlock) lodash.remove(this.writedBlocks, g => g == oldBlock)
                                    await newBlock.updateProps({ content: c.slice(d.length).trim(), level: level })
                                    newBlock.mounted(() => {
                                        this.block = newBlock;
                                        this.aa = newBlock.appearAnchors.last()
                                        if (!this.writedBlocks.includes(newBlock)) this.writedBlocks.push(newBlock);
                                        resolve(newBlock)
                                    })
                                })
                            })
                        }
                        else if (c.match(/^\-[^\-]/)) {
                            isWillSave = true;
                            await new Promise((resolve: (block: Block) => void, reject) => {
                                this.page.onTurn(this.block, BlockUrlConstant.List, async (newBlock: Block, oldBlock) => {
                                    if (oldBlock) lodash.remove(this.writedBlocks, g => g == oldBlock)
                                    await newBlock.updateProps({ listType: ListType.circle, content: c.slice(1) })
                                    newBlock.mounted(() => {
                                        this.block = newBlock;
                                        this.aa = newBlock.appearAnchors.last()
                                        if (!this.writedBlocks.includes(newBlock)) this.writedBlocks.push(newBlock);
                                        resolve(newBlock)
                                    })
                                })
                            })
                        }
                        else if (c.match(/^(\*[^\*]|\+[^\+])/)) {
                            var d = c.match(/^[\-\*\+]/)[0]
                            isWillSave = true;
                            await new Promise((resolve: (block: Block) => void, reject) => {
                                this.page.onTurn(this.block, BlockUrlConstant.List, async (newBlock: Block, oldBlock) => {
                                    if (oldBlock) lodash.remove(this.writedBlocks, g => g == oldBlock)
                                    await newBlock.updateProps({ listType: ListType.circle, content: c.slice(1) })
                                    newBlock.mounted(() => {
                                        // console.log('gggg');
                                        this.block = newBlock;
                                        this.aa = newBlock.appearAnchors.last()
                                        if (!this.writedBlocks.includes(newBlock)) this.writedBlocks.push(newBlock);
                                        resolve(newBlock)
                                    })
                                })
                            })
                        }
                        else {
                            this.aa.appendContent(ts[0]);
                            this.aa.endCollapse();
                        }
                    }
                    else {
                        this.aa.appendContent(ts[0]);
                        this.aa.endCollapse();
                    }
                    this.tool.updatePosition({
                        pos: {
                            relativeEleAutoScroll: this.block.el,
                            roundArea: this.block.getVisibleBound()
                        }
                    })
                }
                ts = ts.slice(1);
                if (ts.length == 0) {
                    this.willWriteBlock = false;
                    if (!isWillSave) await InputStore(this.aa);
                }
                else if (!isWillSave) { await InputForceStore(this.aa); await util.delay(100); }
            }
            if (ts.length > 0) {
                this.page.onAction('AIWrite', async () => {
                    var block = this.block;
                    var at = block.at;
                    var bs = await block.parent.appendArrayBlockData(ts.map(t => {
                        if (t.match(/^```/)) {
                            var ma = t.match(/^```[\w]+/)
                            if (!ma) ma = t.match(/^```/)
                            var lang = ma[0].slice(3);
                            var codeFinished: boolean = false;
                            if (t.endsWith('\n```')) {
                                t = t.slice(0, -4)
                                codeFinished = true
                            }
                            return {
                                codeFinished,
                                language: lang,
                                url: BlockUrlConstant.Code,
                                content: t.slice(ma[0].length).trimStart()
                            }
                        }
                        else if (t.match(/^[\d]+[\.、 ]/)) {
                            var ma = t.match(/^[\d]+[\.、 ]/)
                            return {
                                url: BlockUrlConstant.List,
                                listType: ListType.number,
                                content: t.slice(ma[0].length)
                            }
                        }
                        else if (t.startsWith('---')) {
                            return {
                                url: BlockUrlConstant.Divider
                            }
                        }
                        else if (t.match(/^[一二三四五六七八九十]+[\.、 ]/)) {
                            return {
                                url: BlockUrlConstant.Head,
                                content: t
                            }
                        }
                        else if (t.match(/^\-[^\-]/)) {
                            return {
                                url: BlockUrlConstant.List,
                                listType: ListType.circle,
                                content: t.slice(1)
                            }
                        }
                        else if (t.match(/^[#]+/)) {
                            var d = t.match(/^[#]+/)[0];
                            var level = 'h' + (d.length >= 4 ? 4 : d.length);
                            return {
                                url: BlockUrlConstant.Head,
                                level: level,
                                content: t.slice(d.length).trim()
                            }
                        }
                        else if (t.match(/^(\*[^\*]|\+[^\+])/)) {
                            return {
                                url: BlockUrlConstant.List,
                                listType: ListType.circle,
                                content: t.slice(1)
                            }
                        }
                        return {
                            url: BlockUrlConstant.TextSpan,
                            content: t
                        }
                    }), at + 1, block.parent.hasSubChilds ? 'subChilds' : 'childs');
                    this.writedBlocks.push(...bs);
                    this.block = bs.last();
                    this.page.addUpdateEvent(async () => {
                        this.aa = this.block.appearAnchors.last()
                        if (this.aa) {
                            this.aa.endCollapse();
                        }
                        this.tool.updatePosition({ pos: { relativeEleAutoScroll: this.block.el, roundArea: this.block.getVisibleBound() } })
                        await util.delay(100)
                        this.willWriteBlock = false;
                        if (this.text) this.write()
                    })
                })
            }
        }
        catch (ex) {
            console.error(ex)
        }
    }
    async writeTableRow() {
        if (this.text.indexOf('\n') == -1) return;
        var ts = this.text.split(/\r\n|\n\n|\n\r|\n|\r/g);
        lodash.remove(ts, g => typeof g == 'undefined' || g === '');
        this.text = '';
        this.willWriteBlock = true;
        var rowList = ts;
        if (ts.some(s => !s.trim().startsWith('|'))) {
            rowList = ts.slice(0, ts.findIndex(s => !s.trim().startsWith('|')));
            ts = ts.slice(ts.findIndex(s => !s.trim().startsWith('|')));
        }
        else ts = [];
        // console.log('writee', rowList, ts);
        var createRows: any[] = [];
        for (let i = 0; i < rowList.length; i++) {
            var rg = rowList[i].trim();
            if (rg.length > 1 && rg.startsWith('|') && rg.endsWith('|')) {
                var tss = rg.slice(1, -1).split('|').map(g => g.trim());
                createRows.push({
                    url: '/table/row',
                    blocks: {
                        childs: tss.map((t, i) => {
                            return {
                                url: '/table/cell',
                                blocks: {
                                    childs: [{ url: BlockUrlConstant.TextSpan, content: t }]
                                }
                            }
                        })
                    }
                })
            }
            else break;
        }
        // console.log(createRows, 'createRows')
        if (createRows.length > 0) {
            await new Promise((resolve: (block: Block) => void, reject) => {
                this.page.onAction('AIWriteTableRow', async () => {
                    var block = this.block;
                    var bs = await block.appendArrayBlockData(createRows, block.childs.length, 'childs');
                    this.page.addUpdateEvent(async () => {
                        this.tool.updatePosition({ pos: { relativeEleAutoScroll: this.block.el, roundArea: this.block.getVisibleBound() } })
                        await util.delay(100)
                        resolve(bs.last())
                    })
                })
            })
        }
        if (rowList.map(s => s.trim()).some(rg => !(rg.length > 1 && rg.startsWith('|') && rg.endsWith('|')))) {
            this.text = rowList.last() + this.text;
            this.willWriteBlock = false;
            return false;
        }
        if (ts.length > 0) {
            //说明表格结束了
            this.currentTable.isWriteTable = false;
            this.currentTable.head = [];
            this.text = ts.join('\n') + this.text;
            this.willWriteBlock = false;
            return false;
        }
    }
    accept(text: string, done: boolean) {
        if (typeof text == 'string') {
            this.text += text;
        }
        this.write()
    }
    acceptImages(images: ResourceArguments[]) {
        this.page.onAction('AIDrawImages', async () => {
            var block = this.block;
            var at = block.at;
            var bs = await block.parent.appendArrayBlockData(
                images.map(img => {
                    return {
                        url: BlockUrlConstant.Image,
                        src: img
                    }
                })
                ,
                at + 1,
                block.parent.hasSubChilds ? 'subChilds' : 'childs');
            bs.last().mounted(() => {
                bs.last().page.kit.anchorCursor.onSelectBlocks(bs)
            })
        })
    }
}


