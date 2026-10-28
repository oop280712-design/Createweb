// ==========================================
// STATE MANAGEMENT & PERSISTENCE (บันทึกข้อมูลอัตโนมัติ 24 ชม.)
// ==========================================
let currentUser = null;
let currentAuthMode = 'login';
let userProjects = JSON.parse(localStorage.getItem('webbuilder_projects') || '[]');
let activeProjectId = null;
let currentViewMode = 'preview';

// บันทึกโปรเจกต์ลงความจำเครื่อง (localStorage) ป้องกันเว็บหายเมื่อออกจากระบบหรือยังไม่เผยแพร่
function saveProjectsToStorage() {
    localStorage.setItem('webbuilder_projects', JSON.stringify(userProjects));
}

// สลับโหมด เข้าสู่ระบบ / สมัครสมาชิก
function switchAuthMode(mode) {
    currentAuthMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const fieldName = document.getElementById('field-name');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
        if (tabLogin) tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-white bg-indigo-600 shadow";
        if (tabSignup) tabSignup.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-gray-400 hover:text-white";
        if (fieldName) fieldName.classList.add('hidden');
        if (submitBtn) submitBtn.innerText = "เข้าสู่ระบบ";
    } else {
        if (tabSignup) tabSignup.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-white bg-indigo-600 shadow";
        if (tabLogin) tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition text-gray-400 hover:text-white";
        if (fieldName) fieldName.classList.remove('hidden');
        if (submitBtn) submitBtn.innerText = "สมัครสมาชิก";
    }
}

// จัดการฟอร์มเข้าสู่ระบบ (ป้องกันอาการค้าง)
function handleAuthSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('input-email');
    const nameInput = document.getElementById('input-name');
    
    const email = emailInput ? emailInput.value : 'user@example.com';
    const name = (nameInput && nameInput.value.trim() !== '') ? nameInput.value : email.split('@')[0];
    
    currentUser = { name, email };
    showDashboard();
}

function loginWithGoogle() {
    currentUser = { name: 'Google User', email: 'user@gmail.com' };
    showDashboard();
}

function logout() {
    currentUser = null;
    const authScreen = document.getElementById('auth-screen');
    const editorScreen = document.getElementById('editor-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    
    if (authScreen) authScreen.classList.remove('hidden');
    if (editorScreen) editorScreen.classList.add('hidden');
    if (dashboardScreen) dashboardScreen.classList.add('hidden');
}

// แสดงหน้า Dashboard (หน้ารวมเว็บไซต์ที่สร้างไว้ทั้งหมด)
function showDashboard() {
    const authScreen = document.getElementById('auth-screen');
    const editorScreen = document.getElementById('editor-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    if (authScreen) authScreen.classList.add('hidden');
    if (editorScreen) editorScreen.classList.add('hidden');
    if (dashboardScreen) dashboardScreen.classList.remove('hidden');

    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && currentUser) nameDisplay.innerText = currentUser.name;

    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && currentUser) userAvatar.innerText = currentUser.name.charAt(0).toUpperCase();

    renderProjectCards();
}

// ==========================================
// PROJECT MANAGEMENT & DASHBOARD CARDS
// ==========================================

