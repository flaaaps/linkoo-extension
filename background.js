const API_BASE_URL = 'https://web7686.cweb03.gamingweb.de';
// const API_BASE_URL = 'http://localhost:5441';
const socket = io(API_BASE_URL, { transports: ['websocket'] });

// generates a extension id
let id = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    return s4() + s4();
};

const linkooExtensionId = id();

let messagePort;
chrome.runtime.onConnect.addListener(function (port) {
    console.log('Port:', port);
    if (port.name === 'linkoo-message-channel') {
        messagePort = port;

        messagePort.onDisconnect.addListener(() => {
            console.log('Message port disconnected.');
        });
    }
    messagePort.onMessage.addListener(async function (result) {
        console.log('Result:', result);
        if (messagePort.name === 'linkoo-message-channel') {
            if (result.type === 'login') {
                console.log('Got login call!!');
                if (result.details?.name) {
                    socket.emit('login', result.details.name);
                } else {
                    chrome.storage.sync.get(['user'], (data) => {
                        if (data.user.name) socket.emit('login', data.user.name);
                    });
                }
            } else if (result.type === 'disconnect') {
                removeUser();
                socket.emit('leave');
                messagePort.postMessage({ type: 'logout' });
            } else if (result.type === 'user') {
                chrome.storage.sync.get(['user'], (data) => {
                    console.log('Got user from storage:', data.user);
                    messagePort.postMessage({ type: 'user', details: { user: data.user } });
                });
            }
        } else if (messagePort.name === 'linkoo-notifier') {
            messagePort.postMessage({ port: 'linkoo-notifier', message: { type: 'extensionId', id: linkooExtensionId } });
        }
    });
});

socket.on('login', (data) => {
    chrome.storage.sync.set({ user: data.user }, null);
    console.log('The port zu dem Zeitpunkt:', messagePort);
    messagePort.postMessage({ type: 'login', details: { user: data.user } });
    console.log(data, 'Socket login data');
});

socket.on('leave', (data) => {
    messagePort.postMessage({ type: 'logout', details: { success: data.success } });
});

function removeUser() {
    chrome.storage.sync.set({ user: {} });
    // window.location.reload();
    console.log('Removed user from storage.');
}

socket.on('message', (data) => {
    console.log('Received message:', data);
    const urlRegex = RegExp('(http|https)://[a-zA-Z0-9-.]+.[a-zA-Z]{2,3}(/S*)?');
    let url = `https://google.com/search?q=${data.content}`;
    if (!!data.content.match(urlRegex)) url = data.content;
    chrome.tabs.create({ url: url });
});
