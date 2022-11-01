import dayjs from "dayjs";
import lodash from "lodash";


/*
 * 参数：
 *    headers：表头
 *             格式如：
 *             [
 *               {
 *                  column:"userid", //列字段
 *                  title: "姓名", //表头标题
 *                  formatter:(value) =>{return ... }   //格式化函数  
 *                },
 *                ...
 *             ]
 *    
 *    rows：行
 *          格式如：[{userid:101,gender:0 },{userid:102,gender:1}]
 *    filename：导出保存的文件名
 */
export function exportMarkdownDb(headers, rows, filename: string) {
    if (Array.isArray(headers) && headers.length > 0) { //表头信息不能为空
        if (!filename || typeof filename != "string") {
            filename = "export.md"
        }




        //         | 左对齐 | 右对齐 | 居中对齐 |
        // | :-----| ----: | :----: |
        // | 单元格 | 单元格 | 单元格 |
        // | 单元格 | 单元格 | 单元格 |


        var markdownStr = '';
        var ps: string[] = [];
        ps.push('##' + filename);

        ps.push(headers.map(c => `|` + c.title).join("") + "|")
        ps.push(headers.map(c => `| :----: `).join("") + "|")

        for (let i = 0; i < rows.length; i++) {
            var rs: string[] = headers.map(h => rows[i][h.column]);
            ps.push(rs.map(r => `|${r}`).join("") + '|');
        }

        markdownStr = (ps.join("\n"));

        var blob = new Blob([markdownStr], {
            type: 'text/plain'
        });
        // console.info(blob);
        // console.info(blob.slice(1, 3, 'text/plain'));
        // let blob = getCsvBlob(headers, rows);
        if ((navigator as any).msSaveOrOpenBlob) {
            (navigator as any).msSaveOrOpenBlob(blob, filename);
        } else {
            let url = URL.createObjectURL(blob);
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            if (!filename.startsWith('.md')) filename += '.md';
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }
    }
}