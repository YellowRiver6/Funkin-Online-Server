import {GroupDecreaseKick, GroupDecreaseLeave, GroupMessage, NCWebsocket, Structs} from "node-napcat-ts";
import parseArgsStringToArgv from "string-argv";
import {getPlayerByQQ} from "./database";
import {
    bundleCode,
    bundle,
    bundleForce,
    unbundleForce,
    listUnbundlePoAccount,
    listUnbundleMember,
    kickingFlag, kickUnbundleMember
} from "./bundle";
import {comparePermission, extraPoName} from "./utils";
import {deleteUser, getPlayerByName} from "../network/database";
import {deregister, register, whiteListAdd, whiteListClear} from "./register";
import {status} from "./status";
import {info} from "./info";

export class BotContext {
    bot: NCWebsocket = null;
    groupId: number;
    messageId: number;
    qqId: number;
    qqCard: string;
    // qqName: string;
    poName: string | null;
    poRole: string | null;
    // poEmail: string;

    async sendGroupReply(msg: string): Promise<void> {
        await this.bot.send_group_msg({
            // group_id: this.groupId,
            group_id: groupAdminId,
            // message: [Structs.reply(this.messageId), Structs.at(this.qqId), Structs.text(" " + msg)]
            message: [Structs.text(msg)]
        })
    }

    async kickMembers(ids: number[]): Promise<void> {
        await this.bot.set_group_kick_members({
            group_id: groupId.toString(),
            user_id: ids
        })
    }

    async getMembers() {
        return this.bot.get_group_member_list({
            group_id: groupId,
            no_cache: true
        })
    }
}

const groupId = Number.parseInt(process.env.QQ_GROUP_ID);
const groupAdminId = Number.parseInt(process.env.QQ_GROUP_ADMIN_ID);

export function registerCommands(bot: Robot) {
    bot.command("bd", "绑定", "Unknown", bundle);
    bot.command("bdc", "绑定验证", "Unknown", bundleCode);
    bot.command("info", "个人信息", "Admin", info);
    // bot.command("help", "帮助", "Member", help);
    bot.command("status", "服务器状态", "Admin", status)
    bot.command("bdf", "强制绑定", "Admin", bundleForce);
    bot.command("ubdf", "强制解绑", "Admin", unbundleForce);
    bot.command("whr", "申请白名单", "Unknown", whiteListAdd);
    bot.command("whc", "清空白名单", "Admin", whiteListClear);
    bot.command("reg", "注册", "Admin", register);
    bot.command("dreg", "注销", "Admin", deregister);
    bot.command("ubda", "未绑定账号", "Admin", listUnbundlePoAccount)
    bot.command("ubdm", "未绑定群成员", "Admin", listUnbundleMember)
    bot.command("ubdmk", "踢出未绑定群成员", "Admin", kickUnbundleMember)
}

type CommandHandle = (ctx: BotContext, args: string[]) => Promise<void | boolean>;
class Command {
    name: string;
    permission: string;
    handle: CommandHandle;

    constructor(name: string, permission: string, handle:  CommandHandle) {
        this.name = name;
        this.permission = permission;
        this.handle = handle;
    }
}
export class Robot {
    bot: NCWebsocket;
    commands: Map<string, Command>;

    constructor(bot: NCWebsocket) {
        this.bot = bot;
        this.commands = new Map();
    }

    makeContext(message: GroupMessage): BotContext {
        const ctx = new BotContext();
        ctx.bot = this.bot;
        ctx.groupId = message.group_id;
        ctx.messageId = message.message_id;
        ctx.qqId = message.sender.user_id;
        ctx.qqCard = message.sender.card;
        ctx.poName = extraPoName(message.sender.card);
        return ctx;
    }

