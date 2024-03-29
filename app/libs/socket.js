const { Server } = require("socket.io");
const {
    sendReleaseProductPushNotification,
    sendNegotiationPushNotification
} = require("../libs/fcm");

let io;
let connectedUsers = [];

module.exports = {
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST", "PUT", "DELETE"],
            },
        });

        io.on("connect", async (socket) => {
            console.log(`A user connected with id: ${socket.id}`)
            socket.on("start", (args) => {
                if (args.userId) {
                    const users = connectedUsers.filter((user) => 
                        user.userId == args.userId 
                        && user.socketId == socket.id
                    )
                    if (users.length == 0) {
                        connectedUsers.push({
                            userId: args.userId,
                            socketId: socket.id
                        })
                    }
                }
            })

            socket.on("disconnect", (reason) => {
                connectedUsers = connectedUsers.filter(
                  (user) => user.socketId !== socket.id
                )
            })

            socket.on("fcm", (args) => {
                if(!args.userId || !args.fcmToken) { return; }
                const userIdx = connectedUsers.findIndex(
                    (user) => user.userId == args.userId
                )
                if(userIdx < 0) return
                connectedUsers[userIdx].fcmToken = args.fcmToken
            })
        })
        
        return io;
        
    },
    getIO: () => {
        if (!io) {
          throw new Error("Socket Not Initialized");
        }
        return io;
    },
    sendReleaseProductNotification: (userId, productId) => {
        if (!io) {
            throw new Error("Socket Not Initialized");
        }
        const selectedUsers = connectedUsers.filter(
            (user) => user.userId == userId
        )

        if (selectedUsers.length > 0) {
            selectedUsers.forEach((user) => {
                io.to(user.socketId).emit("notification", [
                  "Ada notifikasi baru!",
                  "Berhasil diterbitkan"
                ]);
                if (user.fcmToken) {
                    sendReleaseProductPushNotification(user.fcmToken, productId);
                }
            });
        }
    },

    sendNegotiationNotification: (userId, negotiationId, status) => {
        if (!io) {
            throw new Error("Socket Not Initialized");
        }
        console.log("Trying to send notification to user : ", userId)
        const selectedUsers = connectedUsers.filter(
            (user) => user.userId == userId
        )
        if (selectedUsers.length > 0) {
            selectedUsers.forEach((user) => {
                io.to(user.socketId).emit("notification", [
                  "Ada notifikasi baru!",
                  "Penawaran Produk"
                ]);
                if (user.fcmToken) {
                    sendNegotiationPushNotification(user.fcmToken, negotiationId, status);
                }
            });
        }
    }
}