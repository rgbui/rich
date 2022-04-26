import { PageWrite } from ".";
import { AppearAnchor } from "../../block/appear";

/**
 * 输入弹窗
 */
export async function inputPop(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {

    return false;
}
/**
 * 对输入的内容进行检测
 * @returns 
 */
export async function inputDetector(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    return false;
}
export async function inputLineTail(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    return false;
}