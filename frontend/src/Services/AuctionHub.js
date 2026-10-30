import * as signalR from '@microsoft/signalr';

export const createAuctionHubConnection = (auctionId, handlers = {}, onStatusChange) => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/auction')
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
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
        .catch((err) => {
            console.error('Error conectando a SignalR:', err);
            if (onStatusChange) onStatusChange('disconnected');
        });

    return connection;
};