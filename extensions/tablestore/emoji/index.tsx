import React, { ReactNode } from "react";
import { FieldConfig } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { PlusSvg } from "../../../component/svgs";
import { Button } from "../../../component/view/button";
import { Row, Col } from "../../../component/view/grid";
import { Remark } from "../../../component/view/text";
import { Rect } from "../../../src/common/vector/point";
import { useOpenEmoji } from "../../emoji";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import "./style.less";

export class FieldEmojiView extends EventsComponent {
    render(): ReactNode {
        return <div className="shy-emoji-field-view">
            <Row>
                <Col><Remark>表情:</Remark><span onClick={e => this.onSetEmoji(e)}>{this.config?.emoji?.code || <Button ghost icon={PlusSvg}>添加表情</Button>}</span></Col>
            </Row >
        </div>
    }
    async onSetEmoji(e: React.MouseEvent) {
        var r = await useOpenEmoji({ roundArea: Rect.fromEvent(e) });
        if (r) {
            await this.onChangeConfig({ emoji: r })
        }
    }
    isChange: boolean = false;
    config: FieldConfig = {};
    async onChangeConfig(config: Partial<FieldConfig>) {
        Object.assign(this.config, config);
        this.isChange = true;
        this.forceUpdate();
    }
    async open(option: {
        schema: TableSchema,
        config?: Record<string, any>
    }) {
        this.config = option.config;
    }
}

export async function useFieldEmojiView(pos: PopoverPosition,
    option: {
        schema: TableSchema,
        config?: Record<string, any>
    }) {
    let popover = await PopoverSingleton(FieldEmojiView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: { config?: FieldConfig }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(fv.isChange ? { config: fv.config } : undefined);
        })
        popover.only('close', () => {
            resolve(fv.isChange ? { config: fv.config } : undefined);
        })
    })
}