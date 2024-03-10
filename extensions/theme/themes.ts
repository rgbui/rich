import { CSSProperties } from "react";
import { lst } from "../../i18n/store";
import { Page } from "../../src/page";
import { PageLayoutType, PageThemeStyle } from "../../src/page/declare";

export function GetPageThemes(page: Page) {
    if ([
        PageLayoutType.doc,
        PageLayoutType.db,
        PageLayoutType.recordView,
        PageLayoutType.docCard
    ].includes(page?.pageLayout?.type)) {
        var groups = [
            {
                text: lst('风格'),
                name: 'style',
                childs: [
                    {
                        text: lst('空白'),
                        name: 'style-1',
                        pageTheme: {
                            name: 'style-1',
                            bgStyle: {
                                mode: 'color',
                                color: '#fff',
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: "noborder"
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('银白'),
                        name: 'style-3',
                        pageTheme: {
                            name: 'style-3',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(246, 244, 244)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 14,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('珍珠'),
                        name: 'style-4',
                        pageTheme: {
                            name: 'style-4',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(236, 236, 243)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'frosted',
                                border: '0px solid #eee',
                                round: 14,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgba(255, 255, 255, 0.64) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('破冰'),
                        name: 'style-5',
                        pageTheme: {
                            name: 'style-5',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(237, 241, 248)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 8,
                                shadow: 'none'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('绿洲'),
                        name: 'style-6',
                        pageTheme: {
                            name: 'style-6',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(170, 188, 182)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('灵巧'),
                        name: 'style-7',
                        pageTheme: {
                            name: 'style-7',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(242, 228, 207)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 4,
                                shadow: 'none'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('伽玛'),
                        name: 'style-8',
                        pageTheme: {
                            name: 'style-8',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(250, 242, 233)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('鼠尾草'),
                        name: 'style-9',
                        pageTheme: {
                            name: 'style-9',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(235, 244, 243)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('赤土'),
                        name: 'style-10',
                        pageTheme: {
                            name: 'style-10',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(247, 237, 233)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('细腻'),
                        name: 'style-1',
                        pageTheme: {
                            name: 'style-1',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(242, 228, 207)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'faded',
                                border: '1px solid #eee',
                                round: 16,
                                shadow: 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    // {
                    //     text: lst('火红'),
                    //     name: 'style-2',
                    //     pageTheme: {
                    //         name: 'style-2',
                    //         bgStyle: {
                    //             "mode": "grad",
                    //             "grad": {
                    //                 "name": "soft",
                    //                 "x": 4,
                    //                 "y": 109.5,
                    //                 "bg": "radial-gradient(circle at 0% 0%, rgba(255,9,32,0.5) 0px, rgba(255,9,32,0) 50%),radial-gradient(circle at 12.700117292409608% 19.41763171368182%, rgba(255,170,9,0.5) 0px, rgba(255,170,9,0) 87.2998827075904%),radial-gradient(circle at 19.41763171368182% 87.2998827075904%, rgba(255,9,217,0.5) 0px, rgba(255,9,217,0) 80.58236828631817%),linear-gradient(0deg, rgba(255,9,32,0.5) 0%, rgba(255,9,32,0.5) 100%)"
                    //             }
                    //         },
                    //         contentStyle: {
                    //             color: 'light',
                    //             transparency: 'solid',
                    //             border: '1px solid #eee',
                    //             round: 16,
                    //             shadow: 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px'
                    //         },
                    //         coverStyle: {
                    //             display: 'outside'
                    //         }
                    //     }
                    // }
                ]
            }
        ]
        return groups;
    }
    return []
}

export function GetPageBgs() {
    return [
        // { color: 'inherit', text: lst('默认') },
        { color: '#fff', text: lst('白色') },
        { color: 'rgba(237,233,235,0.5)', text: lst('白灰') },
        { color: '#EDF2F7', text: lst('冷灰') },
        { color: '#F2F2F2', text: lst('浅灰') },
        { color: '#F7F3F0', text: lst('暖灰') },
        { color: '#F7F1EB', text: lst('米色') },
        { color: 'rgba(217,211,215,0.5)', text: lst('暗银') },
        { color: 'rgba(247,214,183,0.5)', text: lst('幼杏') },
        { color: 'rgba(255,193,153,0.5)', text: lst('鲜橘') },
        { color: '#f8ecd3', text: lst('木瓜') },
        { color: 'rgba(252,246,189,0.5)', text: lst('淡黄') },
        { color: 'rgba(205,243,220,0.5)', text: lst('浅绿') },
        { color: '#bdebe8', text: lst('绿蓝') },
        { color: '#d5eff6', text: lst('青色') },
        { color: 'rgba(169,222,249,0.5)', text: lst('天蓝') },
        { color: '#cbdbf1', text: lst('长春') },
        { color: 'rgba(189,201,255,0.5)', text: lst('雾蓝') },
        { color: 'rgba(239,218,251,0.5)', text: lst('轻紫') },
        { color: '#e2def2', text: lst('淡紫') },
        { color: 'rgba(234,202,220,0.5)', text: lst('熏粉') },
        { color: '#f8d3d7', text: lst('淡粉') },
        { color: 'rgba(253,198,200,0.5)', text: lst('将红') },
        { color: '#eee2dd', text: lst('亚麻') },
    ].map(c => {
        return {
            color: c.color.replace('0.5)', '0.8)'),
            text: c.text
        }
    })
}

export function getCardThemes() {
    return [
        {
            text: lst('边框'),
            name: 'style',
            childs: [
                {
                    text: '',
                    name: 'style-3',
                    pageTheme: {
                        name: 'style-3',
                        contentStyle: {
                            border: '1px solid #eee',
                            round: 8,
                            shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-4',
                    pageTheme: {
                        name: 'style-4',
                        contentStyle: {
                            border: '2px dashed #aaa',
                            round: 8,
                            shadow: 'none'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-5',
                    pageTheme: {
                        name: 'style-5',
                        contentStyle: {
                            border: '2px solid rgb(225, 98, 89)',
                            round: 8,
                            shadow: 'none'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-6',
                    pageTheme: {
                        name: 'style-6',
                        contentStyle: {
                            border: '0px solid #eee',
                            round: 2,
                            shadow: '0 1px 3px hsla(0,0%,7%,.1)'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-7',
                    pageTheme: {
                        name: 'style-7',
                        contentStyle: {
                            border: '0px solid #eee',
                            round: 16,
                            shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-9',
                    pageTheme: {
                        name: 'style-9',
                        contentStyle: {
                            border: '1px solid #e7eaf3',
                            round: 20,
                            shadow: '0 .2rem 1.25rem rgba(0, 0, 0, .07)'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-10',
                    pageTheme: {
                        name: 'style-10',
                        contentStyle: {
                            border: '1px solid #e7eaf3',
                            round: 20,
                            shadow: 'none'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-11',
                    pageTheme: {
                        name: 'style-11',
                        contentStyle: {
                            border: '2px solid rgb(225, 98, 89);1px solid #eee;1px solid #eee;1px solid #eee',
                            round: 10,
                            shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                }
            ]
        }
    ]
}

export function getBgStyle(s: PageThemeStyle['bgStyle']) {
    var bgStyle: CSSProperties = {};
    if (!s) return bgStyle;
    if (s.mode == 'color') bgStyle.backgroundColor = s.color;
    else if (s.mode == 'image' || s.mode == 'uploadImage') {
        bgStyle.backgroundImage = `url(${s.src})`;
        bgStyle.backgroundSize = 'cover';
        bgStyle.backgroundRepeat = 'no-repeat';
        bgStyle.backgroundPosition = 'center center';
        bgStyle.backgroundAttachment = 'scroll'
    }
    else if (s.mode == 'grad') {
        bgStyle.backgroundImage = s.grad?.bg;
        bgStyle.backgroundSize = 'cover';
        bgStyle.backgroundRepeat = 'no-repeat';
        bgStyle.backgroundPosition = 'center center';
        // bgStyle.backgroundAttachment = 'fixed';
        bgStyle.backgroundAttachment = 'scroll'
    }
    return bgStyle;
}

export function getCardStyle(s: PageThemeStyle) {
    var bgStyle: CSSProperties = {};
    var contentStyle: CSSProperties = {};
    var coverStyle: CSSProperties = {};

    contentStyle.borderRadius = 16;
    contentStyle.boxShadow = 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px';
    contentStyle.boxSizing = 'border-box';
    contentStyle.border = '1px solid rgb(238, 238, 238)';

    var cs = s.contentStyle;
    if (cs.border) {
        if (typeof cs.border == 'string') {
            if (cs.border.includes(";")) {
                var cbs = cs.border.split(";");
                contentStyle.borderTop = cbs[0];
                contentStyle.borderRight = cbs[1];
                contentStyle.borderBottom = cbs[2];
                contentStyle.borderLeft = cbs[3];
            }
            else
                contentStyle.border = cs.border;
        }
        else Object.assign(contentStyle, cs.border);
    }
    if (cs.round) {
        if (typeof cs?.round == 'string' || typeof cs?.round == 'number') contentStyle.borderRadius = cs.round;
        else Object.assign(contentStyle, cs.round);
    }
    if (cs.shadow) {
        if (typeof cs.shadow == 'string') contentStyle.boxShadow = cs.shadow;
        else Object.assign(contentStyle, cs.shadow);
    }
    if (s.coverStyle?.display == 'inside') {
        contentStyle.backgroundColor = 'rgba(255,255,255, 0.75)'
        if (s.contentStyle.transparency == 'frosted') {
            contentStyle.backdropFilter = 'blur(20px) saturate(170%)'
        }
        else if (s.contentStyle.transparency == 'noborder') {
            contentStyle.backgroundColor = undefined;
        }
    }

    var round = contentStyle.borderRadius || 8;
    var r1: number | string, r2: number | string, r3: number | string, r4: number | string;
    if (typeof round == 'number') {
        r1 = r2 = r3 = r4 = round + 'px';
    }
    else {
        var rs = (round as string).split(' ');
        if (rs.length == 1) {
            r1 = r2 = r3 = r4 = rs[0];
        }
        else if (rs.length == 2) {
            r1 = r3 = rs[0];
            r2 = r4 = rs[1];
        }
        else {
            r1 = rs[0];
            r2 = rs[1];
            r3 = rs[2];
            r4 = rs[3] || rs[2];
        }
    }

    if (s.coverStyle.display == 'inside-cover') {
        coverStyle.borderRadius = `${r1} ${r2} 0px  0px`;
    }
    else if (s.coverStyle.display == 'inside-cover-left') {
        coverStyle.borderRadius = `${r1} 0px 0px ${r4} `;
    }
    else if (s.coverStyle.display == 'inside-cover-right') {
        coverStyle.borderRadius = ` 0px ${r2} ${r3} 0px`;
    }



    if (s.coverStyle.display != 'none' && s.coverStyle?.bgStyle) {
        if (s.coverStyle?.bgStyle.mode == 'color') coverStyle.backgroundColor = s.coverStyle?.bgStyle.color;
        else if (s.coverStyle?.bgStyle.mode == 'image' || s.coverStyle?.bgStyle.mode == 'uploadImage') {
            coverStyle.backgroundImage = `url(${s.coverStyle?.bgStyle.src})`;
            coverStyle.backgroundSize = 'cover';
            coverStyle.backgroundRepeat = 'no-repeat';
            coverStyle.backgroundPosition = 'center center';
            coverStyle.backgroundAttachment = 'fixed';
        }
        else if (s.coverStyle?.bgStyle.mode == 'grad') {
            coverStyle.backgroundImage = s.coverStyle?.bgStyle?.grad?.bg;
            coverStyle.backgroundSize = 'cover';
            coverStyle.backgroundRepeat = 'no-repeat';
            coverStyle.backgroundPosition = 'center center';
            coverStyle.backgroundAttachment = 'fixed';
        }
    }

    if (s?.bgStyle && s?.bgStyle?.mode != 'none') {
        if (s?.bgStyle.mode == 'color') bgStyle.backgroundColor = s?.bgStyle.color;
        else if (s?.bgStyle.mode == 'image' || s?.bgStyle.mode == 'uploadImage') {
            bgStyle.backgroundImage = `url(${s?.bgStyle.src})`;
            bgStyle.backgroundSize = 'cover';
            bgStyle.backgroundRepeat = 'no-repeat';
            bgStyle.backgroundPosition = 'center center';
            bgStyle.backgroundAttachment = 'fixed';
        }
        else if (s?.bgStyle.mode == 'grad') {
            bgStyle.backgroundImage = s?.bgStyle?.grad?.bg;
            bgStyle.backgroundSize = 'cover';
            bgStyle.backgroundRepeat = 'no-repeat';
            bgStyle.backgroundPosition = 'center center';
            bgStyle.backgroundAttachment = 'fixed';
        }
    }

    return {
        bgStyle,
        contentStyle,
        coverStyle
    }
}