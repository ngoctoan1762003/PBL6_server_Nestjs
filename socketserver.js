const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const clients = {}; // Object to store WebSocket connections by client ID

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'clientId') {
            const clientId = parsedMessage.clientId;

            // Initialize the list of WebSockets for this client if it doesn't exist
            if (!clients[clientId]) {
                clients[clientId] = [];
            }

            // Add the new WebSocket connection to the list for the given client ID
            clients[clientId].push(ws);
            console.log(`Client ${clientId} connected`);

        } else if (parsedMessage.type === 'privateMessage') {
            const recipient_id = parsedMessage.receiver_id;
            const sender_id = parsedMessage.sender_id;
            const recipientWebSockets = clients[recipient_id];

            // Send the message to all WebSocket connections for the recipient client ID
            if (recipientWebSockets && recipientWebSockets.length > 0) {
                recipientWebSockets.forEach((recipientWs) => {
                    if (recipientWs.readyState === WebSocket.OPEN) {
                        recipientWs.send(JSON.stringify(parsedMessage));
                    }
                });
                console.log(`Private message from ${sender_id} to ${recipient_id}`);
            } else {
                console.log(`Recipient ${recipient_id} is not connected.`);
            }

        } else if (parsedMessage.type === 'notification') {
            const recipient_id = parsedMessage.receiver_id;
            const sender_id = parsedMessage.sender_id;
            const recipientWebSockets = clients[recipient_id];

            // Send the notification to all WebSocket connections for the recipient client ID
            if (recipientWebSockets && recipientWebSockets.length > 0) {
                recipientWebSockets.forEach((recipientWs) => {
                    if (recipientWs.readyState === WebSocket.OPEN) {
                        recipientWs.send(JSON.stringify(parsedMessage));
                    }
                });
                console.log(`Notification sent to ${recipient_id}`);
            } else {
                console.log(`Recipient with ID ${recipient_id} is not available.`);
            }
        }
    });

    ws.on('close', () => {
        // Clean up the list of WebSocket connections for the client ID
        Object.keys(clients).forEach((clientId) => {
            // Remove the WebSocket from the client's list
            clients[clientId] = clients[clientId].filter((clientWs) => clientWs !== ws);
            // If the list is empty after removing, delete the client ID from the clients object
            if (clients[clientId].length === 0) {
                delete clients[clientId];
                console.log(`All connections for client ${clientId} are closed and removed.`);
            }
        });
    });
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Serve the static files (for frontend, e.g., Vue.js, React.js)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(5000, () => {
    console.log('WebSocket server listening on port 5000');
});
