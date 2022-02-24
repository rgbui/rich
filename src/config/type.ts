
import { FontCss } from "../block/pattern/css"

export type WorkspaceConfig = {
    fontCss: FontCss;
}
export type PageConfig = {
    fontCss: FontCss;
    smallFont: boolean;
    locker: { lock: boolean, userid?: string, date: number }
}