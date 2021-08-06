import { Page } from "..";
import { ReferenceSelector } from "../../../extensions/tweet";
export function PageReferenceSelector(page: Page, selector: ReferenceSelector) {
    selector.on('error', err => page.onError(err));
}