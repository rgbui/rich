import { Express } from "..";
import { ExpType } from "../exp/declare";
export function testExpressIsCorrect() {
    function testExpress(express: string, args: { name: string, type: ExpType }[], willExcute: boolean = true) {
        if (!willExcute) return;
        var exp = new Express(express, args);
        var c = exp.parse();
        exp.check();
        console.log(express, exp, c.inferType(), exp.getLogs());
    }

    testExpress('a*b', [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], false);
    testExpress('a>b.c', [{ name: 'a', type: 'int' }], false);
    testExpress('[a,b,a>b]', [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], false);
    testExpress('1+-2', [], false);
    testExpress('{a:b,c:a*b}', [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], false);
    testExpress('Math.round(a)', [{ name: 'a', type: 'double' }], true);
    testExpress('Math.PI', [{ name: 'a', type: 'double' }], false);
    testExpress('[a,a].join("")', [{ name: 'a', type: 'double' }], false);


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




