import {BotContext} from "./command";
import {countPlayers} from "../site";

export async function status(ctx: BotContext, _args: string[]) {
    const mem = process.memoryUsage();
    const online = (await countPlayers())[2];
    await ctx.sendGroupReply("内存占用:" + mem.rss / 1024 / 1024 + "MB" + "\n" + "在线人数: " + online);
}