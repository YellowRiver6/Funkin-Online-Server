import {BotContext} from "./command";
import {getPlayerByName} from "../network/database";
import {getPlayerByQQ, setQQByName} from "./database";
import {generateCode, sendCodeMail} from "../network/email";

class PoNameAndQQ {
    poName: string;
    qqId: string;

    constructor(poName: string, qqId: string) {
        this.poName = poName;
        this.qqId = qqId;
    }
}


const codeTimer = new Map<PoNameAndQQ, NodeJS.Timeout>();
const codeList = new Map<PoNameAndQQ, string>();

export async function bundle(ctx: BotContext, args: string[]): Promise<void> {
    if (args.length != 1) {
        await ctx.sendGroupReply("绑定命令只需要 /绑定 或 /bd 即可, 无需任何参数");
        return;
    }
    const poName = ctx.poName;
    const user = await getPlayerByName(poName);
    if (!user) {
        await ctx.sendGroupReply(`没有找到名称为 ${poName} 的PO账号`);
        return;
    }
    if (user.qq && user.qq != ctx.qqId.toString()) {
        await ctx.sendGroupReply("该PO账号已绑定, 请勿恶意尝试绑定他人账号");
        return;
    }
    const bundled = await getPlayerByQQ(String(ctx.qqId));
    if (bundled && bundled.name == poName) {
        await ctx.sendGroupReply("您已经绑定过此PO账号");
        return;
    }
    const email = user.email;
    if (!email) {
        await ctx.sendGroupReply(`PO账号 ${poName} 没有对应的邮箱号`);
        return;
    }
    const code = generateCode();
    const p = new PoNameAndQQ(poName, String(ctx.qqId))
    if (codeList.has(p)) {
        await ctx.sendGroupReply(`请勿重复操作`);
        return;
    }
    codeList.set(p, code);
    codeTimer.set(p, setInterval(()=> {
        codeList.delete(p);
    }, 1000 * 60 * 10));
    await sendCodeMail(email, code);
    await ctx.sendGroupReply(`验证码已发送至您PO账号的邮箱中`);
}

export async function bundleCode(ctx: BotContext, args: string[]): Promise<void> {
    if (args.length < 2) {
        return;
    }
    const poName = ctx.poName;
    if (!poName) {
        await ctx.sendGroupReply("您没有按照群公告规定修改群昵称");
        return;
    }
    let p: PoNameAndQQ = null;
    let c: string = null;
    codeList.forEach((value, key) => {
        if (key.poName == poName && key.qqId == ctx.qqId.toString()) {
            p = key;
            c = value;
        }
    });
    if (!p || !c) {
        await ctx.sendGroupReply("您没有发出绑定命令");
        return;
    }
    const code = args[1].toUpperCase();
    if (c == code) {
        const oldBundle = await getPlayerByQQ(String(ctx.qqId));
        let unBundleMsg = "";
        if (oldBundle && await setQQByName(oldBundle.name, null)) {
            unBundleMsg = `, 原绑定PO账号 ${oldBundle.name} 已自动解绑`
        }
        await setQQByName(poName, String(ctx.qqId));
        await ctx.sendGroupReply(`绑定成功${unBundleMsg}`);
    } else {
        await ctx.sendGroupReply("验证码错误");
    }
    codeList.delete(p);
    codeTimer.delete(p);
}

export async function bundleForce(ctx: BotContext, args: string[]): Promise<void> {
    if (args.length < 3) {
        return;
    }
    if (!Number(args[2]) || args[2].length > 10 || args[2].length < 7) {
        await ctx.sendGroupReply("QQ号无效")
        return;
    }
    const user = await getPlayerByName(args[1]);
    if (!user) {
        await ctx.sendGroupReply(`没有找到名称为 ${args[1]} 的PO账号, 可能您没有注册`);
        return;
    } else if (user.qq == args[2]) {
        await ctx.sendGroupReply(`PO账号 ${args[1]} 已经绑定QQ号 ${args[2]} 了, 请勿重复绑定`);
        return;
    }
    const oldBundle = await getPlayerByQQ(args[2]);
    let unBundleMsg = "";
    let newBundleMsg = "";
    if (oldBundle && await setQQByName(oldBundle.name, null)) {
        unBundleMsg = `, 此QQ号原绑定账号 ${oldBundle.name} 已解绑`;
    }
    if (user.qq) {
        newBundleMsg = `由QQ号 ${user.qq} 更换`;
    }
    if (await setQQByName(user.name, args[2])) {
        await ctx.sendGroupReply(`PO账号 ${user.name} ${newBundleMsg}绑定QQ号 ${args[2]} 成功${unBundleMsg}`);
    } else {
        await ctx.sendGroupReply(`绑定失败${unBundleMsg}`);
    }
}

export async function unbundleForce(ctx: BotContext, args: string[]): Promise<void> {
    if (args.length < 2) {
        return;
    }
    const user = await getPlayerByName(args[1]);
    if (!user) {
        await ctx.sendGroupReply(`没有找到名称为 ${args[1]} 的PO账号`);
        return;
    } else if (!user.qq) {
        await ctx.sendGroupReply(`PO账号 ${args[1]} 已经解绑了, 请勿重复解绑`);
        return;
    }
    if (await setQQByName(user.name, null)) {
        await ctx.sendGroupReply(`PO账号 ${args[1]} 原绑定QQ号 ${user.qq} 已解绑`)
    }
}