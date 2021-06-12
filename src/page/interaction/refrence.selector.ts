import { Page } from "..";
import { ReferenceSelector } from "../../extensions/reference";
export function PageReferenceSelector(page: Page, selector: ReferenceSelector) {
    selector.on('error', err => page.onError(err));
}