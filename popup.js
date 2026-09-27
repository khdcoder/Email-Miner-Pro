/**
 * ========================================================================
 * PROJECT: EMAIL MINER PRO - DEMO VERSION
 * ========================================================================
 * AUTHOR: khdcoder (Khalid)
 * ORGANIZATION: Khalid Software House
 * ROLE: Founder & Lead Developer
 * FILE:(Core Frontend Engine)
 * TECH STACK: Node.js, Express.js, Html, Css, Js
 * VERSION: 15.200.5
 * COPYRIGHT NOTICE:
 * (c) 2026 Khalid Software House. All Rights Reserved.
 * ========================================================================
 */

const STORAGE_KEY = 'leadsync_data_v2';
const SETTINGS_KEY = 'leadsync_settings_v2';
const LICENSE_KEY = 'license_data_v1';
const DARK_MODE_KEY = 'dark_mode_enabled';
const LICENSE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTri6C8R0VDia7aQ1rFqCgquWlHOwvOXRm_z9FigRpofHkaDiC6D9Y518j0HEX8WcclJG6vZo7237Sh/pub?output=csv';

const PRE_BUILT_TEMPLATES = {
    cold_outreach: { subject: "Quick Introduction — [Name]", body: "Hi [Name],<br><br>I came across your profile and was really impressed by your work. I'd love to connect and explore how we might be able to work together.<br><br>Would you be open to a brief chat this week?<br><br>Best regards" },
    service_pitch: { subject: "A Solution for [Name]'s Business", body: "Hi [Name],<br><br>I noticed your business and thought you might benefit from our services. We help companies like yours streamline operations and boost growth.<br><br>Would you like me to send over a quick proposal?<br><br>Looking forward to hearing from you.<br><br>Best regards" },
    collaboration: { subject: "Partnership Opportunity — [Name]", body: "Hi [Name],<br><br>I've been following your work and believe there's a great opportunity for collaboration between our teams.<br><br>I have a few ideas that could be mutually beneficial. Would you be interested in discussing further?<br><br>Warm regards" },
    follow_up: { subject: "Following Up — [Name]", body: "Hi [Name],<br><br>I wanted to follow up on my previous email. I understand you're busy, but I'd really love to connect if you have a few minutes.<br><br>Let me know if there's a better time to reach out.<br><br>Best regards" },
    product_demo: { subject: "See How It Works — [Name]", body: "Hi [Name],<br><br>I'd like to show you something that could save your team hours every week. Our tool automates repetitive tasks and has helped businesses like yours achieve real results.<br><br>Can I schedule a quick 10-minute demo for you?<br><br>Best regards" },
    seo_services: { subject: "Your Website's SEO Report — [Name]", body: "Hi [Name],<br><br>I ran a quick SEO audit on your website and found some significant opportunities for improvement.<br><br>Here's what stood out:<br>• Several high-intent keywords your competitors are ranking for that you're missing<br>• On-page issues affecting your crawlability and indexation<br>• Backlink gaps that could boost your domain authority<br><br>We've helped similar businesses increase their organic traffic by 150-300% within 3-6 months.<br><br>Would you like me to send the full audit report? No strings attached.<br><br>Best regards"},    
    digital_marketing: { subject: "Scaling [Name]'s Business Online", body: "Hi [Name],<br><br>I've been analyzing your online presence and I see real potential to scale your revenue through digital marketing.<br><br>Here's a snapshot of what we could do:<br>• <b>Google Ads:</b> Capture high-intent buyers<br>• <b>Social Media:</b> Build a loyal audience<br>• <b>Retargeting:</b> Recover lost visitors<br>• <b>Analytics:</b> Data-driven decisions<br><br>Our clients typically see a 3-5x return on ad spend within 90 days.<br><br>Can I share a custom strategy blueprint tailored to your business?<br><br>Best regards" }
};

const STATUS_PIPELINE = ['new', 'contacted', 'replied', 'skip'];
const STATUS_LABELS = { new: 'New', contacted: 'Cntd', replied: 'Rpld', skip: 'Skip' };
const STATUS_CLASSES = { new: 'status-new', contacted: 'status-contacted', replied: 'status-replied', skip: 'status-skip' };

let allData = [];
let selectedIds = new Set();
let currentSearchQuery = '';

const extractBtn = document.getElementById('extractBtn');
const exportBtn = document.getElementById('exportBtn');
const exportMenu = document.getElementById('exportMenu');
const clearBtn = document.getElementById('clearBtn');
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const countSpan = document.getElementById('count');
const leadsTodaySpan = document.getElementById('leadsToday');
const toastEl = document.getElementById('toast');
const autoToggle = document.getElementById('autoToggle');
const autoNextToggle = document.getElementById('autoNextToggle');
const deepToggle = document.getElementById('deepToggle');
const headerStatusDot = document.getElementById('headerStatusDot');
const headerStatusText = document.getElementById('headerStatusText');
const modeBadge = document.getElementById('modeBadge');
const searchInput = document.getElementById('searchInput');
const selectAllCb = document.getElementById('selectAll');
const bulkBar = document.getElementById('bulkBar');
const selectedCountSpan = document.getElementById('selectedCount');
const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
const bulkExportBtn = document.getElementById('bulkExportBtn');
const bulkStatusBtn = document.getElementById('bulkStatusBtn');
const bulkStatusMenu = document.getElementById('bulkStatusMenu');

