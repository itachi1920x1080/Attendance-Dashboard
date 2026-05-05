document.addEventListener('DOMContentLoaded', () => {
    const hasChartJs = typeof Chart !== 'undefined';

    /* ==============================
       1. Tab Switching Logic
       ============================== */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.tab-section');
    let chartsInitialized = false;

    function switchToTab(targetId) {
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
        if(activeLink) activeLink.classList.add('active');
        
        const targetSection = document.getElementById('tab-' + targetId);
        if(targetSection) targetSection.classList.add('active');

        if (targetId === 'dashboard' && !chartsInitialized) {
            initCharts();
            chartsInitialized = true;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab(link.getAttribute('data-target'));
        });
    });

    /* ==============================
       2. Profile Menu & Logout Logic
       ============================== */
    const profileToggle = document.getElementById('profile-toggle');
    const profileMenu = document.getElementById('profile-menu');
    const viewProfileBtn = document.getElementById('view-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileModal = document.getElementById('profile-modal');
    const profileModalClose = document.getElementById('profile-modal-close');

    function closeProfileMenu() {
        if (!profileToggle || !profileMenu) return;
        profileMenu.hidden = true;
        profileToggle.setAttribute('aria-expanded', 'false');
    }

    function toggleProfileMenu() {
        if (!profileToggle || !profileMenu) return;
        const isOpen = !profileMenu.hidden;
        profileMenu.hidden = isOpen;
        profileToggle.setAttribute('aria-expanded', String(!isOpen));
    }

    function openProfileModal() {
        if (!profileModal) return;
        profileModal.hidden = false;
        closeProfileMenu();
    }

    function closeProfileModal() {
        if (!profileModal) return;
        profileModal.hidden = true;
    }

    window.logout = function() {
        closeProfileMenu();
        const shouldLogout = window.confirm('Do you want to logout?');

        if (!shouldLogout) return;

        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        window.showToast('Logout successful.', 'success');
    };

    if (profileToggle) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProfileMenu();
        });
    }

    if (viewProfileBtn) viewProfileBtn.addEventListener('click', openProfileModal);
    if (logoutBtn) logoutBtn.addEventListener('click', window.logout);
    if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);

    document.addEventListener('click', (e) => {
        if (profileMenu && profileToggle && !profileMenu.hidden && !profileToggle.contains(e.target) && !profileMenu.contains(e.target)) {
            closeProfileMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeProfileMenu();
        closeProfileModal();
    });

    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeProfileModal();
        });
    }

    /* ==============================
       2. Timetable Click-to-Class Logic
       ============================== */
    const timetableBlocks = document.querySelectorAll('.timetable-class');
    const courseSelect = document.getElementById('course-select');
    const groupSelect = document.getElementById('group-select');

    timetableBlocks.forEach(block => {
        block.addEventListener('click', () => {
            const courseId = block.getAttribute('data-course');
            const groupId = block.getAttribute('data-group');

            switchToTab('attendance');

            if (courseSelect) courseSelect.value = courseId;
            if (groupSelect) groupSelect.value = groupId;

            showToast(`បានផ្ទុកបញ្ជីឈ្មោះសម្រាប់ ${courseId}`, 'success');

            if (tbody) {
                tbody.style.opacity = '0.3';
                setTimeout(() => { tbody.style.opacity = '1'; }, 300);
            }
        });
    });

    /* ==============================
       3. Attendance Table & Logic
       ============================== */
       
    const students = [
        { id: '102447', name: 'Savannah Nguyen', status: 'present', img: '/static/image/photo_2025-09-25_09-24-34.jpg' },
        { id: '102177', name: 'Brooklyn Simmons', status: 'present', img: '/static/image/photo_2025-09-25_09-24-34.jpg' },
        { id: '102185', name: 'Darrell Steward', status: 'present', img: '/static/image/photo_2025-09-25_09-24-34.jpg' },
        { id: '102816', name: 'Marvin McKinney', status: 'present', img: '/static/image/photo_2025-09-25_09-24-34.jpg' },
        { id: '102429', name: 'Cameron Williamson', status: 'present', img: '/static/image/photo_2025-09-25_09-24-34.jpg' }
    ];

    const tbody = document.getElementById('student-table-body');
    const statPresent = document.getElementById('stat-present');
    const statAbsent = document.getElementById('stat-absent');

    function renderTable() {
        if (!tbody) return;
        tbody.innerHTML = ''; 
        students.forEach((student, index) => {
            const tr = document.createElement('tr');
            tr.style.transition = 'opacity 0.3s';
            tr.innerHTML = `
                <td style="color: var(--text-muted);">${student.id}</td>
                <td><div class="student-cell"><img src="${student.img}"><span style="font-weight: 600;">${student.name}</span></div></td>
                <td class="radio-center"><input type="radio" name="att_${index}" value="present" ${student.status === 'present' ? 'checked' : ''}></td>
                <td class="radio-center"><input type="radio" name="att_${index}" value="absent" ${student.status === 'absent' ? 'checked' : ''}></td>
                <td class="radio-center"><input type="radio" name="att_${index}" value="leave" ${student.status === 'leave' ? 'checked' : ''}></td>
            `;
            const radios = tr.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    student.status = e.target.value;
                    updateStats();
                });
            });
            tbody.appendChild(tr);
        });
        updateStats();
    }

    function updateStats() {
        if(statPresent) statPresent.textContent = students.filter(s => s.status === 'present').length;
        if(statAbsent) statAbsent.textContent = students.filter(s => s.status === 'absent').length;
    }

    renderTable();

    /* ==============================
       4. Toast Notification Logic
       ============================== */
    const toastEl = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    let toastTimeout;

    window.showToast = function(message, type) {
        if (!toastEl || !toastMsg || !toastIcon) return;
        toastMsg.textContent = message;
        toastEl.className = `toast show ${type}`;
        toastIcon.setAttribute('name', type === 'success' ? 'checkmark-circle' : 'alert-circle');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => { toastEl.classList.remove('show'); }, 3000);
    };

    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    if (saveAttendanceBtn) saveAttendanceBtn.addEventListener('click', () => {
        if (!students.every(s => s.status !== '')) {
            window.showToast('សូមស្រង់វត្តមានសិស្សទាំងអស់។', 'error');
        } else {
            window.showToast('រក្សាទុកទិន្នន័យវត្តមានជោគជ័យ!', 'success');
        }
    });

    /* ==============================
       5. Chart.js Initialization
       ============================== */
    function initCharts() {
        if (!hasChartJs) return;

        const lineChart = document.getElementById('lineChart');
        const barChart = document.getElementById('barChart');
        const donutChart = document.getElementById('donutChart');
        const radarChart = document.getElementById('radarChart');

        if (lineChart) new Chart(lineChart, {
            type: 'line', data: { labels: ['Jan 1', 'Jan 4', 'Jan 7', 'Jan 10', 'Jan 13', 'Jan 16', 'Jan 19', 'Jan 22', 'Jan 25', 'Jan 28'], datasets: [{ label: 'Attendance', data: [42, 45, 42, 44, 45, 45.5, 44, 45.5, 47, 43], borderColor: '#22c55e', borderWidth: 2, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#22c55e', fill: true, backgroundColor: 'rgba(34, 197, 94, 0.05)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 38, max: 48, grid:{color:'#f1f5f9'} }, x:{grid:{display:false}} } }
        });
        if (barChart) new Chart(barChart, {
            type: 'bar', data: { labels: ['I', 'II', 'III', 'IV', 'V', 'VI'], datasets: [{ data: [17, 18, 17, 19, 18, 20], backgroundColor: ['#e2e8f0', '#e2e8f0', '#e2e8f0', '#e2e8f0', '#e2e8f0', '#22c55e'], borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y:{display:false} } }
        });
        if (donutChart) new Chart(donutChart, {
            type: 'doughnut', data: { labels: ['Male', 'Female'], datasets: [{ data: [55, 45], backgroundColor: ['#22c55e', '#1e293b'], borderWidth: 0, cutout: '70%' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, layout: { padding: 10 } }
        });
        if (radarChart) new Chart(radarChart, {
            type: 'radar', data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: [8, 4, 2, 5, 9, 3, 1], borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.2)', pointBackgroundColor: '#22c55e' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false } } } }
        });
    }

    initCharts();
    chartsInitialized = true;

    /* ==============================
       6. Data: 30 Students (M5 & M6) Grades
       ============================== */
    const studentsData = [
        // Class M5 (15 Students)
        { id: '105001', name: 'Sok Dara (សុខ ដារ៉ា)', class: 'M5', hw: 18, mid: 25, final: 45 },
        { id: '105002', name: 'Chan Seyha (ចាន់ សីហា)', class: 'M5', hw: 15, mid: 20, final: 38 },
        { id: '105003', name: 'Meas Sreyleak (មាស ស្រីលក្ខណ៍)', class: 'M5', hw: 20, mid: 28, final: 48 },
        { id: '105004', name: 'Keo Vuthy (កែវ វុទ្ធី)', class: 'M5', hw: 12, mid: 18, final: 30 },
        { id: '105005', name: 'Ouk Sovann (អ៊ុក សុវណ្ណ)', class: 'M5', hw: 19, mid: 26, final: 42 },
        { id: '105006', name: 'Penh Chhaya (ពេញ ឆាយា)', class: 'M5', hw: 17, mid: 22, final: 40 },
        { id: '105007', name: 'Ros Vanna (រស់ វណ្ណា)', class: 'M5', hw: 16, mid: 24, final: 41 },
        { id: '105008', name: 'Som Tola (សម តុលា)', class: 'M5', hw: 14, mid: 19, final: 35 },
        { id: '105009', name: 'Tep Nimol (ទេព និមល)', class: 'M5', hw: 20, mid: 29, final: 49 },
        { id: '105010', name: 'Vong Rath (វង្ស រ័ត្ន)', class: 'M5', hw: 18, mid: 25, final: 44 },
        { id: '105011', name: 'Chhorn Socheat (ឆន សុជាតិ)', class: 'M5', hw: 15, mid: 21, final: 39 },
        { id: '105012', name: 'Doeun Phearum (ឌឿន ភារម្យ)', class: 'M5', hw: 19, mid: 27, final: 46 },
        { id: '105013', name: 'Heng Makara (ហេង មករា)', class: 'M5', hw: 13, mid: 20, final: 32 },
        { id: '105014', name: 'Khun Sreymom (ឃុន ស្រីមុំ)', class: 'M5', hw: 18, mid: 23, final: 43 },
        { id: '105015', name: 'Lim Chetra (លឹម ចិត្រា)', class: 'M5', hw: 17, mid: 24, final: 41 },

        // Class M6 (15 Students)
        { id: '106001', name: 'Phan Rithy (ផាន់ រិទ្ធី)', class: 'M6', hw: 19, mid: 28, final: 47 },
        { id: '106002', name: 'Chea Vichhai (ជា វិច្ឆ័យ)', class: 'M6', hw: 14, mid: 22, final: 36 },
        { id: '106003', name: 'Noun Kanitha (នួន កនិដ្ឋា)', class: 'M6', hw: 20, mid: 30, final: 50 },
        { id: '106004', name: 'Prak Sopheap (ប្រាក់ សុភាព)', class: 'M6', hw: 16, mid: 21, final: 39 },
        { id: '106005', name: 'Yim Piseth (យឹម ពិសិដ្ឋ)', class: 'M6', hw: 18, mid: 26, final: 45 },
        { id: '106006', name: 'Kim Sokha (គីម សុខា)', class: 'M6', hw: 15, mid: 20, final: 38 },
        { id: '106007', name: 'Lor Panha (ឡោ បញ្ញា)', class: 'M6', hw: 17, mid: 24, final: 42 },
        { id: '106008', name: 'Ngeth Bopha (ង៉ែត បុប្ផា)', class: 'M6', hw: 19, mid: 27, final: 46 },
        { id: '106009', name: 'San Borey (សាន បូរី)', class: 'M6', hw: 13, mid: 18, final: 31 },
        { id: '106010', name: 'Touch Raksa (តូច រក្សា)', class: 'M6', hw: 18, mid: 25, final: 44 },
        { id: '106011', name: 'Bouy Kimsan (ប៊ុយ គឹមសាន)', class: 'M6', hw: 16, mid: 23, final: 40 },
        { id: '106012', name: 'Eang Dalin (អៀង ដាលីន)', class: 'M6', hw: 20, mid: 29, final: 48 },
        { id: '106013', name: 'Gech Seang (ង៉េច សៀង)', class: 'M6', hw: 17, mid: 22, final: 41 },
        { id: '106014', name: 'Hun Chanthorn (ហ៊ុន ចាន់ថន)', class: 'M6', hw: 15, mid: 24, final: 37 },
        { id: '106015', name: 'It Sovady (អ៊ីត សុវ៉ាឌី)', class: 'M6', hw: 18, mid: 26, final: 45 }
    ];

    const gradesTableBody = document.getElementById('grades-table-body');
    const classFilter = document.getElementById('grade-class-filter');

    function renderGradesTable(filterClass) {
        if (!gradesTableBody) return;
        gradesTableBody.innerHTML = ''; 

        const filteredStudents = filterClass === 'all' 
            ? studentsData 
            : studentsData.filter(s => s.class === filterClass);

        filteredStudents.forEach((student) => {
            const tr = document.createElement('tr');
            const total = student.hw + student.mid + student.final;
            
            tr.innerHTML = `
                <td style="color: var(--text-muted); font-family: monospace;">${student.id}</td>
                <td style="font-weight: 600;">${student.name}</td>
                <td><span class="class-badge">${student.class}</span></td>
                <td style="text-align: center;"><input type="number" class="grade-input hw-input" value="${student.hw}" min="0" max="20"></td>
                <td style="text-align: center;"><input type="number" class="grade-input mid-input" value="${student.mid}" min="0" max="30"></td>
                <td style="text-align: center;"><input type="number" class="grade-input final-input" value="${student.final}" min="0" max="50"></td>
                <td style="text-align: center;"><span class="total-score">${total}</span></td>
            `;

            const inputs = tr.querySelectorAll('.grade-input');
            const totalSpan = tr.querySelector('.total-score');

            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    const hwVal = parseInt(tr.querySelector('.hw-input').value) || 0;
                    const midVal = parseInt(tr.querySelector('.mid-input').value) || 0;
                    const finalVal = parseInt(tr.querySelector('.final-input').value) || 0;
                    const newTotal = hwVal + midVal + finalVal;
                    totalSpan.textContent = newTotal;
                    totalSpan.style.color = newTotal < 50 ? '#ef4444' : 'var(--primary)';
                });
            });
            gradesTableBody.appendChild(tr);
        });
    }

    renderGradesTable('all');
    if (classFilter) classFilter.addEventListener('change', (e) => renderGradesTable(e.target.value));
    const saveGradesBtn = document.getElementById('save-grades-btn');
    if (saveGradesBtn) {
        saveGradesBtn.addEventListener('click', () => window.showToast('បានរក្សាទុកពិន្ទុចូលក្នុងប្រព័ន្ធជោគជ័យ! (Grades Saved Successfully!)', 'success'));
    }
});
