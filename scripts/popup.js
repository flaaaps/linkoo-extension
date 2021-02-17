var background = chrome.extension.getBackgroundPage();
const loginForm = document.getElementById('login-form');
const loginInfo = document.getElementById('login-info');

const accountInfo = document.getElementById('account-info');
const logoutBtn = document.getElementById('logout-btn');

const port = chrome.runtime.connect({
    name: 'linkoo-message-channel',
});

// Listening for authentication events
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('login-name-input');
    port.postMessage({ type: 'login', details: { name: nameInput.value } });
});
logoutBtn.addEventListener('click', () => {
    port.postMessage({ type: 'disconnect' });
});

port.onMessage.addListener(function (data) {
    console.log('Popup port result!:', data);
    if (data.type === 'login') {
        console.log('New login!');
        showUserDetails(data);
    } else if (data.type === 'logout') {
        showLoginDetails();
        chrome.storage.sync.set({ loggedIn: false }, null);
    } else if (data.type === 'user') {
        console.log('User data received.');
        console.log('Received user data:', data);
        if (!data.details.user.name) {
            showLoginDetails();
        } else {
            showUserDetails(data);
            console.log('Showed user info');
            chrome.storage.sync.get(['loggedIn'], (data) => {
                console.log("Let's see if you are logged in:", data);
                if (!data.loggedIn) {
                    chrome.storage.sync.set({ loggedIn: true }, null);
                    port.postMessage({ type: 'login', details: { name: data.details.user.name } });
                }
            });
        }
    }
});

function showUserDetails(data) {
    loginInfo.style.display = 'none';
    accountInfo.style.display = 'block';
    setTimeout(() => (accountInfo.style.opacity = '1'), 10);

    const accountName = document.getElementById('account-info__name');
    accountName.innerHTML = data.details.user.name;
}

function showLoginDetails() {
    loginInfo.style.display = 'block';
    accountInfo.style.display = 'none';
    setTimeout(() => (loginInfo.style.opacity = '1'), 10);
}

port.postMessage({ type: 'login' });
port.postMessage({ type: 'user' });

addEventListener(
    'unload',
    function (event) {
        background.console.log(event.type);
        port.disconnect();
    },
    true
);

// get saved user & validate

// actually open hrefs
const clickedHref = (e) => chrome.tabs.create({ url: e.target.href });
document.querySelectorAll('a[href^="http"]').forEach((d) => d.addEventListener('click', clickedHref));

// https://www.google.com/search?q=heeyjoshi
