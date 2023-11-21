import { ShyAlert } from "../../component/lib/alert";
import { useForm } from "../../component/view/form/dialoug";
import { lst } from "../../i18n/store";
import { channel } from "../../net/channel";

export async function useOpenReport(options: {
    workspaceId?: string,
    reportContent?: string,
    userid: string,
    reportElementUrl?: string,
}) {

    var r = await useForm({
        title: lst('举报'),
        maskCloseNotSave: true,
        head: false,
        remark: lst('请真实填写举报原因，我们会在尽快处理。'),
        fields: [
            {
                name: 'tags',
                type: 'select',
                text: lst('举报类型'),
                multiple: true,
                options: [
                    { text: lst('涉政有害'), value: '1' },
                    { text: lst('不友善'), value: '2' },
                    { text: lst('垃圾广告'), value: '3' },
                    { text: lst('违法违规'), value: '4' },
                    { text: lst('色情低俗'), value: '5' },
                    { text: lst('涉嫌侵权'), value: '6' },
                    { text: lst('网络暴力'), value: '7' },
                    { text: lst('涉未成年'), value: '8' },
                    { text: lst('自杀自残'), value: '9' },
                    { text: lst('不实信息'), value: '10' },
                    { text: lst('抄袭我的内容'), value: '11' },
                ]
            },
            { name: 'reason', type: 'textarea', text: lst('举报原因') },
            { name: 'screenshot', mime: 'image', type: 'file', text: lst('截图') }
        ],
        async checkModel(model) {
            if (!(Array.isArray(model.tags) && model.tags.length > 0)) {
                return lst('请选择举报类型');
            }
            if (model.reason && model.reason.length > 5) {
                return lst('举报原因不能少于5个字');
            }
        }
    })
    if (r) {
        await channel.put('/user/report', {
            report: {
                ...r,
                ...options,
            } as any
        })
        ShyAlert(lst('举报成功'));
    }
}

