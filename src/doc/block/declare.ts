import { BlockFactory } from "./block.factory";
import { View } from "./view";


export enum BlockClass {
    view = 1
}

BlockFactory.register(BlockClass.view, View);