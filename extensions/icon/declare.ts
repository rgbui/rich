

export type IconArguments = {
    name: 'none' | 'font-awesome' | 'emoji' | 'image' | 'link' | 'fill',
    code?: string,
    color?: string,
    url?: string,
    text?:string,
    size?:number
}

export type ResourceArguments = {
    name: 'none' | 'link' | 'upload' | 'download'
    url?: string,
    source?: string,
    thumb?:string,
    text?:string,
    size?:number
}