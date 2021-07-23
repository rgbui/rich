

export type BlockGroup = {
    text: string,
    childs: BlockInfo[]
}
export type BlockInfo = {
    text: string,
    pic: JSX.Element,
    url: string;
    description?: string,
    label: string,
    labels?: string[]
}