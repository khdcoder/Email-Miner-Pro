
<div align="center">

  <!-- PROJECT LOGO -->
  <img src="https://raw.githubusercontent.com/khdcoder/EMail-Miner-Pro/main/icons/icon128.png" alt="Logo" width="120" height="120">

  <!-- BADGES -->
  ![Version](https://img.shields.io/badge/version-12.300.15-blue.svg)
  ![Chrome](https://img.shields.io/badge/Chrome-Extension-green.svg)
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

  # EMail Miner Pro

  **The Enterprise-Level Smart Data Extraction Tool**

  [Features](#-features) • [Installation](#-installation) • [How It Works](#-how-it-works) • [Credits](#credits)

</div>

---

## 📖 Overview

**EMail Miner Pro** is a powerful, enterprise-grade Google Chrome Extension designed to automate the lead generation process. It intelligently scans web pages to extract email addresses, names, and associated websites with high accuracy.

Unlike basic scrapers, EMail Miner Pro features a **Smart Linking Algorithm** that automatically connects email addresses to their correct websites. Version 12.300.15 introduces advanced features like **Hidden Email Finder (Deep Scan)** and **Auto-Pagination**, and **Send to Sheets**, taking data extraction to the next level.

<div align="center">

[⬇️ Download Extension](https://github.com/khdcoder/EMail-Miner-Pro/archive/refs/heads/main.zip)

</div>

---

## ✨ Features

*   **🔍 Smart Website Extraction:**
    *   Uses a 3-level verification system (Verified, Linked, Auto) to match emails with correct websites.
*   **⛏️ Deep Scan (Hidden Email Finder):**
    *   **NEW:** Scans "Contact", "About", and "Support" pages in the background. Even if emails aren't visible on the main page, this feature fetches HTML from these links to extract hidden emails.
*   **🚀 Auto-Mining Mode:**
    *   A "Set it and forget it" mode. Enable Auto-Mining to automatically extract emails from newly opened tabs in the background without lifting a finger.
*   **📄 Auto-Pagination:**
    *   **NEW:** Independent navigation control. Enable this to automatically click "Next" buttons on Google Search or directory pages. Works perfectly with or without Auto-Mining enabled.
*   **📧 Integrated Gmail Contacting:**
    *   Click the Gmail icon to instantly open a "Compose" window with the lead's email pre-filled. Icons turn green to mark contacted leads.
*   **💾 Persistent Storage:**
    *   Data is saved locally in your browser. You can navigate between pages, and the extension will accumulate data without losing previous results.
*   **🚫 Duplicate Filter:**
    *   Automatically prevents the same email from being added twice.
*   **📤 Flexible Export:**
    *   CSV Export: Download data with status tracking (Sent/Unsent).
    *   JSON Export: Raw data export for developers.
    *   Google Sheets: Instant data shard to Google Sheets. (Click on Export, Select Send to Sheets. A new Sheet will be Created You just need to Press *ctrl + v* or Paste by Right Clicking.)
*   **🎨 Professional UI:**
    *   Clean, modern, and responsive interface. Includes color-coded confidence badges (Verified, Linked, Auto, Deep Scan).

---


## 🛠️ Installation

Since this is a custom developer tool, it requires a manual installation via Developer Mode in Chrome.

1.  **Download:** Download or clone this repository.
    ```bash
    git clone https://github.com/khdcoder/EMail-Miner-Pro.git
    ```
2.  **Open Chrome Extensions:**
    *   Go to `chrome://extensions/` in your address bar.
3.  **Enable Developer Mode:**
    *   Toggle the switch in the top-right corner to **ON**.
4.  **Load Unpacked:**
    *   Click the **"Load unpacked"** button in the top-left.
5.  **Select Folder:**
    *   Select the folder where you saved the extension files.
6.  **Pin It:**
    *   Click the puzzle icon in Chrome and pin **EMail Miner Pro** for easy access.

---

## 🚀 How It Works

EMail Miner Pro uses advanced logic to clean up your data and automate workflows.

### 1️⃣ Smart Extraction Logic
*   **Scrape:** Navigate to a page with lead information and click **"Mine Current Tab"**.
*   **Organize:** The extension filters and organizes the data, removing duplicates.
*   **Smart Linking:** It attempts to match the email username to a real website URL.

> **Example Scenario:**
> You search Google for: `"@gmail.com"` `"store"` `"pakistan"`.
> *   *Text:* "Contact Skin Store Pakistan at skinstorepakistan@gmail.com..."
> *   *Link:* [Visit Website](https://www.skinstorepakistan.com)
>
> **What EMail Miner Pro does:**
> 1.  **Extraction:** It detects `skinstorepakistan@gmail.com`.
> 2.  **Linking:** It matches the username `skinstorepakistan` to the URL.
> 3.  **Result:** Provides a clickable business website instead of just `gmail.com`.

### 2️⃣ Advanced Modes (Version 9.x)

**A. Deep Scan Mode**
If emails are not visible on the current page:
*   Toggle **ON** the "Deep Scan" switch.
*   The extension looks for links like "Contact Us", "About Us", or "Info".
*   It fetches the HTML of those pages in the background and extracts emails found there.

**B. Automated Workflows**
*   **Auto-Mining:** Turn this on. Every time you open a new tab, it will automatically scrape emails from it.
*   **Auto-Pagination:** Turn this on. When the page finishes scanning (or loads), it will automatically look for a "Next" button and click it after a short delay. Useful for browsing Google Search results hands-free.

### 3️⃣ Contact & Export
*   **Contact:** Click the **Gmail icon** next to any lead. A new Gmail tab opens. The icon turns **Green**.
*   **Export:** Click **"Export"** to download your cleaned list as a CSV file.

---

## 📸 Screenshots

<img width="395" height="558" alt="image" src="https://github.com/user-attachments/assets/8201c75c-1126-4c06-810e-712673dd98b9" />
<img width="398" height="558" alt="image" src="https://github.com/user-attachments/assets/5d590ce2-6211-4f19-8aa2-b92736185bd6" />
<img width="399" height="599" alt="image" src="https://github.com/user-attachments/assets/ce40b72c-8223-43f4-b2b9-d25c2d6e48e0" />


1.  **Dashboard View:** Modern table with independent toggles for Auto-Mining, Auto-Pagination, and Deep Scan.
2.  **Smart Action:** The "Mine Current Tab" button in action.
3.  **Deep Scan:** Visual badges indicating source confidence (Verified vs Deep Scan).

---

## 📂 File Structure

```text
EMail-Miner-Pro/
├── icons/              # Extension ICONS
    └── icon16.png
    └── icon48.png
    └── icon128.png
├── manifest.json       # Extension configuration (v9.100.25)
├── popup.html          # User Interface (HTML/CSS)
├── popup.js            # Core Logic, Manual Mining & Deep Scan
├── background.js       # Auto-Mining & Auto-Pagination Service Worker
└── README.md           # Documentation
```

---

## ⚙️ Tech Stack

*   **Vanilla JavaScript:** No frameworks, for maximum performance and speed.
*   **Chrome Extension Manifest V3:** The latest and most secure extension standard.
*   **Background Fetching:** Uses CORS-safe fetching logic to access hidden pages.
*   **CSS3:** Custom enterprise-grade styling without external libraries.

---

## 📝 Usage Guide

1.  **Setup:** Open the extension popup.
2.  **Configure:**
    *   Enable **Deep Scan** if you want to search hidden "Contact" pages.
    *   Enable **Auto-Mining** if you want data extracted automatically as you browse.
    *   Enable **Auto-Pagination** if you want to automatically go to the next page (e.g., on Google).
3.  **Action:** Navigate to a website or search engine. Click **"Mine Current Tab"** for a one-time scan, or let **Auto-Mining** do the work.
4.  **Navigate:** If on a search result page, the extension will click "Next" automatically (if enabled) and scrape the new page.
5.  **Export:** Once your list is ready, click **"Export"** to download your CSV.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Credits

<div align="center">

**Developed & Maintained by**

**[Khalid Software House](https://khalid-software-house.web.app)**

*Enterprise Software Solutions*

</div>



