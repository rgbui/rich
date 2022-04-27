import { PageWrite } from ".";
import { AppearAnchor } from "../../block/appear";

/**
 * 输入弹窗
 */
export async function inputPop(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    var ev = event.nativeEvent as InputEvent;
    var data = ev.data;
    var textContent = aa.textContent;
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    console.log(textContent, offset, textContent.slice(0, offset));
    if (data == '/' || data == '、') {

    }
    else if (data == '@') {

    }
    else if (data == '[' || data == '【') {

    }
    return false;
}
/**
 * 对输入的内容进行检测
 * @returns 
 */
export async function inputDetector(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    return false;
}
export async function inputLineTail(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    return false;
}