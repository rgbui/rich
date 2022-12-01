import { CardPropsType } from "../declare";
import { CardView } from "../view";
import { CardPin } from "../views/pin";

export class CardFactory {
    static CardModels = new Map<string, CardPropsType>();
    static registerCardModel(model: CardPropsType) {
        var cm = this.CardModels.get(model.url);
        if (cm) {
            Object.assign(cm, model)
        }
        else { this.CardModels.set(model.url, model) }
    }
    static registerCardView(url: string, view: typeof CardView) {
        var cm = this.CardModels.get(url);
        if (!cm) {
            this.CardModels.set(url, { url, view } as any)
        }
        else cm.view = view;
    }
    static getCardView(url: string) {
        return this.CardModels.get(url).view;
    }
}

// export function getCardView(url: string): typeof CardView {

//     return CardPin;
// }