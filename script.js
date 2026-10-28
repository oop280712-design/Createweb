// ฟังก์ชันจัดการเมื่อกดเข้าสู่ระบบหรือสมัครสมาชิก
function handleAuthSubmit(event) {
    event.preventDefault();
    
    // ป้องกันการดึงค่า Element พลาดจนทำให้เว็บค้าง
    const emailInput = document.getElementById('input-email');
    const nameInput = document.getElementById('input-name');
    
    const email = emailInput ? emailInput.value : 'user@example.com';
    const name = (nameInput && nameInput.value.trim() !== '') ? nameInput.value : email.split('@')[0];
    
    currentUser = { name, email };
    
    // เรียกใช้งานหน้า Dashboard อย่างปลอดภัย
    showDashboard();
}

// ฟังก์ชันเข้าสู่ระบบด้วย Google
function loginWithGoogle() {
    currentUser = { name: 'Google User', email: 'user@gmail.com' };
    showDashboard();
}

// ฟังก์ชันแสดงหน้า Dashboard (หน้ารวมเว็บไซต์) แบบปลอดภัยไม่ให้ค้าง
function showDashboard() {
    const authScreen = document.getElementById('auth-screen');
    const editorScreen = document.getElementById('editor-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    // ซ่อน/แสดงหน้าจออย่างรัดกุม
    if (authScreen) authScreen.classList.add('hidden');
    if (editorScreen) editorScreen.classList.add('hidden');
    if (dashboardScreen) dashboardScreen.classList.remove('hidden');

    // อัปเดตข้อมูลผู้ใช้บน Header
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay) nameDisplay.innerText = currentUser.name;

    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) userAvatar.innerText = currentUser.name.charAt(0).toUpperCase();

    // โหลดรายการโปรเจกต์
    renderProjectCards();
}
