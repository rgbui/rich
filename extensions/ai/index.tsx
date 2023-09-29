import { CSSProperties, ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { AiStartSvg, CheckSvg, ChevronDownSvg, CloseSvg, Edit1Svg, PicSvg, PublishSvg, RefreshSvg, TrashSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Singleton } from "../../component/lib/Singleton";
import { PopoverPosition } from "../popover/position";
import { Block } from "../../src/block";
import { riseLayer } from "../../component/lib/zindex";
import { channel } from "../../net/channel";
import { Loading1, Spin } from "../../component/view/spin";
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
    PromptRobot,
    SelectionPrompt,
    SelectionRobotPrompt,
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
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { KeyboardCode } from "../../src/common/keys";
import { getRobotWikiContext, getWsWikiRobots } from "../../net/ai/robot";
import { RobotApply, RobotInfo } from "../../types/user";
import { Avatar } from "../../component/view/avator/face";
import { useSelectMenuItem } from "../../component/view/menu";
import lodash from "lodash";

/**
 * The type of the options object that can be passed to the AITool component.
 */
export type AIToolType = {
    block?: Block,
    blocks?: Block[],
    pos?: PopoverPosition,
    ask?: string,
    isRun?: boolean
}

/**
 * The possible status values for the AIAskStatus enum.
 */
export enum AIAskStatus {
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

const CURRENT_ROBOT_ID = 'SHY_AI_WRITER_CURRENT_ROBOT_ID';

/**
 * The AITool component.
 */
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
    async onSelectRobot(event: React.MouseEvent) {
        var r = await useSelectMenuItem({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        },
            [
                { name: 'shyAI', text: lst('诗云AI'), icon: AiStartSvg },
                {
                    text: lst('自定义AI'),
                    type: MenuItemType.text,
                },
                ...this.robots.map(robot => {
                    return {
                        type: MenuItemType.user,
                        userid: robot.robotId,
                        value: robot.id
                    }
                })]
        );
        if (r) {
            if (r.item.name == 'shyAI') {
                this.currentRobotId = '';
                this.forceUpdate()
                if (this.mv) this.mv.forceUpdateItems(this.getItems())
            }
            else {
                this.currentRobotId = r.item.value;
                this.forceUpdate()
                if (this.mv) this.mv.forceUpdateItems(this.getItems())
            }
        }
    }
    /**
     * Renders the AITool component.
     * @returns The rendered AITool component.
     */
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
                        <span onMouseDown={e => { this.onSelectRobot(e) }} className={"flex-fixed h-30 w-40 gap-h-5 flex-center gap-r-5" + (this.robots.length > 0 ? " cursor" : "")}>
                            {!this.robot && <Icon size={18} icon={AiStartSvg}></Icon>}
                            {this.robot && <Avatar size={20} userid={this.robot.robotId}></Avatar>}
                            {this.robots.length > 0 && <Icon size={12} icon={ChevronDownSvg}></Icon>}
                        </span>
                        <div className="flex-auto flex">
                            {([AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status)) && <div className=" gap-h-10 flex remark  flex"><S>AI正在写作</S><Loading1></Loading1></div>}
                            {(![AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status)) && <DivInput
                                value={this.ask}
                                rf={e => this.textarea = e}
                                onInput={this.onInput}
                                onEnter={this.onEnter}
                                className='padding-h-10 min-h-20 l-20'
                                placeholder={lst("告诉AI写什么")} ></DivInput>}
                        </div>
                        <span className="gap-h-5 h-30 flex-center flex-fixed gap-l-10 gap-r-10">
                            {([AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status)) && <div className="h-24 flex-center">
                                <span className="gap-r-10 cursor" onMouseDown={e => this.onTry()}><S>重试</S><em className="remark gap-l-5">R</em></span>
                                <span className="cursor" onMouseDown={e => this.onEsc()}><S>取消</S><em className="remark gap-l-5">ESC</em></span>
                            </div>}
                            {(![AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status)) && <span onClick={e => this.onEnter()} className={"round size-24 flex-center cursor item-hover" + (this.ask ? " remark" : "")}>
                                <Icon size={18} icon={PublishSvg}></Icon>
                            </span>}
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
    onHander = async (item: MenuItem) => {
        var self = this;
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
                        this.error = lst('没有上文内容无法续写', '没有上文内容，无法续写');
                        self.forceUpdate()
                    }
                    break;
                case 'image':
                    if (await CanSupportFeature(PayFeatureCheck.aiImage, self.page))
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
                    if (await CanSupportFeature(PayFeatureCheck.aiImage, self.page)) {
                        var preContent = this.getPrevBlockContent();
                        this.aiImage({ prompt: preContent, genImageProp: true })
                    }
                    break;
                case 'selectionPrompt':
                    var selection = this.getPrevBlockContent();
                    var pro = self.robot.prompts.find(g => g.id == item.value);
                    if (pro) {
                        var wc = await getRobotWikiContext(self.robot, self.ask, pro.prompt)
                        var content = '';
                        var isNotFound: boolean = wc?.notFound;
                        content = getTemplateInstance(pro.prompt, {
                            prompt: self.ask,
                            selection: selection,
                            context: wc?.context || ''
                        });
                        this.aiSelection({ isNotFound, prompt: content, model: self.robot.model || (window.shyConfig.isUS ? "gpt" : "ERNIE-Bot-turbo"), })
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
                    this.page.kit.anchorCursor.onSelectBlocks(this.options.blocks, { render: true })
                    await this.open({ blocks: this.options.blocks, ask: this.ask });
                    this.onTry();
                    break;
            }
        }
        else if ([AIAskStatus.willAsking].includes(this.status)) {
            switch (item.name) {
                case 'image':
                    if (await CanSupportFeature(PayFeatureCheck.aiImage, self.page))
                        self.aiImage({ prompt: self.ask })
                    break;
                case 'prompt':
                    var pro = self.robot.prompts.find(g => g.id == item.value);
                    var wc = await getRobotWikiContext(self.robot, self.ask, pro.prompt)
                    var content = '';
                    var isNotFound: boolean = wc?.notFound;
                    content = getTemplateInstance(pro.prompt, {
                        prompt: self.ask,
                        context: wc?.context || ''
                    });
                    this.aiText({ isNotFound, prompt: content, model: self.robot.model || (window.shyConfig.isUS ? "gpt" : "ERNIE-Bot-turbo"), })
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
        if ([AIAskStatus.willAsk].includes(this.status)) {
            if (!this.robot)
                items = [
                    { text: lst('用AI写作'), type: MenuItemType.text },
                    { name: 'continue', text: lst('用AI续写...'), icon: Edit1Svg },
                    { type: MenuItemType.divide },
                    { text: lst('基于页面生成'), type: MenuItemType.text },
                    { name: 'pageSummary', text: lst('页面内容总结'), icon: Edit1Svg },
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
                        icon: Edit1Svg
                    }
                ];
            else if (Array.isArray(this.robot?.prompts) && this.robot.prompts.findAll(g => g.apply == RobotApply.askWrite && g.prompt && g.prompt.indexOf('{prompt}') == -1).length > 0) items = this.robot.prompts.findAll(g => g.apply == RobotApply.askWrite && g.prompt && g.prompt.indexOf('{prompt}') == -1).map(pro => {
                return { name: 'prompt', value: pro.id, text: pro.text, icon: pro.icon }
            })
            else items = [];
        }
        else if ([AIAskStatus.willAsking].includes(this.status)) {
            if (this.robot) {
                items = [
                    { name: 'image', text: lst('生成图片'), icon: PicSvg },
                ]
            }
            else if (Array.isArray(this.robot?.prompts) && this.robot.prompts.findAll(g => g.apply == RobotApply.askWrite && g.prompt && g.prompt.indexOf('{prompt}') > -1).length > 0) items = this.robot.prompts.findAll(g => g.apply == RobotApply.askWrite && g.prompt && g.prompt.indexOf('{prompt}') > -1).map(pro => {
                return { name: 'prompt', value: pro.id, text: pro.text, icon: pro.icon }
            })
            else items = [];
        }
        else if ([AIAskStatus.asked].includes(this.status)) {
            items = [
                { name: 'done', text: lst('完成'), icon: CheckSvg },
                { name: 'continue', text: lst('继续'), icon: Edit1Svg },
                // { name: 'makeLonger', text: '内容加长', icon: Edit1Svg },
                // {name:'',text:'',icon:Edit1Svg},
                { type: MenuItemType.divide },
                { name: 'try', text: lst('重新尝试'), icon: RefreshSvg },
                { name: 'cancel', text: lst('取消'), icon: CloseSvg }
            ]
        }
        else if ([AIAskStatus.selectionWillAsk].includes(this.status)) {
            if (!this.robot)
                items = [
                    { text: lst('编辑优化选择的内容'), type: MenuItemType.text },
                    { name: 'improveWrite', text: lst('提升写作'), icon: Edit1Svg },
                    { name: 'fix', text: lst('拼写及语法优化'), icon: Edit1Svg },
                    { name: 'explain', text: lst('解释'), icon: Edit1Svg },
                    { name: 'summary', text: lst('总结'), icon: Edit1Svg },
                    { name: 'abstract', text: lst('摘要'), icon: Edit1Svg },
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
                        icon: Edit1Svg
                    },
                    { type: MenuItemType.divide },
                    { name: 'makeLonger', text: lst('变长一些'), icon: Edit1Svg },
                    { name: 'makeSmaller', text: lst('简洁一些'), icon: Edit1Svg },
                    {
                        text: '润色',
                        icon: Edit1Svg,
                        childs: [
                            { name: 'polish', text: lst('更专业一些'), icon: Edit1Svg },
                            { name: 'polish', text: lst('更友好一些'), icon: Edit1Svg },
                            { name: 'polish', text: lst('更自信一些'), icon: Edit1Svg },
                            { name: 'polish', text: lst('更直接一些'), icon: Edit1Svg },
                            { name: 'polish', text: lst('更口语话一些'), icon: Edit1Svg },
                        ]
                    },
                    { name: 'insertImage', text: lst("生成插图"), icon: PicSvg },
                ];
            else if (Array.isArray(this.robot?.prompts) && this.robot.prompts.findAll(g => g.apply == RobotApply.selectionAskWrite && g.prompt && g.prompt.indexOf('{prompt}') == -1))
                items = this.robot.prompts.findAll(g => g.apply == RobotApply.selectionAskWrite && g.prompt && g.prompt.indexOf('{prompt}') == -1).map(pro => {
                    return { name: 'selectionPrompt', value: pro.id, text: pro.text, icon: pro.icon }
                })
            else items = [];
        }
        else if ([AIAskStatus.selectionWillAsking].includes(this.status)) {
            if (!this.robot)
                items = []
            else if (Array.isArray(this.robot?.prompts) && this.robot.prompts.findAll(g => g.apply == RobotApply.selectionAskWrite && g.prompt && g.prompt.indexOf('{prompt}') > -1))
                items = this.robot.prompts.findAll(g => g.apply == RobotApply.selectionAskWrite && g.prompt && g.prompt.indexOf('{prompt}') > -1).map(pro => {
                    return { name: 'selectionPrompt', value: pro.id, text: pro.text, icon: pro.icon }
                })
            else items = [];
        }
        else if ([AIAskStatus.selectionAsked].includes(this.status)) {
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
    status: AIAskStatus = AIAskStatus.none;
    anwser: string = '';
    onEnter = async () => {
        var self = this;
        if (this.ask) {
            if (this.robot) {
                var wc = await getRobotWikiContext(this.robot, self.ask, '{context}');
                if (this.options.block) {
                    var propTemplate = getTemplateInstance(PromptRobot, { prompt: self.ask, context: wc?.context, });
                    this.aiText({ isNotFound: wc?.notFound, prompt: propTemplate, model: self.robot.model || (window.shyConfig.isUS ? "gpt" : "ERNIE-Bot-turbo"), })
                }
                else if (this.options.blocks) {
                    var preContent = this.getPrevBlockContent();
                    var propTemplate = getTemplateInstance(SelectionRobotPrompt, { prompt: self.ask, context: wc?.context, selection: preContent });
                    this.aiSelection({ isNotFound: wc?.notFound, prompt: propTemplate, model: self.robot.model || (window.shyConfig.isUS ? "gpt" : "ERNIE-Bot-turbo"), })
                }
            }
            else {
                if (this.options.block) this.aiText({ prompt: self.ask })
                else if (this.options.blocks) {
                    var preContent = this.getPrevBlockContent();
                    var propTemplate = getTemplateInstance(SelectionPrompt, { prompt: self.ask, selection: preContent });
                    this.aiSelection({ prompt: propTemplate })
                }
            }
        }
    }
    options: AIToolType = {
        block: null,
        pos: null
    }
    async open(options: AIToolType) {
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
        this.robots = (await getWsWikiRobots()) || [];
        var rid = await channel.query('/cache/get', { key: CURRENT_ROBOT_ID });
        if (rid) this.currentRobotId = rid;
        if (!this.robots.exists(g => g.id == this.currentRobotId)) {
            this.currentRobotId = '';
        }
        this.updateView(() => {
            if (this.textarea)
                this.textarea.focus()
            if (options.isRun) {
                this.onEnter()
            }
        })
    }
    robots: RobotInfo[] = [];
    currentRobotId: string = '';
    get robot() {
        return this.robots.find(g => g.id == this.currentRobotId)
    }
    controller?: AbortController
    lastCommand: { ask: string, command: 'text' | 'image' | 'selection', options?: any } = null;
    async aiText(options: { prompt?: string, model?: string, isNotFound?: boolean }) {
        this.controller = null;
        if (typeof options.model == 'undefined') options.model = this?.page?.ws?.aiConfig?.text
        this.lastCommand = { ask: this.ask, command: 'text', options: lodash.cloneDeep(options) };
        var self = this;
        this.status = AIAskStatus.asking;
        self.anwser = '';
        this.updateView()
        var scope = '';
        if (options?.isNotFound) {
            self.anwser = lst('未找到匹配的答案')
            var done = true;
            self.writer.accept(scope, done);
            if (done) {
                console.log('answer', JSON.stringify(self.anwser))
                var bs = self.writer.writedBlocks;
                var p = bs.first().parent;
                if (bs.some(s => s.url == BlockUrlConstant.List && (s as List).listType == ListType.number)) {
                    await onMergeListBlocks(self.page, bs);
                    bs = bs.findAll(g => g.parent == p);
                }
                self.writer.page.kit.anchorCursor.onSelectBlocks(bs, { render: true })
                self.status = AIAskStatus.asked;
                self.updateView();
            }
        }
        else {
            await channel.post('/text/ai/stream', {
                question: options?.prompt,
                model: options?.model,
                async callback(str, done, contoller) {
                    if (contoller) { self.controller = contoller; return }
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
                        var p = bs.first().parent;
                        if (bs.some(s => s.url == BlockUrlConstant.List && (s as List).listType == ListType.number)) {
                            await onMergeListBlocks(self.page, bs);
                            bs = bs.findAll(g => g.parent == p);
                        }
                        self.writer.page.kit.anchorCursor.onSelectBlocks(bs, { render: true })
                        self.status = AIAskStatus.asked;
                        self.updateView();
                    }
                }
            });
        }

    }
    async aiSelection(options: { prompt?: string, model?: string, isNotFound?: boolean }) {
        this.controller = null;
        this.lastCommand = { ask: this.ask, command: 'selection', options: lodash.cloneDeep(options) };
        if (typeof options.model == 'undefined') options.model = this?.page?.ws?.aiConfig?.text
        var self = this;
        this.status = AIAskStatus.selectionAsking;
        self.anwser = '';
        this.updateView()
        if (options?.isNotFound) {
            self.anwser = lst('未找到匹配的答案')
            if (self.mdEl) {
                self.mdEl.scrollTop = self.mdEl.scrollHeight
            }
            self.status = AIAskStatus.selectionAsked;
            self.updateView()
        }
        else {
            await channel.post('/text/ai/stream', {
                question: options.prompt,
                model: options.model,
                callback(str, done, contoller) {
                    if (contoller) { self.controller = contoller; return }
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
    }
    async aiImage(options: { prompt?: string, model?: string, isNotFound?: boolean, genImageProp?: boolean }) {
        this.controller = null;
        if (typeof options.model == 'undefined') options.model = this?.page?.ws?.aiConfig?.image
        this.lastCommand = { ask: this.ask, command: 'image', options: lodash.cloneDeep(options) };
        var ask = options?.prompt;
        if (!ask) return;
        var self = this;
        if (this.options.block) this.status = AIAskStatus.asking;
        else this.status = AIAskStatus.selectionAsking;
        this.updateView()
        if (options?.genImageProp) {
            var g = await channel.post('/text/ai', {
                model: this?.page?.ws?.aiConfig?.text,
                input: getTemplateInstance(ImagePrompt, { content: options.prompt })
            })
            if (g.ok) {
                ask = g.data.message;
            }
        }
        // console.log(options, ask);
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
        if (this.onKeydown) document.removeEventListener('keydown', this.onKeydown, true);
    }
    onKeydown(event: KeyboardEvent) {
        if (event.key == KeyboardCode.Esc) {
            if ([AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status)) {
                this.onEsc();
            }
        }
        else if (event.key == KeyboardCode.R) {
            if ([AIAskStatus.asking, AIAskStatus.selectionAsking].includes(this.status)) {
                this.onTry();
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
            this.status = AIAskStatus.none;
            this.updateView();
            this.emit('close');
        }
    }
    onTry() {
        if (this.controller)
            this.controller.abort()
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
        if (this.controller)
            this.controller.abort()
    }
}

export var aiTool: AITool;
export async function useAITool(options: AIToolType) {
    aiTool = await Singleton(AITool);
    await aiTool.open(options);
    return new Promise((resolve: (d: { ask: string, aiTool: AITool }) => void, reject) => {
        aiTool.only('save', d => {
            resolve(d)
        })
        aiTool.only("close", () => {
            resolve(null);
        })
    })
}

