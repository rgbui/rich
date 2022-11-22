import { CardView } from "./view";
import { CardPin } from "./views/pin";

export function getCardView(url: string): typeof CardView {

    return CardPin;
}