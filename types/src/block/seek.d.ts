import { Block } from ".";
export declare class Block$Seek {
    blockChilds(this: Block, name: string): Block[];
    each(this: Block, predict: (block: Block) => boolean, consider?: boolean, isDepth?: boolean): void;
    eachReverse(this: Block, predict: (Block: Block) => boolean, consider?: boolean, isDepth?: boolean): void;
    /***
    * 这是从里面最开始的查询
    */
    find(this: Block, predict: (block: Block) => boolean, consider?: boolean, finalPredict?: (block: Block) => boolean, isDepth?: boolean): Block;
    findReverse(this: Block, predict: (block: Block) => boolean, consider?: boolean, finalPredict?: (block: Block) => boolean, isDepth?: boolean): Block;
    prevFindAll(this: Block, predict: (block: Block) => boolean, consider?: boolean, finalPredict?: (block: Block) => boolean): Block[];
    prevFind(this: Block, predict: (block: Block) => boolean, consider?: boolean, finalPredict?: (block: Block) => boolean): Block;
    nextFind(this: Block, predict: (block: Block) => boolean, consider?: boolean, finalPredict?: (block: Block) => boolean): Block;
    nextFindAll(this: Block, predict: (block: Block) => boolean, consider?: boolean, finalPredict?: (block: Block) => boolean): Block[];
    contains(this: Block, block: Block, ignore?: boolean): boolean;
    findAll(this: Block, predict: (block: Block) => boolean, consider?: boolean, finalPredict?: (block: Block) => boolean): Block[];
    closest(this: Block, predict: (block: Block) => boolean, ignore?: boolean, finalPredict?: (block: Block) => boolean): Block;
    parents(this: Block, predict: (block: Block) => boolean, ignore?: boolean, finalPredict?: (block: Block) => boolean): Block[];
}
