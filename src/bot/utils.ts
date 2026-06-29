export function extraPoName(name: string): string | null {
    const first = name.indexOf('[');
    const last = name.indexOf(']');
    if (first === -1 || last === -1) {
        return null;
    }
    return name.slice(first + 1, last);
}

export function roleToCN(role: string | null):string {
    if (!role) return "成员 (Member)";
    switch (role.toLowerCase()) {
        case "admin":
            return "管理员 (Admin)";
        case "moderator":
            return "监管员 (Moderator)";
        case "helper":
            return "协管员 (Helper)";
        case "member":
            return "成员 (Member)";
        case "banned":
            return "封禁 (Banned)";
        default: return "成员 (Member)";
    }
}


export function comparePermission(now: string, need: string): boolean {
    if (need === "Unknown") return true;
    if (now === need) return true;
    if (now === "Admin") return true;
    if (now === "Moderator" && (need === "Helper" || need === "Member")) return true;
    if (now === "Moderator" && (need === "Helper" || need === "Member")) return true;
    if (now === "Helper" && need === "Member") return true;
    if (now === "Member" && need === "Banned") return true;
    if (now === "Banned") return false;
    return false;
}

// 生成随机毫秒数
function getRandomMs(min: number = 2000, max: number = 5000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 随机休眠
export async function sleepRandom(min?: number, max?: number): Promise<void> {
    const ms = getRandomMs(min, max);
    return new Promise(resolve => setTimeout(resolve, ms));
}
