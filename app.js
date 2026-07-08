const DISCORD_INVITE = "https://discord.gg/bqQb2swExK";

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initCalculator();
    const discordButton = document.getElementById('join-discord');
    if (discordButton) {
        discordButton.addEventListener('click', joinDiscord);
    }
});

function joinDiscord() {
    const popup = window.open(DISCORD_INVITE, '_blank');
    if (!popup) {
        window.location.href = DISCORD_INVITE;
    }
}

function initTabs() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    navLinks.forEach(link => link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetTab = link.dataset.tab;
        navLinks.forEach(item => item.classList.toggle('active', item === link));
        tabContents.forEach(content => content.classList.toggle('active', content.id === targetTab));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
}

function switchTab(tabId) {
    const link = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    if (link) link.click();
}

function initCalculator() {
    const timeBtns = document.querySelectorAll('#time-options .opt-btn');
    const consBtns = document.querySelectorAll('#cons-options .opt-btn');
    const vipToggle = document.getElementById('vip-toggle');
    const priceDisplay = document.getElementById('total-price');
    let selectedTimePrice = 5;
    let selectedCons = 1;
    let isVip = false;
    timeBtns.forEach(btn => btn.addEventListener('click', () => {
        timeBtns.forEach(item => item.classList.remove('active'));
        btn.classList.add('active');
        selectedTimePrice = parseInt(btn.dataset.price, 10);
        updatePrice();
    }));
    consBtns.forEach(btn => btn.addEventListener('click', () => {
        consBtns.forEach(item => item.classList.remove('active'));
        btn.classList.add('active');
        selectedCons = parseInt(btn.dataset.val, 10);
        updatePrice();
    }));
    if (vipToggle) {
        vipToggle.addEventListener('change', () => {
            isVip = vipToggle.checked;
            updatePrice();
        });
    }
    function updatePrice() {
        const totalPrice = selectedTimePrice + selectedCons * 5 + (isVip ? 5 : 0);
        animateValue(priceDisplay, parseInt(priceDisplay.innerText, 10), totalPrice, 300);
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}
