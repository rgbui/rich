export declare type BlockMenuItem = {
    name?: BlockMenuAction;
    type?: 'devide' | 'text' | 'option';
    text?: string;
    icon?: string | SvgrComponent;
    label?: string;
    childs?: BlockMenuItem[];
};
export declare enum BlockMenuAction {
    delete = 0,
    copy = 1,
    trun = 2,
    trunIntoPage = 3,
    moveTo = 4,
    link = 5,
    comment = 6,
    color = 7
}
