import React from "react";
import { Kit } from "..";
import { UserBox } from "../../../component/view/avator/user";
import { util } from "../../../util/util";
import { FixedViewScroll } from "../../common/scroll"

import { Point, Rect } from "../../common/vector/point";
import { Avatar } from "../../../component/view/avator/face";
import "./style.less";
import lodash from "lodash";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { UserAction } from "../../history/action";
import { AppearCursorPos, SnapshootBlockPos } from "../../history/snapshoot";
import { ColorUtil } from "../../../util/color";

var colors = [
    '#55efc4',
    '#81ecec',
    '#74b9ff',
    '#a29bfe',
    '#00b894',
    '#00cec9',
    '#0984e3',
    '#6c5ce7',
    '#ffeaa7',
    '#fab1a0',
    '#ff7675',
    '#fd79a8',
    '#fdcb6e',
    '#e17055',
    '#d63031',
    '#e84393'
]

const dure = 1000 * 60 * 2;

export class Collaboration extends React.Component<{ kit: Kit }> {
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.el) {
                this.offset = offset.clone();
                this.forceUpdate();
            }
        })
    }
    time
    componentDidMount() {
        var sc = this.props.kit.page.getScrollDiv();
        if (sc) this.fvs.bind(sc);
        this.time = setInterval(() => {
            this.autoClear()
        }, dure)
    }
    autoClear() {
        var el = this.props.kit.page.contentEl;
        if (el) {
            var rs = el.querySelectorAll('[data-user-selected-time]');
            var now = new Date().getTime();
            rs.forEach(e => {
                var t = e.getAttribute('data-user-selected-time');
                if (t) {
                    var n = parseInt(t);
                    if (lodash.isNumber(n) && now - n > dure) {
                        e.classList.remove('shy-appear-text-user-selected');
                        e.removeAttribute('data-user-selected-time');
                        (e as HTMLElement).style.removeProperty('--user-selected-color');
                    }
                }
            })
        }
    }
    componentWillUnmount() {
        this.fvs.unbind();
        if (this.time) clearInterval(this.time);
    }
    private static UserColor: Map<string, string> = new Map();
    static getUserColor(userid: string) {
        var r = this.UserColor.get(userid);
        if (r) return r;
        if (this.UserColor.size > colors.length) {
            var c = colors.randomOf();
            this.UserColor.set(userid, c);
            return c;
        }
        else {
            var vs = Array.from(this.UserColor.values());
            var rs = colors.findAll(g => !vs.includes(g));
            var c = rs.randomOf();
            if (!c) c = colors.randomOf();
            this.UserColor.set(userid, c);
            return c;
        }
    }
    private fvs: FixedViewScroll = new FixedViewScroll();
    private offset: Point = new Point(0, 0);
    private userOperates: { id: string, eles: HTMLElement[], cursor?: boolean, rects: Rect[], timeOut: any, clear: (force?: boolean) => void, userid: string, color: string, point?: Point, offset?: Point }[] = [];
    private clearUser(userid: string, force?: boolean) {
        var u = this.userOperates.find(g => g.userid == userid);
        if (u) {
            clearTimeout(u.timeOut);
            u.clear(force);
        }
    }
    clearNotOnLineUser(users: string[]) {
        var us = this.userOperates.findAll(g => !users.includes(g.userid));
        for (let i = 0; i < us.length; i++) {
            us[i].clear(true);
        }
    }
    renderUserAction(actions: UserAction[]) {
        var action = actions.last();
        var name = typeof action.directive == 'number' ? ActionDirective[action.directive] : action.directive;
        // console.log(name);
        var op = action.operators.last();
        var opName = typeof op.directive == 'number' ? OperatorDirective[op.directive] : op.directive;
        // console.log(name, opName, op);
        var page = this.props.kit.page;
        if (op?.directive == OperatorDirective.$change_cursor_offset) {
            var oc: {
                old_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] },
                new_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] }
            } = op.data as any;
            if (oc.new_value.blocks?.length > 0) {
                var bs = page.findAll(g => oc.new_value.blocks.some(s => s.blockId == g.id));
                if (bs.length > 0) {
                    var rs = bs.map(b => b.getVisibleBound());
                    this.renderRects(action.userid, rs);
                }
            }
            else {
                if (!(oc.new_value.start && oc.new_value.end)) return;
                var startBlock = page.find(x => x.id == oc.new_value.start.blockId);
                if (startBlock) {
                    var startAppear = startBlock.appearAnchors.find(g => g.prop == oc.new_value.start.prop);
                    var endBlock = oc.new_value.end.blockId == startBlock?.id ? startBlock : page.find(x => x.id == oc.new_value.end.blockId);
                    var endAppear = !endBlock ? startAppear : endBlock.appearAnchors.find(g => g.prop == oc.new_value.end.prop);
                    var so = oc.new_value.start.offset;
                    var eo = oc.new_value.end.offset ? oc.new_value.end.offset : so;
                    var range = document.createRange();
                    // 选择从第n个字符开始的文本
                    console.log(startAppear.el, so, endAppear.el, so);
                    var sa = startAppear.cacCollapseFocusPos(so);
                    var ea = endAppear.cacCollapseFocusPos(eo);
                    range.setStart(sa.node, sa.pos);
                    range.setEnd(ea.node, ea.pos);
                    if (startAppear == endAppear && so == eo) {
                        // 获取第n个字符的矩形区域
                        var rect = range.getBoundingClientRect();
                        this.renderRects(action.userid, [Rect.from(rect)])
                    }
                    else {
                        var rects = range.getClientRects();
                        var rs = Array.from(rects).map(g => Rect.from(g));
                        this.renderRects(action.userid, rs);
                    }
                }
            }
        }
    }
    renderRects(userid: string, rects: Rect[]) {
        this.clearUser(userid);
        var c = Collaboration.getUserColor(userid);
        var point = Rect.getTopStartFromRects(rects);
        var id = util.guid();
        var self = this;
        var us: Partial<ArrayOf<Collaboration['userOperates']>> = {
            id,
            userid,
            rects,
            cursor: false,
            color: c,
            point: point,
            offset: this.offset.clone(),
            clear: (force?: boolean) => {
                var se = self.userOperates.find(g => g.id == id);
                if (se) {
                    self.userOperates.remove(g => g.id == id);
                    if (force) self.forceUpdate()
                }
            },
            timeOut: setTimeout(() => {
                var se = self.userOperates.find(g => g.id == id);
                if (se) {
                    se.clear(true);
                }
            }, dure)
        };
        this.userOperates.push(us as any);
        this.forceUpdate();
    }
    el: HTMLElement;
    render() {
        return <div className="shy-collaboration" ref={e => this.el = e} >
            {this.userOperates.map(u => {
                var top = u.point.y + (this.offset.y - u.offset.y);
                var left = u.point.x + (this.offset.x - u.offset.x);
                return <div key={u.id} className="shy-collaboration-user" style={{
                    top: top,
                    left: left
                }}>
                    <UserBox userid={u.userid}>{(user) => {
                        return <div className="flex h-24" style={{ position: 'absolute', top: -30, left: 0 }}  >
                            {user.avatar?.url && <Avatar className="flex-center flex-fixed" user={user} size={24}></Avatar>}
                            <span style={{ backgroundColor: u.color, height: 18 }} className="gap-l-5 text-nowrap round l-18 padding-w-4 text-white">{user.name}</span>
                        </div>
                    }}</UserBox>
                    {u.rects.map((re,i) => {
                        var isSize = re.width < 2;
                        return <div key={i} style={{
                            borderRadius: 2,
                            position: 'absolute',
                            top: re.top-u.point.y  + (isSize ? -2 : 0),
                            left: re.left-u.point.x  + (isSize ? -1 : 0),
                            width: isSize ? 2 : re.width,
                            height: re.height + (isSize ? 4 : 0),
                            backgroundColor: isSize ? u.color : ColorUtil.opacity(u.color, 0.3)
                        }}></div>
                    })}
                </div>
            })}
        </div>
    }
}