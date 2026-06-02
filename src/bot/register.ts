import {BotContext} from "./command";
import {deleteUser, getPlayerByEmail, getPlayerByName, playerNameCount, validateEmail} from "../network/database";
import {addEmailToWhitelist} from "../whitelist";
import {filterUsername} from "../util";
import {createUserWithQQ, getPlayerByQQ} from "./database";


export async function whiteListAdd(ctx: BotContext, args: string[]): Promise<void> {
    if (args.length != 2) {
        return;
    }
    if (!args[1].includes('@') || !validateEmail(args[1])) {
         await ctx.sendGroupReply( `邮箱无效`);
         return;
    }
    await addEmailToWhitelist(args[1]);
    await ctx.sendGroupReply( `成功将邮箱 ${args[1]} 加入白名单`);
}

// /reg <游戏名> <邮箱号> <qq号>
export async function register(ctx: BotContext, args: string[]): Promise<void> {
    if (args.length != 4) {
        return;
    }
    if (!args[2].includes('@') || !validateEmail(args[2])) {
        await ctx.sendGroupReply(`邮箱无效`);
        return;
    }
    if (filterUsername(args[1]) != args[1] || !((/^[ -~]*$/.test(args[1]) && /^[A-Za-z0-9 _-]*$/.test(args[1])))) {
        await ctx.sendGroupReply(`游戏名字含有无效字符`);
        return;
    }
    if (args[1].length < 3 || args[1].length > 14) {
        await ctx.sendGroupReply(`游戏名字应在3到14个字符之间`);
        return;
    }
    if (await playerNameCount(args[1]) != 0) {
        await ctx.sendGroupReply(`游戏名${args[1]}已被注册`);
        return;
    }
    if (await getPlayerByEmail(args[2])) {
        await ctx.sendGroupReply(`邮箱已被注册`);
        return;
    }
    if (! /^\d{5,10}$/.test(args[3])) {
        await ctx.sendGroupReply(`QQ号无效`);
        return;
    }
    if (await getPlayerByQQ(args[3])) {
        await ctx.sendGroupReply(`该QQ号已被绑定`);
        return;
    }
    await createUserWithQQ(args[1], args[2], args[3]);
    await ctx.sendGroupReply("注册成功");
}

export async function deregister(ctx: BotContext, args: string[]): Promise<void> {
    if (args.length != 2) {
        return;
    }
    const userByName = await getPlayerByName(args[1]);
    if (userByName) {
        await deleteUser(userByName.id);
        await ctx.sendGroupReply(`PO账号 ${args[1]} 已注销`);
        return;
    }
    if (/^\d{5,10}$/.test(args[1])) {
        const userByQQ = await getPlayerByQQ(args[1]);
        if (userByQQ) {
            await deleteUser(userByQQ.id);
            await ctx.sendGroupReply(`QQ号 ${args[1]} 所绑定的PO账号 ${userByQQ.name} 已注销`);
            return;
        }
    }
    if (args[1].includes('@') && validateEmail(args[1])) {
        const userByEmail = await getPlayerByEmail(args[1]);
        if (userByEmail) {
            await deleteUser(userByEmail.id);
            await ctx.sendGroupReply(`邮箱号 ${args[1]} 所绑定的PO账号 ${userByEmail.name} 已注销`);
            return;
        }
    }
    await ctx.sendGroupReply(`没有找到 ${args[1]} 相关的PO账号`);
}