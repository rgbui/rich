import React from "react";
import { Kit } from "..";
import { Avatar } from "../../../component/view/avator/face";
import { FixedViewScroll } from "../../common/scroll";
import { TextEle } from "../../common/text.ele";
import { Point } from "../../common/vector/point";
import "./style.less";
export class Collaboration extends React.Component<{ kit: Kit }>{
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.el) {
                this.offset = offset.clone();
                this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
            }
        })
    }
    componentDidMount() {
        this.fvs.bind(this.props.kit.page.root);
    }
    componentWillUnmount() {
        this.fvs.unbind();
    }
    private fvs: FixedViewScroll = new FixedViewScroll();
    private offset: Point = new Point(0, 0);
    users: { userid: string, point?: Point }[] = [];
    push(userid: string, operate: { blockId: string, prop: string, offset: 0 }) {
        try {
            var block = this.props.kit.page.find(g => g.id == operate.blockId);
            if (block) {
                var appear = block.appearAnchors.find(g => g.prop == operate.prop);
                if (appear && appear.el) {
                    var pr = TextEle.getLineByAt(appear.el, operate.offset);
                    if (pr?.point) {
                        if (this.users.some(s => s.userid == userid)) {
                            var ur = this.users.find(g => g.userid == userid);
                            ur.point = pr.point.relative(this.offset)
                        }
                        else {
                            this.users.push({ userid, point: pr.point.relative(this.offset) })
                        }
                        console.log(this.users);
                        this.forceUpdate();
                    }
                }
            }
        }
        catch (ex) {
            console.error(ex);
            this.props.kit.page.onError(ex);
        }
    }
    el: HTMLElement;
    render() {
        return <div className="shy-collaboration" ref={e => this.el = e} >
            {this.users.map(u => {
                return <div key={u.userid} className="shy-collaboration-user" style={{ top: u.point.y, left: u.point.x }} ><Avatar size={30} userid={u.userid}></Avatar></div>
            })}
        </div>
    }
}