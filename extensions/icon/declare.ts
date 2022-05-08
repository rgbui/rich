

export type IconArguments = {
    name: 'none' | 'font-awesome' | 'emoji' | 'image' | 'link' | 'fill',
    code?: string,
    color?: string,
    url?: string
}

export type ResourceArguments = {
    name: 'none' | 'link' | 'upload' | 'download'
    url?: string,
    source?: string,
    thumb?:string
}