const settingsBtn = document.getElementById('settingsBtn');
const settingsView = document.getElementById('settingsView');
const closeSettingsBtn = document.getElementById('closeSettings');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const blacklistInput = document.getElementById('blacklistInput');
const disposableSelect = document.getElementById('disposableSelect');
const webhookUrlInput = document.getElementById('webhookUrl');
const notifToggle = document.getElementById('notifToggle');
const templateSubject = document.getElementById('templateSubject');
const templateBody = document.getElementById('templateBody');
const btnBold = document.getElementById('btnBold');
const btnItalic = document.getElementById('btnItalic');
const prebuiltTemplate = document.getElementById('prebuiltTemplate');
const templatePreview = document.getElementById('templatePreview');
const bulkMailBtn = document.getElementById('bulkMailBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');
const importZone = document.getElementById('importZone');
const csvFileInput = document.getElementById('csvFileInput');

const licenseModal = document.getElementById('licenseModal');
const licenseInput = document.getElementById('licenseInput');
const activateLicenseBtn = document.getElementById('activateLicenseBtn');
const licenseError = document.getElementById('licenseError');
const startTrialBtn = document.getElementById('startTrialBtn');
const licenseDesc = document.getElementById('licenseDesc');

let appSettings = {
    blacklist: '', disposableMode: 'strict', webhookUrl: '', notifications: true,
    templateSubject: 'Hi [Name],',
    templateBody: 'Hi [Name],<br><br>I noticed your website and wanted to reach out...<br><br>Best regards.',
    selectedTemplate: 'custom'
};

document.addEventListener('DOMContentLoaded', () => { setupAllListeners(); initializeApp(); });

async function initializeApp() {
    const storageData = await chrome.storage.local.get([LICENSE_KEY, 'trial_consumed', STORAGE_KEY, SETTINGS_KEY, DARK_MODE_KEY]);
    const licenseData = storageData[LICENSE_KEY];
    const trialConsumed = storageData['trial_consumed'];
    const now = new Date().getTime();
    let isLicenseValid = false, isTrial = false;

    if (licenseData && licenseData.expiry && now < licenseData.expiry) {
        isLicenseValid = true;
        if (licenseData.key === 'TRIAL_USER') isTrial = true;
    }

    if (!isLicenseValid) {
        licenseModal.classList.add('show'); updateLicenseUI('none');
        if (trialConsumed) { startTrialBtn.style.display = 'none'; licenseDesc.textContent = "Expired. Enter a valid key."; }
        else { startTrialBtn.style.display = 'block'; licenseDesc.textContent = "Enter your 15-digit key."; }
        return;
    }

    licenseModal.classList.remove('show');
    updateLicenseUI(isTrial ? 'trial' : 'active');
    allData = (storageData[STORAGE_KEY] || []).map(migrateItem);
    if (storageData[SETTINGS_KEY]) appSettings = { ...appSettings, ...storageData[SETTINGS_KEY] };
    if (storageData[DARK_MODE_KEY]) applyDarkMode(true);

    renderTable(); loadSettingsUI(); loadAutoModeState(); drawChart();
}

function migrateItem(item) {
    return { ...item, phone: item.phone || '', score: item.score !== undefined ? item.score : calculateLeadScore(item), status: item.status || 'new' };
}

function calculateLeadScore(item) {
    let score = 5;
    const domain = (item.email || '').split('@')[1]?.toLowerCase() || '';
    if (!['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.com'].includes(domain)) score += 3; else score -= 1;
    if (item.confidence === 'verified') score += 3;
    if (item.source === 'Deep Scan') score += 2;
    if (item.phone) score += 2;
    return Math.max(1, Math.min(10, score));
}

function updateLicenseUI(status) {
    const badge = document.querySelector('.trial-badge');
    const watermark = document.querySelector('.watermark');
    if (status === 'trial') { if(watermark) watermark.style.display = 'block'; if(badge) { badge.style.display = 'inline-block'; badge.textContent = "TRIAL"; badge.style.background = "#EF4444"; } }
    else if (status === 'active') { if(watermark) watermark.style.display = 'none'; if(badge) { badge.style.display = 'inline-block'; badge.textContent = "ACTIVATED"; badge.style.background = "#22C55E"; } }
    else { if(watermark) watermark.style.display = 'none'; if(badge) badge.style.display = 'none'; }
}

