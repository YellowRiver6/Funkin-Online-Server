import {BotContext} from "./command";

const helpText = "\n===命令帮助列表===\n" +
    "==玩家命令==\n" +
    "/绑定 (或/bd)\n" +
    "发出绑定当前QQ请求\n\n" +
    "/绑定验证 <验证码>\n" +
    "(或/bdc)\n" +
    "输入验证码完成绑定验证, 若您的PO账号之前绑定过则自动换绑\n\n" +
    "/个人信息 [游戏名字]\n" +
    "(或/info)" +
    "查看玩家信息, 不输入名字查看则自己\n\n" +
    "/帮助 (或/help)\n" +
    "显示这个命令帮助信息\n\n" +
    "==管理员命令==\n" +
    "/添加白名单 <邮箱号>\n" +
    "(或/wh)\n" +
    "添加一个邮箱到白名单\n\n" +
    "/强制绑定 <游戏名> <QQ号>\n" +
    "(或/bdf)\n" +
    "强制给PO账号绑定QQ号, 命令指定的QQ号若已经绑定其他PO账号则会解绑\n\n" +
    "/强制解绑 <游戏名>\n" +
    "(或/ubdf)\n" +
    "强制给PO账号解绑\n\n" +
    "/注册 <游戏名字> <邮箱号> <QQ号>\n" +
    "或(/reg)\n" +
    "不发送验证码直接完成注册并绑定QQ\n\n" +
    "/注销 <游戏名或QQ号或邮箱>\n" +
    "(或/dreg)\n" +
    "注销账户, 按游戏名, QQ号, 邮箱号的匹配顺序依次查找PO账号, 找到即注销\n\n" +
    "服务器管理与群聊管理不完全相同\n" +
    "=============="

// console.log(help);

export async function help(ctx: BotContext, _args: string[]) {
    await ctx.sendGroupReply(helpText);
}