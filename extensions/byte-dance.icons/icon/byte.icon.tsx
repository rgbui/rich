import React, { CSSProperties } from "react";
import { ByteIcons } from "./byte-dance.icons";
import { util } from "../../../util/util";

export default class ByteIcon extends React.Component<{
    style?: CSSProperties,
    className?: string | (string[]),
    size?: number,
    name: string,
    color: string,
    onClick?: (e: React.MouseEvent) => void,
    onMouseDown?: (e: React.MouseEvent) => void
}> {
    render() {
        var { name, color, size } = this.props;
        var d = ByteIcons.get(name)({
            id: name as any,
            width: size || 24,
            height: size || 24,
            strokeWidth: 3,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
            colors: [color, 'none', color, color, color, color, color, color]
        })
        var cs = util.covertToArray(this.props.className);
        return <span className={cs.join(' ')} style={{
            ...(this.props.style || {})
        }} dangerouslySetInnerHTML={{ __html: d }}></span>
    }
}
