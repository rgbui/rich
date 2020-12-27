
export enum BlockType {
    text,
    rowText
}
export function BlockTypeToComponentName(type: BlockType) {
    switch (type) {
        case BlockType.text:
            return 'VcText'
        case BlockType.rowText:
            return 'VcRowText'
    }
}