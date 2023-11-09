import React, { useRef } from "react";
import "./qrcode.min.js";
export function QR(props: { url: string, size: number })
{
    var r = useRef<HTMLElement>(null);
    async function load() {
        var size = props.size;
        if (isNaN(size)) size = 100;
        var qr = r.current;
        qr.style.width = size + "px";
        qr.style.height = size + "px";
        console.log((window as any).QRCode)
        var qrcode = new (window as any).QRCode(qr, {
            width: size - 10,
            height: size - 10
        });
        qrcode.makeCode(props.url);
    }
    React.useEffect(() => {
        load();
    }, [])
    return <div ref={e => r.current = e}>
    </div>
}