function setupAllListeners() {
    if(activateLicenseBtn) activateLicenseBtn.addEventListener('click', activateKey);
    if(startTrialBtn) startTrialBtn.addEventListener('click', startTrial);
    if(licenseInput) licenseInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (val.length > 15) val = val.substring(0, 15);
        let f = '';
        if (val.length > 0) f += val.substring(0, 4);
        if (val.length > 4) f += '-' + val.substring(4, 8);
        if (val.length > 8) f += '-' + val.substring(8, 12);
        if (val.length > 12) f += '-' + val.substring(12, 15);
        e.target.value = f;
    });

    autoToggle.addEventListener('change', (e) => { saveAutoModeState(e.target.checked); updateUIForMode(e.target.checked); showToast(e.target.checked ? "Auto-Mining ON" : "Auto-Mining OFF"); });
    autoNextToggle.addEventListener('change', (e) => saveAutoNextState(e.target.checked));
    deepToggle.addEventListener('change', (e) => saveDeepScanState(e.target.checked));

    extractBtn.addEventListener('click', handleManualExtraction);
    clearBtn.addEventListener('click', handleClearData);
    if(bulkMailBtn) bulkMailBtn.addEventListener('click', handleBulkMail);

    exportBtn.addEventListener('click', (e) => { e.stopPropagation(); exportMenu.classList.toggle('show'); });
    document.addEventListener('click', () => { exportMenu.classList.remove('show'); bulkStatusMenu.style.display = 'none'; });
    document.getElementById('exportCsv').addEventListener('click', () => exportToCSV());
    document.getElementById('exportJson').addEventListener('click', () => exportToJSON());
    document.getElementById('sendSheets').addEventListener('click', sendToSheetsSmart);
    document.getElementById('importCsv').addEventListener('click', () => csvFileInput.click());

    searchInput.addEventListener('input', (e) => { currentSearchQuery = e.target.value.toLowerCase().trim(); renderTable(); });

    selectAllCb.addEventListener('change', () => {
        const filtered = getFilteredData();
        if (selectAllCb.checked) filtered.forEach(item => selectedIds.add(item.id)); else selectedIds.clear();
        updateBulkBar(); renderTable();
    });

    bulkDeleteBtn.addEventListener('click', () => {
        if (!confirm(`Delete ${selectedIds.size} selected?`)) return;
        allData = allData.filter(item => !selectedIds.has(item.id)); selectedIds.clear();
        saveData(); renderTable(); updateBulkBar(); showToast("Deleted");
    });

    bulkExportBtn.addEventListener('click', () => exportToCSV(true));

    bulkStatusBtn.addEventListener('click', (e) => { e.stopPropagation(); bulkStatusMenu.style.display = bulkStatusMenu.style.display === 'none' ? 'block' : 'none'; });
    bulkStatusMenu.querySelectorAll('div').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const newStatus = el.dataset.status;
            allData.forEach(item => { if (selectedIds.has(item.id)) item.status = newStatus; });
            saveData(); renderTable(); bulkStatusMenu.style.display = 'none';
            showToast(`${selectedIds.size} → ${STATUS_LABELS[newStatus]}`);
        });
    });

    settingsBtn.addEventListener('click', () => settingsView.classList.add('open'));
    closeSettingsBtn.addEventListener('click', () => settingsView.classList.remove('open'));
    saveSettingsBtn.addEventListener('click', () => { saveSettings(); settingsView.classList.remove('open'); showToast("Saved"); });

    btnBold.addEventListener('click', () => document.execCommand('bold'));
    btnItalic.addEventListener('click', () => document.execCommand('italic'));

    const btnCopyTemplate = document.getElementById('btnCopyTemplate');
    const copyBtnText = document.getElementById('copyBtnText');
    btnCopyTemplate.addEventListener('click', async () => {
        const subject = templateSubject.value;
        const bodyHtml = templateBody.innerHTML;
        const tempDiv = document.createElement('div'); tempDiv.innerHTML = bodyHtml;
        const plainContent = `Subject: ${subject}\n\n${tempDiv.innerText}`;
        try {
            const htmlBlob = new Blob([`Subject: ${subject}\n\n${bodyHtml}`], { type: 'text/html' });
            const textBlob = new Blob([plainContent], { type: 'text/plain' });
            await navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })]);
            btnCopyTemplate.classList.add('copied'); copyBtnText.textContent = 'Copied!';
            setTimeout(() => { btnCopyTemplate.classList.remove('copied'); copyBtnText.textContent = 'Copy'; }, 2000);
        } catch (err) {
            try { await navigator.clipboard.writeText(plainContent); btnCopyTemplate.classList.add('copied'); copyBtnText.textContent = 'Copied!'; setTimeout(() => { btnCopyTemplate.classList.remove('copied'); copyBtnText.textContent = 'Copy'; }, 2000); }
            catch (e) { showToast("Failed to copy"); }
        }
    });

    prebuiltTemplate.addEventListener('change', (e) => {
        const selected = e.target.value;
        if (selected === 'custom') { templatePreview.classList.remove('show'); templatePreview.innerHTML = ''; return; }
        const tmpl = PRE_BUILT_TEMPLATES[selected];
        if (tmpl) {
            templateSubject.value = tmpl.subject; templateBody.innerHTML = tmpl.body; appSettings.selectedTemplate = selected;
            templatePreview.innerHTML = '<strong>Preview:</strong><br>' + tmpl.body.replace(/\[(.*?)\]/gi, '<strong>[$1]</strong>');
            templatePreview.classList.add('show'); showToast(`"${selected.replace(/_/g, ' ')}" loaded`);
        }
    });

    darkModeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');
        applyDarkMode(isDark); chrome.storage.local.set({ [DARK_MODE_KEY]: isDark }); drawChart();
    });

    importZone.addEventListener('click', () => csvFileInput.click());
    csvFileInput.addEventListener('change', handleImportCSV);

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes[STORAGE_KEY]) {
            allData = (changes[STORAGE_KEY].newValue || []).map(migrateItem);
            renderTable(); drawChart();
            countSpan.style.color = '#22C55E'; setTimeout(() => countSpan.style.color = '', 500);
        }
    });
}

