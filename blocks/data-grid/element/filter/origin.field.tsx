import { Block } from "../../../../src/block";
import { DataGridView } from "../../view/base/table";

export class OriginFilterField extends Block {
    get refBlock(): DataGridView {
        return super.refBlock as DataGridView;
    }
}