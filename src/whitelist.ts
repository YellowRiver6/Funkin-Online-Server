import * as fs from 'fs';
import * as path from 'path';

// 全局变量存储白名单
let whitelistSet: Set<string> = new Set();

/**
 * 读取白名单文件并更新全局变量
 */
export async function loadWhitelist(): Promise<void> {
    try {
        const filePath = path.join('whitelist.txt');

        // 检查文件是否存在[7,8](@ref)
        if (!fs.existsSync(filePath)) {
            //console.warn('白名单文件不存在，将创建空文件');
            // 创建空文件[7](@ref)
            fs.writeFileSync(filePath, '');
            whitelistSet.clear();
            return;
        }

        // 读取文件内容[6,8](@ref)
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const emails = data.split('\n')
            .map(email => email.trim())
            .filter(email => email && !email.startsWith('#')); // 过滤空行和注释

        // 更新白名单集合
        whitelistSet = new Set(emails);
        console.log(`Loaded ${whitelistSet.size} email to whitelist`);

    } catch (error) {
        console.error('读取白名单文件失败:', error);
        // 发生错误时保持现有白名单不变
    }
}

/**
 * 判断邮箱是否在白名单中
 */
export function isEmailInWhitelist(email: string): boolean {
    return whitelistSet.has(email.trim().toLowerCase());
}

/**
 * 初始化白名单功能
 */
export async function initializeWhitelist(): Promise<void> {
    // 首次加载
    await loadWhitelist();

    // 每5分钟刷新一次（300000毫秒）[7](@ref)
    setInterval(async () => {
        await loadWhitelist();
    }, 1 * 60 * 1000);

    console.log('Whitelist initialized! Refresh every 5 minutes');
}

/**
 * 获取当前白名单数量（用于监控）
 */
// export function getWhitelistCount(): number {
//     return whitelistSet.size;
// }

/**
 * 手动添加邮箱到白名单（可选功能）
 */
// export async function addEmailToWhitelist(email: string): Promise<void> {
//     const trimmedEmail = email.trim().toLowerCase();
//
//     if (!whitelistSet.has(trimmedEmail)) {
//         // 添加到内存
//         whitelistSet.add(trimmedEmail);
//
//         // 追加到文件[7](@ref)
//         const filePath = path.join(__dirname, 'whitelist.txt');
//         await fs.promises.appendFile(filePath, `\n${trimmedEmail}`);
//         console.log(`邮箱 ${trimmedEmail} 已添加到白名单`);
//     }
// }