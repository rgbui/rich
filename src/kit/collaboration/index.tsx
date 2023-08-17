import React from "react";
import { Kit } from "..";
import { UserBox } from "../../../component/view/avator/user";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { findBlocksBetweenAppears } from "../../block/appear/visible.seek";
import { FixedViewScroll } from "../../common/scroll";
import { TextEle } from "../../common/text.ele";
import { Point, Rect } from "../../common/vector/point";
import "./style.less";
import { Avatar } from "../../../component/view/avator/face";

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

const dure = 1000 * 60 * 3;

export class Collaboration extends React.Component<{ kit: Kit }>{
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.el) {
                this.offset = offset.clone();
                this.forceUpdate();
            }
        })
    }
    componentDidMount() {
        var sc = this.props.kit.page.getScrollDiv();
        if (sc)
            this.fvs.bind(sc);
    }
    componentWillUnmount() {
        this.fvs.unbind();
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
    renderBlocks(userid: string, blocks: Block[]) {
        this.clearUser(userid);
        var self = this;
        var rects: Rect[] = [];
        var eles: HTMLElement[] = [];
        var c = Collaboration.getUserColor(userid);
        blocks.forEach(b => {
            if (b.el) {
                eles.push(b.el);
                rects.push(Rect.fromEle(b.el));
                b.el.classList.add('shy-block-user-selected')
                b.el.style.setProperty('--user-selected-color', c);
            }
        })
        var id = util.guid();
        var bound = Rect.getRectFromRects(rects);
        var us: Partial<ArrayOf<Collaboration['userOperates']>> = {
            id,
            userid,
            rects,
            eles,
            cursor: false,
            color: c,
            point: bound.leftTop,
            offset: this.offset.clone(),
            clear: (force?: boolean) => {
                var se = self.userOperates.find(g => g.id == id);
                if (se) {
                    if (Array.isArray(se.eles))
                        se.eles.forEach(e => {
                            try {
                                e.classList.remove('shy-block-user-selected');
                                e.style.removeProperty('--user-selected-color');
                            }
                            catch (ex) {
                                console.error(ex);
                            }
                        })
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
    renderSelection(userid: string,
        selecton: {
            startAnchor: AppearAnchor,
            startOffset: number,
            endAnchor: AppearAnchor,
            endOffset: number
        }) {
        this.clearUser(userid);
        if (selecton) {
            var self = this;
            var rects: Rect[] = [];
            var eles: HTMLElement[] = [];
            var c = Collaboration.getUserColor(userid)
            var cursor = false;
            if (selecton.startAnchor && selecton.startAnchor.isEqual(selecton.endAnchor) && selecton.startOffset === selecton.endOffset) {
                eles.push(selecton.startAnchor.el);
                selecton.startAnchor.el.classList.add('shy-appear-text-user-selected');
                selecton.startAnchor.el.style.setProperty('--user-selected-color', c);
                rects.push(Rect.fromEle(selecton.startAnchor.el));
                cursor = true;
            }
            else {
                if (selecton.endAnchor && selecton.endAnchor === selecton.startAnchor && selecton.endOffset < selecton.startOffset || TextEle.isBefore(selecton.endAnchor.el, selecton.startAnchor.el)) {
                    [selecton.startAnchor, selecton.endAnchor] = [selecton.endAnchor, selecton.startAnchor];
                    [selecton.startOffset, selecton.endOffset] = [selecton.endOffset, selecton.startOffset];
                }
                var appears = findBlocksBetweenAppears(selecton.startAnchor.el, selecton.endAnchor.el);
                appears.forEach(appear => {
                    eles.push(appear.el);
                    rects.push(Rect.fromEle(appear.el));
                    appear.el.classList.add('shy-appear-text-user-selected');
                    appear.el.style.setProperty('--user-selected-color', c);
                })
            }
            var id = util.guid();
            var bound = Rect.getRectFromRects(rects);
            var us: Partial<ArrayOf<Collaboration['userOperates']>> = {
                id,
                userid,
                eles,
                rects,
                cursor,
                color: c,
                point: bound.leftTop,
                offset: this.offset.clone(),
                clear: (force?: boolean) => {
                    var se = self.userOperates.find(g => g.id == id);
                    if (se) {
                        if (Array.isArray(se.eles))
                            se.eles.forEach(e => {
                                try {
                                    e.classList.remove('shy-appear-text-user-selected');
                                    e.style.removeProperty('--user-selected-color');
                                }
                                catch (ex) {
                                    console.error(ex);
                                }
                            })
                        self.userOperates.remove(g => g.id == id);
                        if (force) self.forceUpdate();
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
        }
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
                    left: left,
                    marginTop: -27,
                    marginLeft: -3
                }}>
                    <UserBox userid={u.userid}>{(user) => {
                        return <div style={{ backgroundColor: u.color, height: 24 }} className="flex flex-center round padding-w-2">
                            <Avatar className="flex-center" user={user} size={20}></Avatar>
                            <span className="gap-l-5 text-white">{user.name}</span>
                        </div>
                    }}</UserBox>
                </div>
            })}
        </div>
    }
}