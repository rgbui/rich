import { CardPropsType } from "../declare";
import { CardFactory } from "./factory";


export function CardModel(url: string, model: () => CardPropsType) {
    CardFactory.registerCardModel(url,model);
}


export function CardViewCom(url: string) {
    return (target) => {
        target.prototype.url = url;
        CardFactory.registerCardView(url, target);
    }
}
