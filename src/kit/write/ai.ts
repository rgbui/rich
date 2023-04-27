import lodash from "lodash";
import { PageWrite } from ".";
import { AITool, aiTool, useAITool } from "../../../extensions/ai";
import { AppearAnchor } from "../../block/appear";
import { BlockUrlConstant } from "../../block/constant";
import { InputStore } from "./store";

export function AiInput(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    if (event.key.toLowerCase() == ' ' || event.keyCode === 32) {
        var sel = window.getSelection();
        if (sel.focusOffset == 0 && aa.isRowStart) {
            var block = aa.block.closest(x => x.isBlock);
            var context = {
                block,
                aa,
                text: '',
                write: null,
                loadingCreateBlock: false
            }
            context.write = async () => {
                if (context.loadingCreateBlock) return;
                if (!context.text) return;
                var text = context.text;
                context.text = '';
                context.loadingCreateBlock = true;
                var ts = text.split(/\r\n|\n\n|\n\r|\n|\r/g);
                lodash.remove(ts, g => typeof g == 'undefined');
                if (ts.length == 0) return;
                if (context.aa) {
                    if (typeof ts[0] != 'undefined') {
                        context.aa.appendContent(ts[0]);
                        context.aa.endCollapse();
                        if (aiTool) aiTool.updatePosition({ pos: { roundArea: context.block.getVisibleBound() } })
                    }
                    ts = ts.slice(1);
                    if (ts.length == 0) context.loadingCreateBlock = false;
                    await InputStore(context.aa);
                }
                if (ts.length > 0) {
                    write.kit.page.onAction('AIWrite', async () => {
                        var block = context.block;
                        var at = block.at;
                        var bs = await block.parent.appendArrayBlockData(ts.map(t => {
                            return {
                                url: BlockUrlConstant.TextSpan,
                                content: t
                            }
                        }), at + 1, block.parent.hasSubChilds ? 'subChilds' : 'childs');
                        context.block = bs.last();
                        write.kit.page.addUpdateEvent(async () => {
                            context.aa = context.block.appearAnchors.last()
                            context.aa.endCollapse();
                            if (aiTool) aiTool.updatePosition({ pos: { roundArea: context.block.getVisibleBound() } })
                            context.loadingCreateBlock = false;
                            if (context.text) context.write()
                        })
                    })
                }
            }
            useAITool({
                block,
                pos: {
                    roundArea: block.getVisibleBound(),
                    relativeEleAutoScroll: context.block.el
                },
                callback: async (text: string, done: boolean, aiTool: AITool) => {
                    if (typeof text != 'undefined') {
                        context.text += text;
                        context.write()
                    }
                    else {
                        context.write()
                    }
                }
            })
            return true;
        }
    }
    return false;
}