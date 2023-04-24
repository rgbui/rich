import React, { CSSProperties } from "react";
import { ChatInput } from "../chat";
import { RobotInfo, RobotTask, UserStatus } from "../../../../types/user";
import { createPortal } from "react-dom";
import { Rect } from "../../../../src/common/vector/point";
import { SpinBox } from "../../spin";
import lodash from "lodash";
import { Avatar } from "../../avator/face";
import { Line } from "../../grid";

export class ChatCommandInput extends React.Component<{
    cp: ChatInput,
    searchRobots?: () => Promise<RobotInfo[]>,
    select: (task: RobotTask, robot: RobotInfo) => void,
}>{
    robots: RobotInfo[] = [];
    showRobotId: string = '';
    tasks: RobotTask[] = [];
    visible: boolean = false;
    rect: Rect = new Rect();
    loading: boolean = false;
    node: HTMLElement;
    nodeText: string;
    nodeOffset: number;
    async open() {
        try {
            var sel = window.getSelection();
            this.node = sel.focusNode as any;
            /**
             * current text "sssss @" 基中“@”还没有输入
             */
            this.nodeText = this.node === this.props.cp.richEl ? this.props.cp.richEl.innerHTML : this.node.textContent;
            this.nodeOffset = sel.focusOffset;
            this.visible = true;
            var rect = Rect.fromEle(this.props.cp.richEl);
            this.rect = new Rect(rect.left - 35, rect.top - 250 - 10 - 5, rect.width + 60, 250);
            await this.load()
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            this.forceUpdate()
        }
    }
    back() {
        // var sel = window.getSelection();
        // if (sel.focusOffset < this.nodeOffset) {
        //     this.hide()
        // }
    }
    render(): React.ReactNode {
        var style: CSSProperties = {
            top: this.rect.top,
            left: this.rect.left,
            width: this.rect.width,
            height: this.rect.height,
            userSelect: 'none',
            // transform: 'translate(0px, -100%)',
            zIndex: '10000'
        };
        if (this.visible) style.display = 'block';
        else style.display = 'none';
        var currentRobot = this.robots.find(c => c.id == this.showRobotId);
        return createPortal(<div
            ref={e => this.el = e}
            className="bg-white pos border shadow  round-8  overflow-y" style={style}>
            <SpinBox spin={this.loading}></SpinBox>
            <div className="flex flex-full w100 h100">
                <div className="flex-fixed w-60 flex flex-col bg">
                    {this.robots.map(robot => {
                        return <div
                            className={"gap-h-10 size-40 item-hover cursor flex-center round " + (this.showRobotId == robot.id ? " item-hover-focus" : "")}
                            onMouseDown={e => this.showRobotId = robot.id}
                            key={robot.id}
                        ><Avatar size={30} user={robot}></Avatar></div>
                    })}
                </div>
                <div className="flex-auto padding-14">
                    {(currentRobot?.tasks || []).map(c => {
                        return <div className="flex visible-hover padding-10 min-h-30 item-hover gap-h-10 round flex-top" onMouseDown={e => this.select(c)} key={c.id}>
                            <div className="flex-auto">
                                <div className="flex">
                                    <span className="flex-fixed">/{c.name}</span>
                                    <Line className={'flex-fixed'}></Line>
                                    <div className="flex-auto visible flex">{c.args.map(arg => {
                                        return <span className="gap-r-5" key={arg.id}>{arg.name}</span>
                                    })}</div>
                                </div>
                                <div className="remark f-12">{c.description}</div>
                            </div>
                            <div className="flex-fixed">{currentRobot?.name}</div>
                        </div>
                    })}
                </div>
            </div>
            {this.word && <div>
                {this.tasks.map(ta => {
                    var robot = this.getRobot(ta);
                    return <div className='flex cursor' onMouseDown={e => this.select(ta)} key={ta.id}>
                        <span className="flex-fixed"><Avatar size={40} user={robot}></Avatar></span>
                        <span className="flex-auto">
                            <div><span>/{ta.name}</span></div>
                            <div className="remark f-12">{ta.description}</div>
                        </span>
                        <span className="flex-fixed">
                            <span>{robot.name}</span>
                        </span>
                    </div>
                })}
            </div>}
            {this.robots.length == 0 && this.loading == false && <div className="remark f-12">没有搜到机器人</div>}
        </div>, this.panel)
    }
    getRobot(task: RobotTask) {
        return this.robots.find(r => r.tasks.includes(task))
    }
    private _panel: HTMLElement;
    get panel() {
        if (!this._panel) {
            this._panel = document.createElement('div');
            document.body.appendChild(this._panel)
        }
        return this._panel;
    }
    componentDidMount(): void {
        //  this.load()
    }
    async load() {
        if (typeof this.props.searchRobots == 'function') {
            this.robots = await this.props.searchRobots()
            this.showRobotId = this.robots[0].id;
        }
        else {
            this.robots = [
                {
                    id: '1',
                    name: '机器人1',
                    sn: 1,
                    role: 'robot',
                    avatar: { name: 'none', url: 'https://img.yzcdn.cn/vant/cat.jpeg' } as any,
                    status: UserStatus.online,
                    slogan: '',
                    online: true,
                    scene: 'task',
                    tasks: [
                        {
                            id: '1', name: '任务1', description: '任务1描述', args: [
                                { id: '1', name: '参数1', text: '', type: 'text' },
                                { id: '2', name: '参数2', text: '', type: 'text' }
                            ]
                        },
                        {
                            id: '2', name: '任务2', description: '任务2描述', args: [
                                { id: '1', name: '参数1', text: '', type: 'text' },
                                { id: '2', name: '参数2', text: '', type: 'text' }
                            ]
                        },
                    ]
                },
            ]
            this.showRobotId = this.robots[0].id;
        }
    }
    componentWillUnmount(): void {
        if (this.panel) this.panel.remove()
    }
    keydown(key: string) {
        var tasks: RobotTask[] = this.word ? this.tasks : this.robots.find(c => c.id == this.showRobotId)?.tasks || [];
        if (key == 'enter') {
            var g = this.tasks[this.selectIndex];
            this.select(g);
        }
        else if (key == 'arrowdown') {
            if (this.selectIndex + 1 == (this.tasks.length)) { this.selectIndex = 0 }
            else this.selectIndex++;
            this.forceUpdate()
        }
        else if (key == 'arrowup') {
            if (this.selectIndex - 1 == -1) { this.selectIndex = this.tasks.length - 1 }
            else this.selectIndex--;
            this.forceUpdate()
        }
    }
    keyup() {
        var content = this.node == this.props.cp.richEl ? this.props.cp.richEl.innerHTML : this.node.textContent;
        var word = content.slice(this.nodeOffset);
        if (word && word.startsWith('/' || '、')) {
            this.search(word.slice(1))
        }
        else this.hide()
    }
    select(task: RobotTask) {
        var r = this.robots.find(c => c.tasks.includes(task))
        this.props.select(task, r);
        this.hide()
    }
    hide() {
        this.visible = false;
        this.forceUpdate()
    }
    selectIndex = 0;
    el: HTMLElement;
    word: string;
    search = lodash.debounce(async (word: string) => {
        this.loading = true;
        this.forceUpdate()
        try {
            this.word = word;
            this.tasks = [];
            this.robots.forEach(c => {
                c.tasks.forEach(g => {
                    if (g.name.indexOf(word) != -1)
                        this.tasks.push(g)
                })
            })
            this.tasks.sort((x, y) => {
                if (x.name.startsWith(word) && y.name.startsWith(word)) return 0;
                if (x.name.startsWith(word)) return -1;
                else return 1;
            })
        }
        catch (ex) {

        }
        finally {
            this.loading = false;
            this.forceUpdate()
        }
    }, 300)
}