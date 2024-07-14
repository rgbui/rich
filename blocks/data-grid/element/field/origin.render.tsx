import { CSSProperties } from "react";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";
import React from "react";
import { Slick } from "../../../../component/view/slick";
import { autoImageUrl } from "../../../../net/element.type";
import { FileSvg, DownloadSvg } from "../../../../component/svgs";
import { Tip } from "../../../../component/view/tooltip/tip";
import { Icon } from "../../../../component/view/icon";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { Ring } from "../../../../component/view/spin";
import { ColorUtil } from "../../../../util/color";
import { util } from "../../../../util/util";
import lodash from "lodash";
import { useImageViewer } from "../../../../component/view/image.preview";

export function renderFieldElement(field: Field, data) {
    if (field.type == FieldType.image) {
        var images = data as ResourceArguments[]
        var style: CSSProperties = {};
        if (field?.config?.imageFormat?.display == 'auto' || field?.config?.imageFormat?.multipleDisplay == 'carousel') {
            style.width = '100%';
            style.maxHeight = 300;
            style.objectFit = 'cover';
            style.objectPosition = '50% 50%';
        }
        else {
            style.borderRadius = 4;
            style.width = 50;
            style.height = 50;
            style.objectFit = 'cover';
            style.objectPosition = '50% 50%';
        }
        if (field?.config?.isMultiple && field?.config?.imageFormat?.multipleDisplay == 'carousel') {
            var settings = {
                autoplay: true,
                renderCenterLeftControls: () => <></>,
                renderCenterRightControls: () => <></>
            };
            return <div onMouseDown={e => { }}><Slick {...settings}>{images.map((img, i) => {
                return <img onMouseDown={e => {
                    e.stopPropagation();
                    useImageViewer(img, images);
                }} key={i} className="round" src={autoImageUrl(img.url || (img as any).src, 250)} style={style} />
            })}</Slick></div>
        }
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <img onMouseDown={e => {
                    e.stopPropagation();
                    useImageViewer(img, images);
                }} className="round" src={autoImageUrl(img.url || (img as any).src, 250)} style={style} />
            </div>
        })
    }
    else if (field.type == FieldType.file) {
        var images = data as ResourceArguments[]
        return images.map((img, i) => {
            return <div className={" padding-w-3 text-1 flex item-hover-light-focus round " + (i == images.length - 1 ? "" : "gap-b-5")} key={i}>
                <span className="flex-fixed size-16  flex-center gap-r-2"><Icon size={16} icon={FileSvg}></Icon></span>
                <span className="cursor text-overflow flex-auto" >{img.filename}</span>
                <Tip text={'下载文件'}><span onMouseDown={e => {
                    e.stopPropagation();
                    util.downloadFile(img.url, img.filename)
                }} className="gap-l-5 visible size-16 flex-center item-hover round cursor flex-fixed"><Icon size={14} icon={DownloadSvg}></Icon></span></Tip>
            </div>
        })
    }
    else if (field.type == FieldType.sort || field.type == FieldType.autoIncrement || field.type == FieldType.number) {
        var cc = field?.config?.numberDisplay?.decimal || 100;
        var co = field?.config?.numberDisplay?.color;
        var f = field?.config?.numberDisplay?.display || 'auto';
        var value = data as any;
        // 数字转为千分位，并保留两个小数位
        function numberFilter(oldNum, isFixed) {
            // 例（123456.78）
            if (oldNum === "") return {}; // 传入的数值为空直接返回空对象
            let newNum = oldNum.toLocaleString("en-US"); // 数字转成千分位 = 123,456.78
            const numArr = newNum.split("."); // 按小数点吧数字拆分 = [123,456, 78]
            if (!isFixed) { // 如果传了第二个参数，如果有小数位直接返回，否则向下执行
                if (!numArr[1]) { // 如果数组没有下标1的元素，就加.00，例：123,456 = 123,456.00
                    newNum = newNum + ".00";
                } else if (numArr[1].length === 1) { // 如果数组下标1的元素只有一位小数，就加个0，例：123,456.7 = 123,456.70
                    newNum = newNum + "0";
                } else if (numArr[1].length >= 2) { // // 如果数组下标1的元素小数位大于等于2位，就截取前两位，例：123,456.789 = 123,456.78
                    newNum = numArr[0] + "." + numArr[1].substr(0, 2);
                }
            }
            return { oldNum, newNum };
        }
        function formatValue(value: any) {
            if (typeof value == 'undefined' || lodash.isNull(value) || typeof value == 'string' && value == '') {
                return '';
            }
            var v = typeof value != 'number' ? parseFloat(value.toString()) : value;
            if (lodash.isNaN(v)) return '';
            if (field.config?.numberFormat) {
                if (['number'].includes(field.config?.numberFormat)) {
                    return v;
                }
                else if (['int'].includes(field.config?.numberFormat)) {
                    return parseInt(v.toString());
                }
                else if (['1000'].includes(field.config?.numberFormat)) {
                    return numberFilter(v, true).newNum;
                }
                else if (['0.00'].includes(field.config?.numberFormat)) {
                    return v.toFixed(2);
                }
                else if (['%'].includes(field.config?.numberFormat)) {
                    return v.toString() + '%'
                }
                else if (['￥', '$', '€', 'JP¥', 'HK$'].includes(field.config?.numberFormat)) {
                    return field.config?.numberFormat + numberFilter(v, true).newNum;
                }
                else if (field.config?.numberFormat.indexOf('{value}') > -1) {
                    return field.config?.numberFormat.replace('{value}', v.toString());
                } else return value.toString();
            }
            else return value.toString();
        }
        if (f == 'auto') return <span className="text l-22 " >{formatValue(value)}</span>
        else if (f == 'percent') {
            var color = co || '#ddd';
            var cd = ColorUtil.parseColor(color);
            var hex = ColorUtil.toHex(cd);
            hex = 'rgb(108, 155, 125)';
            // var cd = ColorUtil.parseColor(color);
            // var hex = ColorUtil.toHex(cd);
            return <div className="flex-auto flex">
                <div className="flex-auto  round relative" style={{
                    backgroundColor: 'rgba(199, 198, 196, 0.5)',
                    height: 6,
                    boxSizing: 'border-box'
                }}>
                    <div className="round pos " style={{ top: 0, left: 0, bottom: 0, backgroundColor: hex, height: 6, maxWidth: '100%', width: util.toPercent(value || 0, cc, 1) }}></div>
                </div>
                {field?.config.numberDisplay?.showNumber == true && <span className="text l-22 gap-l-10 flex-fixed w-50 f-14" >{util.toPercent(value || 0, cc, 1)}</span>}
            </div>
        }
        else if (f == 'ring') {
            var r = 24;
            var d = 4;
            var color = co || '#ddd';
            var cd = ColorUtil.parseColor(color);
            var hex = ColorUtil.toHex(cd);
            var isNumber = typeof value == 'number'
            hex = 'rgb(108, 155, 125)';
            return <div className="flex flex-inline">
                {isNumber && <Ring className='flex-fixed' size={r}
                    lineWidth={d}
                    value={value}
                    percent={field?.config?.numberDisplay?.decimal || 100}
                    hoverColor={hex}
                ></Ring>}
                {field?.config.numberDisplay?.showNumber == true && <span className="text l-22  gap-l-10 flex-fixed w-50 f-14" >{util.toPercent(value || 0, cc, 1)}</span>}
            </div>
        }
    }
}