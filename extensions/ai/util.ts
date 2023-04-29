/**
 * 按code代码分割
 * @param ts 
 * @returns 
 */
export function mergeCode(ts: string[]) {
    var rs: string[] = [];
    var code = '';
    var isCode: boolean = false;
    for (let j = 0; j < ts.length; j++) {
        var tc = ts[j];
        if (tc.match(/^```/)) {
            if (isCode) {
                isCode = false;
                code += '\n```'
                rs.push(code)
                code = '';
            }
            else {
                isCode = true;
                code = tc + "\n";
            }
        }
        else {
            if (isCode) code += ts[j] + (j == ts.length - 1 ? "" : '\n');
            else rs.push(ts[j])
        }
    }
    if (isCode && code) { rs.push(code); code = ''; }
    return rs;
}