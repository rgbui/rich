import { ExpType, ExpUnitType } from "../exp/declare";
export class DeclareTypes {
    private static types: { type: ExpUnitType, props: { key: string, propertyType: ExpType }[] }[] = [];
    static register(type: ExpUnitType, key: string, propertyType: ExpType) {
        var tp = this.types.find(g => g.type == type);
        if (!tp) {
            this.types.push({ type, props: [{ key, propertyType }] });
        }
        else {
            tp.props.push({ key, propertyType });
        }
    }
    static recommendType(type: ExpUnitType, key: string) {
        var ns = key.split(/\./g);
        var index = ns.length;
        var currentType = type;
        var beforeKey = ns.slice(0, index).join(".");
        var afterKey = ns.slice(index).join(".");
        var ts = this.types.find(g => g.type == currentType);
        var rt: ExpType;
        while (true) {
            var tp = ts.props.find(pro => pro.key == beforeKey);
            if (tp) {
                rt = tp.propertyType;
                break;
            }
            else {
                index -= 1;
                beforeKey = ns.slice(0, index).join('.');
                afterKey = ns.slice(index).join(".");
                if (!beforeKey) break;
            }
        }
        if (rt) {
            if (afterKey) return this.recommendType(rt as ExpUnitType, afterKey);
            else return rt;
        }
    }
}

DeclareTypes.register('string', 'length', 'number');