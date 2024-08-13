


// var _dm;
// async function getDm() {
//     if (_dm) return _dm;
//     _dm = (await import(
//         /* webpackChunkName: 'xlsx' */
//         "dom-to-image"
//     ));
//     return _dm;
// }
import FileSave from 'file-saver';
import domtoimage from 'dom-to-image';
export async function domToPng(node: HTMLElement, options?: { text?: string }) {
    // console.log(node)
    var dm = domtoimage;
    // console.log('dddd', dm);
    // var svg=await dm.toSvg(dom);
    // console.log('svg',svg);
    function filter(node) {
        console.log(node);
        return true
    }
    domtoimage.toSvg(node, {filter: filter})
    .then(function (dataUrl) {
        /* do something */
        console.log(dataUrl)
    });
    domtoimage.toPng(node, { filter: filter })
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = 'my-image-name.jpeg';
            link.href = dataUrl;
            link.click();
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
        });
    // var png = await dm.toPng(dom, { filter: filter });
    // console.log('png', png);
    // var link = document.createElement('a');
    // link.download = (options?.text || "shy") + '.png';
    // link.href = png;
    // link.click();
    // var r = await dm.toBlob(dom);
    // console.log('gggg', r);
    // FileSave.saveAs(r, (options?.text || "shy") + '.png');
}