function applyDarkMode(isDark) {
    document.body.classList.toggle('dark', isDark);
    moonIcon.style.display = isDark ? 'none' : 'block';
    sunIcon.style.display = isDark ? 'block' : 'none';
}

async function activateKey() {
    const key = licenseInput.value.trim().replace(/-/g, '');
    if (key.length !== 15) { showError("Key must be 15 chars."); return; }
    showError("Validating..."); activateLicenseBtn.disabled = true;
    try {
        const text = await (await fetch(LICENSE_SHEET_URL)).text();
        let keyFound = false, keyStatus = '';
        for (let row of text.split('\n')) {
            const cols = parseCSVLine(row);
            if (cols.length >= 2 && cols[0].trim().replace(/"/g, '') === key) { keyFound = true; keyStatus = cols[1].trim().replace(/"/g, '').toLowerCase(); break; }
        }
        if (keyFound && keyStatus === 'unused') {
            const exp = new Date(); exp.setMonth(exp.getMonth() + 1);
            await chrome.storage.local.set({ [LICENSE_KEY]: { key, activatedOn: new Date().toISOString(), expiry: exp.getTime() } });
            showError("✅ Activated!"); setTimeout(() => initializeApp(), 1000);
        } else { showError(keyFound ? "Key already used." : "Invalid Key."); activateLicenseBtn.disabled = false; }
    } catch (e) { showError("Connection error."); activateLicenseBtn.disabled = false; }
}

async function startTrial() {
    if ((await chrome.storage.local.get(['trial_consumed'])).trial_consumed) { showError("Trial used."); return; }
    const exp = new Date(); exp.setDate(exp.getDate() + 2);
    await chrome.storage.local.set({ [LICENSE_KEY]: { key: 'TRIAL_USER', activatedOn: new Date().toISOString(), expiry: exp.getTime() }, 'trial_consumed': true });
    showError("Starting Trial..."); setTimeout(() => initializeApp(), 500);
}
function showError(msg) { if(licenseError) licenseError.textContent = msg; }
function parseCSVLine(text) { let r = [], p = '', q = false; for (let i = 0; i < text.length; i++) { let c = text[i]; if (c === '"') q = !q; else if (c === ',' && !q) { r.push(p); p = ''; } else p += c; } r.push(p); return r; }

function loadSettingsUI() {
    blacklistInput.value = appSettings.blacklist; disposableSelect.value = appSettings.disposableMode;
    webhookUrlInput.value = appSettings.webhookUrl; notifToggle.checked = appSettings.notifications;
    templateSubject.value = appSettings.templateSubject || ''; templateBody.innerHTML = appSettings.templateBody || '';
    if (appSettings.selectedTemplate && appSettings.selectedTemplate !== 'custom' && PRE_BUILT_TEMPLATES[appSettings.selectedTemplate]) {
        prebuiltTemplate.value = appSettings.selectedTemplate;
        const tmpl = PRE_BUILT_TEMPLATES[appSettings.selectedTemplate];
        templatePreview.innerHTML = '<strong>Preview:</strong><br>' + tmpl.body.replace(/\[(.*?)\]/gi, '<strong>[$1]</strong>');
        templatePreview.classList.add('show');
    }
}
function saveSettings() { appSettings.blacklist = blacklistInput.value; appSettings.disposableMode = disposableSelect.value; appSettings.webhookUrl = webhookUrlInput.value; appSettings.notifications = notifToggle.checked; appSettings.templateSubject = templateSubject.value; appSettings.templateBody = templateBody.innerHTML; appSettings.selectedTemplate = prebuiltTemplate.value; chrome.storage.local.set({ [SETTINGS_KEY]: appSettings }); }

function drawChart() {
    const canvas = document.getElementById('activityChart'); if(!canvas) return;
    const ctx = canvas.getContext('2d'); const isDark = document.body.classList.contains('dark');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = new Date(); const hc = new Array(24).fill(0);
    allData.forEach(item => { const d = Math.floor((now - new Date(item.timestamp)) / 3600000); if (d >= 0 && d < 24) hc[23 - d]++; });
    leadsTodaySpan.textContent = `${allData.filter(item => (now - new Date(item.timestamp)) / 3600000 < 24).length} leads (24h)`;
    const w = canvas.width = canvas.parentElement.offsetWidth; const h = canvas.height = canvas.parentElement.offsetHeight;
    const bw = (w / 24) - 2; const max = Math.max(...hc, 5);
    ctx.fillStyle = isDark ? '#60A5FA' : '#3B82F6';
    hc.forEach((count, i) => { ctx.beginPath(); ctx.roundRect(i * (w / 24) + 1, h - (count / max) * h, bw, (count / max) * h, 2); ctx.fill(); });
}

