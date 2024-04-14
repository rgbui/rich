import React, { lazy } from "react";
import { ACC } from "../../lib/async.compont";

export function LazyMarkdown(props: { md: string, html?: boolean, className?: string | (string[]) }) {
    return <ACC C={lazy(() => import('./index'))} props={props}></ACC>
}