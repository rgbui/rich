import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { channel } from "../../net/channel";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";
import { Textarea } from "../../component/view/input/textarea";
import { Button } from "../../component/view/button";
import { Avatar } from "../../component/view/avator/face";
import { UserBox } from "../../component/view/avator/user";
import { util } from "../../util/util";
import { RobotApply, RobotInfo } from "../../types/user";
import { marked } from "marked";
import { AskTemplate, getTemplateInstance } from "../ai/prompt";
import { Divider } from "../../component/view/grid";
import { getWsWikiRobots } from "../../net/ai/robot";
import { DownSvg, SearchSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { Rect } from "../../src/common/vector/point";
import { MenuItemType } from "../../component/view/menu/declare";
import { ToolTip } from "../../component/view/tooltip";
import { useSearchBox } from "./keyword";

export class AISearchBox extends EventsComponent {
    renderMessages() {
        return this.messages.map(msg => {
            return <div key={msg.id}>
                <UserBox userid={msg.userid}>{(user) => {
                    return <div className="flex flex-top gap-h-10">
                        <div className="flex-fixed gap-r-10">
                            <Avatar size={30} user={user}></Avatar>
                        </div>
                        <div className="flex-atuo">
                            <div className="flex">
                                <span className="flex-fixed">{user.name}</span>
                                <span className="flex-auto gap-l-10 remark">{util.showTime(msg.date)}</span>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: msg.content }}>
                            </div>
                        </div>
                    </div>
                }}</UserBox>
            </div>
        })
    }
    async openSearch(event: React.MouseEvent) {
        this.emit('close');
        await channel.act('/cache/set', { key: 'search-mode', value: 'keyword' })
        useSearchBox();
    }
    render() {
        return <div className="w-800 bg-white  round flex flex-col flex-full">
            <div className="padding-w-10 flex r-gap-r-10 padding-h-5">
                {this.robotId && <Avatar size={30} userid={this.robotId}></Avatar>}
                <span className="remark flex-auto text-overflow">{this.robot?.slogan || (this.robot?.remark || '').slice(0, 30) || '语义搜索'}</span>
                <span className="flex-fixed">
                    <ToolTip overlay={'切换成关键词搜索'}>   <span
                        onMouseDown={e => this.openSearch(e)}
                        className="size-24 flex-center item-hover cursor round"><Icon
                            size={20}
                            icon={SearchSvg}
                        ></Icon></span></ToolTip>

                </span>
            </div>
            <Divider></Divider>
            <div className="padding-w-10 min-h-120 overflow-y" ref={e => this.scrollEl = e}>
                {!this.robotId && <div className="remark flex-center gap-h-30 ">无AI机器人,了解<a href='https://help.shy.live/page/1075' className="remark underline" target="_blank">如何训练自已的机器人</a></div>}
                {this.renderMessages()}
            </div>
            <Divider></Divider>
            <div className="flex flex-top padding-w-10 gap-h-10">
                <span className="flex-fixed flex" onMouseDown={e => this.changeRobot(e)}>
                    {this.robotId && <Avatar size={30} userid={this.robotId}></Avatar>}
                    <Icon className={'gap-l-5'} size={12} icon={DownSvg}></Icon>
                </span>
                <div className="flex-auto gap-w-10"><Textarea value={this.prompt} onChange={e => this.prompt = e} onEnter={e => this.send(e, this.button)} style={{ height: 60 }}></Textarea></div>
                <Button ref={e => this.button = e} onClick={(e, b) => this.send(e, b)} className="flex-fixed">发送</Button>
            </div>
        </div>
    }
    button: Button;
    textarea: Textarea;
    scrollEl: HTMLElement;
    prompt: string = '';
    robots: RobotInfo[] = [];
    robotId: string = '';
    get robot() {
        return this.robots.find(g => g.robotId == this.robotId);
    }
    async send(event: React.MouseEvent, b: Button) {
        try {
            var self = this;
            b.loading = true;
            var prompt = this.prompt;
            this.prompt = '';
            var u = channel.query('/query/current/user');
            var sender = { id: util.guid(), userid: u.id, date: new Date(), content: prompt }
            this.messages.push(sender)
            this.forceUpdate();
            if (this.scrollEl) {
                this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
            }
            var cb = { id: util.guid(), userid: this.robot.robotId, date: new Date(), content: '' };
            this.messages.push(cb);
            this.forceUpdate();
            var g = await channel.get('/query/wiki/answer', { robotId: this.robot.robotId, ask: prompt });
            if (g.data?.contents?.length > 0) {
                var pro = (this.robot?.prompts || []).find(g => g.apply == RobotApply.search);
                var text = '';
                cb.content = `<span class='typed-print'></span>`;
                var content = getTemplateInstance(pro ? pro.prompt : AskTemplate, {
                    prompt: prompt,
                    context: g.data.contents[0].content
                });
                this.forceUpdate();
                await channel.post('/text/ai/stream', {
                    question: content,
                    callback(str, done) {
                        console.log(str, done);
                        if (typeof str == 'string') text += str;
                        cb.content = marked.parse(text + (done ? "" : "<span class='typed-print'></span>"));
                        self.forceUpdate(() => {
                            var el = document.querySelector('.typed-print');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        });
                    }
                });
            }
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
            b.loading = false;
        }
    }
    async changeRobot(event: React.MouseEvent) {
        var r = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, [
            ...this.robots.map(r => {
                return {
                    type: MenuItemType.user,
                    userid: r.robotId,
                    size: 24
                }
            })
        ]);
        if (r) {
            console.log(r.item.userid);
            this.robotId = r.item.userid;
        }
    }
    messages: { id: string, userid: string, date: Date, content: string }[] = [];
    el: HTMLElement;
    async open() {
        this.robots = await getWsWikiRobots();
        this.robotId = this.robots[0]?.robotId;
        this.forceUpdate();
    }
}

export async function useAISearchBox() {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(AISearchBox, { mask: true, frame: true, shadow: true, });
    let fv = await popover.open(pos);
    fv.open();
    return new Promise((resolve: (p: { id: string, content?: string }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}