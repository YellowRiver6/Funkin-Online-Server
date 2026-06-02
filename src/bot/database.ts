import {createUserStats, prisma} from "../network/database";
import crypto from "crypto";


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
    }
    catch (_exc) {
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

export async function createUserWithQQ(name: string, email: string, qq: string) {
    if (!process.env["DATABASE_URL"]) {
        return false;
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
}