import { CSSProperties, ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { AiStartSvg, CheckSvg, CloseSvg, Edit1Svg, PicSvg, PublishSvg, RefreshSvg, TrashSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Singleton } from "../../component/lib/Singleton";
import { PopoverPosition } from "../popover/position";
import { Block } from "../../src/block";
import { riseLayer } from "../../component/lib/zindex";
import { channel } from "../../net/channel";
import { Spin } from "../../component/view/spin";
import { FixedViewScroll } from "../../src/common/scroll";
import { Point, Rect } from "../../src/common/vector/point";
import { DivInput } from "../../component/view/input/div";
import { MenuView } from "../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { AiWrite } from "./write";
import { Markdown } from "../../component/view/markdown";
import { Divider } from "../../component/view/grid";

import {
    AbstractTemplate,
    ArticleContinue,
    ExplainPrompt,
    FixSpellingGrammar,
    ImagePrompt,
    MakeLonger,
    MakeSmall,
    PolishTemplate,
    SummarizeTemplate,
    TranslateTemplate,
    WritingAssistant,
    getTemplateInstance
} from "./prompt";
import { parseMarkdownContent } from "../../src/import-export/markdown/parse";
import { BlockUrlConstant } from "../../src/block/constant";
import { List, ListType } from "../../blocks/present/list/list";
import { onMergeListBlocks } from "./util";
import { CanSupportFeature, PayFeatureCheck } from "../../component/pay";

export type AIToolType = {
    block?: Block,
    blocks?: Block[],
    pos?: PopoverPosition,
    ask?: string,
    isRun?: boolean
}

export enum AIAskStatus {
    none,
    /**
     * 将要询问
     */
    willAsk,
    /**
     * 正在输入问题中
     */
    willAsking,
    /**
     * 机器人正在回答中
     */
    asking,
    /**
     * 机器人回答完毕
     */
    asked,


    selectionWillAsk,

    selectionWillAsking,

    selectionAsking,

    selectionAsked
}

export class AITool extends EventsComponent {
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.visible == true && this.el)
                this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    writer: AiWrite = new AiWrite(this);
    el: HTMLDivElement;
    error: string = '';
    private fvs: FixedViewScroll = new FixedViewScroll();
    mdEl: HTMLElement;
    render(): ReactNode {
        var style: CSSProperties = {
        }
        if (this.visible == false) style.display = 'none';
        if (this.options.pos) {
            style.width = this.options.pos.roundArea.width;
            style.left = this.options.pos.roundArea.left;
            style.top = this.options.pos.roundArea.top + this.options.pos.roundArea.height;
        }
        return <div
            className="pos-t-r pn vw100 vh100 overflow-hidden"
            style={{
                zIndex: riseLayer.zoom(this)
            }}><div
                ref={e => this.el = e}
                className="pos"
                style={style}>
                <div className="pv min-h-30 bg-white shadow-1  round-8">
                    {this.anwser && [AIAskStatus.selectionAsking, AIAskStatus.selectionAsked].includes(this.status) && <>
                        <div ref={e => this.mdEl = e} className=" padding-w-10 padding-t-10 gap-t-10 max-h-150 overflow-y">
                            <Markdown md={this.anwser}></Markdown>
                        </div>
                        <Divider></Divider>
                    </>
                    }
                    <div className="flex flex-top">
                        <span className="flex-fixed size-30 gap-h-5 flex-center gap-r-5">
                            <Icon size={18} icon={AiStartSvg}></Icon>
                        </span>
                        <div className="flex-auto">
                            {[AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status) && <div className="size-30  gap-h-5  flex-center"><Spin size={16}></Spin></div>}
                            {![AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status) && <DivInput
                                value={this.ask}
                                rf={e => this.textarea = e}
                                onInput={this.onInput}
                                onEnter={this.onEnter}
                                className='padding-h-10 min-h-20 l-20'
                                placeholder="告诉AI写什么" ></DivInput>}
                        </div>
                        <span className="size-30  gap-h-5 flex-center flex-fixed gap-l-10">
                            <span onClick={e => this.onEnter()} className={"round size-24 flex-center cursor item-hover" + (this.ask ? " remark" : "")}>
                                <Icon size={18} icon={PublishSvg}></Icon>
                            </span>
                        </span>
                    </div>
                    {this.error && <div className="flex min-h-20 gap-b-5 padding-w-10 f-12 visible-hover">
                        <div className="error ">{this.error}</div>
                        <div className="size-20 flex-center visible gap-l-10  item-hover cursor round"
                            onClick={e => { this.error = ''; this.forceUpdate() }}>
                            <Icon size={14} icon={CloseSvg}></Icon>
                        </div>
                    </div>}
                </div>
                <div
                    style={{ display: [AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status) ? 'none' : 'block' }}
                    ref={e => this.menuView = e}
                    className="gap-t-10 pv shadow-1 w-300 bg-white   round-8">
                    {this.renderItems()}
                </div>
            </div>
        </div>
    }
    menuView: HTMLElement;
    renderItems() {
        var self = this;
        var select = async (item: MenuItem) => {
            if ([AIAskStatus.willAsk].includes(this.status)) {
                switch (item.name) {
                    case 'continue':
                        var preContent = this.getPrevBlockContent();
                        if (preContent) {
                            this.error = '';
                            var propTemplate = getTemplateInstance(ArticleContinue, { content: preContent });
                            this.aiText({ prompt: propTemplate })
                        }
                        else {
                            this.error = '没有上文内容，无法续写';
                            self.forceUpdate()
                        }
                        break;
                    case 'image':
                        if (await CanSupportFeature(PayFeatureCheck.aiImage))
                            self.aiImage()
                        break;
                    case 'pageSummary':
                        var preContent = await this.getPageContent()
                        var propTemplate = getTemplateInstance(SummarizeTemplate, { content: preContent });
                        this.aiText({ prompt: propTemplate })
                        break;
                    case 'pageTranslate':
                        var preContent = await this.getPageContent()
                        var propTemplate = getTemplateInstance(TranslateTemplate, { language: item.value, content: preContent });
                        this.aiText({ prompt: propTemplate })
                        break;
                }
            }
            else if ([AIAskStatus.asked].includes(this.status)) {
                switch (item.name) {
                    case 'done':
                    case 'cancel':
                        this.page.kit.anchorCursor.onClearSelectBlocks()
                        this.close()
                        break;
                    case 'try':
                        var blocks = this.writer.writedBlocks;
                        var block = this.options.block;
                        if (blocks.includes(block)) block = block.prev;
                        await this.writer.page.onBatchDelete(blocks);
                        if (block) {
                            this.page.kit.anchorCursor.onFocusBlockAnchor(block, { last: true, render: true })
                            var ask = this.ask;
                            this.open({ block: block });
                            this.ask = ask;
                            this.onEnter()
                        }
                        break;
                    case 'continue':
                        var blocks = this.writer.writedBlocks;
                        this.page.kit.anchorCursor.onFocusBlockAnchor(blocks.last(), { last: true, render: true })
                        this.open({ block: blocks.last() });
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(ArticleContinue, { content: preContent });
                        this.aiText({ prompt: propTemplate })
                        break;
                    case 'makeLonger':
                        break;
                }
            }
            else if ([AIAskStatus.selectionWillAsk].includes(this.status)) {
                switch (item.name) {
                    case 'improveWrite':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(WritingAssistant, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'fix':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(FixSpellingGrammar, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'explain':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(ExplainPrompt, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'makeSmaller':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(MakeSmall, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'makeLonger':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(MakeLonger, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'continue':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(ArticleContinue, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'summary':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(SummarizeTemplate, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'abstract':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(AbstractTemplate, { content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'polish':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(PolishTemplate, {
                            style: item.text,
                            content: preContent
                        });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'translate':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(TranslateTemplate, { language: item.value, content: preContent });
                        this.aiSelection({ prompt: propTemplate })
                        break;
                    case 'insertImage':
                        if (await CanSupportFeature(PayFeatureCheck.aiImage)) {
                            var preContent = this.getPrevBlockContent();
                            this.aiImage({ prompt: preContent, genImageProp: true })
                        }
                        break;
                }
            }
            else if ([AIAskStatus.selectionAsked].includes(this.status)) {
                switch (item.name) {
                    case 'replace':
                        var blockDatas = await parseMarkdownContent(this.anwser);
                        var bs = this.options.blocks || [];
                        var b = this.page.visibleSearchBlocks(bs, 'last');
                        if (b) {
                            await this.page.onAction('AIReplaceBlocks', async () => {
                                for (let i = 0; i < blockDatas.length; i++) {
                                    if (blockDatas[i].url == BlockUrlConstant.TextSpan) {
                                        var bd = bs[i];
                                        if (bd.pattern) {
                                            var pattern = await bd.pattern.cloneData();
                                            if (bd.url != BlockUrlConstant.TextSpan) {
                                                blockDatas[i].url = bd.url;
                                            }
                                            blockDatas[i].pattern = pattern;
                                        }
                                    }
                                }
                                var newBlocks = await b.parent.appendArrayBlockData(blockDatas, b.at + 1, b.parentKey);
                                if (newBlocks.length > 0)
                                    newBlocks.last().mounted(() => {
                                        this.page.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true });
                                    })
                                for (let i = 0; i < bs.length; i++) {
                                    await bs[i].delete()
                                }
                            })
                            this.close()
                        }
                        break;
                    case 'insertBelow':
                        var blockDatas = await parseMarkdownContent(this.anwser);
                        var bs = this.options.blocks || [];
                        var b = this.page.visibleSearchBlocks(bs, 'last');
                        if (b) {
                            await this.page.onAction('AIReplaceBlocks', async () => {
                                for (let i = 0; i < blockDatas.length; i++) {
                                    if (blockDatas[i].url == BlockUrlConstant.TextSpan) {
                                        var bd = bs[i];
                                        if (bd.pattern) {
                                            var pattern = await bd.pattern.cloneData();
                                            if (bd.url != BlockUrlConstant.TextSpan) {
                                                blockDatas[i].url = bd.url;
                                            }
                                            blockDatas[i].pattern = pattern;
                                        }
                                    }
                                }
                                var newBlocks = await b.parent.appendArrayBlockData(blockDatas, b.at + 1, b.parentKey);
                                if (newBlocks.length > 0)
                                    newBlocks.last().mounted(() => {
                                        this.page.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true });

                                    })
                            })
                            this.close()
                        }
                        break;
                    case 'done':
                    case 'cancel':
                        this.page.kit.anchorCursor.onClearSelectBlocks()
                        this.close()
                        break;
                    case 'try':
                        this.anwser = '';
                        if (this.options.block) this.writer.open(this.options.block);
                        else this.writer.selection(this.options.blocks);
                        this.aiSelection({ prompt: this.lastAiSelection.question });
                        break;
                }
            }
            else if ([AIAskStatus.willAsking].includes(this.status)) {
                switch (item.name) {
                    case 'image':
                        if (await CanSupportFeature(PayFeatureCheck.aiImage))
                            self.aiImage()
                        break;
                }
            }
        }
        function click(item: MenuItem) {

        }
        async function input(item: MenuItem) {

        }
        var items = this.getItems();
        return <MenuView ref={e => this.mv = e}
            input={input}
            select={select}
            click={click}
            cacRelative={(rect => {
                var b = self.el.getBoundingClientRect()
                rect.top -= b.top;
                rect.left -= b.left;
                return rect;
            })}
            style={{
                width: 300,
                maxHeight: 300,
                paddingTop: 10,
                paddingBottom: 10,
                overflowY: 'auto'
            }} items={items}></MenuView>
    }
    getItems() {
        var items: MenuItem[] = [];
        if ([AIAskStatus.willAsk].includes(this.status)) {
            items = [
                { text: '用AI写作', type: MenuItemType.text },
                { name: 'continue', text: '用AI续写...', icon: Edit1Svg },
                { type: MenuItemType.divide },
                { text: '基于页面生成', type: MenuItemType.text },
                { name: 'pageSummary', text: '页面内容总结', icon: Edit1Svg },
                {
                    text: "翻译",
                    childsPos: { align: 'end' },
                    childs: [
                        { text: '中文', name: 'pageTranslate', value: 'Chinese' },
                        { text: '英文', name: 'pageTranslate', value: 'English' },
                        { text: '日文', name: 'pageTranslate', value: 'Japanese' },
                        { text: '韩文', name: 'pageTranslate', value: 'Korean' },
                        { text: '德语', name: 'pageTranslate', value: 'German' },
                        { text: '法语', name: 'pageTranslate', value: 'French' },
                        { text: '俄语', name: 'pageTranslate', value: 'Russian' },
                        { text: '意大利', name: 'pageTranslate', value: 'Italian' },
                        { text: '葡萄牙', name: 'pageTranslate', value: 'Portuguese' },
                        { text: '西班牙', name: 'pageTranslate', value: 'Spanish' },
                        { text: '荷兰', name: 'pageTranslate', value: 'Dutch' },
                        { text: '阿拉伯', name: 'pageTranslate', value: 'Arabic' },
                        { text: '印度尼西亚', name: 'pageTranslate', value: 'Indonesian' }
                    ],
                    icon: Edit1Svg
                }
            ];
        }
        if ([AIAskStatus.asked].includes(this.status)) {
            items = [
                { name: 'done', text: '完成', icon: CheckSvg },
                { name: 'continue', text: '继续', icon: Edit1Svg },
                // { name: 'makeLonger', text: '内容加长', icon: Edit1Svg },
                // {name:'',text:'',icon:Edit1Svg},
                { type: MenuItemType.divide },
                { name: 'try', text: '重新尝试', icon: RefreshSvg },
                { name: 'cancel', text: '取消', icon: CloseSvg }
            ]
        }
        if ([AIAskStatus.selectionWillAsk].includes(this.status)) {
            items = [
                { text: '编辑优化选择的内容', type: MenuItemType.text },
                { name: 'improveWrite', text: '提升写作', icon: Edit1Svg },
                { name: 'fix', text: '拼写及语法优化', icon: Edit1Svg },
                { name: 'explain', text: '解释', icon: Edit1Svg },
                { name: 'summary', text: '总结', icon: Edit1Svg },
                { name: 'abstract', text: '摘要', icon: Edit1Svg },
                {
                    text: "翻译",
                    childsPos: { align: 'end' },
                    childs: [
                        { text: '中文', name: 'translate', value: 'Chinese' },
                        { text: '英文', name: 'translate', value: 'English' },
                        { text: '日文', name: 'translate', value: 'Japanese' },
                        { text: '韩文', name: 'translate', value: 'Korean' },
                        { text: '德语', name: 'translate', value: 'German' },
                        { text: '法语', name: 'translate', value: 'French' },
                        { text: '俄语', name: 'translate', value: 'Russian' },
                        { text: '意大利', name: 'translate', value: 'Italian' },
                        { text: '葡萄牙', name: 'translate', value: 'Portuguese' },
                        { text: '西班牙', name: 'translate', value: 'Spanish' },
                        { text: '荷兰', name: 'translate', value: 'Dutch' },
                        { text: '阿拉伯', name: 'translate', value: 'Arabic' },
                        { text: '印度尼西亚', name: 'translate', value: 'Indonesian' },
                    ],
                    icon: Edit1Svg
                },
                { type: MenuItemType.divide },
                { name: 'makeLonger', text: '变长一些', icon: Edit1Svg },
                { name: 'makeSmaller', text: '简洁一些', icon: Edit1Svg },
                {
                    text: '润色',
                    icon: Edit1Svg,
                    childs: [
                        { name: 'polish', text: '更专业一些', icon: Edit1Svg },
                        { name: 'polish', text: '更友好一些', icon: Edit1Svg },
                        { name: 'polish', text: '更自信一些', icon: Edit1Svg },
                        { name: 'polish', text: '更直接一些', icon: Edit1Svg },
                        { name: 'polish', text: '更口语话一些', icon: Edit1Svg },
                    ]
                },
                { name: 'insertImage', text: "生成插图", icon: PicSvg },
            ];
        }
        if ([AIAskStatus.selectionAsked].includes(this.status)) {
            items = [
                { name: 'replace', text: '替换', icon: CheckSvg },
                { name: 'insertBelow', text: '插到下面', icon: Edit1Svg },
                // { name: 'makeLonger', text: '内容加长', icon: Edit1Svg },
                // {name:'',text:'',icon:Edit1Svg},
                { type: MenuItemType.divide },
                { name: 'try', text: '重新尝试', icon: RefreshSvg },
                { name: 'cancel', text: '取消', icon: TrashSvg }
            ]
        }
        if ([AIAskStatus.willAsking].includes(this.status)) {
            items = [
                { name: 'image', text: '生成图片', icon: PicSvg },
            ]
        }
        return items;
    }
    async getPageContent() {

        return await this.page.getPlain()
    }
    get page() {
        return this.options.block ? this.options.block.page : (this.options.blocks[0].page)
    }
    getPrevBlockContent() {
        if (this.options.block) {
            var content = '';
            this.options.block.prevFind(g => {
                var c = g.getBlockContent();
                if (c) {
                    content = c;
                    return true;
                }
            })
            return content;
        }
        else if (Array.isArray(this.options.blocks)) {
            var c = this.options.blocks.map(b => b.getBlockContent()).join("\n\n");
            return c;
        }
    }
    mv: MenuView = null;
    onInput = (e) => {
        this.ask = e;
        if (this.ask) {
            if (this.options.block) this.status = AIAskStatus.willAsking;
            else this.status = AIAskStatus.selectionWillAsking;
        }
        else {
            if (this.options.block) this.status = AIAskStatus.willAsk;
            else this.status = AIAskStatus.selectionWillAsk;
        }
        if (this.mv) this.mv.forceUpdateItems(this.getItems())
    }
    updateView(callback?: () => void) {
        if (this.mv) this.mv.forceUpdateItems(this.getItems())
        this.forceUpdate(callback)
    }
    textarea: HTMLElement;
    ask: string = '';
    prompt: string = '';
    status: AIAskStatus = AIAskStatus.none;
    anwser: string = '';
    onEnter = () => {
        if (this.ask) {
            if (this.options.block) this.aiText()
            else if (this.options.blocks) this.aiSelection()
        }
    }
    options: AIToolType = {
        block: null,
        pos: null
    }
    open(options: AIToolType) {
        if (options.block) this.writer.open(options.block);
        else this.writer.selection(options.blocks);
        this.fvs.unbind();
        if (!options.pos) {
            options.pos = {
                relativeEleAutoScroll: options.block ? options.block.el : options.blocks[0].el,
                roundArea: options.block ? options.block.getVisibleBound() : (Rect.getRectFromRects(options.blocks.map(o => o.getVisibleBound())))
            }
        }
        if (options.pos.relativeEleAutoScroll) this.fvs.bind(options.pos.relativeEleAutoScroll);
        this.el.style.transform = `translate(${0}px,${0}px)`;
        if (options.block) this.status = AIAskStatus.willAsk;
        else this.status = AIAskStatus.selectionWillAsk;
        this.visible = true;
        this.ask = options.ask || '';
        this.anwser = '';
        this.options = options;
        this.page.setPaddingBottom(500);
        if (this.textarea) this.textarea.innerText = '';
        this.updateView(() => {
            if (this.textarea)
                this.textarea.focus()
            if (options.isRun) {
                this.onEnter()
            }
        })
    }
    async aiText(options?: { prompt?: string, ask?: string }) {
        var self = this;
        this.status = AIAskStatus.asking;
        self.anwser = '';
        this.updateView()
        var scope = '';
        await channel.post('/text/ai/stream', {
            question: options?.prompt || options?.ask || this.ask,
            async callback(str, done) {
                if (typeof str == 'string') {
                    self.anwser += str;
                    scope += str;
                    if (done !== true && (str.match(/^[\d]+/) || str.match(/[\d]+$/) || str.match(/^`+/) || str.match(/`+$/))) {
                        self.writer.accept(undefined, done);
                    }
                    else {
                        self.writer.accept(scope, done);
                        scope = '';
                    }
                }
                else self.writer.accept(undefined, done);
                if (done) {
                    console.log('answer', JSON.stringify(self.anwser))
                    var bs = self.writer.writedBlocks;
                    if (bs.some(s => s.url == BlockUrlConstant.List && (s as List).listType == ListType.number)) {
                        await onMergeListBlocks(self.page, bs);
                    }
                    self.writer.page.kit.anchorCursor.onSelectBlocks(bs, { render: true })
                    self.status = AIAskStatus.asked;
                    self.updateView();
                }
            }
        });
    }
    lastAiSelection: { question: string };
    async aiSelection(options?: { prompt?: string, ask?: string }) {
        var self = this;
        this.status = AIAskStatus.selectionAsking;
        self.anwser = '';
        this.lastAiSelection = {
            question: options?.prompt || options?.ask || this.ask,
        }
        this.updateView()
        await channel.post('/text/ai/stream', {
            question: this.lastAiSelection.question,
            callback(str, done) {
                if (typeof str == 'string') {
                    self.anwser += str;
                    if (self.mdEl) {
                        self.mdEl.scrollTop = self.mdEl.scrollHeight
                    }
                    self.updateView()
                }
                // else self.writer.accept(undefined, done);
                if (done) {
                    // console.log('done', JSON.stringify(self.anwser))
                    self.status = AIAskStatus.selectionAsked;
                    self.updateView();
                }
            }
        });
    }
    async aiImage(options?: { prompt?: string, ask?: string, genImageProp?: boolean }) {
        var ask = options?.prompt || options?.ask || this.ask;
        if (!ask) return;
        var self = this;
        if (this.options.block) this.status = AIAskStatus.asking;
        else this.status = AIAskStatus.selectionAsking;
        this.updateView()
        if (options?.genImageProp) {
            var g = await channel.post('/text/ai', { input: getTemplateInstance(ImagePrompt, { content: options.ask || options.prompt }) })
            if (g.ok) {
                ask = g.data.message;
            }
        }
        // console.log(options, ask);
        var r = await channel.post('/http', {
            url: '/text/to/image',
            method: 'post',
            data: { prompt: ask }
        });
        if (r?.ok) {
            if (Array.isArray(r.data.images)) {
                if (this.options.block) {
                    self.writer.acceptImages(r.data.images);
                    this.status = AIAskStatus.asking;
                    this.close()
                }
                else {
                    // var ds=r.data.images||[{url:'http://localhost:8888/img?id=5ce14d2a04e04a758a23102692237a17'}]
                    var ds = [{
                        name: '',
                        url: 'http://localhost:8888/img?id=5ce14d2a04e04a758a23102692237a17'
                    }]
                    self.anwser += r.data.images.map(g => `<img data-origin='${JSON.stringify(g)}' src='${g.url}'/>`).join("\n\n");
                    self.anwser += ds.map(g => `![${g.name.slice(0, 10) || 'image'}](${g.url})`).join("\n\n");
                    this.status = AIAskStatus.selectionAsked;
                    this.updateView();
                }
            }
            else if (r.data.error) {
                this.error = r.data.error;
                if (this.options.block) this.status = AIAskStatus.asking;
                else this.status = AIAskStatus.selectionAsked;
                this.updateView();
            }
        }
    }
    updatePosition(options: AIToolType) {
        this.fvs.unbind();
        this.el.style.transform = `translate(${0}px,${0}px)`
        if (options.pos.relativeEleAutoScroll) this.fvs.bind(options.pos.relativeEleAutoScroll);
        this.el.style.top = (options.pos.roundArea.top + options.pos.roundArea.height) + 'px';
    }
    visible: boolean = false;
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            this.close();
        }
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown, true);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown, true);
    }
    close() {
        if (this.visible == true) {
            if (this.page) {
                this.page.setPaddingBottom()
            }
            this.fvs.unbind();
            this.visible = false;
            this.status = AIAskStatus.none;
            this.updateView();
            this.emit('close');
        }
    }
}

export var aiTool: AITool;
export async function useAITool(options: AIToolType) {
    aiTool = await Singleton(AITool);
    aiTool.open(options);
    return new Promise((resolve: (d: { ask: string, aiTool: AITool }) => void, reject) => {
        aiTool.only('save', d => {
            resolve(d)
        })
        aiTool.only("close", () => {
            resolve(null);
        })
    })
}

