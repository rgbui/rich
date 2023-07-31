import React from "react";

export class S extends React.Component<{ key?: string, children: React.ReactText }>{
    render(): React.ReactNode {
        return this.props.children;
    }
}

export class Sp extends React.Component<{ key?: string, children: React.ReactNode }>{
    render(): React.ReactNode {
        return this.props.children;
    }
}