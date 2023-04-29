import { CSSProperties, ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { CheckSvg, CloseSvg, Edit1Svg, PublishSvg, RefreshSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Singleton } from "../../component/lib/Singleton";
import { PopoverPosition } from "../popover/position";
import { Block } from "../../src/block";
import { riseLayer } from "../../component/lib/zindex";
import { channel } from "../../net/channel";
import { Spin } from "../../component/view/spin";
import { FixedViewScroll } from "../../src/common/scroll";
import { Point } from "../../src/common/vector/point";
import { DivInput } from "../../component/view/input/div";
import { MenuView } from "../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { AiWrite } from "./write";

export type AIToolType = {
    block?: Block,
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
                <div className="pv flex flex-top padding-w-10 min-h-30 bg-white shadow-1  round-8">
                    <span className="flex-fixed size-30 gap-t-5 flex-center gap-r-10">

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
        async function select(item: MenuItem) {
            if ([AIAskStatus.asked].includes(this.status)) {
                switch (item.name) {
                    case 'done':
                    case 'cancel':
                        this.close()
                        break;
                    case 'try':
                        break;
                    case 'continue':
                        break;
                    case 'makeLonger':
                        break;
                }
            }
            else if ([AIAskStatus.willAsk].includes(this.status)) {
                switch (item.name) {
                    case 'continue':
                        break;
                    case 'summary':
                        break;
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
                { type: MenuItemType.divide },
                { text: '基于页面生成', type: MenuItemType.text },
                {
                    name: 'summary', text: '页面内容总结', icon: Edit1Svg
                },
                {
                    text: "翻译", childs: [
                        { text: '中文', name: 'Chinese' },
                        { text: '英文', name: 'English' },
                        { text: '日文', name: 'Japlese' },
                        { text: '韩文', name: 'Korean' }
                    ],
                    icon: Edit1Svg
                }
            ];
        }
        if ([AIAskStatus.asked].includes(this.status)) {
            items = [
                { name: 'done', text: '完成', icon: CheckSvg },
                { name: 'continue', text: '继续', icon: Edit1Svg },
                { name: 'makeLonger', text: '内容加长', icon: Edit1Svg },
                // {name:'',text:'',icon:Edit1Svg},
                { type: MenuItemType.divide },
                { name: 'try', text: '重新尝试', icon: RefreshSvg },
                { name: 'cancel', text: '取消', icon: CloseSvg }
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
    status: AIAskStatus = AIAskStatus.none;
    anwser: string = '';
    onEnter = () => {
        if (this.ask)
            this.aiText()
    }
    options: AIToolType = {
        block: null,
        pos: null
    }
    open(options: AIToolType) {
        this.writer.open(options.block);
        this.fvs.unbind();
        if (options.pos.relativeEleAutoScroll) this.fvs.bind(options.pos.relativeEleAutoScroll);
        this.el.style.transform = `translate(${0}px,${0}px)`
        this.status = AIAskStatus.willAsk;
        this.visible = true;
        this.anwser = '';
        this.options = options;
        if (this.textarea) this.textarea.innerText = '';
        this.forceUpdate(() => {
            if (this.textarea)
                this.textarea.focus()
        })
    }
    async aiText() {
        var self = this;
        this.status = AIAskStatus.asking;
        self.anwser = '';
        this.forceUpdate()
        var scope = '';
        await channel.post('/text/ai/stream', {
            question: this.ask,
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
                    console.log('done', JSON.stringify(self.anwser))
                    self.status = AIAskStatus.asked;
                    self.forceUpdate();
                }
            }
        });
    }
    async aiImage() {
        this.status = AIAskStatus.asking;
        var r = await channel.post('/http', {
            url: '/text/to/image',
            method: 'post',
            data: { prompt: this.ask }
        });
        if (r?.ok) {
            console.log(r.data.images);
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

