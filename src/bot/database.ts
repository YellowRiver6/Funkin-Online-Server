import {createUserStats, getPlayerByEmail, playerNameCount, prisma} from "../network/database";
import crypto from "crypto";
import {filterUsername} from "../util";


export async function getPlayerByQQ(id: string) {
    if (!id || !process.env["DATABASE_URL"])
        return null;

    try {
        return await prisma.user.findFirstOrThrow({
            where: {
                qq: {
                    equals: id,
                    mode: "default"
                }
            }
        });
    } catch (_exc) {
        // not found
        return null;
    }
}

export async function setQQByName(name: string, qq: string) {
    if (!process.env["DATABASE_URL"]) {
        return false;
    }

    if (await getPlayerByQQ(qq))
        return false

    return !!(await prisma.user.update({
        data: {
            qq: qq
        },
        where: {
            name: name,
        }
    }));
}


export async function getUnbundledUsers() {
    if (!process.env["DATABASE_URL"]) {
        return null;
    }
    const users = await prisma.user.findMany({});
    return users.filter(user => user.qq == null);
}

export async function getUnbundleGroupMembers(qq_ids: string[]) {
    const exists = await prisma.user.findMany({
        select: {
            qq: true
        }
    });
    const existSet = new Set(exists.map((x) => x.qq));
    return qq_ids.filter((x) => !existSet.has(x));
}

export async function createUserWithQQ(name: string, email: string, qq: string) {
    if (!process.env["DATABASE_URL"]) {
        throw { error_message: "No database set on the server!" }
    }

    await verifyRegister(name, email);

    if (await getPlayerByQQ(qq)) {
        throw { error_message: "Can't set the same qq for two accounts! 该QQ号已被绑定" }
    }

    const user = (await prisma.user.create({
        data: {
            name: name,
            email: email,
            secret: crypto.randomBytes(64).toString('hex'),
            qq: qq
        },
    }));

    await createUserStats(user.id);

    return user;
}

export async function verifyRegister(name: string, email: string) {
    if (filterUsername(name) != name) {
        throw {
            error_message: "Your username contains invalid characters! 用户名包含无效字符"
        }
    }

    if (name.length < 3) {
        throw {
            error_message: "Your username is too short! (min 3 characters) 用户名至少3字符"
        }
    }

    if (name.length > 14) {
        throw {
            error_message: "Your username is too long! (max 14 characters) 用户名最多14字符"
        }
    }

    if (await playerNameCount(name) != 0)
        throw { error_message: "Player with that username already exists! 该用户名已存在" }

    if (await getPlayerByEmail(email))
        throw { error_message: "Can't set the same email for two accounts! 该邮箱已被注册" }
}