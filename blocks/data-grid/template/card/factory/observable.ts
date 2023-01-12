import { CardPropsType } from "../declare";
import { CardFactory } from "./factory";


export function CardModel(data: CardPropsType) {
    CardFactory.registerCardModel(data);
}


export function CardViewCom(url: string) {
    return (target) => {
        target.prototype.url = url;
        CardFactory.registerCardView(url, target);
    }
}