    run() {
        this.bot.on("message.group", async (msg: GroupMessage) => {
            // 不是指定的群聊直接返回
            if (msg.group_id != groupId && msg.group_id != groupAdminId) {
                return;
            }
            let text = msg.raw_message;
            // 命令必须以斜杠开头
            if (!text.startsWith('/')) {
                return;
            } else {
                text = text.substring(1, text.length);
            }
            // 构建命令上下文
            const ctx = this.makeContext(msg)
            // 从群昵称中分离出PO游戏名字
            const poName = extraPoName(msg.sender.card);
            if (!poName) {
                // await ctx.sendGroupReply("您没有按照群公告规定修改群昵称, 无法使用命令")
                return;
            }
            // 解析命令参数
            const args = parseArgsStringToArgv(text);
            // 按照QQ号查找绑定对应的账号
            const poUser = await getPlayerByQQ(String(ctx.qqId));
            // 按照群昵称提取出的游戏名查找账号
            const poUserByName = await getPlayerByName(poName);

            if (!poUserByName && poUser) {
                // await ctx.sendGroupReply("您群昵称标记的游戏名对应的PO账号不存在, 请检查群昵称是否设置正确");
                return;
            } else if (poUserByName && poUser && poUserByName.qq != ctx.qqId.toString()) {
                // await ctx.sendGroupReply("您群昵称标记的PO游戏名与绑定PO账号不一致, 请勿恶意使用他人游戏名");
                return;
            } else if (poUser) {
                ctx.poRole = poUser.role || "Member";
                ctx.poName = poUser.name;
            } else {
                ctx.poRole = "Unknown";
                ctx.poName = poName;
            }

            // 开始匹配命令
            const command: Command = this.commands.get(args[0]);
            if (!command) {
                return;
            }
            const permissionIsOk = comparePermission(ctx.poRole, command.permission);
            if (!permissionIsOk && args[0] != "whr") {
                if (ctx.poRole === "Unknown") {
                    if (!poUser && !poUserByName) {
                        // await ctx.sendGroupReply("您未注册PO账号, 无法使用命令");
                        return;
                    } else if (poUserByName && !poUser) {
                        // await ctx.sendGroupReply("您未绑定PO账号, 无法使用命令");
                        return;
                    }
                } else if (ctx.poRole === "Banned") {
                    // await ctx.sendGroupReply("您的PO账号已被封禁, 无法使用命令");
                    return;
                } else {
                    // await ctx.sendGroupReply(`您的权限不足, 该命令需要${command.permission}权限`)
                    return;
                }
            }
            // 执行命令
            await command.handle(ctx, args);
        });

        this.bot.on("notice.group_decrease.leave", async (msg: GroupDecreaseLeave) => {
            if (msg.group_id != groupId) {
                return;
            }
            const user = await getPlayerByQQ(String(msg.user_id));
            if (user) {
                await deleteUser(user.id);
                await this.bot.send_group_msg({
                    group_id: groupAdminId,
                    message: [Structs.text(`群成员"${msg.user_id}"退群, 已注销其PO账号 ${user.name}`)]
                })
            } else {
                await this.bot.send_group_msg({
                    group_id: groupAdminId,
                    message: [Structs.text(`群成员"${msg.user_id}"退群, 其未注册PO账号`)]
                })
            }

        });
        this.bot.on("notice.group_decrease.kick", async (msg: GroupDecreaseKick) => {
            if (msg.group_id != groupId || kickingFlag) {
                return;
            }
            const user = await getPlayerByQQ(String(msg.user_id));
            if (user) {
                await deleteUser(user.id);
                await this.bot.send_group_msg({
                    group_id: groupAdminId,
                    message: [Structs.text(`群成员"${msg.user_id}"被踢出群聊, 已注销其PO账号 ${user.name}`)]
                })
            } else {
                await this.bot.send_group_msg({
                    group_id: groupAdminId,
                    message: [Structs.text(`群成员"${msg.user_id}"被踢出群聊, 其未注册PO账号`)]
                })
            }

        });
    }

    command(name: string, nameCN: string, permission: "Admin" | "Moderator" | "Helper" | "Member" | "Banned" | "Unknown", handle: CommandHandle) {
        this.commands.set(name, new Command(name, permission, handle));
        this.commands.set(nameCN, new Command(nameCN, permission, handle));
    }
}