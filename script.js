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

// รองรับการพิมพ์นามสกุลโดเมนอิสระ
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
            'index.html': generatePostableTemplate(name, fullUrl)
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

function renderFileList() {
    const proj = userProjects.find(p => p.id === activeProjectId);
    const list = document.getElementById('file-list');
    list.innerHTML = '';

    Object.keys(proj.files).forEach(filename => {
        const isSelected = filename === proj.activeFile;
        const btn = document.createElement('button');
        btn.onclick = () => switchFile(filename);
        btn.className = `w-full px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition ${isSelected ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`;
        btn.innerHTML = `<span class="flex items-center gap-2"><i class="fa-regular fa-file-code"></i> ${filename}</span>`;
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

// GEMINI AI ASSISTANT LOGIC
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

    setTimeout(() => {
        const aiResponse = `สร้างโค้ดสำหรับ "${text}" เรียบร้อยครับ!`;
        const codeBlock = `<div style="background:#1e1b4b;color:#fff;padding:20px;text-align:center;border-radius:12px;">\n  <h2>${text}</h2>\n  <p>ออกแบบโดย Gemini AI Assistant</p>\n</div>`;
        appendGeminiMessage('ai', aiResponse, codeBlock);
    }, 600);
}

function appendGeminiMessage(sender, text, codeBlock = null) {
    const container = document.getElementById('gemini-messages');
    const msgDiv = document.createElement('div');

    if (sender === 'user') {
        msgDiv.className = "bg-indigo-600 text-white p-2.5 rounded-xl ml-auto max-w-[85%] text-xs";
        msgDiv.innerText = text;
    } else {
        msgDiv.className = "bg-gray-800 text-gray-200 p-3 rounded-xl border border-gray-700 max-w-[95%] text-xs space-y-2";
        msgDiv.innerHTML = `<div>${text}</div>`;

        if (codeBlock) {
            const applyBtn = document.createElement('button');
            applyBtn.className = "mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-sans text-xs font-semibold flex items-center justify-center gap-1";
            applyBtn.innerHTML = `<i class="fa-solid fa-file-import"></i> นำโค้ดไปใส่ในไฟล์`;
            applyBtn.onclick = () => {
                const proj = userProjects.find(p => p.id === activeProjectId);
                proj.files[proj.activeFile] = codeBlock;
                document.getElementById('code-input').value = codeBlock;
                liveUpdatePreview();
                alert('อัปเดตโค้ดเข้าสู่ไฟล์เรียบร้อย!');
            };
            msgDiv.appendChild(applyBtn);
        }
    }
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// แม่แบบเว็บไซต์ (จำกัดสิทธิ์อัปโหลดรูปภาพเฉพาะเจ้าของเว็บเท่านั้น)
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

            <!-- ปุ่มสลับโหมดเจ้าของเว็บ (ผู้สร้างเว็บเท่านั้น) -->
            <button onclick="toggleOwnerMode()" id="owner-toggle-btn" class="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl border border-gray-700 flex items-center gap-2 transition">
                <i class="fa-solid fa-lock"></i> มุมมองผู้เยี่ยมชม (ห้ามอัปโหลดรูป)
            </button>
        </div>
    </header>

    <main class="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- แผงอัปโหลดรูปเฉพาะเจ้าของเว็บเท่านั้น -->
        <div id="owner-panel" class="hidden lg:col-span-1 bg-gray-900 p-5 rounded-2xl border border-indigo-500/30 shadow-2xl h-fit sticky top-24 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-gray-800">
                <h2 class="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <i class="fa-solid fa-user-shield"></i> แผงควบคุมเจ้าของเว็บ
                </h2>
                <span class="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">ผู้สร้างเว็บเท่านั้น</span>
            </div>

            <form onsubmit="addBenefitItem(event)" class="space-y-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">หัวข้อประโยชน์ / จุดเด่น</label>
                    <input type="text" id="benefit-title" required placeholder="เช่น ประหยัดเวลา, ใช้งานง่าย" class="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">URL รูปภาพตัวอย่าง</label>
                    <input type="url" id="benefit-img" required placeholder="https://images.unsplash.com/..." class="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">คำอธิบายรายละเอียดประโยชน์</label>
                    <textarea id="benefit-desc" rows="3" placeholder="อธิบายว่าฟีเจอร์นี้มีประโยชน์อย่างไร..." class="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"></textarea>
                </div>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20">
                    <i class="fa-solid fa-plus mr-1"></i> โพสต์ภาพตัวอย่าง & ประโยชน์
                </button>
            </form>
        </div>

        <div id="content-container" class="lg:col-span-4 space-y-8">
            <div class="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-gray-900 border border-indigo-500/20 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden">
                <div class="max-w-2xl mx-auto">
                    <span class="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800 mb-3 inline-block">Official Website</span>
                    <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">ยินดีต้อนรับสู่ ${siteName}</h2>
                    <p class="text-sm text-gray-300 leading-relaxed">เว็บไซต์นี้ออนไลน์และทำงานต่อเนื่อง 24 ชั่วโมง ด้านล่างคือภาพตัวอย่างและประโยชน์ของเว็บไซต์ครับ</p>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-star text-amber-400"></i> ประโยชน์และจุดเด่นของเว็บไซต์
                        </h3>
                        <p class="text-xs text-gray-400">ภาพตัวอย่างและผลงานที่ผู้สร้างเว็บไซต์นำมาเผยแพร่</p>
                    </div>
                </div>

                <div id="benefits-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="benefit-card bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition relative">
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600" class="w-full h-48 object-cover">
                        <div class="p-5">
                            <h4 class="font-bold text-base text-white mb-2 flex items-center gap-2">
                                <i class="fa-solid fa-bolt text-indigo-400"></i> ประมวลผลและทำงาน 24 ชั่วโมง
                            </h4>
                            <p class="text-xs text-gray-400 leading-relaxed">ระบบเว็บไซต์ทำงานแบบไร้รอยต่อ ให้ผู้ใช้งานเข้าถึงข้อมูลและดูภาพตัวอย่างได้ตลอดเวลา</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        let isOwner = false;

        function toggleOwnerMode() {
            isOwner = !isOwner;
            const panel = document.getElementById('owner-panel');
            const contentContainer = document.getElementById('content-container');
            const btn = document.getElementById('owner-toggle-btn');

            if (isOwner) {
                panel.classList.remove('hidden');
                contentContainer.className = "lg:col-span-3 space-y-8";
                btn.className = "px-3.5 py-2 bg-indigo-600 text-white text-xs rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30";
                btn.innerHTML = '<i class="fa-solid fa-user-shield"></i> สิทธิ์เจ้าของเว็บ (อัปโหลดรูปภาพได้)';
            } else {
                panel.classList.add('hidden');
                contentContainer.className = "lg:col-span-4 space-y-8";
                btn.className = "px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl border border-gray-700 flex items-center gap-2 transition";
                btn.innerHTML = '<i class="fa-solid fa-lock"></i> มุมมองผู้เยี่ยมชม (ห้ามอัปโหลดรูป)';
            }
            renderDeleteButtons();
        }

        function addBenefitItem(e) {
            e.preventDefault();
            if (!isOwner) return;

            const title = document.getElementById('benefit-title').value;
            const img = document.getElementById('benefit-img').value;
            const desc = document.getElementById('benefit-desc').value;

            const grid = document.getElementById('benefits-grid');
            const card = document.createElement('div');
            card.className = "benefit-card bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition relative group";
            card.innerHTML = \`
                <div>
                    <img src="\${img}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/600x300?text=Image+Error'">
                    <div class="p-5">
                        <h4 class="font-bold text-base text-white mb-2 flex items-center gap-2">
                            <i class="fa-solid fa-check-circle text-indigo-400"></i> \${title}
                        </h4>
                        <p class="text-xs text-gray-400 leading-relaxed">\${desc}</p>
                    </div>
                </div>
                \${isOwner ? '<button onclick="this.closest(\\'div.benefit-card\\').remove();" class="delete-btn absolute top-3 right-3 w-8 h-8 rounded-xl bg-rose-600/90 text-white text-xs flex items-center justify-center hover:bg-rose-500 transition shadow-lg"><i class="fa-solid fa-trash"></i></button>' : ''}
            \`;

            grid.prepend(card);
            document.getElementById('benefit-title').value = '';
            document.getElementById('benefit-img').value = '';
            document.getElementById('benefit-desc').value = '';
        }

        function renderDeleteButtons() {
            const cards = document.querySelectorAll('.benefit-card');
            cards.forEach(card => {
                let delBtn = card.querySelector('.delete-btn');
                if (isOwner && !delBtn) {
                    const btn = document.createElement('button');
                    btn.className = "delete-btn absolute top-3 right-3 w-8 h-8 rounded-xl bg-rose-600/90 text-white text-xs flex items-center justify-center hover:bg-rose-500 transition shadow-lg";
                    btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    btn.onclick = () => card.remove();
                    card.classList.add('relative');
                    card.appendChild(btn);
                } else if (!isOwner && delBtn) {
                    delBtn.remove();
                }
            });
        }
    <\/script>
</body>
</html>`;
}
