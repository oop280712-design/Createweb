// ==========================================
// STATE MANAGEMENT (จัดการข้อมูลระบบ)
// ==========================================
let currentUser = null;
let currentAuthMode = 'login';
let userProjects = [];
let activeProjectId = null;
let currentViewMode = 'preview';

function switchAuthMode(mode) {
    currentAuthMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const fieldName = document.getElementById('field-name');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
        tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-white bg-indigo-600 shadow";
        tabSignup.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-gray-400 hover:text-white";
        fieldName.classList.add('hidden');
        submitBtn.innerText = "เข้าสู่ระบบ";
    } else {
        tabSignup.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-white bg-indigo-600 shadow";
        tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-gray-400 hover:text-white";
        fieldName.classList.remove('hidden');
        submitBtn.innerText = "สมัครสมาชิก";
    }
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('input-email').value;
    const name = document.getElementById('input-name').value || email.split('@')[0];
    currentUser = { name, email };
    showDashboard();
}

function loginWithGoogle() {
    currentUser = { name: 'Google User', email: 'user@gmail.com' };
    showDashboard();
}

function logout() {
    currentUser = null;
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('editor-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('editor-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
    document.getElementById('user-name-display').innerText = currentUser.name;
    document.getElementById('user-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
    renderProjectCards();
}

function renderProjectCards() {
    const grid = document.getElementById('project-list');
    const emptyState = document.getElementById('empty-state');
    grid.innerHTML = '';

    if (userProjects.length === 0) {
        emptyState.classList.remove('hidden');
        grid.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');

    userProjects.forEach(proj => {
        const card = document.createElement('div');
        card.className = "bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 transition group flex flex-col justify-between shadow-xl";
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center text-lg font-bold border border-indigo-900">
                        <i class="fa-solid fa-globe"></i>
                    </span>
                    <button onclick="deleteProject('${proj.id}')" class="text-gray-500 hover:text-rose-400 text-sm p-1">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
                <h3 class="font-bold text-white text-base group-hover:text-indigo-400 transition mb-1">${proj.name}</h3>
                <p class="text-xs text-indigo-400 font-mono mb-4 truncate">${proj.url}</p>
            </div>
            <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
                <span class="text-xs text-gray-500">${Object.keys(proj.files).length} ไฟล์</span>
                <button onclick="openEditor('${proj.id}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-pen-to-square"></i> เปิดหน้าออกแบบ
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openCreateModal() { document.getElementById('create-modal').classList.remove('hidden'); }
function closeCreateModal() { document.getElementById('create-modal').classList.add('hidden'); }

function handleCreateSite(event) {
    event.preventDefault();
    const name = document.getElementById('site-name-input').value;
    const urlSub = document.getElementById('site-url-input').value;
    let tld = document.getElementById('site-tld-custom').value.trim();
    
    if (tld.startsWith('.')) tld = tld.substring(1);
    const fullUrl = `https://${urlSub}.${tld}`;

    const newProj = {
        id: 'proj_' + Date.now(),
        name: name,
        url: fullUrl,
        files: {
            'index.html': generatePostableTemplate(name, fullUrl),
            'style.css': '/* สไตล์ CSS สำหรับเว็บไซต์ */\nbody { background: #030712; }',
            'script.js': '// จาวาสคริปต์ทำงานตลอด 24 ชั่วโมง\nconsole.log("System Online 24/7");'
        },
        activeFile: 'index.html'
    };

    userProjects.push(newProj);
    closeCreateModal();
    openEditor(newProj.id);
}

function deleteProject(id) {
    userProjects = userProjects.filter(p => p.id !== id);
    renderProjectCards();
}

function openEditor(projId) {
    activeProjectId = projId;
    const proj = userProjects.find(p => p.id === projId);

    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('editor-screen').classList.remove('hidden');

    document.getElementById('active-site-title').innerText = proj.name;
    document.getElementById('active-site-url').innerText = proj.url;
    document.getElementById('preview-url-bar').innerText = proj.url;

    renderFileList();
    switchFile(proj.activeFile || 'index.html');
    setEditorView('split');
}

function backToDashboard() {
    saveCurrentFileCode();
    showDashboard();
}

// ------------------------------------------
// ระบบแสดงผลไฟล์และ "หลอดสถานะไฟล์ที่กำลังทำงานอยู่"
// ------------------------------------------
function renderFileList() {
    const proj = userProjects.find(p => p.id === activeProjectId);
    const list = document.getElementById('file-list');
    list.innerHTML = '';

    Object.keys(proj.files).forEach(filename => {
        const isSelected = filename === proj.activeFile;
        const btn = document.createElement('div');
        btn.onclick = () => switchFile(filename);
        btn.className = `w-full px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition cursor-pointer relative group ${isSelected ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40' : 'text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent'}`;
        
        btn.innerHTML = `
            <span class="flex items-center gap-2 z-10">
                <i class="fa-regular fa-file-code ${isSelected ? 'text-indigo-400' : 'text-gray-500'}"></i> ${filename}
            </span>
            <!-- หลอดสถานะ / แถบเรืองแสงแสดงไฟล์ที่กำลังทำงานอยู่ -->
            ${isSelected ? '<span class="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]"></span>' : ''}
            ${isSelected ? '<span class="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded animate-pulse">Active</span>' : ''}
        `;
        list.appendChild(btn);
    });
}

function switchFile(filename) {
    saveCurrentFileCode();
    const proj = userProjects.find(p => p.id === activeProjectId);
    proj.activeFile = filename;
    document.getElementById('current-active-file-label').innerText = filename;
    document.getElementById('code-input').value = proj.files[filename] || '';
    renderFileList();
    liveUpdatePreview();
}

function saveCurrentFileCode() {
    if (!activeProjectId) return;
    const proj = userProjects.find(p => p.id === activeProjectId);
    if (proj && proj.activeFile) {
        proj.files[proj.activeFile] = document.getElementById('code-input').value;
    }
}

function setEditorView(mode) {
    currentViewMode = mode;
    const codePanel = document.getElementById('code-panel');
    const previewPanel = document.getElementById('preview-panel');

    if (mode === 'preview') {
        codePanel.classList.add('hidden');
        previewPanel.classList.remove('hidden');
        previewPanel.style.width = '100%';
    } else if (mode === 'code') {
        codePanel.classList.remove('hidden');
        previewPanel.classList.add('hidden');
        codePanel.style.width = '100%';
    } else {
        codePanel.classList.remove('hidden');
        previewPanel.classList.remove('hidden');
        codePanel.style.width = '50%';
        previewPanel.style.width = '50%';
    }
}

function liveUpdatePreview() {
    saveCurrentFileCode();
    const proj = userProjects.find(p => p.id === activeProjectId);
    const iframe = document.getElementById('web-preview-iframe');
    const htmlCode = proj.files['index.html'] || '<div>หน้าเว็บว่างเปล่า</div>';

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlCode);
    iframeDoc.close();
}

function runCode() { liveUpdatePreview(); }

function publishSite() {
    if (!activeProjectId) return;
    const proj = userProjects.find(p => p.id === activeProjectId);
    document.getElementById('published-url-display').innerText = proj.url;
    document.getElementById('publish-modal').classList.remove('hidden');
    liveUpdatePreview();
}

function closePublishModal() { document.getElementById('publish-modal').classList.add('hidden'); }
function copySiteUrl() {
    const urlText = document.getElementById('published-url-display').innerText;
    navigator.clipboard.writeText(urlText);
    alert('คัดลอกลิงก์เรียบร้อยแล้ว: ' + urlText);
}

function downloadWebCode() {
    const proj = userProjects.find(p => p.id === activeProjectId);
    const blob = new Blob([proj.files['index.html'] || ''], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'index.html';
    a.click();
}

function openFileModal() { document.getElementById('file-modal').classList.remove('hidden'); }
function closeFileModal() { document.getElementById('file-modal').classList.add('hidden'); }

function handleCreateFile(event) {
    event.preventDefault();
    const filename = document.getElementById('file-name-input').value.trim();
    if (!filename) return;

    const proj = userProjects.find(p => p.id === activeProjectId);
    if (!proj.files[filename]) {
        proj.files[filename] = `<!-- ไฟล์ ${filename} -->\n`;
    }
    closeFileModal();
    switchFile(filename);
}

// ==========================================
// GEMINI AI SMART ENGINE (อัปเดตใหม่ล่าสุด)
// ==========================================
function toggleGeminiWidget() {
    document.getElementById('gemini-chat-window').classList.toggle('hidden');
}

function handleGeminiSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('gemini-input');
    const text = input.value.trim();
    if (!text) return;

    appendGeminiMessage('user', text);
    input.value = '';

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'gemini-loading';
    loadingDiv.className = "bg-gray-800 text-gray-300 p-3 rounded-xl border border-gray-700 max-w-[95%] text-xs flex items-center gap-2";
    loadingDiv.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-indigo-400"></i> <span>Gemini กำลังออกแบบและสร้างระบบเว็บไซต์ตามคำสั่ง...</span>`;
    document.getElementById('gemini-messages').appendChild(loadingDiv);
    scrollGeminiToBottom();

    setTimeout(() => {
        const loader = document.getElementById('gemini-loading');
        if (loader) loader.remove();

        let aiResponse = "";
        let generatedCode = "";

        if (text.includes('Robux') || text.includes('ไก่ตัน') || text.includes('เติม') || text.includes('ร้าน')) {
            aiResponse = "🚀 สร้างระบบร้านขายไอดีไก่ตัน และเว็บเติม Robux อัตโนมัติ (พร้อมระบบกรอก Username และเลือกแพ็กเกจ) ให้เรียบร้อยแล้วครับ!";
            generatedCode = generateRobuxShopCode();
        } else if (text.includes('พอร์ต') || text.includes('แนะนำตัว') || text.includes('portfolio')) {
            aiResponse = "🎨 สร้างหน้าเว็บไซต์พอร์ตโฟลิโอส่วนตัว พร้อมดีไซน์ธีมมืดสุดเท่เรียบร้อยครับ!";
            generatedCode = generatePortfolioCode();
        } else {
            aiResponse = `✨ ออกแบบหน้าเว็บไซต์สำหรับ "${text}" ให้เรียบร้อยแล้วครับ! กดนำโค้ดไปวางในไฟล์ได้ทันที`; generatedCode = generateCustomDynamicCode(text); }  appendGeminiMessage('ai', aiResponse, generatedCode); }, 1000); }  function appendGeminiMessage(sender, text, codeBlock = null) { const container = document.getElementById('gemini-messages'); const msgDiv = document.createElement('div');  if (sender === 'user') { msgDiv.className = "bg-indigo-600 text-white p-2.5 rounded-xl ml-auto max-w-[85\%] text-xs shadow-md"; msgDiv.innerText = text; } else { msgDiv.className = "bg-gray-800 text-gray-200 p-3 rounded-xl border border-gray-700 max-w-[95\%] text-xs space-y-2.5"; msgDiv.innerHTML = `<div>${text}</div>`;

        if (codeBlock) {
            const applyBtn = document.createElement('button');
            applyBtn.className = "w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-[1.02]";
            applyBtn.innerHTML = `<i class="fa-solid fa-file-import"></i> นำโค้ดไปวางในไฟล์ index.html ทันที`;
            applyBtn.onclick = () => {
                if (!activeProjectId) {
                    alert('กรุณาเลือกหรือสร้างเว็บไซต์ในระบบก่อนครับ');
                    return;
                }
                const proj = userProjects.find(p => p.id === activeProjectId);
                if (proj) {
                    proj.files['index.html'] = codeBlock;
                    document.getElementById('code-input').value = codeBlock;
                    liveUpdatePreview();
                    alert('นำโค้ดที่ Gemini ออกแบบไปใส่ในไฟล์ index.html เรียบร้อยแล้ว!');
                }
            };
            msgDiv.appendChild(applyBtn);
        }
    }

    container.appendChild(msgDiv);
    scrollGeminiToBottom();
}

function scrollGeminiToBottom() {
    const container = document.getElementById('gemini-messages');
    container.scrollTop = container.scrollHeight;
}

// ------------------------------------------
// แม่แบบโค้ดต่างๆ ที่ Gemini AI สร้างให้
// ------------------------------------------
function generateRobuxShopCode() {
    return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BloxShop - ร้านขายไก่ตัน & เติม Robux อัตโนมัติ</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-950 text-gray-100 font-sans min-h-screen">
    <header class="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div class="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white text-xl font-black">R</div>
                <span class="font-bold text-lg text-white">BloxShop <span class="text-xs text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">ROBUX 24H</span></span>
            </div>
            <span class="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ระบบอัตโนมัติทำงาน 24 ชม.
            </span>
        </div>
    </header>

    <main class="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <div class="bg-gradient-to-r from-rose-900/40 to-indigo-900/40 border border-rose-500/20 rounded-3xl p-6 md:p-8 text-center md:text-left">
            <span class="text-xs font-bold uppercase text-rose-400 bg-rose-950 px-3 py-1 rounded-full border border-rose-800 mb-3 inline-block">บริการเติม Robux & ขายไอดี</span>
            <h1 class="text-2xl md:text-4xl font-extrabold text-white mb-2">เติม Robux อัตโนมัติ & ร้านไก่ตัน</h1>
            <p class="text-sm text-gray-300">เข้าบัญชีทันที ปลอดภัย ด้วยระบบ Roblox Gamepass API</p>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><i class="fa-solid fa-coins text-amber-400"></i> ระบบเติม Robux เข้าบัญชีอัตโนมัติ</h2>
            <form onsubmit="processRobuxTopup(event)" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-400 mb-1">1. ชื่อบัญชี Roblox (Username)</label>
                    <input type="text" id="roblox-username" required placeholder="เช่น RobloxUser123" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-400 mb-1">2. เลือกแพ็กเกจ Robux</label>
                    <select id="robux-package" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500">
                        <option value="100">100 Robux - 35 บาท</option>
                        <option value="500">500 Robux - 160 บาท 🔥</option>
                        <option value="1000">1,000 Robux - 300 บาท</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition">ยืนยันการเติม Robux</button>
                </div>
            </form>
            <div id="topup-status-msg" class="hidden mt-4 p-4 rounded-xl bg-gray-950 border border-emerald-500/30 text-emerald-400 text-xs"></div>
        </div>
    </main>

    <script>
        function processRobuxTopup(e) {
            e.preventDefault();
            const user = document.getElementById('roblox-username').value;
            const amount = document.getElementById('robux-package').value;
            const status = document.getElementById('topup-status-msg');
            status.classList.remove('hidden');
            status.innerText = "กำลังโอน " + amount + " Robux ไป
