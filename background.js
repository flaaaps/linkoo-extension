const API_BASE_URL = 'https://web7686.cweb03.gamingweb.de';
const socket = io(API_BASE_URL, { transports: ['websocket'] });

chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (result) {
        console.log('Port:', port);
        console.log('Result:', result);
        if (result.type === 'login') {
            socket.emit('login', result.user.identifier);
        } else if (result.type === 'disconnect') {
            socket.emit('leave');
        }
    });
});

socket.on('login', (data) => {
    chrome.storage.sync.set({ user: data.user }, null);
    console.log(data, 'Socket login data');
});

socket.on('message', (data) => {
    console.log('Received message:', data);
    const urlRegex = RegExp('(http|https)://[a-zA-Z0-9-.]+.[a-zA-Z]{2,3}(/S*)?');
    let url = `https://google.com/search?q=${data.content}`;
    if (!!data.content.match(urlRegex)) url = data.content;
    chrome.tabs.create({ url: url });
});
