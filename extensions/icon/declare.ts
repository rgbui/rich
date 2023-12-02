
/**
 * 图标资源
 * 主要是考虑到图标有可能是字体
 * 图片有可能自带颜色
 */
export type IconArguments = {
    name: 'none' | 'font-awesome' | 'bytedance-icon'|'byte' | 'emoji' | 'image' | 'link' | 'fill',
    code?: string,
    color?: string,
    url?: string,
    text?: string,
    size?: number
}

export type CoverMask = {
    abled: boolean,
    url: string,
    thumb: string,
    top: number
}
/**
 * 通过诗云上传的图片资源地址
 * 
 */
export type ResourceArguments = {
    name?: 'none' | 'link' | 'upload' | 'download'
    url?: string,
    source?: string,
    thumb?: string,
    filename?: string,
    size?: number,
    origin?: string,
    mime?: string,
    ext?: string,
    width?:number,
    height?:number
}