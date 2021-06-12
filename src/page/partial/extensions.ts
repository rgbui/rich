import { Page } from "..";
import { BlockSelector } from "../../extensions/block";
import { BlockMenu } from "../../extensions/menu/menu";
import { ReferenceSelector } from "../../extensions/reference";
import { SyExtensionsComponent } from "../../extensions/sy.component";
import { TextTool } from "../../extensions/text.tool/text.tool";
import { Kit } from "../../kit";
import { PageBlockSelector } from "../interaction/block.selector";
import { PageBlockMenu } from "../interaction/menu";
import { PageReferenceSelector } from "../interaction/refrence.selector";
import { PageTextTool } from "../interaction/text.tool";

export class Page$Extensions {
    blockSelector: BlockSelector;
    referenceSelector: ReferenceSelector;
    blockMenu: BlockMenu;
    textTool: TextTool;
    kit: Kit;
    registerExtension(this: Page, extension: SyExtensionsComponent) {
        if (extension instanceof BlockSelector) {
            this.blockSelector = extension;
            PageBlockSelector(this, this.blockSelector);
        }
        else if (extension instanceof BlockMenu) {
            this.blockMenu = extension;
            PageBlockMenu(this, this.blockMenu);
        }
        else if (extension instanceof TextTool) {
            this.textTool = extension;
            PageTextTool(this, this.textTool);
        }
        else if (extension instanceof ReferenceSelector) {
            this.referenceSelector = extension;
            PageReferenceSelector(this, this.referenceSelector);
        }
    }
}