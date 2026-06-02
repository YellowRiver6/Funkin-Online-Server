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