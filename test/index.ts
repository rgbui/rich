import { parseMarkdownContent } from "../extensions/Import-export/mime/markdown/parse";
import { channel } from "../net/channel"
import { getTextLink } from "../src/kit/write/declare";
import { testParseHtmlTs } from "./parse.html"



async function TestCode() {
    // var url = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

    // var html = 'WordPress的付费方案包括域名（约14.99美元/年）和主机（通常从7.99美元/月起）。此外，http://WordPress.com提供个人计划，每月4美元（按年计费），可以删除http://WordPress.com徽标和广告，并获得自定义域名。还有每月8美元（按年计费）的计划，提供额外的设计工具和额外的存储空间。';
    // var replaceHtml = html.replace(url, (url) => {
    //     return `<a href="${url}" target="_blank">${url}</a>`
    // });
    // console.log(html, replaceHtml);

    // var r=await channel.post('/text/ai',{input:'写一段小故事，不少于1000字，故事内容自定，但必须包含“我”和“你”两个角色。'});
    // console.log(r);
    // var r={
    //     "message": "在那个寂静的小山村，住着两个要好的小伙伴，一个叫小华，一个叫小丽。小华家在村头，而小丽家在村尾，两家人世代相邻，两家人的孩子更是形影不离的好朋友。\n\n小华性格活泼开朗，喜欢冒险，而小丽则沉稳内向，善解人意。他们经常一起捉迷藏、放风筝、跳绳，度过了许多快乐的时光。\n\n一天，小华突然提出了一个大胆的想法：“小丽，我们去探险吧，听说村子后面那片原始森林里藏着许多神秘的传说。”\n\n小丽犹豫了一下，说：“可是那片森林很危险，还有很多野兽，你真的确定要去吗？”\n\n小华信心满满地说：“放心吧，我会保护你的。我们一起去探险，一定能发现许多有趣的事情。”\n\n于是，两人决定第二天一起去探险。为了这次探险，小华和小丽都做足了准备。小华带上了一把锋利的刀、一壶水、一些干粮和一把绳索；小丽则带上了一把备用伞、一个急救包和一些简单的食物。\n\n第二天一早，小华和小丽背着行囊，带着满心的期待和好奇，踏上了探险之旅。他们穿过村庄，来到了村子后面的原始森林。\n\n森林里古树参天，藤蔓交错，阳光透过树叶洒在地面上，形成斑驳的光影。小华和小丽小心翼翼地走着，一边欣赏着大自然的鬼斧神工，一边寻找着传说中的宝藏。\n\n他们穿过了一片密林，来到了一片开阔地。小华突然眼前一亮，兴奋地说：“小丽，你看，那座石碑，上面好像刻着什么字。”\n\n小丽走上前仔细看了看，说：“嗯，是‘天赐宝藏’四个字。传说中，这座石碑下面就是宝藏的所在地。”\n\n两人商量了一下，决定挖开石碑。他们小心翼翼地将石碑周围的土挖开，露出一个深深的洞穴。洞穴里黑漆漆的，看不清里面的情况。\n\n小华壮着胆子说：“来吧，我们一起进去。”两人互相牵着对方的手，小心翼翼地走进了洞穴。\n\n洞穴里湿漉漉的，充满了泥土的气息。他们走了好一会儿，终于来到了一个宽敞的地下空间。小丽惊讶地说：“哇，这里好大啊，好像是一个地下宫殿。”\n\n他们四处张望，发现地下宫殿里摆放着许多古代文物，有金银财宝、瓷器、玉器等。小华兴奋地说：“小丽，我们发财了！”\n\n然而，就在这时，洞穴里突然传来了阵阵低吼声。小华和小丽心头一紧，原来是一只巨大的野兽正躲在暗处。野兽发现了他们，朝着他们扑了过来。\n\n小华和小丽奋力抵抗，但野兽的力量实在太大了。小丽被野兽扑倒在地，小华见状，毫不犹豫地冲上去与野兽展开了搏斗。\n\n经过一番惊心动魄的搏斗，小华终于将野兽击倒。他立刻跑过去救助小丽，将她扶起。两人互相看了看，发现对方身上都受伤了。\n\n小华疼爱地看着小丽，说：“小丽，你没事吧？我没事，我们回家吧。”小丽点点头，两人相互扶持着，走出了地下宫殿。\n\n当他们回到村子时，村民们看到他们满身尘土，满身伤痕，都惊呆了。村长走过来，关切地问：“小华、小丽，你们没事吧？”\n\n小华笑着说：“村长，我们没事，就是去探险了。我们发现了一个地下宫殿，不过里面有一只野兽，我们合力将它击倒了。”\n\n村长松了一口气，说：“好险啊，你们可要小心一点，以后不要再冒险了。”\n\n小华和小丽点点头，回到了家中。从此，他们再也没有去探险，而是把更多的时间用在学习和帮助村民们上。\n\n然而，那段探险的经历，却成为了他们一生中最难忘的回忆。每当夜深人静的时候，小华和小丽总会想起那段冒险的日子，心中充满了感慨。"
    // }
    // var blockDatas = await parseMarkdownContent(r.message);
    // console.log(blockDatas);

    const urlRegex = /^((https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])( |$)/i;
    var texts = 'https://www.xiaoyuzhoufm.com/episode/66f2e15b2adfe48b832d1af0 eee gghttps://www.xiaoyuzhoufm.com/episode/66f2e15b2adfe48b832d1af0 eee gg https://www.xiaoyuzhoufm.com/episode/66f2e15b2adfe48b832d1af0';
    var str = getTextLink(texts);
    console.log(str);

}

window.addEventListener('DOMContentLoaded', () => {
    if (window.shyConfig.isDev)
        TestCode()
})

