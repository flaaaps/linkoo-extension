const port = chrome.extension.connect({
    name: 'linkoo-message-channel',
});

const API_BASE_URL = 'https://web7686.cweb03.gamingweb.de';

const loginForm = document.getElementById('login-form');
const loginInfo = document.getElementById('login-info');

const accountInfo = document.getElementById('account-info');
const logoutBtn = document.getElementById('logout-btn');

// Listening for authentication events
loginForm.addEventListener('submit', login);
logoutBtn.addEventListener('click', logout);

// get saved user & validate
chrome.storage.sync.get(['user'], async ({ user }) => {
    console.log('User value:', { user });
    if (!user) return;
    const response = await fetch(`${API_BASE_URL}/user/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.identifier }),
    });
    const { success } = await response.json();
    if (success) {
        port.postMessage({ type: 'login', user });
        loginInfo.style.display = 'none';
        accountInfo.style.display = 'block';
        setTimeout(() => (accountInfo.style.opacity = '1'), 10);

        const accountName = document.getElementById('account-info__name');
        accountName.innerHTML = user.name;
    } else {
        loginInfo.style.display = 'block';
        setTimeout(() => (loginInfo.style.opacity = '1'), 10);
    }
});

function removeUser() {
    chrome.storage.sync.set({ user: {} });
    window.location.reload();
}

function logout() {
    removeUser();
    port.postMessage({ type: 'disconnect' });
}

async function login(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const nameInput = document.getElementById('login-name-input');
    console.log(nameInput.value, 'INPUT VALUE!');
    // replace later!!! https://web7686.cweb03.gamingweb.de/login`
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: nameInput.value,
        }),
    });
    const data = await response.json();
    if (data.success) {
        chrome.storage.sync.set({ user: data.user }, null);
        window.location.reload();
    }
    return false;
}

// actually open hrefs
const clickedHref = (e) => chrome.tabs.create({ url: e.target.href });
document.querySelectorAll('a[href^="http"]').forEach((d) => d.addEventListener('click', clickedHref));

// https://www.google.com/search?q=heeyjoshi
