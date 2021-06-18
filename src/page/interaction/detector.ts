import { Page } from "..";
import { InputDetector } from "../../extensions/input.detector/detector";

export function PageInputDetector(page: Page, detector: InputDetector) {
    detector.on('input', (rule, value, lastValue) => {
        page.kit.textInput.onInputDetector(rule, value, lastValue);
    });
}