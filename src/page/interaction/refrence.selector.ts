import { Page } from "..";
import { AtSelector } from "../../../extensions/at";
export function PageReferenceSelector(page: Page, selector: AtSelector) {
    selector.on('error', err => page.onError(err));
}