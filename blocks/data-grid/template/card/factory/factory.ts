import { TableSchema } from "../../../schema/meta";
import { CardPropsType } from "../declare";
import { CardView } from "../view";
export class CardFactory {
    static CardModels = new Map<string, {
        view: typeof CardView,
        create: () => CardPropsType,
        model: CardPropsType
    }>();
    static registerCardModel(url: string, model: () => CardPropsType) {
        var cm = this.CardModels.get(url);
        if (cm) {
            Object.assign(cm, { create: model })
        }
        else { this.CardModels.set(url, { view: null, create: model, model: null }) }
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
    static getCardModel(url:string){
        var cm = this.CardModels.get(url);
        if (cm) {
            if (!cm.model) {
                cm.model = cm.create();
            }
            return cm.model;
        }
    }
    static getCardModels(schema?: TableSchema) {
        var cms = Array.from(CardFactory.CardModels.values());
        for (let cm of cms) {
            if (!cm.model) {
                cm.model = cm.create();
            }
        }
        if (schema) {
            cms = cms.filter(c => {
                var pros = c.model.props.findAll(g => g.required ? true : false);
                return pros.every(p => p.types.some(ty => schema.fields.some(f => f.type == ty)));
            })
        }
        return cms.map(c => {
            return {
                model: c.model
            }
        })
    }
}

