export type FontAwesomeType = {
    name: string,
    text: string,
    icons: {
        name: string,
        label: string,
        keywords: string[]
    }[]
}

export type FontAwesomeIconType=ArrayOf<FontAwesomeType['icons']>
