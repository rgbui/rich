import React from "react";
import { IconArguments } from "../extensions/icon/declare";
import { EventsComponent } from "./lib/events.component";
class Notify extends React.Component<NotityProps> {

}
class NotifyBox extends EventsComponent {

}

export enum NotifyType {
    warn,
    error,
    info
}

export type NotityProps = {
    type: NotifyType,
    title?: string,
    remark?: string,
    icon?: IconArguments
}


export async function useOpenNotify(props: NotityProps) {

}