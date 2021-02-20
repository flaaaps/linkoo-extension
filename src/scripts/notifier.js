console.log('Content script!');
const port = chrome.extension.connect({
    name: 'linkoo-notifier',
});

port.postMessage('id');
port.onMessage.addListener((data) => {
    console.log('Port message:', data);
    if (data.message.type === 'extensionId') {
        var customEvent = new CustomEvent('extension-event', { detail: { linkooExtensionId: data.message.id } });
        document.dispatchEvent(customEvent);
    }
});
