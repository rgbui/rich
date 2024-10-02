import { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { AiStartSvg, CheckSvg, CloseSvg, Edit1Svg, PicSvg, PublishSvg, RefreshSvg, TrashSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Singleton } from "../../component/lib/Singleton";
import { PopoverPosition } from "../../component/popover/position";
import { Block } from "../../src/block";
import { popoverLayer } from "../../component/lib/zindex";
import { channel } from "../../net/channel";
import { Loading1 } from "../../component/view/spin";
import { FixedViewScroll } from "../../src/common/scroll";
import { Point, Rect } from "../../src/common/vector/point";
import { DivInput } from "../../component/view/input/div";
import { MenuView } from "../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { AiWrite } from "./write";
import { Divider } from "../../component/view/grid";

import {
    AbstractTemplate,
    ArticleContinue,
    ExplainPrompt,
    FixSpellingGrammar,
    MakeLonger,
    MakeSmall,
    PolishTemplate,
    SelectionPrompt,
    SummarizeTemplate,
    TranslateTemplate,
    WritingAssistant,
    getTemplateInstance
} from "./prompt";

import { parseMarkdownContent } from "../Import-export/mime/markdown/parse";
import { BlockUrlConstant } from "../../src/block/constant";
import { List, ListType } from "../../blocks/present/list/list";
import { onBlockPickLine, onMergeListBlocks } from "./util";
import { CanSupportFeature, PayFeatureCheck } from "../../component/pay";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { KeyboardCode } from "../../src/common/keys";

import lodash from "lodash";
import { WsConsumeType, getAiDefaultModel } from "../../net/ai/cost";
import { LazyMarkdown } from "../../component/view/markdown/lazy";
import { ToolTip } from "../../component/view/tooltip";
import { util } from "../../util/util";

/**
 * The type of the options object that can be passed to the AITool component.
 */
export type AIWriteAssistantProps = {
    block?: Block,
    blocks?: Block[],
    pos?: PopoverPosition,
    ask?: string,
    isRun?: boolean
}

/**
 * The possible status values for the AIWriteStatus enum.
 */
export enum AIWriteStatus {
    none,
    /**
     * Will ask a question.
     */
    willAsk,
    /**
     * Currently typing a question.
     */
    willAsking,
    /**
     * The robot is answering the question.
     */
    asking,
    /**
     * The robot has finished answering the question.
     */
    asked,
    /***
     * base on selection will ask a question
     */
    selectionWillAsk,
    /**
     *  base on selection inputting a question
     */
    selectionWillAsking,

    /**
     * the robot is answering the question
     */
    selectionAsking,

    /**
     * the robot has finished answering the question
     */
    selectionAsked
}

/**
 * The AITool component.
 */
export class AIWriteAssistant extends EventsComponent {
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
    /**
     * Renders the AITool component.
     * @returns The rendered AITool component.
     */
    render() {
        var style: CSSProperties = {
            minWidth: 300
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
                zIndex: popoverLayer.zoom(this)
            }}
        ><div
            ref={e => this.el = e}
            className="pos"
            style={style}>
                <div style={{ border: `2px solid var(--text-purple)` }} className="pv min-h-30 bg-white  shadow  round-8">
                    {this.anwser && [AIWriteStatus.selectionAsking, AIWriteStatus.selectionAsked].includes(this.status) && <>
                        <div ref={e => this.mdEl = e} className=" padding-w-10 gap-t-10 max-h-150 overflow-y">
                            <LazyMarkdown md={this.anwser}></LazyMarkdown>
                        </div>
                        <Divider></Divider>
                    </>}
                    <div className="flex flex-top">
                        <span className={"flex-fixed h-30 w-30 gap-h-5 flex-center "}>
                            <Icon className={'text-pu'} size={18} icon={AiStartSvg}></Icon>
                        </span>
                        <div className="flex-auto flex" onMouseDown={e => {
                            if (e.target == e.currentTarget) {
                                if ((![AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status))) {
                                    if (this.textarea) {
                                        this.focusTextarea()
                                    }
                                }
                            }
                        }}>
                            {([AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status)) && <div className=" gap-h-10 flex remark  flex"><S>AI正在写作</S><Loading1></Loading1></div>}
                            {(![AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status)) && <DivInput
                                value={this.ask}
                                ref={e => this.textarea = e}
                                onInput={this.onInput}
                                onEnter={this.onEnter}
                                className='padding-h-10 min-h-20 l-20'
                                placeholder={lst("告诉AI你想写什么...")} ></DivInput>}
                        </div>
                        <span className="gap-h-5 h-30 flex-center flex-fixed gap-l-10 gap-r-10">
                            {([AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status)) && <div className="h-24 flex-center">
                                <span className="gap-r-10 cursor f-14 text-1" onMouseDown={e => this.onTry()}><S>重试</S><em className="remark gap-l-5">R</em></span>
                                <span className="cursor f-14 text-1" onMouseDown={e => this.onEsc()}><S>取消</S><em className="remark gap-l-5">ESC</em></span>
                            </div>}
                            {(![AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status)) && <ToolTip overlay={<div>
                                <div className="flex"><span style={{ color: '#bbb' }}>Enter</span><span className="gap-l-5"><S>发送</S></span></div>
                                <div className="flex"><span style={{ color: '#bbb' }}>Shift+Enter</span><span className="gap-l-5"><S>换行</S></span></div>
                            </div>}>
                                <span onClick={e => this.onEnter()} className={"round size-24 flex-center cursor item-hover" + (this.ask ? "" : " remark")}>
                                    <Icon size={18} icon={PublishSvg}></Icon>
                                </span>
                            </ToolTip>}
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
                    style={{
                        // border: `2px solid var(--text-purple)`,
                        display: [AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status) ? 'none' : 'block'
                    }}
                    ref={e => this.menuView = e}
                    className="gap-t-10 pv border shadow w-300 bg-white   round-8">
                    {this.renderItems()}
                </div>
            </div>
        </div>
    }
    menuView: HTMLElement;
    onHander = async (item: MenuItem) => {
        var self = this;
        if ([AIWriteStatus.willAsk].includes(this.status)) {
            switch (item.name) {
                case 'continue':
                    var preContent = this.getPrevBlockContent();
                    if (preContent) {
                        this.error = '';
                        var propTemplate = getTemplateInstance(ArticleContinue, { content: preContent });
                        this.aiText({ prompt: propTemplate })
                    }
                    else {
                        this.error = lst('没有上文内容无法续写', '没有上文内容，无法续写');
                        self.forceUpdate()
                    }
                    break;
                case 'image':
                    if (await CanSupportFeature(PayFeatureCheck.aiImage, self.page.ws))
                        self.aiImage({ prompt: self.ask })
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
        else if ([AIWriteStatus.asked].includes(this.status)) {
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
                        await this.open({ block: block });
                        this.onTry();
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
        else if ([AIWriteStatus.selectionWillAsk].includes(this.status)) {
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
                    if (await CanSupportFeature(PayFeatureCheck.aiImage, self.page.ws)) {
                        var preContent = this.getPrevBlockContent();
                        this.aiImage({ prompt: preContent, genImageProp: true })
                    }
                    break;
            }
        }
        else if ([AIWriteStatus.selectionAsked].includes(this.status)) {
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
                                    if (bd?.pattern) {
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
                                    this.page.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true, scroll: 'top' });
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
                                    if (bd?.pattern) {
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
                                    this.page.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true, scroll: 'bottom' });
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
                    this.page.kit.anchorCursor.onSelectBlocks(this.options.blocks, { render: true, scroll: 'top' })
                    await this.open({ blocks: this.options.blocks, ask: this.ask });
                    this.onTry();
                    break;
            }
        }
        else if ([AIWriteStatus.willAsking].includes(this.status)) {
            switch (item.name) {
                case 'image':
                    if (await CanSupportFeature(PayFeatureCheck.aiImage, self.page.ws))
                        self.aiImage({ prompt: self.ask })
                    break;
            }
        }
    }
    renderItems() {
        var self = this;
        return <MenuView ref={e => this.mv = e}
            input={(e) => {

            }}
            select={this.onHander}
            click={(it, e) => {

            }}
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
            }} items={this.getItems()}></MenuView>
    }
    getItems() {
        var items: MenuItem[] = [];
        if ([AIWriteStatus.willAsk, AIWriteStatus.willAsking].includes(this.status)) {
            items = [
                { text: lst('用AI写作'), type: MenuItemType.text, helpAlign: 'right', helpText: lst('了解诗云AI'), helpUrl: window.shyConfig?.isUS ? "https://help.shy.red/page/62#3m2UwPfji1semDiT92uiyP" : "https://help.shy.live/page/696#1Gbvfw852sj8TNYfPYVXNh" },
                { name: 'continue', text: lst('用AI续写...'), icon: { name: 'byte', code: 'go-on' } },
                { type: MenuItemType.divide },
                { text: lst('基于页面生成'), type: MenuItemType.text },
                { name: 'pageSummary', text: lst('页面内容总结'), icon: { name: 'byte', code: 'converging-gateway' } },
                {
                    text: lst("翻译"),
                    childsPos: { align: 'end' },
                    childs: [
                        { text: lst('中文'), name: 'pageTranslate', value: 'Chinese' },
                        { text: lst('英文'), name: 'pageTranslate', value: 'English' },
                        { text: lst('日文'), name: 'pageTranslate', value: 'Japanese' },
                        { text: lst('韩文'), name: 'pageTranslate', value: 'Korean' },
                        { text: lst('德语'), name: 'pageTranslate', value: 'German' },
                        { text: lst('法语'), name: 'pageTranslate', value: 'French' },
                        { text: lst('俄语'), name: 'pageTranslate', value: 'Russian' },
                        { text: lst('意大利'), name: 'pageTranslate', value: 'Italian' },
                        { text: lst('葡萄牙'), name: 'pageTranslate', value: 'Portuguese' },
                        { text: lst('西班牙'), name: 'pageTranslate', value: 'Spanish' },
                        { text: lst('荷兰'), name: 'pageTranslate', value: 'Dutch' },
                        { text: lst('阿拉伯'), name: 'pageTranslate', value: 'Arabic' },
                        { text: lst('印度尼西亚'), name: 'pageTranslate', value: 'Indonesian' }
                    ],
                    icon: { name: 'byte', code: 'translation' }
                }
            ];
        }
        else if ([AIWriteStatus.asked].includes(this.status)) {
            items = [
                { name: 'done', text: lst('完成'), icon: CheckSvg },
                { name: 'continue', text: lst('继续'), icon: { name: 'byte', code: 'go-on' } },
                { type: MenuItemType.divide },
                { name: 'try', text: lst('重新尝试'), icon: RefreshSvg },
                { name: 'cancel', text: lst('取消'), icon: CloseSvg }
            ]
        }
        else if ([AIWriteStatus.selectionWillAsk, AIWriteStatus.selectionWillAsking].includes(this.status)) {
            items = [
                { text: lst('编辑优化选择的内容'), type: MenuItemType.text, helpAlign: 'right', helpText: lst('了解诗云AI'), helpUrl: window.shyConfig?.isUS ? "https://help.shy.red/page/62#3m2UwPfji1semDiT92uiyP" : "https://help.shy.live/page/696#1Gbvfw852sj8TNYfPYVXNh" },
                { name: 'improveWrite', text: lst('提升写作'), icon: { name: 'byte', code: 'optimize' }, },
                { name: 'fix', text: lst('拼写及语法优化'), icon: { name: 'byte', code: 'modify' } },
                { name: 'explain', text: lst('解释'), icon: { name: 'byte', code: 'transform' } },
                { name: 'summary', text: lst('总结'), icon: { name: 'byte', code: 'converging-gateway' } },
                { name: 'abstract', text: lst('摘要'), icon: { name: 'byte', code: 'magic-wand' } },
                {
                    text: lst("翻译"),
                    childsPos: { align: 'end' },
                    childs: [
                        { text: lst('中文'), name: 'translate', value: 'Chinese' },
                        { text: lst('英文'), name: 'translate', value: 'English' },
                        { text: lst('日文'), name: 'translate', value: 'Japanese' },
                        { text: lst('韩文'), name: 'translate', value: 'Korean' },
                        { text: lst('德语'), name: 'translate', value: 'German' },
                        { text: lst('法语'), name: 'translate', value: 'French' },
                        { text: lst('俄语'), name: 'translate', value: 'Russian' },
                        { text: lst('意大利'), name: 'translate', value: 'Italian' },
                        { text: lst('葡萄牙'), name: 'translate', value: 'Portuguese' },
                        { text: lst('西班牙'), name: 'translate', value: 'Spanish' },
                        { text: lst('荷兰'), name: 'translate', value: 'Dutch' },
                        { text: lst('阿拉伯'), name: 'translate', value: 'Arabic' },
                        { text: lst('印度尼西亚'), name: 'translate', value: 'Indonesian' },
                    ],
                    icon: { name: 'byte', code: 'translation' }
                },
                { type: MenuItemType.divide },
                { name: 'makeLonger', text: lst('变长一些'), icon: { name: 'byte', code: 'indent-right' } },
                { name: 'makeSmaller', text: lst('简洁一些'), icon: { name: 'byte', code: 'indent-left' } },
                {
                    text: lst('润色'),
                    icon: { name: 'byte', code: 'effects' },
                    childs: [
                        { name: 'polish', text: lst('更专业一些'), icon: Edit1Svg },
                        { name: 'polish', text: lst('更友好一些'), icon: Edit1Svg },
                        { name: 'polish', text: lst('更自信一些'), icon: Edit1Svg },
                        { name: 'polish', text: lst('更直接一些'), icon: Edit1Svg },
                        { name: 'polish', text: lst('更口语话一些'), icon: Edit1Svg },
                    ]
                },
                { type: MenuItemType.divide },
                { name: 'insertImage', text: lst("生成插图"), icon: PicSvg },
            ];
        }
        else if ([AIWriteStatus.selectionAsked].includes(this.status)) {
            items = [
                { name: 'replace', text: lst('替换'), icon: CheckSvg },
                { name: 'insertBelow', text: lst('插到下面'), icon: Edit1Svg },
                { type: MenuItemType.divide },
                { name: 'try', text: lst('重新尝试'), icon: RefreshSvg },
                { name: 'cancel', text: lst('取消'), icon: TrashSvg }
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
            if (this.options.block) this.status = AIWriteStatus.willAsking;
            else this.status = AIWriteStatus.selectionWillAsking;
        }
        else {
            if (this.options.block) this.status = AIWriteStatus.willAsk;
            else this.status = AIWriteStatus.selectionWillAsk;
        }
        if (this.mv) this.mv.forceUpdateItems(this.getItems())
    }
    updateView(callback?: () => void) {
        if (this.mv) this.mv.forceUpdateItems(this.getItems())
        this.forceUpdate(callback)
    }
    textarea: DivInput;
    ask: string = '';
    status: AIWriteStatus = AIWriteStatus.none;
    anwser: string = '';
    onEnter = async () => {
        var self = this;
        var r = this.mv.onSelectFocusItem();
        if (r == true) return;
        if (this.ask) {
            if (this.options.block) this.aiText({ prompt: self.ask })
            else if (this.options.blocks) {
                var preContent = this.getPrevBlockContent();
                var propTemplate = getTemplateInstance(SelectionPrompt, { prompt: self.ask, selection: preContent });
                this.aiSelection({ prompt: propTemplate })
            }
        }
    }
    options: AIWriteAssistantProps = {
        block: null,
        pos: null
    }
    async open(options: AIWriteAssistantProps) {
        if (options.block) this.writer.open(options.block);
        this.fvs.unbind();
        if (!options.pos) {
            options.pos = {
                relativeEleAutoScroll: options.block ? options.block.el : options.blocks[0].el,
                roundArea: options.block ? options.block.getVisibleBound() : (Rect.getRectFromRects(options.blocks.map(o => o.getVisibleBound())))
            }
        }
        if (options.pos.relativeEleAutoScroll) this.fvs.bind(options.pos.relativeEleAutoScroll);
        this.el.style.transform = `translate(${0}px,${0}px)`;
        if (options.block) this.status = AIWriteStatus.willAsk;
        else this.status = AIWriteStatus.selectionWillAsk;
        this.visible = true;
        this.error = '';
        this.ask = options.ask || '';
        this.anwser = '';
        this.options = options;
        this.page.setPaddingBottom(500);
        if (this.textarea) this.textarea.setValue('')
        this.updateView(async () => {
            await this.focusTextarea();
            if (options.isRun) {
                this.onEnter()
            }
        })
    }
    controller?: AbortController
    lastCommand: { ask: string, command: 'text' | 'image' | 'selection', options?: any } = null;
    async aiText(options: { prompt?: string, model?: WsConsumeType, isNotFound?: boolean }) {
        this.controller = null;
        if (!options) options = {} as any;
        if (!options?.model) options.model = getAiDefaultModel(this?.page?.ws?.aiConfig?.text)
        this.lastCommand = { ask: this.ask, command: 'text', options: lodash.cloneDeep(options) };
        var self = this;
        this.status = AIWriteStatus.asking;
        self.anwser = '';
        this.error = '';
        this.updateView()
        var scope = '';
        self.writer.ms = [];
        self.writer.ready(async bs => {
            if (bs.length > 0) {
                await bs.eachAsync(async b => {
                    await onBlockPickLine(self.page, b, true);
                })
                var p = bs.first().parent;
                if (bs.some(s => s.url == BlockUrlConstant.List && (s as List).listType == ListType.number)) {
                    await onMergeListBlocks(self.page, bs);
                    bs = bs.findAll(g => g.parent == p);
                }
                await self.writer.page.kit.anchorCursor.onSelectBlocks(bs, { render: true, scroll: 'bottom' })
            }
            self.status = AIWriteStatus.asked;
            self.updateView(async () => {
                await self.focusTextarea(true);
            });
        })
        await channel.post('/text/ai/stream', {
            question: options?.prompt,
            model: options?.model,
            async callback(str, done, contoller, abort) {
                if (contoller) { self.controller = contoller; return }
                // console.log(str, done);
                if (typeof str == 'string') {
                    self.anwser += str;
                    scope += str;
                    if (done !== true && (scope.length < 10 || scope.match(/```[^\n\r]*$/) || scope.match(/[一二三四五六七八九十]+$/) || scope.match(/[`]+$/) || scope.match(/[#]+$/) || scope.match(/^[\*]+$/) || scope.endsWith('~') || scope.endsWith('-') || scope.endsWith('|') || scope.match(/[\d]+$/))) {

                    }
                    else {
                        self.writer.accept(scope, done);
                        scope = '';
                    }
                }
                else self.writer.accept(scope, done);
            }
        });
    }
    async aiSelection(options: { prompt?: string, model?: WsConsumeType, isNotFound?: boolean }) {
        this.controller = null;
        this.lastCommand = { ask: this.ask, command: 'selection', options: lodash.cloneDeep(options) };
        if (!options?.model) options.model = getAiDefaultModel(this?.page?.ws?.aiConfig?.text);
        var self = this;
        this.status = AIWriteStatus.selectionAsking;
        self.anwser = '';
        this.error = '';
        this.updateView()
        if (options?.isNotFound) {
            self.anwser = lst('未找到匹配的答案')
            if (self.mdEl) {
                self.mdEl.scrollTop = self.mdEl.scrollHeight
            }
            self.status = AIWriteStatus.selectionAsked;
            self.updateView()
        }
        else {
            await channel.post('/text/ai/stream', {
                question: options.prompt,
                model: options.model,
                callback(str, done, contoller, abort) {
                    if (contoller) { self.controller = contoller; return }
                    if (typeof str == 'string') {
                        self.anwser += str;
                        if (self.mdEl) {
                            self.mdEl.scrollTop = self.mdEl.scrollHeight
                        }
                        self.updateView()
                    }
                    if (done) {
                        self.status = AIWriteStatus.selectionAsked;
                        self.updateView(async () => {
                            await self.focusTextarea(true);
                        });
                    }
                }
            });
        }
    }
    async aiImage(options: { prompt?: string, model?: WsConsumeType, isNotFound?: boolean, genImageProp?: boolean }) {
        this.controller = null;
        options.model = getAiDefaultModel(this?.page?.ws?.aiConfig?.image, 'image');
        this.lastCommand = { ask: this.ask, command: 'image', options: lodash.cloneDeep(options) };
        var ask = options?.prompt;
        if (!ask) return;
        var self = this;
        this.error = '';
        if (this.options.block) this.status = AIWriteStatus.asking;
        else this.status = AIWriteStatus.selectionAsking;
        this.updateView()
        var r = await channel.post('/http', {
            url: '/text/ai/image',
            method: 'post',
            data: {
                model: options.model,
                prompt: ask
            }
        });
        if (r?.ok) {
            if (Array.isArray(r.data.images)) {
                if (this.options.block) {
                    self.writer.acceptImages(r.data.images);
                    this.status = AIWriteStatus.asking;
                    this.close()
                }
                else {
                    self.anwser += r.data.images.map(g => `![${g.filename.slice(0, 10) || 'image'}](${g.url})`).join("\n\n");
                    this.status = AIWriteStatus.selectionAsked;
                    this.updateView();
                }
            }
            else if (r.data.error) {
                this.error = r.data.error;
                if (this.options.block) this.status = AIWriteStatus.asking;
                else this.status = AIWriteStatus.selectionAsked;
                this.updateView();
            }
        }
    }
    updatePosition(options: AIWriteAssistantProps) {
        this.fvs.unbind();
        this.el.style.transform = `translate(${0}px,${0}px)`
        if (options.pos.relativeEleAutoScroll) this.fvs.bind(options.pos.relativeEleAutoScroll);
        this.el.style.top = (options.pos.roundArea.top + options.pos.roundArea.height) + 'px';
    }
    visible: boolean = false;
    onGlobalMousedown = (event: MouseEvent) => {
        if ([AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status)) return;
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            if (target.closest('.shy-menu-panel')) return;
            this.close();
        }
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown, true);
        document.addEventListener('keydown', this.onKeydown, true);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown, true);
        document.removeEventListener('keydown', this.onKeydown, true);
    }
    onKeydown = async (event: KeyboardEvent) => {
        if (this.visible == false) return;
        if ((event.key.toLowerCase() != KeyboardCode.Esc.toLowerCase() && event.key.toLowerCase() != KeyboardCode.R.toLowerCase()) && [AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status)) return;
        if (event.key.toLowerCase() == KeyboardCode.Esc.toLowerCase()) {
            if ([AIWriteStatus.asking, AIWriteStatus.selectionAsking].includes(this.status)) {
                event.stopPropagation();
                event.preventDefault();
                this.onEsc();
                if (this.status == AIWriteStatus.asking)
                    this.status = AIWriteStatus.asked;
                else if (this.status == AIWriteStatus.selectionAsking) {
                    this.status = AIWriteStatus.selectionAsked;
                }
                this.updateView(() => {
                    this.focusTextarea()
                })
            }
            else if ([AIWriteStatus.willAsk, AIWriteStatus.asked, AIWriteStatus.selectionAsked, AIWriteStatus.selectionWillAsk].includes(this.status)) {
                event.stopPropagation();
                event.preventDefault();
                this.close()
            }
        }
        else if (event.key.toLowerCase() == KeyboardCode.Delete.toLowerCase() || event.key.toLowerCase() == KeyboardCode.Backspace.toLowerCase()) {
            if ([AIWriteStatus.willAsk, AIWriteStatus.asked, AIWriteStatus.selectionAsked, AIWriteStatus.selectionWillAsk].includes(this.status)) {
                if (!this.ask) {
                    event.stopPropagation();
                    event.preventDefault();
                    this.close()
                }
            }
        }
        else if (event.key.toLowerCase() == KeyboardCode.R.toLowerCase()) {
            if ([AIWriteStatus.selectionAsking, AIWriteStatus.selectionAsked].includes(this.status)) {
                event.stopPropagation();
                event.preventDefault();
                this.onEsc();

                this.page.kit.anchorCursor.onSelectBlocks(this.options.blocks, { render: true, scroll: 'top' })
                await this.open({ blocks: this.options.blocks, ask: this.ask });
                this.onTry();
            }
            if ([AIWriteStatus.asked, AIWriteStatus.asking].includes(this.status)) {
                event.stopPropagation();
                event.preventDefault();
                this.onEsc();

                var blocks = this.writer.writedBlocks;
                var block = this.options.block;
                if (blocks.includes(block)) block = block.prev;
                await this.writer.page.onBatchDelete(blocks);
                if (block) {
                    this.page.kit.anchorCursor.onFocusBlockAnchor(block, { last: true, render: true })
                    await this.open({ block: block });
                    this.onTry();
                }
            }
        }
        else if (event.key.toLowerCase() == KeyboardCode.ArrowDown.toLowerCase()) {
            console.log('down focus item', this.mv);
            if (this.mv) {
                event.stopPropagation();
                event.preventDefault(); this.mv.onDownFocusItem()
            }
        }
        else if (event.key.toLowerCase() == KeyboardCode.ArrowUp.toLowerCase()) {
            console.log('up focus item...');
            if (this.mv) {
                event.stopPropagation();
                event.preventDefault();
                this.mv.onUpFocusItem()
            }
        }
        else if (event.key.toLowerCase() == KeyboardCode.ArrowLeft.toLowerCase()) {
            if (this.mv) {
                event.stopPropagation();
                event.preventDefault();
                this.mv.onLeftFocusItem();
            }
        }
        else if (event.key.toLowerCase() == KeyboardCode.ArrowRight.toLowerCase()) {
            if (this.mv) {
                event.stopPropagation();
                event.preventDefault();
                this.mv.onRightFocusItem()
            }
        }
    }
    close() {
        if (this.visible == true) {
            if (this.page) {
                this.page.setPaddingBottom()
            }
            this.fvs.unbind();
            this.visible = false;
            this.status = AIWriteStatus.none;
            this.updateView();
            this.emit('close');
        }
    }
    onTry() {
        // console.log('onTry', this.controller);
        // try {
        //     if (this.controller) {
        //         this.controller.abort()
        //         this.controller = null;
        //     }
        // }
        // catch (ex) {
        //     console.error(ex);
        // }
        if (this.lastCommand) {
            switch (this.lastCommand.command) {
                case 'image':
                    this.aiImage(this.lastCommand.options);
                    break;
                case 'selection':
                    this.aiSelection(this.lastCommand.options);
                    break;
                case 'text':
                    this.aiText(this.lastCommand.options);
                    break;
            }
        }
    }
    onEsc() {
        try {
            if (this.controller) {
                this.controller.abort()
                this.controller = null;
            }
        }
        catch (ex) {
            console.error(ex)
        }
    }
    autoScrollPage() {
        if (this.el && this.page) {
            var r = Rect.fromEle(this.el);
            if (r.bottom > window.innerHeight) {
                this.page.getScrollDiv().scrollTop = this.page.getScrollDiv().scrollTop + r.bottom - window.innerHeight + 50
            }
            else if (r.top < 48) {
                this.page.getScrollDiv().scrollTop = this.page.getScrollDiv().scrollTop - 48 - r.top
            }
        }
    }
    async focusTextarea(isSelectMenu?: boolean) {
        await util.delay(100);
        this.autoScrollPage();
        if (this.textarea) {
            this.textarea.focus()
        }
        if (isSelectMenu) {
            if (this.mv) this.mv.onDownFocusItem()
        }
    }
}

export var aiTool: AIWriteAssistant;
export async function useAIWriteAssistant(options: AIWriteAssistantProps) {
    aiTool = await Singleton(AIWriteAssistant);
    await aiTool.open(options);
    return new Promise((resolve: (d: { ask: string, aiTool: AIWriteAssistant }) => void, reject) => {
        // aiTool.only('save', d => {
        //     resolve(d)
        // })
        aiTool.only("close", () => {
            resolve(null);
        })
    })
}

