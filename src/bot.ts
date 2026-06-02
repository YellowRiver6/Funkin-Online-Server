import { NCWebsocket } from 'node-napcat-ts'
import {registerCommands, Robot} from "./bot/command";

const napcat = new NCWebsocket(
    {
        protocol: 'ws',
        host: process.env.NAPCAT_HOST,
        port: Number.parseInt(process.env.NAPCAT_PORT),
        accessToken: process.env.NAPCAT_TOKEN,
        // ↓ 自动重连(可选)
        reconnection: {
            enable: true,
            attempts: 10,
            delay: 5000,
        },
        // ↓ 是否开启 DEBUG 模式
    },
    false,
)

export function initNapCatBot() {
    const bot = new Robot(napcat);
    registerCommands(bot);
    bot.run();
    napcat.on("socket.open", async () => {
        console.log("Opening NapCatBot");
    })
    void napcat.connect();
}