import {BotContext} from "./command";
import {getPlayerByName, getPlayerRank, getUserStats} from "../network/database";
import {roleToCN} from "./utils";

export async function info(ctx: BotContext, args: string[]) {
    if (args.length > 2) {
        return;
    }
    let poName = ctx.poName
    if (args.length == 2) {
        poName = args[1];
    }
    const user = await getPlayerByName(poName);
    if (!user) {
        await ctx.sendGroupReply(`没有找到名称为 ${args[1]} 的玩家`);
        return;
    }
    const stats = await getUserStats(user.id);
    let fp: number;
    let acc: number;
    if (!stats) {
        fp = 0
        acc = 0
    } else {
        fp = stats.points4k + stats.points5k + stats.points6k + stats.avgAcc7k + stats.avgAcc8k + stats.avgAcc9k;
        acc = stats.avgAcc4k;
    }
    const reply = `\n玩家 ${user.name} 的资料\n` +
        `游戏名字: ${user.name}\n` +
        `区域: ${user.country || "未设置"}\n` +
        `绑定账号: ${user.qq || "未绑定"}\n` +
        `权限等级: ${roleToCN(user.role)}\n` +
        `注册时间: ${user.joined.toLocaleDateString()}\n` +
        `FP总分: ${fp}\n` +
        `精准度: ${(acc * 100).toFixed(2) + '%'}\n` +
        `排名: ${await getPlayerRank(user.name)}`;
    await ctx.sendGroupReply(reply);
}