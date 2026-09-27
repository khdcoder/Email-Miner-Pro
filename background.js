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
const AUTO_MODE_KEY = 'auto_mining_enabled';
const AUTO_NEXT_KEY = 'auto_next_enabled';
const DEEP_SCAN_KEY = 'deep_scan_enabled';
const SETTINGS_KEY = 'leadsync_settings_v2';
const MILESTONES = [20, 50, 100, 200, 300, 500, 1000, 2000, 5000, 10000];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        chrome.storage.local.get([DEEP_SCAN_KEY, AUTO_MODE_KEY, AUTO_NEXT_KEY], (result) => {
            const isDeepScan = result[DEEP_SCAN_KEY] !== undefined ? result[DEEP_SCAN_KEY] : true;
            const shouldMine = result[AUTO_MODE_KEY] === true;
            const shouldNext = result[AUTO_NEXT_KEY] === true;
            if (shouldMine) mineDataFromTab(tabId, isDeepScan, shouldNext);
            else if (shouldNext) clickNextPage(tabId);
        });
    }
});

async function mineDataFromTab(tabId, isDeepScan, shouldClickNext) {
    try {
        const results = await chrome.scripting.executeScript({ target: { tabId }, func: scrapeGoogleAware });
        if (results?.[0]?.result) {
            let data = results[0].result;
            if (isDeepScan && data.linksData) data.deepEmails = await performDeepScanInBackground(data.linksData);
            else data.deepEmails = [];
            await processAndSaveResults(data);
            if (shouldClickNext) clickNextPage(tabId);
        }
    } catch (e) { console.log("Auto-mine skip:", e); }
}

async function performDeepScanInBackground(linksData) {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const kw = ['contact', 'about', 'reach', 'info', 'support', 'team', 'help']; let all = [];
    for (const url of [...new Set(linksData.filter(l => kw.some(k => l.url.includes(k))).map(l => l.url))].slice(0, 5)) { 
        try { const r = await fetch(url); if (!r.ok) continue; const m = (await r.text()).match(regex); if (m) all.push(...m); } catch (e) {} 
    }
    return all;
}

function clickNextPage(tabId) {
    chrome.scripting.executeScript({ target: { tabId }, func: () => {
        let btn = document.querySelector('#pnnext') || document.querySelector('a[aria-label="Next"]');
        if (!btn) { const links = Array.from(document.querySelectorAll('a')); btn = links.find(a => a.innerText.toLowerCase().trim() === 'next' || a.innerText.toLowerCase().includes('next >')); }
        if (btn) { setTimeout(() => btn.click(), 2000); return true; } return false;
    }});
}

