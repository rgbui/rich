export type ExpUnitType = 'string' | 'bool' | 'double' | 'long' | 'int' | 'number' | 'any'|'array'|'object';
export type ExpObjectType = { [key: string]: ExpType };
export type ExpArrayType = ExpType[];
export type ExpFunType = { __args: ExpObjectType, __returnType?: ExpType };
export type ExpType = ExpUnitType | ExpFunType | ExpObjectType;
export function typeIsEqual(type1: ExpType, type2: ExpType) {
    if (type1 == 'any' || type2 == 'any') return true;
    return type1 == type2;
}

export function typeIsNumber(type1: ExpType) {
    if (type1 == 'any' || type1 == 'int' || type1 == 'number' || type1 == 'double' || type1 == 'long') return true;
    else return false;
}

export function typeIsBool(type: ExpType) {
    return type == 'bool' || type == 'any'
}