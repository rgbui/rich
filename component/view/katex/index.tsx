import React from "react";
import { util } from "../../../util/util";
import { loadKatex } from "./load";



export function Katex(props: {
    latex: string,
    block?: boolean,
    className?: string | (string[]),
    onMouseDown?: (event: React.MouseEvent) => void
}) {
    var rf = React.useRef<HTMLElement>(null);
    var cs = util.covertToArray(props.className);
    async function load() {
        var katex = await loadKatex();
        var html = katex.renderToString(props.latex);
        if (rf.current) rf.current.innerHTML = html;
    }
    React.useEffect(() => {
        load()
    }, [props.latex])
    if (props.block) return <div onMouseDown={e=>props?.onMouseDown&&props?.onMouseDown(e)} className={cs.join(" ")} ref={e => rf.current = e}></div>
    else return <span  onMouseDown={e=>props?.onMouseDown&&props?.onMouseDown(e)} className={cs.join(" ")} ref={e => rf.current = e}>
    </span>
}