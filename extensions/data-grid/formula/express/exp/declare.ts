
export type ExpUnitType = 'string' | 'date' | 'bool' |  'int' | 'number' | 'any' | 'array' | 'object' | 'void'|'user'|'file'|'interact';
export type ExpObjectType = { [key: string]: ExpType };
export type ExpArrayType = { __unit: ExpType, __extensible?: boolean };
export type ExpFunType = { __args: ExpType[], __returnType?: ExpType };
export type ExpType = ExpUnitType | ExpFunType | ExpObjectType | ExpArrayType;

export function typeIsEqual(type1: ExpType, type2: ExpType, considerAnyType?: boolean) {
    if (considerAnyType == true) { if (type1 == 'any' || type2 == 'any') return true; }
    if (typeof type1 == 'string' && typeof type2 == 'string')
        return type1 == type2;
    else {
        if ((type1 as any)?.__unit && (type2 as any)?.__unit) {
            return typeIsEqual((type1 as any).__unit, (type2 as any).__unit)
        }
        else if ((type1 as any)?.__args && (type2 as any)?.__args) {
            var isArgs = typeIsEqual((type1 as any).__args, (type2 as any).__args);
            if (isArgs) {
                return typeIsEqual((type1 as any).__returnType || 'void', (type2 as any).__returnType || 'void')
            }
            return false;
        }
        else if (type1 && !Object.keys(type1).some(s => s.startsWith('__unit') || s.startsWith('__args') || s.startsWith('__returnType'))
            && type2 && !Object.keys(type2).some(s => s.startsWith('__unit') || s.startsWith('__args') || s.startsWith('__returnType'))
        ) {
            var k1s = Object.keys(type1);
            var k2s = Object.keys(type2);
            if (k1s.length == k2s.length && k1s.every(g => k2s.includes(g)))
                return k1s.every(g => typeIsEqual(type1[g], type2[g]));
            else return false;
        }
    }
}

export function typeIsFun(type1: ExpType) {
    if (Array.isArray((type1 as any).__args)) return true;
}

export function argsIsFunType(type1: ExpType, args: ExpType[]) {
    if (typeIsFun(type1))
        return (type1 as ExpFunType).__args.every((c, i) => typeIsEqual(c, args[i]))
}

export function typeIsNumber(type1: ExpType, considerAnyType?: boolean) {
    if (considerAnyType == true && type1 == 'any') return true;
    if (type1 == 'int' || type1 == 'number' ) return true;
    else return false;
}

export function typeIsBool(type: ExpType, considerAnyType?: boolean) {
    if (considerAnyType && type == 'any') return true;
    return type == 'bool'
}

export function typesIsEqual(types: ExpType[], considerAnyType?: boolean) {
    for (var i = 0; i < types.length - 1; i++) {
        var type = types[i];
        var nextType = types[i + 1];
        if (!typeIsEqual(type, nextType, considerAnyType)) return false;
    }
    return true;
}