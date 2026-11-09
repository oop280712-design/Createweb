// ==========================================
// GITHUB-STYLE REPOSITORY & FILE MANAGEMENT
// ==========================================
let currentUser = null;
let currentAuthMode = 'login';
let userProjects = JSON.parse(localStorage.getItem('webbuilder_repos') || '[]');
let activeProjectId = null;
let currentViewMode = 'split';

// บันทึกข้อมูลลงหน่วยความจำแบบจำลอง Repository
function saveRepoStorage() {
    localStorage.setItem('webbuilder_repos', JSON.stringify(userProjects));
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

function handleAuthSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('input-email');
    const nameInput = document.getElementById('input-name');
    
    const email = emailInput ? emailInput.value : 'developer@github.com';
    const name = (nameInput && nameInput.value.trim() !== '') ? nameInput.value : email.split('@')[0];
    
    currentUser = { name, email };
    showDashboard();
}

function loginWithGoogle() {
    currentUser = { name: 'GitHub Developer', email: 'user@github.com' };
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

    renderRepositoryCards();
}

// ==========================================
// REPOSITORY DASHBOARD (หน้ารวมโปรเจกต์)
// ==========================================

function renderRepositoryCards() {
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
                        <i class="fa-solid fa-book-bookmark"></i>
                    </span>
                    <button onclick="deleteRepository('${proj.id}')" title="ลบ Repository นี้" class="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition">
                        <i class="fa-regular fa-trash-can"></i> Delete
                    </button>
                </div>
                <h3 class="font-bold text-white text-base group-hover:text-indigo-400 transition mb-1">${proj.name}</h3>
                <p class="text-xs text-indigo-400 font-mono mb-4 truncate">${proj.url}</p>
            </div>
            
            <div class="pt-4 border-t border-gray-800 flex items-center justify-between gap-2">
                <span class="text-xs text-gray-500"><i class="fa-solid fa-code-commit"></i> ${Object.keys(proj.files).length} files</span>
                <button onclick="openEditor('${proj.id}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-code"></i> Code Repository
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

// สร้าง Repository ใหม่ พร้อมโครงสร้างแยก 3 ไฟล์มาตรฐาน
function handleCreateSite(event) {
    event.preventDefault();
    const nameInput = document.getElementById('site-name-input');
    const urlSubInput = document.getElementById('site-url-input');
    const tldCustomInput = document.getElementById('site-tld-custom');

    const name = nameInput ? nameInput.value : 'my-repo';
    const urlSub = urlSubInput ? urlSubInput.value : 'my-repo';
    let tld = tldCustomInput ? tldCustomInput.value.trim() : 'com';
    
    if (tld.startsWith('.')) tld = tld.substring(1);
    const fullUrl = `https://${urlSub}.${tld}`;

    const newProj = {
        id: 'repo_' + Date.now(),
        name: name,
        url: fullUrl,
        files: {
            'index.html': `<!DOCTYPE html>\n<html lang="th">\n<head>\n    <meta charset="UTF-8">\n    <title>${name}</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="container">\n        <h1>Welcome to ${name}</h1>\n        <p>Repository initialized successfully.</p>\n    </div>\n    <script src="script.js"><\\/script>\n</body>\n</html>`,
            'style.css': `/* CSS File - Managed by Repository */\nbody {\n    background-color: #030712;\n    color: #ffffff;\n    font-family: sans-serif;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 100vh;\n    margin: 0;\n}\n.container {\n    text-align: center;\n    background: #111827;\n    padding: 3rem;\n    border-radius: 1rem;\n    border: 1px solid #1f2937;\n}`,
            'script.js': `// JavaScript File - Managed by Repository\nconsole.log("${name} Repository Loaded 24/7");`
        },
        activeFile: 'index.html'
    };

    userProjects.push(newProj);
    saveRepoStorage();
    closeCreateModal();
    openEditor(newProj.id);
}

function deleteRepository(id) {
    const proj = userProjects.find(p => p.id === id);
    const projName = proj ? proj.name : "Repository นี้";
    
    if (confirm(`คุณต้องการลบ Repository "${projName}" นี้ทิ้งหรือไม่?`)) {
        userProjects = userProjects.filter(p => p.id !== id);
        saveRepoStorage();
        renderRepositoryCards();
    }
}

// ==========================================
// GITHUB-STYLE CODE EDITOR & FILE TREE
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

    renderFileTree();
    switchFile(proj.activeFile || 'index.html');
    setEditorView('split');
}

