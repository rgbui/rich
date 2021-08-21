import { Page } from "..";
import { BlockSelector } from "../../../extensions/block";
import { InputDetector } from "../../../extensions/input.detector/detector";
import { AtSelector } from "../../../extensions/at";
import { EventsComponent } from "../../../component/events.component";
import { TextTool } from "../../../extensions/text.tool/text.tool";
import { Kit } from "../../kit";
import { PageBlockSelector } from "../interaction/block.selector";

import { PageReferenceSelector } from "../interaction/refrence.selector";
import { PageTextTool } from "../interaction/text.tool";

export class Page$Extensions {
    blockSelector: BlockSelector;
    referenceSelector: AtSelector;
    textTool: TextTool;
    kit: Kit;
    inputDetector: InputDetector;
    registerExtension(this: Page, extension: EventsComponent) {
        if (extension instanceof BlockSelector) {
            this.blockSelector = extension;
            PageBlockSelector(this, this.blockSelector);
        }
        else if (extension instanceof TextTool) {
            this.textTool = extension;
            PageTextTool(this, this.textTool);
        }
        else if (extension instanceof AtSelector) {
            this.referenceSelector = extension;
            PageReferenceSelector(this, this.referenceSelector);
        }
    }
}