import { FieldType } from "./type";
import numberList from "../../../src/assert/img/numbered-list.png";
import React from "react";
import {
    AudioSvg,
    CollectionBoardSvg,
    CollectionCalendarSvg,
    CollectionGallerySvg,
    CollectionListSvg,
    CollectTableSvg,
    CommentSvg,
    EmojiSvg,
    PictureSvg,
    TypesButtonSvg,
    TypesCheckboxSvg,
    TypesCreateAtSvg,
    TypesCreateBySvg,
    TypesDateSvg,
    TypesEmailSvg,
    TypesFileSvg,
    TypesFormulaSvg,
    TypesLinkSvg,
    TypesMultipleSelectSvg,
    TypesNumberSvg,
    TypesPersonSvg,
    TypesPhoneSvg,
    TypesRelationSvg,
    TypesRollupSvg,
    TypesSelectSvg,
    TypesSortSvg,
    TypesStringSvg,
    VideoSvg
} from "../../../component/svgs";
export function getTypeSvg(type: FieldType) {
    switch (type) {
        case FieldType.bool:
            return TypesCheckboxSvg
        case FieldType.option:
            return TypesSelectSvg
        case FieldType.options:
            return TypesMultipleSelectSvg
        case FieldType.file:
            return TypesFileSvg
        case FieldType.image:
            return PictureSvg
        case FieldType.audio:
            return AudioSvg;
        case FieldType.video:
            return VideoSvg;
        case FieldType.link:
            return TypesLinkSvg
        case FieldType.phone:
            return TypesPhoneSvg
        case FieldType.email:
            return TypesEmailSvg
        case FieldType.date:
            return TypesDateSvg
        case FieldType.user:
            return TypesPersonSvg
        case FieldType.text:
            return TypesStringSvg
        case FieldType.number:
            return TypesNumberSvg;
        case FieldType.formula:
            return TypesFormulaSvg
        case FieldType.createDate:
        case FieldType.modifyDate:
            return TypesCreateAtSvg
        case FieldType.creater:
        case FieldType.modifyer:
            return TypesCreateBySvg
        case FieldType.relation:
            return TypesRelationSvg;
        case FieldType.rollup:
            return TypesRollupSvg;
        case FieldType.comment:
            return CommentSvg;
        case FieldType.button:
            return TypesButtonSvg;
        case FieldType.emoji:
            return EmojiSvg
        case FieldType.autoIncrement:
            return TypesSortSvg
            // return  <img src={numberList}/>
        default:
            return TypesStringSvg
    }
}

export function getSchemaViewIcon(url: string) {
    switch (url) {
        case '/data-grid/table':
            return CollectTableSvg
            break;
        case '/data-grid/board':
            return CollectionBoardSvg
            break;
        case '/data-grid/gallery':
            return CollectionGallerySvg
            break;
        case '/data-grid/list':
            return CollectionListSvg
            break;
        case '/data-grid/calendar':
            return CollectionCalendarSvg
            break;
    }
}