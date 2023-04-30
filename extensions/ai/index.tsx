import { CSSProperties, ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { CheckSvg, CloseSvg, Edit1Svg, MagicSvg, PicSvg, PublishSvg, RefreshSvg, TrashSvg } from "../../component/svgs";
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
import { ArticleContinue, FixSpellingGrammar, ImagePrompt, MakeLonger, MakeSmall, SummarizeTemplate, TranslateTemplate, WritingAssistant, getTemplateInstance } from "./prompt";
import { parseMarkdownContent } from "../../src/import-export/markdown/parse";


export type AIToolType = {
    block?: Block,
    blocks?: Block[],
    pos?: PopoverPosition
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
                <div className="pv  padding-w-10 min-h-30 bg-white shadow-1  round-8">
                    {[AIAskStatus.selectionAsking, AIAskStatus.selectionAsked].includes(this.status) && <>
                        <div className="padding-t-10 max-h-150 overflow-y">
                            <Markdown md={this.anwser}></Markdown>
                        </div>
                        <Divider></Divider>
                    </>
                    }
                    <div className="flex flex-top">
                        <span className="flex-fixed size-30 gap-t-5 flex-center gap-r-10">
                            <Icon size={18} icon={MagicSvg}></Icon>
                        </span>
                        <div className="flex-auto">
                            {[AIAskStatus.asking].includes(this.status) && <div className="size-30 flex-center"><Spin size={16}></Spin></div>}
                            {![AIAskStatus.asking].includes(this.status) && <DivInput
                                value={this.ask}
                                rf={e => this.textarea = e}
                                onInput={this.onInput}
                                onEnter={this.onEnter}
                                className='padding-h-10 min-h-20'
                                placeholder="告诉AI写什么" ></DivInput>}
                        </div>
                        <span className="size-30  gap-t-5 flex-center flex-fixed gap-l-10">
                            <span onClick={e => this.onEnter()} className=" round size-24 flex-center cursor item-hover">
                                <Icon size={18} icon={PublishSvg}></Icon>
                            </span>
                        </span>
                    </div>


                </div>
                <div
                    style={{ display: [AIAskStatus.willAsking, AIAskStatus.asking].includes(this.status) ? 'none' : 'block' }}
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
                        this.close()
                        break;
                    case 'try':
                        var blocks = this.writer.writedBlocks;
                        await this.writer.page.onBatchDelete(blocks);
                        if (this.options.block) this.writer.open(this.options.block);
                        else this.writer.selection(this.options.blocks);
                        this.onEnter()
                        break;
                    case 'continue':
                        var blocks = this.writer.writedBlocks;
                        this.open({ blocks });
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
                    case 'makeSmall':
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
                    case 'translate':
                        var preContent = this.getPrevBlockContent();
                        var propTemplate = getTemplateInstance(TranslateTemplate, { language: item.value, content: preContent });
                        this.aiSelection({ prompt: propTemplate })
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
                            this.page.onAction('AIReplaceBlocks', async () => {
                                var newBlocks = await b.parent.appendArrayBlockData(blockDatas, b.at + 1, b.parentKey);

                                if (newBlocks.length > 0)
                                    newBlocks.last().mounted(() => {
                                        this.page.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true });
                                        this.open({ blocks: newBlocks });
                                    })
                                else this.close()
                                for (let i = 0; i < bs.length; i++) {
                                    await bs[i].delete()
                                }
                            })
                        }
                        break;
                    case 'insertBelow':
                        var blockDatas = await parseMarkdownContent(this.anwser);
                        var bs = this.options.blocks || [];
                        var b = this.page.visibleSearchBlocks(bs, 'last');
                        if (b) {
                            this.page.onAction('AIReplaceBlocks', async () => {
                                var newBlocks = await b.parent.appendArrayBlockData(blockDatas, b.at + 1, b.parentKey);
                                if (newBlocks.length > 0)
                                    newBlocks.last().mounted(() => {
                                        this.page.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true });
                                        this.open({ blocks: newBlocks });
                                    })
                                else this.close()

                            })
                        }
                        break;
                    case 'done':
                    case 'cancel':
                        this.close()
                        break;
                    case 'try':
                        this.anwser = '';
                        if (this.options.block) this.writer.open(this.options.block);
                        else this.writer.selection(this.options.blocks);
                        this.onEnter()
                        break;
                    // case 'continue':

                    //     break;
                    // case 'makeLonger':
                    //     break;
                }
            }
        }
        function click(item: MenuItem) {

        }
        async function input(item: MenuItem) {

        }
        var items: MenuItem[] = [];
        if ([AIAskStatus.willAsk].includes(this.status)) {
            items = [
                { text: '用AI写作', type: MenuItemType.text },
                { name: 'continue', text: '用AI续写...', icon: Edit1Svg },
                // { name: 'image', text: '插入插图', icon: PicSvg },
                { type: MenuItemType.divide },
                { text: '基于页面生成', type: MenuItemType.text },
                { name: 'pageSummary', text: '页面内容总结', icon: Edit1Svg },
                {
                    text: "翻译", childs: [
                        { text: '中文', name: 'pageTranslate', value: 'Chinese' },
                        { text: '英文', name: 'pageTranslate', value: 'English' },
                        { text: '日文', name: 'pageTranslate', value: 'Japanese' },
                        { text: '韩文', name: 'pageTranslate', value: 'Korean' }
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
                { name: 'makeLonger', text: '变长一些', icon: Edit1Svg },
                { name: 'makeSmaller', text: '简洁一些', icon: Edit1Svg },
                // { name: 'insertImage', text: "生成插图", icon: PicSvg },
                // { text: '润色', icon: Edit1Svg },
                { name: 'summary', text: '内容总结', icon: Edit1Svg },
                {
                    text: "翻译", childs: [
                        { text: '中文', name: 'translate', value: 'Chinese' },
                        { text: '英文', name: 'translate', value: 'English' },
                        { text: '日文', name: 'translate', value: 'Japanese' },
                        { text: '韩文', name: 'translate', value: 'Korean' }
                    ],
                    icon: Edit1Svg
                }
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
        return <MenuView ref={e => this.mv = e}
            input={input}
            select={select}
            click={click} style={{
                width: 300,
                maxHeight: 300,
                paddingTop: 10,
                paddingBottom: 10,
                overflowY: 'auto'
            }} items={items}></MenuView>
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
            this.status = AIAskStatus.willAsking;
            this.menuView.style.display = 'none';
        }
        else {
            this.state = AIAskStatus.willAsking;
            this.menuView.style.display = 'block';
        }
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
        this.ask = '';
        this.anwser = '';
        this.options = options;
        if (this.textarea) this.textarea.innerText = '';
        this.forceUpdate(() => {
            if (this.textarea)
                this.textarea.focus()
        })
    }
    async aiText(options?: { prompt?: string, ask?: string }) {
        var self = this;
        this.status = AIAskStatus.asking;
        self.anwser = '';
        this.forceUpdate()
        var scope = '';
        await channel.post('/text/ai/stream', {
            question: options?.prompt || options?.ask || this.ask,
            callback(str, done) {
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
                    self.writer.page.kit.anchorCursor.onSelectBlocks(self.writer.writedBlocks, { render: true })
                    // self.open({ blocks: self.writer.writedBlocks })
                    self.status = AIAskStatus.asked;
                    self.forceUpdate();
                }
            }
        });
    }
    async aiSelection(options?: { prompt?: string, ask?: string }) {
        var self = this;
        this.status = AIAskStatus.selectionAsking;
        self.anwser = '';
        this.forceUpdate()
        await channel.post('/text/ai/stream', {
            question: options?.prompt || options?.ask || this.ask,
            callback(str, done) {
                if (typeof str == 'string') {
                    self.anwser += str;
                    self.forceUpdate()
                }
                // else self.writer.accept(undefined, done);
                if (done) {
                    // console.log('done', JSON.stringify(self.anwser))
                    self.status = AIAskStatus.selectionAsked;
                    self.forceUpdate();
                }
            }
        });
    }
    async aiImage(options?: { prompt?: string, ask?: string }) {
        var inputPromput = getTemplateInstance(ImagePrompt, { content: options?.prompt || options.ask || this.ask })
        var g = await channel.post('/text/ai', { input: inputPromput })
        if (g.ok) {
            this.status = AIAskStatus.asking;
            var r = await channel.post('/http', {
                url: '/text/to/image',
                method: 'post',
                data: { prompt: g.data.message }
            });
            if (r?.ok) {
                console.log(r.data.images);
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
            this.fvs.unbind();
            this.visible = false;
            this.forceUpdate();
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