function isDisposable(email) {
    if (appSettings.disposableMode === 'off') return false;
    const domain = email.split('@')[1];
    const list = appSettings.disposableMode === 'strict' ? ['temp-mail.org', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'trashmail.com'] : ['temp-mail.org', '10minutemail.com'];
    return list.some(d => domain.includes(d));
}
function isBlacklisted(email) { if (!appSettings.blacklist) return false; const d = email.split('@')[1].toLowerCase(); return appSettings.blacklist.split(',').map(x => x.trim().toLowerCase()).some(x => d.includes(x)); }
function checkMilestone(n) { if (!appSettings.notifications) return; if ([20,50,100,200,300,500,1000,2000,5000,10000].includes(n)) chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: 'EMail Miner Pro', message: `Milestone! ${n} leads.` }); }

function getFilteredData() {
    let data = [...allData].reverse();
    if (currentSearchQuery) data = data.filter(item => (item.email||'').toLowerCase().includes(currentSearchQuery) || (item.name||'').toLowerCase().includes(currentSearchQuery) || (item.website||'').toLowerCase().includes(currentSearchQuery) || (item.phone||'').includes(currentSearchQuery) || (item.status||'').toLowerCase().includes(currentSearchQuery));
    return data;
}
function updateBulkBar() { if (selectedIds.size > 0) { bulkBar.classList.add('show'); selectedCountSpan.textContent = `${selectedIds.size} selected`; } else bulkBar.classList.remove('show'); selectAllCb.checked = false; }

async function handleManualExtraction() {
    extractBtn.disabled = true; const orig = extractBtn.innerHTML; extractBtn.innerHTML = deepToggle.checked ? "Scanning..." : "Analyzing...";
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); if (!tab) return;
        const results = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: scrapeGoogleAware });
        if (results?.[0]?.result) {
            let data = results[0].result;
            if (deepToggle.checked && data.linksData) data.deepEmails = await performDeepScanInPopup(data.linksData); else data.deepEmails = [];
            await processResults(data);
        }
    } catch (e) { console.error(e); showToast("Error scanning page."); }
    finally { extractBtn.disabled = false; extractBtn.innerHTML = orig; }
}

async function performDeepScanInPopup(linksData) {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const kw = ['contact', 'about', 'reach', 'info', 'support', 'team', 'help']; let all = [];
    for (const url of [...new Set(linksData.filter(l => kw.some(k => l.url.includes(k))).map(l => l.url))].slice(0, 5)) { try { const r = await fetch(url); if (!r.ok) continue; const m = (await r.text()).match(regex); if (m) all.push(...m); } catch (e) {} }
    return all;
}

