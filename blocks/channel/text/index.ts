import { Block } from "../../../src/block";
import { url } from "../../../src/block/factory/observable";
import { ChannelTextType } from "./declare";

@url('/channel/text')
export class ChannelText extends Block {
    datas: ChannelTextType[] = [];
    async loadChannelTextDatas() {

    }
}
