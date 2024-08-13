import React from "react";
import { BoardEditTool } from "..";
import { Icon } from "../../../component/view/icon";
import { AiStartSvg } from "../../../component/svgs";
import { MenuView } from "../../../component/view/menu/menu";
import { getBoardAIItems } from "./data";
import { BlockUrlConstant } from "../../../src/block/constant";
import { lst } from "../../../i18n/store";

export function AIView(props: {
    name: string,
    tool: BoardEditTool,
    change?(value: string): void
}) {

    async function input(item) {
    }
    function select(item, event) {
        props.change(item.value);
    }
    function click(item) {

    }
    var items = getBoardAIItems();
    if (props.tool.blocks.some(s => s.url == BlockUrlConstant.Mind)) {
        items = [
            {
                icon: { name: 'byte', code: 'optimize' },
                name: 'generateMind',
                text: lst('生成思维导图节点'),
                value: `你是一个擅长思考的助手。我将为你提供一个主题，你的任务是围绕主题生成思维导图，请返回markdown格式，不要返回标题，结果不要使用\`\`\`\`\`\`进行包裹。主题为“{content}”`
            }
        ]
    }

    var rf = React.useRef<HTMLElement>(null);
    return <div className="shy-board-edit-background-color">
        <div style={{
            color: 'var(--text-purple)',
        }} className="shy-board-edit-background-color-current size-20 flex-center">
            <Icon icon={AiStartSvg} size={16}></Icon>
        </div>
        {props.tool.isShowDrop(props.name) && <div ref={e => {
            rf.current = e;
        }} style={{ position: 'absolute', top: 20, transform: 'translate(-50%, 0px)' }}> <div
            style={{
                marginTop: 15,
                width: 'auto',
                minHeight: 'auto',
                padding: '5px 0px'
            }}
            className=" bg-white shadow-s round">
                <MenuView cacRelative={(rect => {
                    if (rf.current) {
                        var b = rf.current.getBoundingClientRect()
                        rect.top -= b.top;
                        rect.left -= b.left;
                    }
                    return rect;
                })}
                    input={input}
                    select={select}
                    click={click} style={{
                        maxHeight: 400,
                        // paddingTop: 10,
                        // paddingBottom: 5,
                        overflowY: 'auto'
                    }}
                    items={items as any}></MenuView>
            </div>
        </div>}
    </div>
}