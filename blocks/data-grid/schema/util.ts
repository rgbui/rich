import { FieldType } from "./type";
import checkbox from "../../../src/assert/svg/types.checkbox.svg";
import select from "../../../src/assert/svg/types.select.svg";
import string from "../../../src/assert/svg/types.string.svg";
import multipleSelect from "../../../src/assert/svg/types.multiple.select.svg";
import file from "../../../src/assert/svg/types.file.svg";
import link from "../../../src/assert/svg/types.link.svg";
import number from "../../../src/assert/svg/types.number.svg";
import date from "../../../src/assert/svg/types.date.svg";
import email from "../../../src/assert/svg/types.email.svg";
import phone from "../../../src/assert/svg/types.phone.svg";
import person from "../../../src/assert/svg/types.person.svg";
import CollectTable from "../../../src/assert/svg/collectTable.svg";
import CollectionBoard from "../../../src/assert/svg/collectionBoard.svg";
import CollectionGallery from "../../../src/assert/svg/collectionGallery.svg";
import CollectionList from "../../../src/assert/svg/collectionList.svg";
import CollectionCalendar from "../../../src/assert/svg/collectionCalendar.svg";
export function getTypeSvg(type: FieldType) {
    switch (type) {
        case FieldType.bool:
            return checkbox
        case FieldType.option:
            return select
        case FieldType.options:
            return multipleSelect
        case FieldType.file:
            return file
        case FieldType.link:
            return link
        case FieldType.phone:
            return phone
        case FieldType.email:
            return email;
        case FieldType.date:
            return date;
        case FieldType.users:
            return person;
        case FieldType.text:
            return string;
        case FieldType.number:
            return number;
        default:
            return string;
    }
}

export function getSchemaViewIcon(url: string) {
    switch (url) {
        case '/data-grid/table':
            return CollectTable;
            break;
        case '/data-grid/board':
            return CollectionBoard
            break;
        case '/data-grid/gallery':
            return CollectionGallery
            break;
        case '/data-grid/list':
            return CollectionList
            break;
        case '/data-grid/calendar':
            return CollectionCalendar
            break;
    }
}