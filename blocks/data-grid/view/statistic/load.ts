import { SyncLoad } from '../../../../component/lib/sync';
import { lst } from '../../../../i18n/store';
import { channel } from '../../../../net/channel';
import { util } from '../../../../util/util';
var sc = new SyncLoad<any>()

export function getEchartTheme() {
    return [
        {
            text:lst('白垩'),
            name: 'chalk',
            html: `<a class="theme-plan-group" title="chalk" style="background-color: rgb(41, 52, 65);">
        <div class="theme-plan-color" style="background-color: rgb(252, 151, 175);">
        </div><div class="theme-plan-color" style="background-color: rgb(135, 247, 207);">
        </div><div class="theme-plan-color" style="background-color: rgb(247, 244, 148);">
        </div><div class="theme-plan-color" style="background-color: rgb(114, 204, 255);">
        </div><div class="theme-plan-color" style="background-color: rgb(247, 197, 160);">
        </div><div class="theme-plan-color" style="background-color: rgb(212, 164, 235);">
        </div><div class="theme-plan-color" style="background-color: rgb(210, 245, 166);">
        </div><div class="theme-plan-color" style="background-color: rgb(118, 242, 242);">
        </div>
      </a>`,
            load: async () => await import('./data/chalk.json')
        },
        {  text:lst('暗黑'),
            name: 'dark',
            html: `<a class="theme-plan-group" title="dark" style="background-color: rgb(51, 51, 51);">
        <div class="theme-plan-color" style="background-color: rgb(221, 107, 102);">
        </div><div class="theme-plan-color" style="background-color: rgb(117, 154, 160);">
        </div><div class="theme-plan-color" style="background-color: rgb(230, 157, 135);">
        </div><div class="theme-plan-color" style="background-color: rgb(141, 193, 169);">
        </div><div class="theme-plan-color" style="background-color: rgb(234, 126, 83);">
        </div><div class="theme-plan-color" style="background-color: rgb(238, 221, 120);">
        </div><div class="theme-plan-color" style="background-color: rgb(115, 163, 115);">
        </div><div class="theme-plan-color" style="background-color: rgb(115, 185, 188);">
        </div><div class="theme-plan-color" style="background-color: rgb(114, 137, 171);">
        </div><div class="theme-plan-color" style="background-color: rgb(145, 202, 140);">
        </div><div class="theme-plan-color" style="background-color: rgb(244, 159, 66);">
        </div>
      </a>`,
            load: async () => await import('./data/dark.json')
        },
        {
            text:lst('厄索斯'),
            name: 'essos',
            html: `<a class="theme-plan-group" title="essos" style="background-color: rgba(242, 234, 191, 0.15);">
        <div class="theme-plan-color" style="background-color: rgb(137, 52, 72);">
        </div><div class="theme-plan-color" style="background-color: rgb(217, 88, 80);">
        </div><div class="theme-plan-color" style="background-color: rgb(235, 129, 70);">
        </div><div class="theme-plan-color" style="background-color: rgb(255, 178, 72);">
        </div><div class="theme-plan-color" style="background-color: rgb(242, 214, 67);">
        </div><div class="theme-plan-color" style="background-color: rgb(235, 219, 164);">
        </div>
      </a>`,
            load: async () => await import('./data/essos.json')
        },
        {
            text:lst('信息图'),
            name: 'infographic',
            html: `<a class="theme-plan-group" title="infographic" style="background-color: transparent;">
        <div class="theme-plan-color" style="background-color: rgb(193, 35, 43);">
        </div><div class="theme-plan-color" style="background-color: rgb(39, 114, 123);">
        </div><div class="theme-plan-color" style="background-color: rgb(252, 206, 16);">
        </div><div class="theme-plan-color" style="background-color: rgb(232, 124, 37);">
        </div><div class="theme-plan-color" style="background-color: rgb(181, 195, 52);">
        </div><div class="theme-plan-color" style="background-color: rgb(254, 132, 99);">
        </div><div class="theme-plan-color" style="background-color: rgb(155, 202, 99);">
        </div><div class="theme-plan-color" style="background-color: rgb(250, 216, 96);">
        </div><div class="theme-plan-color" style="background-color: rgb(243, 164, 59);">
        </div><div class="theme-plan-color" style="background-color: rgb(96, 192, 221);">
        </div><div class="theme-plan-color" style="background-color: rgb(215, 80, 75);">
        </div><div class="theme-plan-color" style="background-color: rgb(198, 229, 121);">
        </div><div class="theme-plan-color" style="background-color: rgb(244, 224, 1);">
        </div><div class="theme-plan-color" style="background-color: rgb(240, 128, 90);">
        </div><div class="theme-plan-color" style="background-color: rgb(38, 192, 192);">
        </div>
      </a>`,
            load: async () => await import('./data/infographic.json')
        },
        {
            text:lst('马卡龙'),
            name: 'macarons',
            html: `<a class="theme-plan-group" title="macarons" style="background-color: transparent;">
        <div class="theme-plan-color" style="background-color: rgb(46, 199, 201);">
        </div><div class="theme-plan-color" style="background-color: rgb(182, 162, 222);">
        </div><div class="theme-plan-color" style="background-color: rgb(90, 177, 239);">
        </div><div class="theme-plan-color" style="background-color: rgb(255, 185, 128);">
        </div><div class="theme-plan-color" style="background-color: rgb(216, 122, 128);">
        </div><div class="theme-plan-color" style="background-color: rgb(141, 152, 179);">
        </div><div class="theme-plan-color" style="background-color: rgb(229, 207, 13);">
        </div><div class="theme-plan-color" style="background-color: rgb(151, 181, 82);">
        </div><div class="theme-plan-color" style="background-color: rgb(149, 112, 109);">
        </div><div class="theme-plan-color" style="background-color: rgb(220, 105, 170);">
        </div><div class="theme-plan-color" style="background-color: rgb(7, 162, 164);">
        </div><div class="theme-plan-color" style="background-color: rgb(154, 127, 209);">
        </div><div class="theme-plan-color" style="background-color: rgb(88, 141, 213);">
        </div><div class="theme-plan-color" style="background-color: rgb(245, 153, 78);">
        </div><div class="theme-plan-color" style="background-color: rgb(192, 80, 80);">
        </div><div class="theme-plan-color" style="background-color: rgb(89, 103, 140);">
        </div><div class="theme-plan-color" style="background-color: rgb(201, 171, 0);">
        </div><div class="theme-plan-color" style="background-color: rgb(126, 176, 10);">
        </div><div class="theme-plan-color" style="background-color: rgb(111, 85, 83);">
        </div><div class="theme-plan-color" style="background-color: rgb(193, 64, 137);">
        </div>
      </a>`,
            load: async () => await import('./data/macarons.json')
        },
        {
            text:lst('紫色'),
            name: 'purple-passion',
            html: `<a class="theme-plan-group" title="purple-passion" style="background-color: rgb(91, 92, 110);">
        <div class="theme-plan-color" style="background-color: rgb(138, 124, 168);">
        </div><div class="theme-plan-color" style="background-color: rgb(224, 152, 199);">
        </div><div class="theme-plan-color" style="background-color: rgb(143, 211, 232);">
        </div><div class="theme-plan-color" style="background-color: rgb(113, 102, 158);">
        </div><div class="theme-plan-color" style="background-color: rgb(204, 112, 175);">
        </div><div class="theme-plan-color" style="background-color: rgb(124, 180, 204);">
        </div>
      </a>`,
            load: async () => await import('./data/purple-passion.json')
        },
        {
            text:lst('罗马'),
            name: 'roma',
            html: `<a class="theme-plan-group" title="roma" style="background-color: transparent;">
        <div class="theme-plan-color" style="background-color: rgb(224, 31, 84);">
        </div><div class="theme-plan-color" style="background-color: rgb(0, 24, 82);">
        </div><div class="theme-plan-color" style="background-color: rgb(245, 232, 200);">
        </div><div class="theme-plan-color" style="background-color: rgb(184, 210, 199);">
        </div><div class="theme-plan-color" style="background-color: rgb(198, 179, 142);">
        </div><div class="theme-plan-color" style="background-color: rgb(164, 216, 194);">
        </div><div class="theme-plan-color" style="background-color: rgb(243, 217, 153);">
        </div><div class="theme-plan-color" style="background-color: rgb(211, 117, 143);">
        </div><div class="theme-plan-color" style="background-color: rgb(220, 195, 146);">
        </div><div class="theme-plan-color" style="background-color: rgb(46, 71, 131);">
        </div><div class="theme-plan-color" style="background-color: rgb(130, 182, 233);">
        </div><div class="theme-plan-color" style="background-color: rgb(255, 99, 71);">
        </div><div class="theme-plan-color" style="background-color: rgb(160, 146, 241);">
        </div><div class="theme-plan-color" style="background-color: rgb(10, 145, 93);">
        </div><div class="theme-plan-color" style="background-color: rgb(234, 248, 137);">
        </div><div class="theme-plan-color" style="background-color: rgb(102, 153, 255);">
        </div><div class="theme-plan-color" style="background-color: rgb(255, 102, 102);">
        </div><div class="theme-plan-color" style="background-color: rgb(60, 179, 113);">
        </div><div class="theme-plan-color" style="background-color: rgb(213, 177, 88);">
        </div><div class="theme-plan-color" style="background-color: rgb(56, 182, 182);">
        </div>
      </a>`,
            load: async () => await import('./data/roma.json')
        },
        {
            text:lst('闪亮'),
            name: 'shine',
            html: `<a class="theme-plan-group" title="shine" style="background-color: transparent;">
        <div class="theme-plan-color" style="background-color: rgb(193, 46, 52);">
        </div><div class="theme-plan-color" style="background-color: rgb(230, 182, 0);">
        </div><div class="theme-plan-color" style="background-color: rgb(0, 152, 217);">
        </div><div class="theme-plan-color" style="background-color: rgb(43, 130, 29);">
        </div><div class="theme-plan-color" style="background-color: rgb(0, 94, 170);">
        </div><div class="theme-plan-color" style="background-color: rgb(51, 156, 168);">
        </div><div class="theme-plan-color" style="background-color: rgb(205, 168, 25);">
        </div><div class="theme-plan-color" style="background-color: rgb(50, 164, 135);">
        </div>
      </a>`,
            load: async () => await import('./data/shine.json')
        },
        {
            text:lst('复古'),
            name: 'vintage',
            html: `<a class="theme-plan-group" title="vintage" style="background-color: rgb(254, 248, 239);">
            <div class="theme-plan-color" style="background-color: rgb(216, 124, 124);">
            </div><div class="theme-plan-color" style="background-color: rgb(145, 158, 139);">
            </div><div class="theme-plan-color" style="background-color: rgb(215, 171, 130);">
            </div><div class="theme-plan-color" style="background-color: rgb(110, 112, 116);">
            </div><div class="theme-plan-color" style="background-color: rgb(97, 160, 168);">
            </div><div class="theme-plan-color" style="background-color: rgb(239, 161, 141);">
            </div><div class="theme-plan-color" style="background-color: rgb(120, 116, 100);">
            </div><div class="theme-plan-color" style="background-color: rgb(204, 126, 99);">
            </div><div class="theme-plan-color" style="background-color: rgb(114, 78, 88);">
            </div><div class="theme-plan-color" style="background-color: rgb(75, 86, 91);">
            </div>
          </a>`,
            load: async () => await import('./data/vintage.json')
        },
        {
            text:lst('瓦尔登'),
            name: 'walden',
            html: `<a class="theme-plan-group" title="walden" style="background-color: rgba(252, 252, 252, 0);">
        <div class="theme-plan-color" style="background-color: rgb(63, 177, 227);">
        </div><div class="theme-plan-color" style="background-color: rgb(107, 230, 193);">
        </div><div class="theme-plan-color" style="background-color: rgb(98, 108, 145);">
        </div><div class="theme-plan-color" style="background-color: rgb(160, 167, 230);">
        </div><div class="theme-plan-color" style="background-color: rgb(196, 235, 173);">
        </div><div class="theme-plan-color" style="background-color: rgb(150, 222, 232);">
        </div>
      </a>`,
            load: async () => await import('./data/walden.json')
        },
        {
            text:lst('维斯特洛'),
            name: 'westeros',
            html: `<a class="theme-plan-group" title="westeros" style="background-color: transparent;">
        <div class="theme-plan-color" style="background-color: rgb(81, 107, 145);">
        </div><div class="theme-plan-color" style="background-color: rgb(89, 196, 230);">
        </div><div class="theme-plan-color" style="background-color: rgb(237, 175, 218);">
        </div><div class="theme-plan-color" style="background-color: rgb(147, 183, 227);">
        </div><div class="theme-plan-color" style="background-color: rgb(165, 231, 240);">
        </div><div class="theme-plan-color" style="background-color: rgb(203, 176, 227);">
        </div>
      </a>`,
            load: async () => await import('./data/westeros.json')
        },
        {
            text:lst('仙境'),
            name: 'wonderland',
            html: `<a class="theme-plan-group" title="wonderland" style="background-color: transparent;">
        <div class="theme-plan-color" style="background-color: rgb(78, 163, 151);">
        </div><div class="theme-plan-color" style="background-color: rgb(34, 195, 170);">
        </div><div class="theme-plan-color" style="background-color: rgb(123, 217, 165);">
        </div><div class="theme-plan-color" style="background-color: rgb(208, 100, 138);">
        </div><div class="theme-plan-color" style="background-color: rgb(245, 141, 178);">
        </div><div class="theme-plan-color" style="background-color: rgb(242, 179, 201);">
        </div>
      </a>`,
            load: async () => await import('./data/wonderland.json')
        }
    ]
}

export async function loadEchart() {
    return await sc.create((c) => {
        (async () => {
            var r = await import(
                /* webpackChunkName: 'echarts' */
                /* webpackPrefetch: true */
                'echarts');
            var EchartThemes = getEchartTheme();
            for (let i = 0; i < EchartThemes.length; i++) {
                var te = EchartThemes[i];
                var rc = await channel.query('/cache/get', { key: 'echart-theme-' + te.name });
                if (!rc) {
                    var rg = await te.load();
                    var d = typeof rg.default == 'object' ? rg.default : (await util.getJson(rg.default)).data;
                    await channel.act('/cache/set', { key: 'echart-theme-' + te.name, value: d });
                    rc = d;
                }
                r.registerTheme(te.name, rc)
            }
            c(r);
        })()
    });
}


