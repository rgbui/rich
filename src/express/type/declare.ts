

import { ExpType, ExpUnitType } from "../exp/declare";
export enum TypeKind {
    /**
     * 类
     */
    class,
    /**
     * 静态方法
     */
    static,
    /**
     * 参数
     */
    arg
}

export type TypeDeclare = {
    path: string,
    kind: TypeKind,
    caller?: ExpUnitType,
    type: ExpType,
    template?: string,
    references?: { name: string, code: string }[]
}
export class DeclareTypes {
    static declares: TypeDeclare[] = [];
    static registerType(caller: ExpUnitType, propKey: string, propType: ExpType, template?: string, references?: { name: string, code: string }[]) {
        var dec = this.declares.find(g => g.kind == TypeKind.class && g.caller == caller && g.path == propKey);
        if (dec) {
            Object.assign(dec, { caller, kind: TypeKind.class, type: propType, template, references });
        }
        else {
            this.declares.push({ caller, path: propKey, kind: TypeKind.class, type: propType, template, references });
        }
    }
    static registerStatic(propKey: string, propType: ExpType, template?: string, references?: { name: string, code: string }[]) {
        var dec = this.declares.find(g => g.kind == TypeKind.static && g.path == propKey);
        if (dec) {
            Object.assign(dec, { kind: TypeKind.static, type: propType, template, references });
        }
        else {
            this.declares.push({ path: propKey, kind: TypeKind.static, type: propType, template, references });
        }
    }
}
DeclareTypes.registerType('string', 'length', 'number', 'len($this)');
DeclareTypes.registerType('string', 'slice', { __args: ['int', 'int'], __returnType: 'string' });
DeclareTypes.registerStatic('Math.round', { __args: ['number'], __returnType: 'int' }, `round($args1)`)
DeclareTypes.registerStatic('Math.PI', 'double', `math.pi`, [{ name: 'math', code: 'import math' }]);