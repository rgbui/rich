import { Page } from "..";


import { EventsComponent } from "../../../component/events.component";
import { TextTool } from "../../../extensions/text.tool/text.tool";
import { Kit } from "../../kit";
import { PageTextTool } from "../interaction/text.tool";
export class Page$Extensions {
    textTool: TextTool;
    kit: Kit;
    registerExtension(this: Page, extension: EventsComponent) {
        if (extension instanceof TextTool) {
            this.textTool = extension;
            PageTextTool(this, this.textTool);
        }
    }
}