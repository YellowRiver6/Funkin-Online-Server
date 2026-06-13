const whitelistEmails = new Map<string, string>();
const whitelistNames = new Map<string, string>();

export function addWhitelist(name: string, email: string, qq: string): void {
    whitelistEmails.set(email, qq);
    whitelistNames.set(name, qq);
}

export function clearWhitelist(): void {
    whitelistNames.clear();
    whitelistEmails.clear();
}

export function verifyRegisterWithQQ(name: string, email: string): string {
    const idByName = whitelistNames.get(name);

    const idByEmail = whitelistEmails.get(email);

    if (!idByName) {
        throw { error_message: 'Name is not in the whitelist! 您没有按照群公告要求修改群昵称, 改好后重新申请白名单' };
    }

    if (!idByEmail) {
        throw { error_message: 'Email is not in the whitelist! 邮箱不在白名单中' };
    }

    if (idByName != idByEmail) {
        throw { error_message: "Invalid whitelist! 白名单校验失败"}
    }

    return idByName;
}

setInterval(() => clearWhitelist(), 1000 * 60 * 10);