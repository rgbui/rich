
import { Block } from "./block/block";

import Vue from "vue";
import EditorView from "./vue/view.vue";
import { Selector } from "./selector/selector";
import { Events } from "./util/events";
export class Editor extends Events {
    private blocks: Block[] = [];
    selector: Selector;
    vm;
    constructor(el: HTMLElement, options: {
        width: number,
        height: number
    }) {
        super();
        var self = this;
        new Vue({
            el: el.appendChild(document.createElement('div')),
            render: (h) => {
                return h(EditorView, {
                    ref: 'editor-view',
                    props: { width: options.width, height: options.height }
                })
            },
            computed: {
                editorView() {
                    return this.$refs['editor-view'];
                }
            },
            mounted() {
                self.vm = this.editorView;
                self.selector = new Selector(self.vm.selector, self);
                var ele = self.vm.$el as HTMLElement;
                ele.addEventListener('mousedown', self.mousedown.bind(self));
                ele.addEventListener('mouseup', self.mouseup.bind(self));
            }
        })
    }
    blur() {
        this.isFocus = false;
        this.emit("blur");
    }
    private isFocus: boolean = false;
    focus() {
        this.isFocus = true;
        this.emit('focus');
    }
    /**
     * 鼠标点击事件时，需要重新确认光标的位置，
     * 这里需要查询鼠标点在什么block上面
     * @param event 
     * 
     */
    mousedown(event: MouseEvent) {
        this.focus();
        this.selector.selectBlockByContentMousedown(event);
    }
    mouseup(event: MouseEvent) {
        /**
         * 如果处于聚焦，但焦点没有处于textarea时，需要聚焦到textarea才能输入
         */
        if (this.isFocus == true && !this.selector.focusIsInTextearea)
            this.selector.focusTextearea()
    }
    append(block: Block, at?: number) {
        this.blocks.insertAt(typeof at == 'number' ? at : this.blocks.length, block);
    }
    render() {
        this.vm.updateBlocks(this.blocks.map(b => b.viewData));
    }
    get ele(): HTMLElement {
        return this.vm.$el as HTMLElement;
    }
}