function scrapeGoogleAware() {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(?:(?:\+|00)[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,}/g;
    const text = document.body.innerText;
    const rawEmails = text.match(emailRegex) || [];
    const emails = rawEmails.filter(e => !['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'css', 'js'].includes(e.split('.').pop().toLowerCase()));
    const rawPhones = text.match(phoneRegex) || [];
    const phones = [...new Set(rawPhones.map(p => p.trim()).filter(p => { const d = p.replace(/\D/g, ''); return d.length >= 7 && d.length <= 15 && !(d.length === 4 && parseInt(d) >= 1990 && parseInt(d) <= 2030); }))];

    // ULTRA FIXED PHONE EXTRACTOR (Strict Pairing)
    let emailPhoneMap = {};
    let processedBlocks = new Set();
    
    document.querySelectorAll('p, span, div, a, li, td, dt, dd').forEach(el => {
        let cur = el;
        for (let i = 0; i < 4; i++) {
            const txt = (cur.innerText || '').trim();
            // Sirf reasonable size ke blocks check kare (50 se 2000 characters ke beech)
            if (txt.length > 50 && txt.length < 2000 && !processedBlocks.has(cur)) {
                processedBlocks.add(cur);
                const localEmails = txt.match(emailRegex) || [];
                const localPhones = (txt.match(phoneRegex) || []).map(p => p.trim()).filter(p => {
                    const d = p.replace(/\D/g, '');
                    return d.length >= 7 && d.length <= 15 && !(d.length === 4 && parseInt(d) >= 1990 && parseInt(d) <= 2030);
                });

                if (localEmails.length > 0 && localPhones.length > 0) {
                    // Har phone ke liye sabse closest email dhundho
                    localPhones.forEach(phone => {
                        const pIdx = txt.indexOf(phone);
                        if (pIdx === -1) return;
                        
                        let minDist = Infinity;
                        let closestEmail = null;
                        
                        localEmails.forEach(email => {
                            let eIdx = txt.indexOf(email);
                            // Agar same email do baar aayi ho toh sab occurrences check karo
                            while(eIdx !== -1) {
                                const dist = Math.abs(eIdx - pIdx);
                                if (dist < minDist) { 
                                    minDist = dist; 
                                    closestEmail = email; 
                                }
                                const nextIdx = txt.indexOf(email, eIdx + email.length);
                                if (nextIdx === -1) break;
                                eIdx = nextIdx;
                            }
                        });

                        // Agar closest email 150 chars ke andar hai, toh SIRF USI ko map karo
                        if (closestEmail && minDist < 150) {
                            if (!emailPhoneMap[closestEmail]) {
                                emailPhoneMap[closestEmail] = phone;
                            }
                        }
                    });
                }
                break; // Ek baar block mil gaya toh aur upar nahi jayenge
            }
            if (!cur.parentElement) break;
            cur = cur.parentElement;
        }
    });

    let googleResults = [];
    if (window.location.href.includes('google.com/search')) {
        document.querySelectorAll('div.g').forEach(result => {
            const titleEl = result.querySelector('h3'), linkEl = result.querySelector('a'), citeEl = result.querySelector('cite');
            if (titleEl && linkEl) {
                let url = linkEl.href;
                if (url.includes('/url?q=')) { try { const u = new URLSearchParams(url.split('?')[1]).get('q'); if (u) url = u; } catch (e) {} }
                googleResults.push({ title: titleEl.innerText.toLowerCase().trim(), url, cite: (citeEl ? citeEl.innerText : '').toLowerCase().replace('...', '').trim() });
            }
        });
    }

    const linksData = Array.from(document.querySelectorAll('a[href^="http"], a[href^="/url"]')).map(a => {
        let href = a.href, realUrl = href, realHost = '';
        if (href.includes('/url?q=')) { try { const u = new URLSearchParams(href.split('?')[1]).get('q'); if (u) { realUrl = u; try { realHost = new URL(u).hostname; } catch (e) {} } } catch (e) {} }
        else { try { realHost = new URL(href).hostname; } catch (e) {} }
        return { url: realUrl, host: realHost, text: a.innerText.toLowerCase().trim() };
    }).filter(l => l.host && l.host.length > 3 && l.host !== 'google.com');

    return { emails, deepEmails: [], linksData, googleResults, pageTitle: document.title, currentUrl: window.location.href, phones, emailPhoneMap };
}

function findSmartWebsite(emailNamePart, googleResults, linksData) {
    let clean = emailNamePart.toLowerCase().replace(/[0-9._-]/g, '');
    if (clean.length < 4) return null;
    for (let r of (googleResults || [])) { if (r.title.replace(/[^a-z0-9]/g, '').includes(clean) || clean.includes(r.title.replace(/[^a-z0-9]/g, ''))) return { url: r.url, confidence: "verified" }; if (r.cite.replace(/[^a-z0-9]/g, '').includes(clean) || clean.includes(r.cite.replace(/[^a-z0-9]/g, ''))) return { url: r.url, confidence: "verified" }; }
    for (let l of (linksData || [])) { let h = l.host.toLowerCase().replace('www.', '').replace(/\.com|\.pk|\.net|\.org|\.biz|\.co/g, '').replace(/-/g, ''); if (h.includes(clean) || clean.includes(h)) return { url: l.url, confidence: "verified" }; }
    return null;
}

async function processResults(data) {
    let newCount = 0;
    const combined = [...(data.emails || []), ...(data.deepEmails || [])];
    const commonProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.com'];
    combined.forEach(email => {
        if (isDisposable(email) || isBlacklisted(email)) return;
        if (allData.some(item => item.email === email)) return;
        let name = email.split('@')[0].replace(/[0-9.]/g, ' ').trim(); name = name.charAt(0).toUpperCase() + name.slice(1);
        const domain = email.split('@')[1]; const emailNamePart = email.split('@')[0];
        let websiteUrl = "", confidence = "auto";
        const phone = data.emailPhoneMap?.[email] || ''; // STRICT PROXIMITY MAPPING

        if (!commonProviders.includes(domain)) {
            const socials = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'pinterest'];
            const match = (data.linksData || []).find(l => !socials.some(s => l.url.includes(s)) && l.host.includes(domain));
            if (match) { websiteUrl = match.url; confidence = "verified"; } else { websiteUrl = `https://${domain}`; }
        } else {
            const sm = findSmartWebsite(emailNamePart, data.googleResults, data.linksData);
            if (sm) { websiteUrl = sm.url; confidence = "verified"; } else { websiteUrl = `https://www.${emailNamePart.replace(/[0-9._-]/g, '')}.com`; }
        }
        const item = { id: Date.now() + Math.random(), name, email, website: websiteUrl, phone, source: data.deepEmails?.includes(email) ? "Deep Scan" : data.pageTitle, confidence, visited: false, timestamp: new Date().toISOString(), status: 'new', score: 0 };
        item.score = calculateLeadScore(item);
        allData.push(item); newCount++;
    });
    saveData(); renderTable();
    if (newCount > 0) { showToast(`+${newCount} leads mined`); checkMilestone(allData.length); } else showToast("No new emails found");
}

function renderTable() {
    tableBody.innerHTML = '';
    const filtered = getFilteredData();
    if (allData.length === 0) { emptyState.style.display = 'block'; document.getElementById('dataTable').style.display = 'none'; countSpan.textContent = "0 Records"; updateBulkBar(); return; }
    emptyState.style.display = 'none'; document.getElementById('dataTable').style.display = '';

    filtered.forEach(item => {
        const row = document.createElement('tr');
        const tdCheck = document.createElement('td'); tdCheck.className = 'td-check';
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = selectedIds.has(item.id);
        cb.addEventListener('change', () => { if (cb.checked) selectedIds.add(item.id); else selectedIds.delete(item.id); updateBulkBar(); });
        tdCheck.appendChild(cb);

        const tdContact = document.createElement('td'); tdContact.className = 'td-contact';
        const contactWrap = document.createElement('div'); contactWrap.style.cssText = 'display:flex; align-items:flex-start; gap:6px;';
        const gmailA = document.createElement('a'); gmailA.className = 'gmail-link' + (item.visited ? ' clicked' : ''); gmailA.title = "Send via Gmail";
        gmailA.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';
        gmailA.addEventListener('click', (e) => { e.preventDefault(); handleEmailClick(item, gmailA); });
        contactWrap.appendChild(gmailA);
        const textDiv = document.createElement('div'); textDiv.style.cssText = 'min-width:0;';
        textDiv.innerHTML = `<span class="email-cell">${item.email}</span><span class="name-cell">${item.name}</span>`;
        if (item.phone) textDiv.innerHTML += `<span class="phone-cell"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>${item.phone}</span>`;
        contactWrap.appendChild(textDiv); tdContact.appendChild(contactWrap);

        const tdSource = document.createElement('td'); tdSource.className = 'td-source';
        let srcHtml = '';
        if (item.website) { let cd = item.website; try { cd = new URL(item.website).hostname; } catch (e) { cd = item.website.replace('https://', '').split('/')[0]; } srcHtml = `<a href="${item.website}" target="_blank" class="source-link">${cd}</a>`; }
        else srcHtml = '<span style="color:#CBD5E1;font-size:10px;">—</span>';
        const scoreClass = item.score >= 7 ? 'score-high' : item.score >= 4 ? 'score-mid' : 'score-low';
        srcHtml += `<div class="source-sub"><span class="score-dot ${scoreClass}"></span><span class="score-num">${item.score}</span> ${(item.source || '').substring(0, 20)}</div>`;
        tdSource.innerHTML = srcHtml;

        const tdStatus = document.createElement('td'); tdStatus.className = 'td-status'; tdStatus.style.position = 'relative';
        const statusBadge = document.createElement('span'); statusBadge.className = `status-badge ${STATUS_CLASSES[item.status] || STATUS_CLASSES.new}`; statusBadge.textContent = STATUS_LABELS[item.status] || 'New';
        const statusDrop = document.createElement('div'); statusDrop.className = 'status-dropdown-menu';
        STATUS_PIPELINE.forEach(s => {
            const opt = document.createElement('div'); opt.innerHTML = `${s==='new'?'⚪':s==='contacted'?'🔵':s==='replied'?'🟢':'🔴'} ${STATUS_LABELS[s]}`;
            opt.addEventListener('click', (e) => { e.stopPropagation(); item.status = s; saveData(); statusBadge.className = `status-badge ${STATUS_CLASSES[s]}`; statusBadge.textContent = STATUS_LABELS[s]; statusDrop.classList.remove('show'); });
            statusDrop.appendChild(opt);
        });
        statusBadge.addEventListener('click', (e) => { e.stopPropagation(); document.querySelectorAll('.status-dropdown-menu.show').forEach(m => m.classList.remove('show')); statusDrop.classList.toggle('show'); });
        tdStatus.appendChild(statusBadge); tdStatus.appendChild(statusDrop);

        const tdAction = document.createElement('td'); tdAction.className = 'td-action';
        const delBtn = document.createElement('div'); delBtn.className = 'action-btn';
        delBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        delBtn.addEventListener('click', () => { allData = allData.filter(d => d.id !== item.id); selectedIds.delete(item.id); saveData(); renderTable(); updateBulkBar(); showToast("Deleted"); });
        tdAction.appendChild(delBtn);

        row.append(tdCheck, tdContact, tdSource, tdStatus, tdAction);
        tableBody.appendChild(row);
    });
    updateStats(); updateBulkBar();
}

function replaceTemplateVars(text, item) {
    const domain = (item.email || '').split('@')[1] || '';
    return text.replace(/\[Name\]/gi, item.name || '').replace(/\[Email\]/gi, item.email || '').replace(/\[Domain\]/gi, domain).replace(/\[Website\]/gi, item.website || domain);
}

async function handleEmailClick(item, iconElement) {
    const subject = replaceTemplateVars(appSettings.templateSubject, item);
    const bodyHtml = replaceTemplateVars(appSettings.templateBody, item);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyHtml;
    const plain = tempDiv.innerText;

    try {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([bodyHtml], { type: 'text/html' }) })]);
        chrome.tabs.create({ url: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(item.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plain)}` }, () => showToast("Template copied! Ctrl+V in Gmail."));
        if (!item.visited) { const i = allData.findIndex(d => d.id === item.id); if (i !== -1) { allData[i].visited = true; saveData(); iconElement.classList.add('clicked'); } }
    } catch (err) { chrome.tabs.create({ url: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(item.email)}` }); showToast("Opening Gmail."); }
}

