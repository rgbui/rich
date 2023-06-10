
export type AtSelectorItem = {
    text: string,
    childs: {
        url: string,
        text: string,
        label?: string,
        args?: Record<string, any>
    }[]
}


