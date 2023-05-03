import React from "react";
import "./style.less";

export class Pagination extends React.Component<{
    size: number,
    index: number,
    total: number,
    onChange?: (index: number, size: number) => void
}>{
    getPages() {
        var page = Math.ceil(this.props.total / this.props.size);
        var index: number = this.props.index;
        if (index <= 0) index = 1;
        if (index > page) index = page;
        var ps: (string | number)[] = [];
        if (this.props.total > 0) {
            if (index - 3 > 1) [1, "...", index - 2, index - 1, index].forEach((p) => ps.push(p));
            else for (var i = 1; i <= index; i++) ps.push(i);
            if (index + 3 < page) [index + 1, index + 2, "...", page].forEach((p) => ps.push(p));
            else for (var j = index + 1; j <= page; j++) ps.push(j);
        } else ps = [];
        return ps.map((p) => {
            var classList: string[] = ["shy-pagination-page"];
            if (p == index) classList.push("shy-pagination-current");
            else if (typeof p == "number") {
            } else classList.push("shy-pagination-text");
            return {
                text: p,
                index: typeof p == "number" ? p : undefined,
                classList,
            };
        });
    }
    render() {
        var page = Math.ceil(this.props.total / this.props.size);
        if (page < 2) return <></>
        var size = this.props.size;
        return <div className='shy-pagination flex-center'>{this.getPages().map((pa, i) => {
            return <a key={i} className={pa.classList.join(" ")} onMouseDown={e => pa.index && this.props.onChange(pa.index, size)}>{pa.text}</a>
        })}</div>
    }
}