export enum BlockClass {
    view = 1,
    viewArea = 2,
    row = 3,
    group = 4,
    textSpan = 5,
    text = 6,
    todo = 7,
    image = 8
}

export enum Align {
    left,
    right,
    center
}

export enum Valign {
    top,
    bottom,
    middle
}

export enum BlockState {
    none,
    hover,
    focus,
    placeholder,
    input,
    click,
    contextmenu,
    longPress,
    dblclick
}