function backToDashboard() {
    saveCurrentFileCode();
    const editorScreen = document.getElementById('editor-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    if (editorScreen) editorScreen.classList.add('hidden');
    if (dashboardScreen) dashboardScreen.classList.remove('hidden');
    renderRepositoryCards();
}

// แสดงแถบ File Tree เหมือนแถวซ้ายของ GitHub Repository
function renderFileTree() {
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
            ${isSelected ? '<span class="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]"></span>' : ''}
            ${isSelected ? '<span class="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded">Active</span>' : ''}
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
    
    renderFileTree();
    compileAndPreview();
}

function saveCurrentFileCode() {
    if (!activeProjectId) return;
    const proj = userProjects.find(p => p.id === activeProjectId);
    const codeInput = document.getElementById('code-input');
    if (proj && proj.activeFile && codeInput) {
        proj.files[proj.activeFile] = codeInput.value;
        saveRepoStorage(); // บันทึกแยกไฟล์อัตโนมัติแบบ Real-time
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

// อ่านโค้ดแต่ละไฟล์แล้วประกอบกันแบบมืออาชีพ (Clean Compilation like GitHub Pages)
function compileAndPreview() {
    saveCurrentFileCode();
    const proj = userProjects.find(p => p.id === activeProjectId);
    const iframe = document.getElementById('web-preview-iframe');
    if (!proj || !iframe) return;

    let htmlCode = proj.files['index.html'] || '';
    let cssCode = proj.files['style.css'] || '';
    let jsCode = proj.files['script.js'] || '';

    // แทนที่ลิงก์ไฟล์ภายในด้วยโค้ดจริงอย่างสะอาดหมดจด
    let compiledHtml = htmlCode;
    
    if (cssCode) {
        if (compiledHtml.includes('</head>')) {
            compiledHtml = compiledHtml.replace('</head>', `<style>\n${cssCode}\n</style>\n</head>`);
        } else {
            compiledHtml = `<style>\n${cssCode}\n</style>\n` + compiledHtml;
        }
    }

    if (jsCode) {
        if (compiledHtml.includes('</body>')) {
            compiledHtml = compiledHtml.replace('</body>', `<script>\n${jsCode}\n</script>\n</body>`);
        } else {
            compiledHtml = compiledHtml + `\n<script>\n${jsCode}\n</script>`;
        }
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(compiledHtml);
    iframeDoc.close();
}

function runCode() { compileAndPreview(); }

function publishSite() {
    if (!activeProjectId) return;
    const proj = userProjects.find(p => p.id === activeProjectId);
    const urlDisplay = document.getElementById('published-url-display');
    const pubModal = document.getElementById('publish-modal');

    if (proj && urlDisplay) urlDisplay.innerText = proj.url;
    if (pubModal) pubModal.classList.remove('hidden');
    compileAndPreview();
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
    alert('คัดลอกลิงก์สำเร็จ: ' + urlText);
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
        proj.files[filename] = `// New file: ${filename}\n`;
        saveRepoStorage();
    }
    closeFileModal();
    switchFile(filename);
}

// ==========================================
// GEMINI AI ASSISTANT (อ่านและแปลผลโค้ดแยกไฟล์)
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
    loadingDiv.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-indigo-400"></i> <span>Gemini กำลังประมวลผลโค้ดโครงสร้าง...</span>`;
    
    const messagesContainer = document.getElementById('gemini-messages');
    if (messagesContainer) {
        messagesContainer.appendChild(loadingDiv);
        scrollGeminiToBottom();
    }

    setTimeout(() => {
        const loader = document.getElementById('gemini-loading');
        if (loader) loader.remove();

        const aiResponse = `✨ วิเคราะห์คำสั่ง "${text}" และจัดโครงสร้างชุดโค้ดแยกไฟล์ให้เรียบร้อยแล้วครับ!`;
        const generatedCode = generateRepositoryTemplate(text);

        appendGeminiMessage('ai', aiResponse, generatedCode);
    }, 1200);
}

function generateRepositoryTemplate(promptText) {
    const lowerText = promptText.toLowerCase();

    if (lowerText.includes('robux') || lowerText.includes('เกม') || lowerText.includes('เติม') || lowerText.includes('ไก่ตัน')) {
        return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BloxShop - Roblox & Game Topup</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-950 text-gray-100 font-sans min-h-screen">
    <header class="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <h1 class="font-bold text-lg text-white">BloxShop 24H</h1>
        <span class="text-xs text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">ระบบอัตโนมัติ</span>
    </header>
    <main class="max-w-4xl mx-auto p-6 space-y-6">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 class="text-lg font-bold text-white mb-4"><i class="fa-solid fa-coins text-amber-400"></i> เติม Robux อัตโนมัติ</h2>
            <form onsubmit="alert('เติมเงินสำเร็จ!'); event.preventDefault();" class="space-y-4">
                <input type="text" placeholder="Roblox Username" required class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white">
                <select class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white">
                    <option>500 Robux - 160 บาท</option>
                    <option>1000 Robux - 300 บาท</option>
                </select>
                <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl">ยืนยันการเติมเงิน</button>
            </form>
        </div>
    </main>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>${promptText}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-6">
    <div class="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center max-w-lg w-full">
        <h1 class="text-2xl font-bold mb-3">${promptText}</h1>
        <p class="text-gray-400 text-sm mb-6">สร้างโครงสร้าง Repository และคอมไพล์โค้ดแบบมืออาชีพเรียบร้อย</p>
        <button onclick="alert('ระบบทำงานปกติ')" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl">ทดสอบระบบ</button>
    </div>
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
            applyBtn.innerHTML = `<i class="fa-solid fa-code-merge"></i> นำโค้ดไปอัปเดตไฟล์ index.html ใน Repository ทันที`;
            applyBtn.onclick = () => {
                if (!activeProjectId) {
                    alert('กรุณาเลือก Repository ก่อนครับ');
                    return;
                }
                const proj = userProjects.find(p => p.id === activeProjectId);
                if (proj) {
                    proj.files['index.html'] = codeBlock;
                    const codeInput = document.getElementById('code-input');
                    if (codeInput) codeInput.value = codeBlock;
                    compileAndPreview();
                    saveRepoStorage();
                    alert('อัปเดตไฟล์ index.html เรียบร้อยแล้ว!');
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
