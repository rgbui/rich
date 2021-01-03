import { SelectorView } from "../selector/selector";

export interface EditorView extends Vue {
    /**
     * 渲染更新所有block
     * @param blocks 
     */
    renderBlocks(blocks: Record<string, any>[]);
    /**
     * 获取选择器视图对象
     */
    readonly selector: SelectorView
}