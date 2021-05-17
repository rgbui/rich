import React from "react";
import { Events } from "../util/events";

export class SyPlugComponent<T = {}> extends React.Component<T>{
    constructor(props: T) {
        super(props);
        Events.call(this);
    }
}
export interface SyPlugComponent<T> extends Events {

}