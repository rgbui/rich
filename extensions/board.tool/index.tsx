import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import TextSvg from "../../src/assert/svg/board.tool.text.svg";
import StickerSvg from "../../src/assert/svg/board.tool.sticker.svg";
import ConnectSvg from "../../src/assert/svg/connet.line.svg";
import PenSvg from "../../src/assert/svg/pen.svg";
import MeiSvg from "../../src/assert/svg/board.tool.mei.svg";
import SharpSvg from "../../src/assert/svg/board.tool.sharp.svg";
import IframeSvg from "../../src/assert/svg/board.tool.frame.svg";

export class BoardTool extends EventsComponent {
    render(): ReactNode {
        return <div className="shy-board-tool">
            <div className="shy-board-tool-bar">
                <span><TextSvg /></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><StickerSvg /></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><SharpSvg></SharpSvg></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><ConnectSvg /></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><MeiSvg></MeiSvg></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><IframeSvg></IframeSvg></span>
            </div>
        </div>
    }
}