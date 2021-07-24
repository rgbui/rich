

export type BlockGroup = {
    text: string,
    childs: BlockSelectorItem[]
}

export enum BlockSelectorOperator {
    selectEmoji,
    createTable
}
export type BlockSelectorItem = {
    text: string,
    pic: JSX.Element,
    url: string;
    description?: string,
    label: string,
    labels?: string[],
    isLine?: boolean,
    operator?: BlockSelectorOperator
}