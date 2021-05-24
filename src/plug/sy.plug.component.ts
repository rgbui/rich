import React from "react";
import { Events } from "../util/events";
import { util } from "../util/util";

export class SyPlugComponent<T = {}> extends React.Component<T>{
    constructor(props: T) {
        super(props);
    }
}
util.inherit(SyPlugComponent, Events);
export interface SyPlugComponent<T> extends Events {

}