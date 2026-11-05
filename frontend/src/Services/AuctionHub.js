import * as signalR from '@microsoft/signalr';

export const createAuctionHubConnection = (auctionId, handlers = {}, onStatusChange, userId = null) => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/auction')
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.None)
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

    if (handlers.onOutbid) {
        connection.on('OutbidNotification', handlers.onOutbid);
    }

    if (handlers.onWalletBalanceChanged) {
        connection.on('WalletBalanceChanged', handlers.onWalletBalanceChanged);
    }

    const joinGroups = async () => {
        await connection.invoke('JoinAuctionGroup', String(auctionId));
        if (userId !== null && userId !== undefined) {
            await connection.invoke('JoinUserGroup', String(userId));
        }
    };

    connection.onreconnecting(() => {
        if (onStatusChange) onStatusChange('reconnecting');
    });

    connection.onreconnected(() => {
        if (onStatusChange) onStatusChange('connected');
        joinGroups().catch(() => {});
    });

    connection.onclose(() => {
        if (onStatusChange) onStatusChange('disconnected');
    });

    connection
        .start()
        .then(async () => {
            if (onStatusChange) onStatusChange('connected');
            await joinGroups();
        })
        .catch(() => {
            if (onStatusChange) onStatusChange('disconnected');
        });

    return connection;
};
