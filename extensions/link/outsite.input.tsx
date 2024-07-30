import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { EmbedType } from "./url/embed.url";
import { Input } from "../../component/view/input";
import { Button } from "../../component/view/button";
import { S } from "../../i18n/view";
import { HelpText } from "../../component/view/text";

class OutSideUrlInput extends EventsComponent {
    save() {
        this.emit('select', { name: 'link', url: this.url });
    }
    url: string = '';
    render() {
        var placeholder = 'https://...';
        if (this.isEmbed) {
          
            if (this.embedType == 'bilibili') placeholder = 'https://www.bilibili.com/video/***';
            else if (this.embedType == 'music.163') placeholder = 'https://music.163.com/#/song?id=***';
            else if (this.embedType == 'figma') placeholder = 'https://www.figma.com/file/***';
            else if (this.embedType == 'mastergo') placeholder = 'https://mastergo.com/goto/***';
            else if (this.embedType == 'vqq') placeholder = 'https://v.qq.com/x/cover/***';
            else if(this.embedType=='youku') placeholder = 'https://v.youku.com/v_show/id_***==.html';
            else if(this.embedType=='ytob') placeholder = 'https://www.youtube.com/watch?v=***';
        }
        return <div className='gap-10 w-350' >

            <div className="flex">
                <div className="flex-auto">
                    <Input placeholder={placeholder} value={this.url} onChange={e => this.url = e} onEnter={e => { this.url = e; this.save() }}></Input>
                </div>
                <div className="flex-fixed gap-l-10">
                    <Button onClick={() => this.save()}>{this.isEmbed ? <S>嵌入</S> : <S>保存</S>}</Button>
                </div>
            </div>

            <div className="gap-t-10" style={{ marginLeft: -3 }}>
                {this.embedType == '' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#qwNuJC5aEquidQgYi5qg2u" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trj"} ><S>了解如何嵌入网址</S></HelpText>}
                {this.embedType == 'bilibili' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#5gKEXYbh25oZmav8nWw8rt" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trjt"} ><S>了解如何嵌入B站视频</S></HelpText>}
                {this.embedType == 'music.163' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#dbrjkrxsrcAdhVFPNnvaTa" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trj"} ><S>了解如何嵌入网易云音乐的歌曲</S></HelpText>}
                {this.embedType == 'figma' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#nhsrgEfQp9PDyHdGuWdftf" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trj"} ><S>了解如何嵌入Figma文件</S></HelpText>}
                {this.embedType == 'mastergo' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#nhsrgEfQp9PDyHdGuWdftf" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trj"} ><S>了解如何嵌入MasterGO文件</S></HelpText>}
                {this.embedType == 'vqq' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#nhsrgEfQp9PDyHdGuWdftf" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trj"} ><S>了解如何嵌入腾讯视频</S></HelpText>}
                {this.embedType == 'youku' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#nhsrgEfQp9PDyHdGuWdftf" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trj"} ><S>了解如何嵌入优酷视频</S></HelpText>}
                {this.embedType == 'ytob' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/270#nhsrgEfQp9PDyHdGuWdftf" : "https://help.shy.live/page/1895#5pnuHiArkgFbBHEx9J2trj"} ><S>了解如何嵌入YouTube视频</S></HelpText>}
                {this.embedType == 'bookmark' && <HelpText align="left" url={window.shyConfig?.isUS ? "https://help.shy.live/page/269#gxcRqJXWfdDa1TUKzvp5yo" : "https://help.shy.live/page/269#gxcRqJXWfdDa1TUKzvp5yo"} ><S>了解如何使用网址书签</S></HelpText>}

            </div>

        </div>
    }
    embedType: EmbedType;
    isEmbed: boolean;
    open(options?: { embedType?: EmbedType,url?:string, isEmbed?: boolean }) {
        this.embedType = options?.embedType ?? '';
        this.isEmbed = options?.isEmbed ?? false;
        this.url=options?.url??'';
        this.forceUpdate();
    }
}

interface OutSideUrlInput {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useOutSideUrlInput(pos: PopoverPosition, options?: { embedType?: EmbedType, url?:string,isEmbed?: boolean }) {
    let popover = await PopoverSingleton(OutSideUrlInput);
    let outSideUrlInput = await popover.open(pos);
    outSideUrlInput.open(options);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        outSideUrlInput.only('select', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}