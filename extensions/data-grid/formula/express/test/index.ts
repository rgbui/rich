import { Express } from "..";
import { ExpType } from "../exp/declare";
export function testExpressIsCorrect() {

    function testExpress(express: string, args: { name: string, type: ExpType, template?: string }[], willExcute: boolean = true) {
        if (!willExcute) return;
        var exp = new Express(args);
        var c = exp.parse(express);
        console.log('exp', c);
        console.log(express, exp, exp.check(), c.inferType(), exp.getLogs(), exp.compile(), exp.references);
    }

    testExpress('a*b', [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], false);
    testExpress('a>b.c', [{ name: 'a', type: 'int' }], false);
    testExpress('[a,b,a>b]', [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], false);
    testExpress('1+-2', [], false);
    testExpress('{a:b,c:a*b}', [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], false);
    testExpress('Math.round(a)', [{ name: 'a', type: 'int' }], false);
    testExpress('Math.PI', [{ name: 'a', type: 'int' }], false);
    testExpress('[a,a].join("")', [{ name: 'a', type: 'int' }], false);

    //testExpress('"test"', [], true);

    testExpress('"1".toInt()>3', [], false);
    testExpress('a.toInt()>3', [{ name: 'a', type: 'string', template: 'rds(a)' }], false);
    testExpress('Math.PI+Math.E', [], false)
    testExpress('Math.round(a)', [{ name: 'a', type: 'number', template: 'rds(a)' }], false);

    testExpress('Date.now.format("YYYY-MM-DD HH:mm:ss")', [{ name: 'a', type: 'number', template: 'rds(a)' }], false);
    testExpress('array.map(current.name+123)', [{ name: 'array', type: 'array' }, { name: 'current', type: 'any' }], true);

    // testExpress('"a+"+b', [{ name: "b", type: "string" }], true);
    // testExpress('a*(b+c)', [{ name: "a", type: 'int' }, { name: 'b', type: 'int' }, { name: 'c', type: 'int' }], true);
    // testExpress('a[0]+b[1]+c[a]', [{ name: 'a', type: 'array' }], true);
    // testExpress('a[0].c.d[a]', [{ name: 'a', type: 'array' }], true);
    // testExpress('a>b?true:false', [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], true);

    // var r = checkExpressType('a*b', [{ name: 'b', type: 'int' }], showLog);
    //   console.log('recommand type', r);
    //var r = checkExpressType('a>b.c', [{ name: 'a', type: 'int' }], showLog);
    // console.log('recommand type', r);
    // var r = checkExpressType('\'a\'+b', [], showLog);
    // console.log('recommand type', r);
    // checkExpressType('a-b');
    //  var r = checkExpressType('[a,b,a>b]',[],showLog);
    //console.log('recommand type', r);
    // checkExpressType('1+-2');
    // checkExpressType(`{a:b:2,c:a*b}`);
    // checkExpressType(`math.round(a)`);
    // var r = checkExpressType(`1500task.defLabel`, [{ name: 'task.defLabel', type: 'string' }], showLog);
    // console.log('recommand type', r);

    // var r = checkExpressType(` task.creat【`, [{ name: 'task.defLabel', type: 'string' }], showLog);
    // console.log('recommand type', r);

}




