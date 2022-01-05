
import { checkExpressType } from "../check";
export function testExpressIsCorrect() {
    console.log('test express is corrent');
    function showLog(level: string, msg: string) {
        console.log(level, msg);
    }
    //{ name: 'a', type: 'int' }, 
    // var r = checkExpressType('a*b', [{ name: 'b', type: 'int' }], showLog);
    // console.log('recommand type', r);
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

    var r = checkExpressType(` task.creat【`, [{ name: 'task.defLabel', type: 'string' }], showLog);
    console.log('recommand type', r);
   
}




