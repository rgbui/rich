
import { BoardToolFrameSvg, BoardFrame34Svg, BoardFrame43Svg, BoardFrame11Svg, BoardFrame169Svg, BoardFrameA4Svg, BoardFramePhoneSvg, BoardFramePadSvg, BoardFrameWebSvg } from "../../component/svgs"
import { Icon } from "../../component/view/icon"
import { MenuItemType } from "../../component/view/menu/declare"
import { lst } from "../../i18n/store"
import React from "react"

export var canvasOptions = () => [
    {
        text: lst('画板'),
        renderIcon() {
            return <span className="flex-center flex-line  text-1 size-32" ><Icon
                icon={BoardToolFrameSvg}
            ></Icon></span >
        },
        value: 'none'
    },
    { text: '3:4', value: '3:4', iconSize: 32, icon: BoardFrame34Svg },
    { text: '4:3', value: '4:3', iconSize: 32, icon: BoardFrame43Svg },
    { text: '1:1', value: '1:1', iconSize: 32, icon: BoardFrame11Svg },
    { text: '16:9', value: '16:9', iconSize: 32, icon: BoardFrame169Svg },
    { text: 'A4', value: 'A4', iconSize: 32, icon: BoardFrameA4Svg },
    { text: lst('原型'), type: MenuItemType.text },
    {
        text: ('Phone'),
        value: 'phone',
        iconSize: 32,
        icon: BoardFramePhoneSvg,
        childs: [
            {
                "text": "iPhone 14",
                "value": {
                    "name": "phone",
                    "width": 390,
                    "height": 844
                },
                "label": "390 x 844"
            },
            {
                "text": "iPhone 14 Pro",
                "value": {
                    "name": "phone",
                    "width": 393,
                    "height": 852
                },
                "label": "393 x 852"
            },
            {
                "text": "iPhone 14 Plus",
                "value": {
                    "name": "phone",
                    "width": 428,
                    "height": 926
                },
                "label": "428 x 926"
            },
            {
                "text": "iPhone 14 Pro Max",
                "value": {
                    "name": "phone",
                    "width": 430,
                    "height": 932
                },
                "label": "430 x 932"
            },
            {
                "text": "iPhone 13 Pro Max",
                "value": {
                    "name": "phone",
                    "width": 428,
                    "height": 926
                },
                "label": "428 x 926"
            },
            {
                "text": "iPhone 13 / 13 Pro",
                "value": {
                    "name": "phone",
                    "width": 390,
                    "height": 844
                },
                "label": "390 x 844"
            },
            {
                "text": "iPhone 13 mini",
                "value": {
                    "name": "phone",
                    "width": 375,
                    "height": 812
                },
                "label": "375 x 812"
            },
            {
                "text": "iPhone SE",
                "value": {
                    "name": "phone",
                    "width": 320,
                    "height": 568
                },
                "label": "320 x 568"
            },
            {
                "text": "iPhone 8 Plus",
                "value": {
                    "name": "phone",
                    "width": 414,
                    "height": 736
                },
                "label": "414 x 736"
            },
            {
                "text": "iPhone 8",
                "value": {
                    "name": "phone",
                    "width": 375,
                    "height": 667
                },
                "label": "375 x 667"
            },
            {
                "text": "Android Small",
                "value": {
                    "name": "phone",
                    "width": 360,
                    "height": 640
                },
                "label": "360 x 640"
            },
            {
                "text": "Android Large",
                "value": {
                    "name": "phone",
                    "width": 360,
                    "height": 800
                },
                "label": "360 x 800"
            }
        ]

    },
    {
        text: ('Pad'),
        value: 'pad',
        iconSize: 32,
        icon: BoardFramePadSvg,
        childs: [
            {
                "text": "iPad mini",
                "value": {
                    "name": "pad",
                    "width": 768,
                    "height": 1024
                },
                "label": "768 x 1024"
            },
            {
                "text": "iPad Pro 11",
                "value": {
                    "name": "pad",
                    "width": 834,
                    "height": 1194
                },
                "label": "834 x 1194"
            },
            {
                "text": "iPad Pro 12.9",
                "value": {
                    "name": "pad",
                    "width": 1024,
                    "height": 1366
                },
                "label": "1024 x 1366"
            },
            {
                "text": "Surface Pro 8",
                "value": {
                    "name": "pad",
                    "width": 1440,
                    "height": 960
                },
                "label": "1440 x 960"
            }
        ]
    },
    {
        text: ('Web'),
        value: 'web',
        iconSize: 32,
        icon: BoardFrameWebSvg,
        childs: [
            {
                "text": "FHD",
                "value": {
                    "name": "web",
                    "width": 1920,
                    "height": 1080
                },
                "label": "1920 x 1080"
            },
            {
                "text": "Desktop",
                "value": {
                    "name": "web",
                    "width": 1440,
                    "height": 1024
                },
                "label": "1440 x 1024"
            },
            {
                "text": "Macbook Air",
                "value": {
                    "name": "web",
                    "width": 1280,
                    "height": 832
                },
                "label": "1280 x 832"
            },
            {
                "text": "Macbook Pro 14",
                "value": {
                    "name": "web",
                    "width": 1512,
                    "height": 982
                },
                "label": "1512 x 982"
            },
            {
                "text": "Macbook Pro 16",
                "value": {
                    "name": "web",
                    "width": 1728,
                    "height": 1117
                },
                "label": "1728 x 1117"
            },
            {
                "text": "Surface Book",
                "value": {
                    "name": "web",
                    "width": 1500,
                    "height": 1000
                },
                "label": "1500 x 1000"
            },
            {
                "text": "TV",
                "value": {
                    "name": "web",
                    "width": 1280,
                    "height": 720
                },
                "label": "1280 x 720"
            }
        ]
    }
]