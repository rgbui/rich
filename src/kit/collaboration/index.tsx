import React from "react";
import { Kit } from "..";
import { Avatar } from "../../../component/view/avator/face";
import { FixedViewScroll } from "../../common/scroll";
import { Point } from "../../common/vector/point";
import "./style.less";

export class Collaboration extends React.Component<{ kit: Kit }>{
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.el) {
                this.offset = offset.clone();
                this.forceUpdate();
                // this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
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
    users: { userid: string, point?: Point, offset?: Point }[] = [];
    push(userid: string, operate: { blockId: string, prop: string, offset: 0 }) {
        try {
            var block = this.props.kit.page.find(g => g.id == operate.blockId);
            if (block) {
                var rowBlock = block.closest(x => x.isBlock);
                if (rowBlock) {
                    var rect = rowBlock.getVisibleBound();
                    if (this.users.some(s => s.userid == userid)) {
                        var ur = this.users.find(g => g.userid == userid);
                        ur.point = rect.leftTop.move(-30, 0);
                        ur.offset = this.offset.clone();
                    }
                    else {
                        this.users.push({ userid, offset: this.offset.clone(), point: rect.leftTop.move(-30, 0) })
                    }
                    this.forceUpdate();
                    return;
                }
            }
            else if (userid) {
                this.users.remove(g => g.userid == userid);
                this.forceUpdate();
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
                return <div key={u.userid} className="shy-collaboration-user" style={{ top: u.point.y + (this.offset.y - u.offset.y), left: u.point.x + (this.offset.x - u.offset.x) }} ><Avatar size={24} userid={u.userid}></Avatar></div>
            })}
        </div>
    }
}