async function handleBulkMail() {
    if (!appSettings.templateSubject && !appSettings.templateBody) { showToast("Set a template first."); return; }
    const leads = allData.filter(i => !i.visited); 
    if (!leads.length) { showToast("All emailed."); return; }
    if (!confirm(`Open ${leads.length} Gmail tabs?\nPress Ctrl+V in each for styling.`)) return;
    showToast(`Processing ${leads.length}...`);
    
    for (let i = 0; i < leads.length; i++) {
        const lead = leads[i]; 
        const subject = replaceTemplateVars(appSettings.templateSubject, lead); 
        const bodyHtml = replaceTemplateVars(appSettings.templateBody, lead);
        
        // HTML ko Plain Text mein convert karna
        const tempDiv = document.createElement('div'); 
        tempDiv.innerHTML = bodyHtml;
        const plainText = tempDiv.innerText;

        // HTML Clipboard mein copy karna
        try {
            const blob = new Blob([bodyHtml], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([clipboardItem]);
        } catch (e) {
            console.log("Clipboard fail:", e);
        }

        // Gmail Tab open karna
        chrome.tabs.create({ 
            url: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`, 
            active: false 
        });
        
        lead.visited = true; 
        
        // Aglay tab ke liye 2 second delay (taake clipboard overwrite na ho)
        if (i < leads.length - 1) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    
    saveData(); renderTable(); showToast(`Done! ${leads.length} tabs opened.`);
}

function handleClearData() { if (!allData.length) return; if (confirm("Clear all?")) { allData = []; selectedIds.clear(); saveData(); renderTable(); updateBulkBar(); showToast("Cleared"); } }

function exportToCSV(selectedOnly = false) {
    let data = selectedOnly ? allData.filter(i => selectedIds.has(i.id)) : allData; if (!data.length) return showToast("No data");
    let csv = "Name,Email,Phone,Website,Source,Score,Status,Visited\n";
    data.forEach(r => { csv += `"${r.name}","${r.email}","${r.phone || ''}","${r.website}","${r.source}","${r.score}","${STATUS_LABELS[r.status]||'New'}","${r.visited}"\n`; });
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; link.click(); showToast("CSV downloaded");
}
function exportToJSON() { if (!allData.length) return showToast("No data"); const link = document.createElement("a"); link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2)); link.download = `leads_${new Date().toISOString().slice(0, 10)}.json`; link.click(); showToast("JSON downloaded"); }
async function sendToSheetsSmart() { if (!allData.length) return showToast("No data"); let tsv = "Name\tEmail\tPhone\tWebsite\tScore\tStatus\n"; allData.forEach(r => { tsv += `${r.name}\t${r.email}\t${r.phone||''}\t${r.website}\t${r.score}\t${STATUS_LABELS[r.status]||'New'}\n`; }); try { await navigator.clipboard.writeText(tsv); chrome.tabs.create({ url: "https://docs.google.com/spreadsheets/u/0/create?usp=sheets_home&ths=true" }); showToast("Copied! Paste in sheet."); } catch (e) { showToast("Copy failed."); } }

async function handleImportCSV(e) {
    const file = e.target.files[0]; if (!file) return;
    try {
        const lines = (await file.text()).split('\n').filter(l => l.trim()); if (lines.length < 2) { showToast("Empty CSV"); return; }
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]); if (cols.length < 2) continue;
            const email = cols[1]?.trim().replace(/"/g, ''); if (!email || !email.includes('@') || allData.some(d => d.email === email)) continue;
            const name = (cols[0]?.trim().replace(/"/g, '') || email.split('@')[0]);
            const item = { id: Date.now() + Math.random(), name: name.charAt(0).toUpperCase() + name.slice(1), email, phone: (cols[2]?.trim().replace(/"/g, '') || ''), website: (cols[3]?.trim().replace(/"/g, '') || ''), source: 'CSV Import', confidence: 'auto', visited: false, timestamp: new Date().toISOString(), status: 'new', score: 0 };
            item.score = calculateLeadScore(item); allData.push(item); imported++;
        }
        saveData(); renderTable(); drawChart(); showToast(`Imported ${imported} leads`);
    } catch (err) { showToast("Import failed"); }
    csvFileInput.value = '';
}

function saveData() { chrome.storage.local.set({ [STORAGE_KEY]: allData }, () => updateStats()); }
function updateStats() { countSpan.textContent = `${allData.length} Records`; }
function showToast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(() => toastEl.classList.remove('show'), 3000); }
function loadAutoModeState() { chrome.storage.local.get(['auto_mining_enabled', 'auto_next_enabled', 'deep_scan_enabled'], (r) => { autoToggle.checked = !!r.auto_mining_enabled; autoNextToggle.checked = !!r.auto_next_enabled; deepToggle.checked = r.deep_scan_enabled !== undefined ? r.deep_scan_enabled : true; updateUIForMode(autoToggle.checked); }); }
function saveAutoModeState(v) { chrome.storage.local.set({ 'auto_mining_enabled': v }); }
function saveAutoNextState(v) { chrome.storage.local.set({ 'auto_next_enabled': v }); }
function saveDeepScanState(v) { chrome.storage.local.set({ 'deep_scan_enabled': v }); }
function updateUIForMode(on) { if (on) { headerStatusDot.classList.add('active'); headerStatusText.textContent = "Auto-Mining Active"; modeBadge.textContent = "AUTO-ON"; modeBadge.style.cssText = "color:#166534;background:#DCFCE7;padding:2px 5px;border-radius:4px;font-size:9px;"; } else { headerStatusDot.classList.remove('active'); headerStatusText.textContent = "Manual Mode"; modeBadge.textContent = "MANUAL"; modeBadge.style.cssText = "color:#64748B;background:transparent;"; } }