import {defineServer, defineRoom, matchMaker, WebSocketTransport} from "colyseus";

//import { monitor } from "@colyseus/monitor";
//import { playground } from "@colyseus/playground";

import { initExpress } from "./site";
import { GameRoom } from "./rooms/GameRoom";
import { NetworkRoom } from "./rooms/NetworkRoom";
import { setCooldown } from "./cooldown";
// import { BunWebSockets } from "@colyseus/bun-websockets";
//import  {uWebSocketsTransport} from "@colyseus/uwebsockets-transport";

function registerRooms() {
    const rooms = {
        room: defineRoom(GameRoom)
    };
    if (process.env["NETWORK_ENABLED"] == "true") {
        rooms["network"] = defineRoom(NetworkRoom);
    }
    return rooms;
}


export default defineServer({
    rooms: registerRooms(),
    express: async (app) => {
        await initExpress(app);
        console.log('Express initialized');
    },
    greet: false,
    async beforeListen() {
        setCooldown('command.report', 30);
        if (process.env["NETWORK_ENABLED"] == "true") {
            await matchMaker.createRoom("network", {});
        }
    },
    // transport: new BunWebSockets({
    //     options: {
    //         maxPayloadLength: 250 * 1024,
    //     }
    // }),
    transport: new WebSocketTransport({
        maxPayload: 1024 * 1024 * 250,
    })
    // transport: new uWebSocketsTransport({
    //     maxPayloadLength: 20 * 1024,
    //
    // }, {
    //     cert_file_name: process.env.NETWORK_CERT_FILE_NAME,
    //     key_file_name: process.env.NETWORK_KEY_FILE_NAME,
    // })
});