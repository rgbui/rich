
export type DomParserOptions = {

}

export async function DomParse(stringContainingHTMLSource: string, options?: DomParserOptions) {
    /**
     * 
     * find img video autio 
     * ignore input,select,textarea
     * 
     * key tags title hr  h1~h6  pre  ol-ul-li table b del
     * https://zhuanlan.zhihu.com/p/81132589
     */
    let parser = new DOMParser();
    let doc = parser.parseFromString(stringContainingHTMLSource, "text/html");





}