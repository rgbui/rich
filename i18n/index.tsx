import React from "react";
import { LangID } from "./declare";
import { langProvider } from "./provider";
export class Sp extends React.Component<{ id: LangID }>{
    id: number;
    constructor(props) {
        super(props);
        this.id = langProvider.id;
    }
    componentDidMount() {
        langProvider.push(this);
    }
    componentWillUnmount() {
        langProvider.remove(this)
    }
    render() {
        if (langProvider.isLoaded) return langProvider.get(this.props.id)
        else return <></>;
    }
}