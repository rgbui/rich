import { TableSchema } from "../../../schema/meta";
import { CardPropsType } from "../declare";
import { CardView } from "../view";
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
        return this.CardModels.get(url)?.view;
    }
    static getCardModels(schema?: TableSchema) {
        var cms = Array.from(CardFactory.CardModels.values());
        if (schema) {
            cms = cms.filter(c => {
                var pros = c.props.findAll(g => g.required ? true : false);
                return pros.every(p => p.types.some(ty => schema.fields.some(f => f.type == ty)));
            })
        }
        return cms.map(c => {
            return {
                ...c
            }
        })
    }
}

