import * as signalR from '@microsoft/signalr';

const HUB_URL = 'https://localhost:7073/hubs/auction';

export const createAuctionHubConnection = (auctionId, handlers = {}, onStatusChange) => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
            withCredentials: true
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.None) // Evita saturar la consola si el backend está apagado
        .build();

    if (handlers.onNewBid) {
        connection.on('ReceiveNewBid', handlers.onNewBid);
    }

    if (handlers.onTimeExtended) {
        connection.on('AuctionTimeExtended', handlers.onTimeExtended);
    }

    if (handlers.onAuctionClosed) {
        connection.on('AuctionClosed', handlers.onAuctionClosed);
    }

    connection.onreconnecting(() => {
        if (onStatusChange) onStatusChange('reconnecting');
    });

    connection.onreconnected(() => {
        if (onStatusChange) onStatusChange('connected');
        connection.invoke('JoinAuctionGroup', String(auctionId)).catch(() => {});
    });

    connection.onclose(() => {
        if (onStatusChange) onStatusChange('disconnected');
    });

    connection
        .start()
        .then(async () => {
            if (onStatusChange) onStatusChange('connected');
            await connection.invoke('JoinAuctionGroup', String(auctionId));
        })
        .catch(() => {
            if (onStatusChange) onStatusChange('disconnected');
        });

    return connection;
};