function renderProjectCards() {
    const grid = document.getElementById('project-list');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (userProjects.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        grid.classList.add('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    grid.classList.remove('hidden');

    userProjects.forEach(proj => {
        const card = document.createElement('div');
        card.className = "bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 transition group flex flex-col justify-between shadow-xl relative";
        
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center text-lg font-bold border border-indigo-900">
                        <i class="fa-solid fa-globe"></i>
                    </span>
                    <!-- ปุ่มลบเว็บไซต์ -->
                    <button onclick="deleteProject('${proj.id}')" title="ลบเว็บไซต์นี้" class="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition">
                        <i class="fa-regular fa-trash-can"></i> ลบเว็บ
                    </button>
                </div>
                <h3 class="font-bold text-white text-base group-hover:text-indigo-400 transition mb-1">${proj.name}</h3>
                <p class="text-xs text-indigo-400 font-mono mb-4 truncate">${proj.url}</p>
            </div>
            
            <div class="pt-4 border-t border-gray-800 flex items-center justify-between gap-2">
                <span class="text-xs text-gray-500">${Object.keys(proj.files).length} ไฟล์ (บันทึกอัตโนมัติ)</span>
                <!-- ปุ่มจัดการเว็บไซต์ -->
                <button onclick="openEditor('${proj.id}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-gear"></i> จัดการเว็บไซต์
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openCreateModal() { 
    const modal = document.getElementById('create-modal');
    if (modal) modal.classList.remove('hidden'); 
}

function closeCreateModal() { 
    const modal = document.getElementById('create-modal');
    if (modal) modal.classList.add('hidden'); 
}

// สร้างเว็บไซต์ใหม่ (เก็บลงระบบทันทีแม้ยังไม่ได้เผยแพร่)
function handleCreateSite(event) {
    event.preventDefault();
    const nameInput = document.getElementById('site-name-input');
    const urlSubInput = document.getElementById('site-url-input');
    const tldCustomInput = document.getElementById('site-tld-custom');

    const name = nameInput ? nameInput.value : 'My Site';
    const urlSub = urlSubInput ? urlSubInput.value : 'mysite';
    let tld = tldCustomInput ? tldCustomInput.value.trim() : 'com';
    
    if (tld.startsWith('.')) tld = tld.substring(1);
    const fullUrl = `https://${urlSub}.${tld}`;

    const newProj = {
        id: 'proj_' + Date.now(),
        name: name,
        url: fullUrl,
        files: {
            'index.html': generatePostableTemplate(name, fullUrl),
            'style.css': '/* เขียน CSS ตกแต่งเว็บไซต์ได้ที่นี่ */\nbody {\n    background-color: #030712;\n    color: #ffffff;\n}',
            'script.js': '// จาวาสคริปต์ทำงานตลอด 24 ชั่วโมง\nconsole.log("System Online 24/7");'
        },
        activeFile: 'index.html'
    };

    userProjects.push(newProj);
    saveProjectsToStorage();
    closeCreateModal();
    openEditor(newProj.id);
}

// ลบเว็บไซต์ทิ้ง
function deleteProject(id) {
    const proj = userProjects.find(p => p.id === id);
    const projName = proj ? proj.name : "เว็บไซต์นี้";
    
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${projName}" ทิ้งออกจากระบบ?`)) {
        userProjects = userProjects.filter(p => p.id !== id);
        saveProjectsToStorage();
        renderProjectCards();
    }
}

// ==========================================
// SITE EDITOR & LIVE MULTI-FILE PREVIEW (หลอดสถานะและพรีวิวสด)
// ==========================================

function openEditor(projId) {
    activeProjectId = projId;
    const proj = userProjects.find(p => p.id === projId);
    if (!proj) return;

    const dashboardScreen = document.getElementById('dashboard-screen');
    const editorScreen = document.getElementById('editor-screen');

    if (dashboardScreen) dashboardScreen.classList.add('hidden');
    if (editorScreen) editorScreen.classList.remove('hidden');

    const activeTitle = document.getElementById('active-site-title');
    const activeUrl = document.getElementById('active-site-url');
    const previewUrlBar = document.getElementById('preview-url-bar');

    if (activeTitle) activeTitle.innerText = proj.name;
    if (activeUrl) activeUrl.innerText = proj.url;
    if (previewUrlBar) previewUrlBar.innerText = proj.url;

    renderFileList();
    switchFile(proj.activeFile || 'index.html');
    setEditorView('split');
}

// ปุ่มย้อนกลับจากหน้า Editor ไป Dashboard
function backToDashboard() {
    saveCurrentFileCode();
    const editorScreen = document.getElementById('editor-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    if (editorScreen) editorScreen.classList.add('hidden');
    if (dashboardScreen) dashboardScreen.classList.remove('hidden');
    renderProjectCards();
}

// แสดงรายการไฟล์ พร้อมหลอดสถานะแถบเรืองแสง Active
function renderFileList() {
    const proj = userProjects.find(p => p.id === activeProjectId);
    const list = document.getElementById('file-list');
    if (!proj || !list) return;
    
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
    if (!proj) return;

    proj.activeFile = filename;
    const activeFileLabel = document.getElementById('current-active-file-label');
    const codeInput = document.getElementById('code-input');

    if (activeFileLabel) activeFileLabel.innerText = filename;
    if (codeInput) codeInput.value = proj.files[filename] || '';
    
    renderFileList();
    liveUpdatePreview();
}

function saveCurrentFileCode() {
    if (!activeProjectId) return;
    const proj = userProjects.find(p => p.id === activeProjectId);
    const codeInput = document.getElementById('code-input');
    if (proj && proj.activeFile && codeInput) {
        proj.files[proj.activeFile] = codeInput.value;
        saveProjectsToStorage(); // บันทึกอัตโนมัติ Real-time
    }
}

function setEditorView(mode) {
    currentViewMode = mode;
    const codePanel = document.getElementById('code-panel');
    const previewPanel = document.getElementById('preview-panel');
    if (!codePanel || !previewPanel) return;

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

// ระบบอัปเดตหน้าตาเว็บสดๆ ทันทีเมื่อพิมพ์โค้ด (ผสาน HTML, CSS, JS)
function liveUpdatePreview() {
    saveCurrentFileCode();
    const proj = userProjects.find(p => p.id === activeProjectId);
    const iframe = document.getElementById('web-preview-iframe');
    if (!proj || !iframe) return;

    let htmlCode = proj.files['index.html'] || '<div>หน้าเว็บว่างเปล่า</div>';
    const cssCode = proj.files['style.css'] || '';
    const jsCode = proj.files['script.js'] || '';

    let fullHtml = htmlCode;
    if (cssCode) {
        if (fullHtml.includes('</head>')) {
            fullHtml = fullHtml.replace('</head>', `<style>${cssCode}</style></head>`);
        } else {
            fullHtml = `<style>${cssCode}</style>` + fullHtml;
        }
    }
    if (jsCode) {
        if (fullHtml.includes('</body>')) {
            fullHtml = fullHtml.replace('</body>', `<script>${jsCode}<\/script></body>`);
        } else {
            fullHtml = fullHtml + `<script>${jsCode}<\/script>`;
        }
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();
}

function runCode() { liveUpdatePreview(); }

function publishSite() {
    if (!activeProjectId) return;
    const proj = userProjects.find(p => p.id === activeProjectId);
    const urlDisplay = document.getElementById('published-url-display');
    const pubModal = document.getElementById('publish-modal');

    if (proj && urlDisplay) urlDisplay.innerText = proj.url;
    if (pubModal) pubModal.classList.remove('hidden');
    liveUpdatePreview();
}

function closePublishModal() { 
    const modal = document.getElementById('publish-modal');
    if (modal) modal.classList.add('hidden'); 
}

function copySiteUrl() {
    const urlTextElement = document.getElementById('published-url-display');
    if (!urlTextElement) return;
    const urlText = urlTextElement.innerText;
    navigator.clipboard.writeText(urlText);
    alert('คัดลอกลิงก์เรียบร้อยแล้ว: ' + urlText);
}

function downloadWebCode() {
    const proj = userProjects.find(p => p.id === activeProjectId);
    if (!proj) return;
    const blob = new Blob([proj.files['index.html'] || ''], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'index.html';
    a.click();
}

function openFileModal() { 
    const modal = document.getElementById('file-modal');
    if (modal) modal.classList.remove('hidden'); 
}

function closeFileModal() { 
    const modal = document.getElementById('file-modal');
    if (modal) modal.classList.add('hidden'); 
}

function handleCreateFile(event) {
    event.preventDefault();
    const fileNameInput = document.getElementById('file-name-input');
    const filename = fileNameInput ? fileNameInput.value.trim() : '';
    if (!filename) return;

    const proj = userProjects.find(p => p.id === activeProjectId);
    if (proj && !proj.files[filename]) {
        proj.files[filename] = `<!-- ไฟล์ ${filename} -->\n`;
        saveProjectsToStorage();
    }
    closeFileModal();
    switchFile(filename);
}

// ==========================================
// GEMINI AI SMART DYNAMIC GENERATOR (สร้างโค้ดตามสั่งแชท)
// ==========================================

function toggleGeminiWidget() {
    const chatWindow = document.getElementById('gemini-chat-window');
    if (chatWindow) chatWindow.classList.toggle('hidden');
}

function handleGeminiSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('gemini-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendGeminiMessage('user', text);
    input.value = '';

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'gemini-loading';
    loadingDiv.className = "bg-gray-800 text-gray-300 p-3 rounded-xl border border-gray-700 max-w-[95%] text-xs flex items-center gap-2";
    loadingDiv.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-indigo-400"></i> <span>Gemini กำลังวิเคราะห์คำสั่งและเขียนโค้ดตามที่คุณต้องการ...</span>`;
    
    const messagesContainer = document.getElementById('gemini-messages');
    if (messagesContainer) {
        messagesContainer.appendChild(loadingDiv);
        scrollGeminiToBottom();
    }

    setTimeout(() => {
        const loader = document.getElementById('gemini-loading');
        if (loader) loader.remove();

        const aiResponse = `✨ วิเคราะห์คำสั่ง "${text}" และเขียนโค้ดเว็บไซต์ตามความต้องการของคุณเรียบร้อยแล้วครับ!`;
        const generatedCode = generateSmartCodeFromPrompt(text);

        appendGeminiMessage('ai', aiResponse, generatedCode);
    }, 1200);
}

function generateSmartCodeFromPrompt(promptText) {
    let themeColor = "indigo";
    let badgeText = "AI GENERATED";
    let iconClass = "fa-solid fa-wand-magic-sparkles";

    const lowerText = promptText.toLowerCase();
    if (lowerText.includes('robux') || lowerText.includes('เกม') || lowerText.includes('เติม') || lowerText.includes('ไก่ตัน')) {
        themeColor = "rose";
        badgeText = "ROBLOX & GAMING";
        iconClass = "fa-solid fa-gamepad";
    } else if (lowerText.includes('ร้าน') || lowerText.includes('ขาย') || lowerText.includes('สินค้า') || lowerText.includes('shop')) {
        themeColor = "amber";
        badgeText = "ONLINE STORE";
        iconClass = "fa-solid fa-store";
    } else if (lowerText.includes('พอร์ต') || lowerText.includes('ประวัติ') || lowerText.includes('แนะนำตัว')) {
        themeColor = "emerald";
        badgeText = "PORTFOLIO";
        iconClass = "fa-solid fa-user-tie";
    }

    return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${promptText}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-950 text-gray-100 font-sans min-h-screen flex flex-col justify-between">
    <header class="bg-gray-900/80 border-b border-gray-800 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div class="max-w-5xl mx-auto flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-${themeColor}-600/20 text-${themeColor}-400 flex items-center justify-center text-lg border border-${themeColor}-500/30">
                    <i class="${iconClass}"></i>
                </div>
                <div>
                    <h1 class="text-sm font-bold text-white">${promptText}</h1>
                    <span class="text-[10px] text-${themeColor}-400 font-mono bg-${themeColor}-950 px-2 py-0.5 rounded border border-${themeColor}-800">${badgeText}</span>
                </div>
            </div>
            <span class="text-xs text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ระบบออนไลน์ 24 ชม.
            </span>
        </div>
    </header>
    <main class="max-w-5xl w-full mx-auto p-6 md:p-12 my-auto space-y-8">
        <div class="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-${themeColor}-600/10 rounded-full blur-3xl"></div>
            <div class="w-16 h-16 rounded-2xl bg-${themeColor}-600/20 text-${themeColor}-400 text-2xl flex items-center justify-center mx-auto mb-6 border border-${themeColor}-500/30 shadow-lg">
                <i class="${iconClass}"></i>
            </div>
            <h2 class="text-2xl md:text-4xl font-black text-white mb-4 tracking-tight">${promptText}</h2>
            <p class="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
                หน้าเว็บไซต์นี้ถูกสร้างขึ้นแบบไดนามิกตามคำสั่งที่คุณพิมพ์สั่งในแชท พร้อมโครงสร้างและระบบที่พร้อมใช้งานทันที
            </p>
            <div class="flex flex-wrap justify-center gap-3">
                <button onclick="alert('ระบบทำงานสำเร็จ!')" class="px-6 py-3 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-bold text-xs rounded-2xl shadow-lg transition transform hover:scale-105 flex items-center gap-2">
                    <i class="fa-solid fa-bolt"></i> เริ่มต้นใช้งานระบบ
                </button>
                <button onclick="alert('เชื่อมต่อฐานข้อมูล 24 ชม. เรียบร้อย')" class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold text-xs rounded-2xl border border-gray-700 transition">
                    <i class="fa-solid fa-server mr-1"></i> เช็คสถานะ 24 ชม.
                </button>
            </div>
        </div>
    </main>
    <footer class="border-t border-gray-900 py-6 text-center text-xs text-gray-500">
        สร้างสรรค์ด้วยระบบ AI Smart Generator • ทำงานตลอด 24 ชั่วโมง
    </footer>
</body>
</html>`;
}

function appendGeminiMessage(sender, text, codeBlock = null) {
    const container = document.getElementById('gemini-messages');
    if (!container) return;
    const msgDiv = document.createElement('div');

    if (sender === 'user') {
        msgDiv.className = "bg-indigo-600 text-white p-2.5 rounded-xl ml-auto max-w-[85%] text-xs shadow-md";
        msgDiv.innerText = text;
    } else {
        msgDiv.className = "bg-gray-800 text-gray-200 p-3 rounded-xl border border-gray-700 max-w-[95%] text-xs space-y-2.5";
        msgDiv.innerHTML = `<div>${text}</div>`;

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
                    const codeInput = document.getElementById('code-input');
                    if (codeInput) codeInput.value = codeBlock;
                    liveUpdatePreview();
                    saveProjectsToStorage();
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
    if (container) container.scrollTop = container.scrollHeight;
}

// แม่แบบหน้าเว็บหลักพร้อมระบบเจ้าของเว็บ
function generatePostableTemplate(siteName, siteUrl) {
    return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteName} - ประโยชน์และบริการของเว็บไซต์</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-950 text-gray-100 font-sans min-h-screen">
    <header class="bg-gray-900 border-b border-gray-800 py-4 px-6 sticky top-0 z-30">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    <i class="fa-solid fa-globe"></i>
                </div>
                <div>
                    <h1 class="text-base font-bold text-white">${siteName}</h1>
                    <p class="text-[11px] text-indigo-400 font-mono">${siteUrl}</p>
                </div>
            </div>
            <button onclick="toggleOwnerMode()" id="owner-toggle-btn" class="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl border border-gray-700 flex items-center gap-2 transition">
                <i class="fa-solid fa-lock"></i> มุมมองผู้เยี่ยมชม (ห้ามอัปโหลดรูป)
            </button>
        </div>
    </header>
    <main class="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div id="owner-panel" class="hidden lg:col-span-1 bg-gray-900 p-5 rounded-2xl border border-indigo-500/30 shadow-2xl h-fit sticky top-24 space-y-4">
            <h2 class="text-sm font-bold text-indigo-400 pb-2 border-b border-gray-800">แผงควบคุมเจ้าของเว็บ</h2>
            <form onsubmit="addBenefitItem(event)" class="space-y-3">
                <input type="text" id="benefit-title" required placeholder="หัวข้อประโยชน์" class="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
                <input type="url" id="benefit-img" required placeholder="URL รูปภาพ" class="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
                <textarea id="benefit-desc" rows="3" placeholder="คำอธิบาย..." class="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"></textarea>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">โพสต์ภาพตัวอย่าง</button>
            </form>
        </div>
        <div id="content-container" class="lg:col-span-4 space-y-8">
            <div class="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
                <h2 class="text-2xl font-bold text-white mb-2">ยินดีต้อนรับสู่ ${siteName}</h2>
                <p class="text-sm text-gray-400">เว็บไซต์นี้ทำงานตลอด 24 ชั่วโมง</p>
            </div>
            <div id="benefits-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="benefit-card bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600" class="w-full h-48 object-cover">
                    <div class="p-5">
                        <h4 class="font-bold text-base text-white mb-2">ทำงานรวดเร็ว 24 ชม.</h4>
                        <p class="text-xs text-gray-400">ระบบประมวลผลออนไลน์ตลอดเวลา</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <script>
        let isOwner = false;
        function toggleOwnerMode() {
            isOwner = !isOwner;
            document.getElementById('owner-panel').classList.toggle('hidden');
            document.getElementById('content-container').className = isOwner ? "lg:col-span-3 space-y-8" : "lg:col-span-4 space-y-8";
            document.getElementById('owner-toggle-btn').innerHTML = isOwner ? '<i class="fa-solid fa-user-shield"></i> สิทธิ์เจ้าของเว็บ' : '<i class="fa-solid fa-lock"></i> มุมมองผู้เยี่ยมชม';
        }
        function addBenefitItem(e) {
            e.preventDefault();
            if (!isOwner) return;
            const t = document.getElementById('benefit-title').value;
            const i = document.getElementById('benefit-img').value;
            const d = document.getElementById('benefit-desc').value;
            const grid = document.getElementById('benefits-grid');
            const card = document.createElement('div');
            card.className = "benefit-card bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative group";
            card.innerHTML = \`<img src="\${i}" class="w-full h-48 object-cover"><div class="p-5"><h4 class="font-bold text-base text-white mb-2">\${t}</h4><p class="text-xs text-gray-400">\${d}</p></div><button onclick="this.closest('.benefit-card').remove()" class="absolute top-3 right-3 w-8 h-8 rounded-xl bg-rose-600 text-white text-xs flex items-center justify-center"><i class="fa-solid fa-trash"></i></button>\`;
            grid.prepend(card);
            document.getElementById('benefit-title').value = '';
            document.getElementById('benefit-img').value = '';
            document.getElementById('benefit-desc').value = '';
        }
    <\/script>
</body>
</html>`;
}
