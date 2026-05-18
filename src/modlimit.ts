import * as fs from 'fs';
import * as path from 'path';
import {GameRoom} from "./rooms/GameRoom";
import {VANILLA_CHARTS, VANILLA_SKINS} from "./vanilla";
import {Player} from "./rooms/schema/Player";

interface FinalJson {
    name: string;
    url: string;
    url_name: string;
    charts: Record<string, string>;
    skins: string[];
}

interface JsonUrl {
    name: string;
    url: string;
}

interface JsonUrlList {
    mods: JsonUrl[];
}

// 使用闭包和立即执行函数模拟 LazyLock
const modCache = (() => {
    let cache: Record<string, FinalJson> | null = null;
    return {
        get: (): Record<string, FinalJson> => {
            if (!cache) {
                cache = readModDir('./mods/dl');
            }
            return cache;
        },
        set: (newCache: Record<string, FinalJson>) => {
            cache = newCache;
        }
    };
})();

const skinCache = (() => {
    let cache: Record<string, FinalJson> | null = null;
    return {
        get: (): Record<string, FinalJson> => {
            if (!cache) {
                cache = readModDir('./mods/sk');
            }
            return cache;
        },
        set: (newCache: Record<string, FinalJson>) => {
            cache = newCache;
        }
    };
})();

let modListJson: string = '';
let skinListJson: string = '';

function readModDir(dirPath: string): Record<string, FinalJson> {
    const ret: Record<string, FinalJson> = {};

    try {
        if (!fs.existsSync(dirPath)) {
            return ret;
        }

        // 读取目录下的直接子文件和一级子目录中的文件
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // 读取子目录中的文件（深度为2）
                try {
                    const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
                    for (const subEntry of subEntries) {
                        if (subEntry.isFile() && path.extname(subEntry.name) === '.json') {
                            const filePath = path.join(fullPath, subEntry.name);
                            const json = readJson(filePath);
                            const name = path.basename(subEntry.name, '.json');
                            if (json) {
                                ret[name] = json;
                            }
                        }
                    }
                } catch (_) {
                    // 跳过无法读取的子目录
                }
            } else if (entry.isFile() && path.extname(entry.name) === '.json') {
                const json = readJson(fullPath);
                const name = path.basename(entry.name, '.json');
                if (json) {
                    ret[name] = json;
                }
            }
        }
    } catch (_) {
        // 目录不存在或无法访问时返回空对象
    }

    return ret;
}

export function reloadCache(): void {
    // 重新加载 MOD 缓存
    const modData = readModDir('./mods/dl');
    const modList: JsonUrlList = { mods: [] };

    for (const [, value] of Object.entries(modData)) {
        modList.mods.push({
            name: value.name,
            url: value.url
        });
    }

    modListJson = JSON.stringify(modList);
    modCache.set(modData);

    // 重新加载 SKIN 缓存
    const skinData = readModDir('./mods/sk');
    const skinList: JsonUrlList = { mods: [] };

    for (const [, value] of Object.entries(skinData)) {
        skinList.mods.push({
            name: value.name,
            url: value.url
        });
    }

    skinListJson = JSON.stringify(skinList);
    skinCache.set(skinData);
}

export function findModUrl(name: string | null | undefined, chart: string | null | undefined, hash: string | null | undefined): string {
    const safeName = name || '';
    const safeChart = chart || '';
    const safeHash = hash || '';

    try {
        const m = modCache.get();
        const md = m[safeName];
        if (md) {
            const h = md.charts[safeChart];
            if (h && h === safeHash) {
                return md.url;
            }
        }
    } catch (_) {
        // 出现异常时返回空字符串
    }

    return '';
}

export function findSkinUrl(name: string | null | undefined, skin: string | null | undefined): string {
    const safeName = name || '';
    const safeSkin = skin || '';

    try {
        const m = skinCache.get();
        const md = m[safeName];
        if (md && md.skins.some(s => s === safeSkin)) {
            return md.url;
        }
    } catch (_) {
        // 出现异常时返回空字符串
    }

    return '';
}

export function getModList(): string {
    if (!modListJson) {
        // 如果列表还未初始化，先加载
        reloadCache();
    }
    return modListJson;
}

export function getSkinList(): string {
    if (!skinListJson) {
        // 如果列表还未初始化，先加载
        reloadCache();
    }
    return skinListJson;
}

function readJson(filePath: string): FinalJson | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as FinalJson;
    } catch (_) {
        return null;
    }
}

function isVanillaChart(chart: string | null | undefined): boolean {
    if (!chart) {
        return false;
    }
    return VANILLA_CHARTS.includes(chart);
}

function isVanillaSkin(skin: string | null | undefined): boolean {
    if (!skin) {
        return false;
    }
    return VANILLA_SKINS.includes(skin);
}
// 0 不限制
// 1 网盘
// 2 仅原版

export function setSongLimited(room: GameRoom, message: any, level: number = 1): boolean {
    if (level > 2 || level < 0) {
        return false;
    }
    if (!message[5] && message[4]) {
        return false;
    }
    let url: string = findModUrl(message[4], message[1], message[3]);
    const isVanilla = isVanillaChart(message[1]) && !message[4];
    const noUrl = url == '';
    if (level == 1 && noUrl && !isVanilla) {
        return false;
    } else if (level == 2 && !isVanilla) {
        return false;
    }
    if (url == '') {
        url = null
    }

    room.state.folder = message[0];
    room.state.song = message[1];
    room.state.diff = message[2];
    room.chartHash = message[3];
    room.state.modDir = message[4];
    //room.state.modURL = message[5];
    room.state.modURL = url;
    room.state.diffList = message[6];
    return true;
}

export function setSkinLimited(room: GameRoom, player: Player, skin: any, level: number = 1): boolean {
    if (level > 2 || level < 0) {
        return false;
    }
    if (!skin) {
        return false;
    }
    if (!skin[0]) {
        return false;
    }
    let url = findSkinUrl(skin[3], skin[0])
    const isVanilla = isVanillaSkin(skin[0]) && !skin[3]
    const noUrl = url == '';
    if (level == 1 && noUrl && !isVanilla) {
        return false;
    } else if (level == 2 && !isVanilla) {
        return false;
    }
    if (url == '') {
        url = null
    }
    if (skin[0] == 'bf' && !player[3]) {
        room.setPlayerSkin(player, null);
        player.skinURL = null;
    } else {
        room.setPlayerSkin(player, skin);
        player.skinURL = url;
    }
    return true
}