function scrapeGoogleAware() {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(?:(?:\+|00)[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,}/g;
    const text = document.body.innerText;
    const rawEmails = text.match(emailRegex) || [];
    const emails = rawEmails.filter(e => !['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'css', 'js'].includes(e.split('.').pop().toLowerCase()));
    const rawPhones = text.match(phoneRegex) || [];
    const phones = [...new Set(rawPhones.map(p => p.trim()).filter(p => { const d = p.replace(/\D/g, ''); return d.length >= 7 && d.length <= 15 && !(d.length === 4 && parseInt(d) >= 1990 && parseInt(d) <= 2030); }))];

    // FIXED PHONE EXTRACTOR (150 Character Proximity Rule)
    // ULTRA FIXED PHONE EXTRACTOR (Strict Pairing)
    let emailPhoneMap = {};
    let processedBlocks = new Set();
    
    document.querySelectorAll('p, span, div, a, li, td, dt, dd').forEach(el => {
        let cur = el;
        for (let i = 0; i < 4; i++) {
            const txt = (cur.innerText || '').trim();
            if (txt.length > 50 && txt.length < 2000 && !processedBlocks.has(cur)) {
                processedBlocks.add(cur);
                const localEmails = txt.match(emailRegex) || [];
                const localPhones = (txt.match(phoneRegex) || []).map(p => p.trim()).filter(p => {
                    const d = p.replace(/\D/g, '');
                    return d.length >= 7 && d.length <= 15 && !(d.length === 4 && parseInt(d) >= 1990 && parseInt(d) <= 2030);
                });

                if (localEmails.length > 0 && localPhones.length > 0) {
                    localPhones.forEach(phone => {
                        const pIdx = txt.indexOf(phone);
                        if (pIdx === -1) return;
                        
                        let minDist = Infinity;
                        let closestEmail = null;
                        
                        localEmails.forEach(email => {
                            let eIdx = txt.indexOf(email);
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

                        if (closestEmail && minDist < 150) {
                            if (!emailPhoneMap[closestEmail]) {
                                emailPhoneMap[closestEmail] = phone;
                            }
                        }
                    });
                }
                break;
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

function calculateLeadScoreBg(item) {
    let score = 5;
    const domain = (item.email || '').split('@')[1]?.toLowerCase() || '';
    if (!['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.com'].includes(domain)) score += 3; else score -= 1;
    if (item.confidence === 'verified') score += 3;
    if (item.source === 'Deep Scan') score += 2;
    if (item.phone) score += 2;
    return Math.max(1, Math.min(10, score));
}

function findSmartWebsiteBg(emailNamePart, googleResults, linksData) {
    let clean = emailNamePart.toLowerCase().replace(/[0-9._-]/g, '');
    if (clean.length < 4) return null;
    for (let r of (googleResults || [])) { if (r.title.replace(/[^a-z0-9]/g, '').includes(clean) || clean.includes(r.title.replace(/[^a-z0-9]/g, ''))) return { url: r.url, confidence: "verified" }; if (r.cite.replace(/[^a-z0-9]/g, '').includes(clean) || clean.includes(r.cite.replace(/[^a-z0-9]/g, ''))) return { url: r.url, confidence: "verified" }; }
    for (let l of (linksData || [])) { let h = l.host.toLowerCase().replace('www.', '').replace(/\.com|\.pk|\.net|\.org|\.biz|\.co/g, '').replace(/-/g, ''); if (h.includes(clean) || clean.includes(h)) return { url: l.url, confidence: "verified" }; }
    return null;
}

async function processAndSaveResults(data) {
    const settingsRes = await chrome.storage.local.get([SETTINGS_KEY]);
    const settings = settingsRes[SETTINGS_KEY] || { blacklist: '', disposableMode: 'strict', notifications: true };
    const storedData = await chrome.storage.local.get([STORAGE_KEY]);
    let allData = (storedData[STORAGE_KEY] || []).map(item => ({ ...item, phone: item.phone || '', score: item.score !== undefined ? item.score : calculateLeadScoreBg(item), status: item.status || 'new' }));
    let newCount = 0;
    const combined = [...(data.emails || []), ...(data.deepEmails || [])];
    const blacklistDomains = settings.blacklist ? settings.blacklist.split(',').map(d => d.trim().toLowerCase()) : [];
    const disposableList = settings.disposableMode === 'strict' ? ['temp-mail.org', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'trashmail.com'] : settings.disposableMode === 'basic' ? ['temp-mail.org', '10minutemail.com'] : [];
    const commonProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.com'];

    combined.forEach(email => {
        const domain = email.split('@')[1].toLowerCase();
        if (blacklistDomains.some(d => domain.includes(d)) || disposableList.some(d => domain.includes(d))) return;
        if (allData.some(item => item.email === email)) return;
        let name = email.split('@')[0].replace(/[0-9.]/g, ' ').trim(); name = name.charAt(0).toUpperCase() + name.slice(1);
        const emailNamePart = email.split('@')[0];
        const phone = data.emailPhoneMap?.[email] || ''; // STRICT PROXIMITY MAPPING
        let websiteUrl = "", confidence = "auto";
        if (!commonProviders.includes(domain)) {
            const socials = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'pinterest'];
            const match = (data.linksData || []).find(l => !socials.some(s => l.url.includes(s)) && l.host.includes(domain));
            if (match) { websiteUrl = match.url; confidence = "verified"; } else { websiteUrl = `https://${domain}`; }
        } else {
            const sm = findSmartWebsiteBg(emailNamePart, data.googleResults, data.linksData);
            if (sm) { websiteUrl = sm.url; confidence = "verified"; } else { websiteUrl = `https://www.${emailNamePart.replace(/[0-9._-]/g, '')}.com`; }
        }
        const item = { id: Date.now() + Math.random(), name, email, website: websiteUrl, phone, source: data.deepEmails?.includes(email) ? "Deep Scan" : data.pageTitle, confidence, visited: false, timestamp: new Date().toISOString(), status: 'new', score: 0 };
        item.score = calculateLeadScoreBg(item);
        allData.push(item); newCount++;
    });

    if (newCount > 0) {
        await chrome.storage.local.set({ [STORAGE_KEY]: allData });
        if (settings.notifications && MILESTONES.includes(allData.length)) {
            chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: 'EMail Miner Pro', message: `Milestone Reached! ${allData.length} leads.` });
        }
        chrome.action.setBadgeText({ text: `+${newCount}` });
        chrome.action.setBadgeBackgroundColor({ color: '#22C55E' });
        setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
    }
}