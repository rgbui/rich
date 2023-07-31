// import React from "react";
// import { langStore } from "./store";

// export class LangView<T = number> extends React.Component<{ id: T }>
// {
//     public key: string;
//     id: any;
//     constructor(props) {
//         super(props);
//         this.id = langStore.id;
//     }
//     componentDidMount() {
//         langStore.push(this as any);
//     }
//     componentWillUnmount() {
//         langStore.remove(this as any)
//     }
//     render() {
//         if (langStore.isLoaded(this.key)) return langStore.get(this.key, this.props.id)
//         else return <></>;
//     }
// }