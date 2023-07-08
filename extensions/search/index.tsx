import { channel } from "../../net/channel";
import { useAISearchBox } from "./ai";
import { useSearchBox } from "./keyword";

export async function useWsSearch(options?: { ws: any, word?: string, isNav?: boolean }) {

    var r = await await channel.query('/cache/get', { key: 'search-mode' })
    if (r == 'ai') {
        await useAISearchBox({ ws: options.ws })
    }
    else {
        await useSearchBox({ ws: options.ws })
    }
}