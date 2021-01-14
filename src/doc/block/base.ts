import { Events } from "../../util/events";

export class BaseBlock extends Events {
    childs: BaseBlock[] = [];
    parent: BaseBlock;
}