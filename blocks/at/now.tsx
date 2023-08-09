import dayjs from "dayjs";
import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";

@url('/now/date')
export class ShyNowDate extends Block {
    display = BlockDisplay.inline;
    loadTime() {
        this.time = setInterval(() => {
            this.forceUpdate()
        }, 1000) as any;
    }
    time: number;
    async didMounted(): Promise<void> {
        this.loadTime()
    }
    async didUnmounted() {
        if (this.time) {
            clearInterval(this.time);
            this.time = null;
        }
    }
    async getHtml() {
        return `<time></time>`
    }
    async getMd() {
        return `@now`;
    }
}
@view('/now/date')
export class ShyNowDateView extends BlockView<ShyNowDate>{
    renderView() {
        return <span >{dayjs().format('YYYY-MM-DDTHH:ss:ss')}</span>
    }
}