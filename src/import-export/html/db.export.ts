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
export function exportHtmlDb(headers, rows, filename: string) {
    if (Array.isArray(headers) && headers.length > 0) { //表头信息不能为空
        if (!filename || typeof filename != "string") {
            filename = "export.html"
        }




        //         | 左对齐 | 右对齐 | 居中对齐 |
        // | :-----| ----: | :----: |
        // | 单元格 | 单元格 | 单元格 |
        // | 单元格 | 单元格 | 单元格 |


        var htmlStr = '';
        var ps: string[] = [];
        ps.push(`<h1>${filename}</h1>`);

        ps.push('<table>')
        ps.push("<thead>");
        ps.push('<tr>');
        ps.push(headers.map(c => `<th>${c.title}</th>`).join(""))
        ps.push("</tr>");
        ps.push("</thead>");

        for (let i = 0; i < rows.length; i++) {
            var rs: string[] = headers.map(h => rows[i][h.column]);
            ps.push('<tr>' + rs.map(r => `<td>${r}</td>`).join("") + "</tr>");
        }

        ps.push('</table>');

        htmlStr = `<html>
        <head>
             <title>${filename}</title>
             <style>
               body{
                   padding:10px 30px;
               }
               table{
                   min-width:100%;
                   border-top:1px solid #ddd;
                   border-left:1px solid #ddd;
                   border-spacing:0px;
               }
               table tr td,table tr th{
                border-bottom:1px solid #ddd;
                border-right:1px solid #ddd;
               }
               table td,table th{
                   padding:5px 10px;
               }
             </style>
        </head>
        <body>${ps.join("")}</body>
    </html>`




        var blob = new Blob([htmlStr], {
            type: 'text/html'
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
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }
    }
}