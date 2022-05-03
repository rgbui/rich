import { Kit } from "../..";
import { useBoardEditTool } from "../../../../extensions/board.edit.tool";
import { ActionDirective } from "../../../history/declare";

export async function openBoardEditTool(kit: Kit) {
    if (kit.picker.blocks.length > 0) {
        while (true) {
            var r = await useBoardEditTool(kit.picker.blocks);
            if (r) {
                await kit.page.onAction(ActionDirective.onBoardEditProp, async () => {
                    await kit.picker.blocks.eachAsync(async (block) => {
                        if (r.name)
                            await block.setBoardEditCommand(r.name, r.value);
                        else for (let n in r) {
                            await block.setBoardEditCommand(n, r[n]);
                        }
                    })
                });
                kit.picker.onRePicker();
            } else break;
        }
    }
}