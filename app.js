1; const CONFIG = {
    timezone: 'Asia/Taipei',
    series: localStorage.getItem('gp_series') || 'motogp',
    filter: 'all'
};

const MOTOGP_SESSIONS = ["FP1", "Practice", "FP2", "Q1", "Q2", "Sprint", "Race"];
const F1_SESSIONS = ["FP1", "FP2", "FP3", "Qualy", "Race"];
const F1_SPRINT_SESSIONS = ["FP1", "Sprint Qualy", "Sprint", "Qualy", "Race"];

const M_OFF = [0, 0, 1, 1, 1, 1, 2];
const F_OFF = [0, 0, 1, 1, 2];
const FS_OFF = [0, 0, 1, 1, 2];

// 智能代理服務：提供多重備援
const getProxiedUrl = (url, retryCount = 0) => {
    if (!url) return '';
    const cleanUrl = url.replace(/^https?:\/\//, '');

    // 首選：weserv.nl (強大的格式轉換)
    if (retryCount === 0) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=800&output=png&q=90`;
    }
    // 備選：WP.com (Jetpack Proxy, 適合 Wikipedia 資源)
    if (retryCount === 1) {
        return `https://i0.wp.com/${cleanUrl}`;
    }
    return url; // 最終嘗試原始連結
};

// 擴展賽道詳細數據 (包含地圖 SVG)
const MOTOGP_SCHEDULE = [
    { n: '泰國', l: 'Buriram', c: 'th', d: '2026-02-27', t: ['11:45', '16:00', '11:10', '11:50', '12:15', '16:00', '16:00'], o: M_OFF, track: 'Chang International Circuit', stats: { len: '4.55 km', turns: 12, rec: '1:28.700 (Francesco Bagnaia, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Buriram_circuit_map.svg' } },
    { n: '巴西', l: 'Goiânia', c: 'br', d: '2026-03-20', t: ['21:00', '01:15', '20:10', '20:50', '21:15', '01:00', '01:00'], o: [0, 1, 1, 1, 1, 2, 3], track: 'Autódromo de Goiânia', stats: { len: '3.83 km', turns: 13, rec: 'N/A', map: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Aut%C3%B3dromo_Internacional_Ayrton_Senna_%28Goi%C3%A2nia%29_track_map_%28Brazil%29--Mixed_circuit.svg' } },
    { n: '美國', l: 'Austin', c: 'us', d: '2026-03-27', t: ['22:00', '02:00', '21:00', '21:40', '22:05', '04:00', '03:00'], o: [0, 1, 1, 1, 1, 2, 3], track: 'Circuit of The Americas', stats: { len: '5.51 km', turns: 20, rec: '2:00.864 (Maverick Viñales, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Austin_circuit.svg' } },
    { n: '卡達', l: 'Lusail', c: 'qa', d: '2026-04-10', t: ['20:45', '01:00', '20:00', '20:40', '21:05', '01:00', '01:00'], o: [0, 1, 2, 2, 2, 3, 3], track: 'Lusail International Circuit', stats: { len: '5.38 km', turns: 16, rec: '1:50.499 (Marc Marquez, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Lusail_International_Circuit_2023.svg ' } },
    { n: '西班牙', l: 'Jerez', c: 'es', d: '2026-04-24', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Circuito de Jerez', stats: { len: '4.42 km', turns: 13, rec: '1:35.610 (Fabio Quartararo, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Circuito_de_Jerez_%281985-1992%29.svg' } },
    { n: '法國', l: 'Le Mans', c: 'fr', d: '2026-05-08', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Le Mans Centre', stats: { len: '4.19 km', turns: 14, rec: '1:29.324 (Fabio Quartararo, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Circuit_Bugatti.svg' } },
    { n: '西班牙', l: 'Barcelona', c: 'es', d: '2026-05-15', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Circuit de Barcelona-Catalunya', stats: { len: '4.66 km', turns: 14, rec: '1:37.536 (Alex Marquez, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Circuit_Catalunya.svg' } },
    { n: '義大利', l: 'Mugello', c: 'it', d: '2026-05-29', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Mugello Circuit', stats: { len: '5.24 km', turns: 15, rec: '1:44.169 (Marc Marquez, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Mugello_Circuit.svg' } },
    { n: '荷蘭', l: 'Assen', c: 'nl', d: '2026-06-26', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'TT Circuit Assen', stats: { len: '4.54 km', turns: 18, rec: '1:30.540 (Francesco Bagnaia, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Assen-MotoGP.svg' } },
    { n: '德國', l: 'Sachsenring', c: 'de', d: '2026-07-10', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Sachsenring', stats: { len: '3.67 km', turns: 13, rec: '1:19.071 (Fabio Di Giannantonio, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Sachsenring-2003.svg' } },
    { n: '英國', l: 'Silverstone', c: 'gb', d: '2026-08-07', t: ['17:45', '22:00', '17:10', '17:50', '18:15', '22:00', '20:00'], o: M_OFF, track: 'Silverstone Circuit', stats: { len: '5.90 km', turns: 18, rec: '1:57.233 (Fabio Quartararo, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Silverstone_Circuit_2020.svg' } },
    { n: '聖馬利諾', l: 'Misano', c: 'sm', d: '2026-09-11', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Misano World Circuit', stats: { len: '4.23 km', turns: 16, rec: '1:30.304 (Francesco Bagnaia, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Misano_World_Circuit_Marco_Simoncelli.svg' } },
    { n: '奧地利', l: 'Spielberg', c: 'at', d: '2026-09-18', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Red Bull Ring', stats: { len: '4.32 km', turns: 11, rec: '1:27.748 (Jorge Martin, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Red_Bull_Ring_2022.svg' } },
    { n: '日本', l: 'Motegi', c: 'jp', d: '2026-10-02', t: ['09:45', '14:00', '09:10', '09:50', '10:15', '14:00', '13:00'], o: M_OFF, track: 'Mobility Resort Motegi', stats: { len: '4.80 km', turns: 14, rec: '1:42.911 (Francesco Bagnaia, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Motegi-road_course.svg' } },
    { n: '澳洲', l: 'Phillip Island', c: 'au', d: '2026-10-23', t: ['07:45', '12:00', '07:10', '07:50', '08:15', '12:00', '11:00'], o: M_OFF, track: 'Phillip Island Circuit', stats: { len: '4.45 km', turns: 12, rec: '1:26.465 (Fabio Quartararo, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Phillip_Island_track_map.svg' } },
    { n: '馬來西亞', l: 'Sepang', c: 'my', d: '2026-10-30', t: ['10:45', '15:00', '10:10', '10:50', '11:15', '15:00', '15:00'], o: M_OFF, track: 'Petronas Sepang International Circuit', stats: { len: '5.54 km', turns: 15, rec: '1:56.337 (Francesco Bagnaia, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Sepang.svg' } },
    { n: '巴倫西亞', l: 'Valencia', c: 'es', d: '2026-11-13', t: ['16:45', '21:00', '16:10', '16:50', '17:15', '21:00', '20:00'], o: M_OFF, track: 'Circuit Ricardo Tormo', stats: { len: '4.01 km', turns: 14, rec: '1:28.809 (Marco Bezzecchi, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Valencia_circuit.svg' } }
];

const F1_SCHEDULE = [
    { n: '澳洲', l: 'Melbourne', c: 'au', d: '2026-03-06', t: ['09:30', '13:00', '09:30', '13:00', '12:00'], o: F_OFF, track: 'Albert Park Circuit', stats: { len: '5.27 km', turns: 14, rec: '1:15.096 (Lando Norris, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Albert_Park_Circuit_2021.svg' } },
    { n: '中國 (Sprint)', l: 'Shanghai', c: 'cn', d: '2026-03-13', t: ['11:30', '15:30', '11:00', '15:00', '15:00'], s: true, o: FS_OFF, track: 'Shanghai International Circuit', stats: { len: '5.45 km', turns: 16, rec: '1:30.641 (Oscar Piastri, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Shanghai_International_Circuit-2005.svg' } },
    { n: '日本', l: 'Suzuka', c: 'jp', d: '2026-03-27', t: ['10:30', '14:00', '10:30', '14:00', '13:00'], o: F_OFF, track: 'Suzuka Circuit', stats: { len: '5.80 km', turns: 18, rec: '1:26.983 (Max Verstappen, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Suzuka_circuit_map--2005.svg' } },
    { n: '巴林', l: 'Sakhir', c: 'bh', d: '2026-04-10', t: ['19:30', '23:00', '20:30', '00:00', '21:00'], o: [0, 0, 1, 2, 2], track: 'Bahrain International Circuit', stats: { len: '5.41 km', turns: 15, rec: '1:27.264 (Lewis Hamilton, 2020)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Bahrain_International_Circuit--Grand_Prix_Layout.svg' } },
    { n: '沙烏地', l: 'Jeddah', c: 'sa', d: '2026-04-17', t: ['21:30', '01:00', '21:30', '01:00', '01:00'], o: [0, 1, 1, 2, 3], track: 'Jeddah Corniche Circuit', stats: { len: '6.17 km', turns: 27, rec: '1:27.472 (Lewis Hamilton, 2021)', map: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Jeddah_Corniche_Circuit_2022.svg' } },
    { n: '邁阿密 (Sprint)', l: 'Miami', c: 'us', d: '2026-05-01', t: ['00:30', '04:30', '00:00', '04:00', '04:00'], s: true, o: [1, 1, 2, 2, 3], track: 'Miami International Autodrome', stats: { len: '5.41 km', turns: 19, rec: '1:27.319 (Charles Leclerc, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Miami_International_Autodrome.svg' } },
    { n: '艾米利亞-羅馬涅', l: 'Imola', c: 'it', d: '2026-05-15', t: ['19:30', '23:00', '18:30', '22:00', '21:00'], o: F_OFF, track: 'Autodromo Enzo e Dino Ferrari', stats: { len: '4.91 km', turns: 19, rec: '1:14.670 (Oscar Piastri, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Imola_Track_Map.svg' } },
    { n: '摩納哥', l: 'Monte Carlo', c: 'mc', d: '2026-05-22', t: ['19:30', '23:00', '18:30', '22:00', '21:00'], o: F_OFF, track: 'Circuit de Monaco', stats: { len: '3.33 km', turns: 19, rec: '1:09.954 (Lando Norris, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Monte_Carlo_Formula_1_track_map.svg' } },
    { n: '西班牙', l: 'Barcelona', c: 'es', d: '2026-05-29', t: ['19:30', '23:00', '18:30', '22:00', '21:00'], o: F_OFF, track: 'Circuit de Barcelona-Catalunya', stats: { len: '4.66 km', turns: 14, rec: '1:11.383 (Lando Norris, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Circuit_Catalunya.svg' } },
    { n: '加拿大', l: 'Montreal', c: 'ca', d: '2026-06-12', t: ['01:30', '05:00', '00:30', '04:00', '02:00'], o: [1, 1, 2, 2, 3], track: 'Circuit Gilles Villeneuve', stats: { len: '4.36 km', turns: 14, rec: '1:10.899 (George Russell, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Circuit_Gilles_Villeneuve.svg' } },
    { n: '奧地利 (Sprint)', l: 'Spielberg', c: 'at', d: '2026-06-26', t: ['19:30', '22:30', '21:00', '22:00', '21:00'], s: true, o: FS_OFF, track: 'Red Bull Ring', stats: { len: '4.31 km', turns: 10, rec: '1:02.939 (Valtteri Bottas, 2020)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Red_Bull_Ring_2022.svg' } },
    { n: '英國', l: 'Silverstone', c: 'gb', d: '2026-07-03', t: ['19:30', '23:00', '18:30', '22:00', '22:00'], o: F_OFF, track: 'Silverstone Circuit', stats: { len: '5.89 km', turns: 18, rec: '1:24.303 (Lewis Hamilton, 2020)', map: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Silverstone_Circuit_2020.svg' } },
    { n: '比利時', l: 'Spa', c: 'be', d: '2026-07-24', t: ['19:30', '23:00', '18:30', '22:00', '21:00'], o: F_OFF, track: 'Circuit de Spa-Francorchamps', stats: { len: '7.00 km', turns: 19, rec: '1:41.252 (Lewis Hamilton, 2020)', map: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Spa-Francorchamps_of_Belgium.svg' } },
    { n: '匈牙利', l: 'Hungaroring', c: 'hu', d: '2026-07-31', t: ['19:30', '23:00', '18:30', '22:00', '21:00'], o: F_OFF, track: 'Hungaroring', stats: { len: '4.38 km', turns: 14, rec: '1:13.447 (Lewis Hamilton, 2020)', map: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Hungaroring.svg' } },
    { n: '荷蘭', l: 'Zandvoort', c: 'nl', d: '2026-08-28', t: ['18:30', '22:00', '17:30', '21:00', '21:00'], o: F_OFF, track: 'Circuit Zandvoort', stats: { len: '4.25 km', turns: 14, rec: '1:08.662 (Oscar Piastri, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Circuit_Zandvoort_2020.svg' } },
    { n: '義大利', l: 'Monza', c: 'it', d: '2026-09-04', t: ['19:30', '23:00', '18:30', '22:00', '21:00'], o: F_OFF, track: 'Autodromo Nazionale Monza', stats: { len: '5.79 km', turns: 11, rec: '1:18.792 (Max Verstappen, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Monza_track_map.svg' } },
    { n: '亞塞拜然', l: 'Baku', c: 'az', d: '2026-09-18', t: ['17:30', '21:00', '16:30', '20:00', '19:00'], o: F_OFF, track: 'Baku City Circuit', stats: { len: '6.00 km', turns: 20, rec: '1:41.117 (Max Verstappen, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Baku_City_Circuit_2016.svg' } },
    { n: '新加坡', l: 'Marina Bay', c: 'sg', d: '2026-10-02', t: ['17:30', '21:00', '17:30', '21:00', '20:00'], o: F_OFF, track: 'Marina Bay Street Circuit', stats: { len: '4.94 km', turns: 19, rec: '1:29.158 (George Russell, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Marina_Bay_Street_Circuit_2023.svg' } },
    { n: '美國 (Sprint)', l: 'Austin', c: 'us', d: '2026-10-16', t: ['01:30', '05:30', '02:00', '06:00', '03:00'], s: true, o: [1, 1, 2, 2, 3], track: 'Circuit of The Americas', stats: { len: '5.51 km', turns: 20, rec: '1:32.029 (Valtteri Bottas, 2019)', map: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Austin_circuit.svg' } },
    { n: '墨西哥', l: 'Mexico City', c: 'mx', d: '2026-10-23', t: ['02:30', '06:00', '01:30', '05:00', '04:00'], o: [1, 1, 2, 2, 3], track: 'Autódromo Hermanos Rodríguez', stats: { len: '4.30 km', turns: 17, rec: '1:14.758 (Max Verstappen, 2019)', map: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Hermanos_Rodriguez.svg' } },
    { n: '巴西 (Sprint)', l: 'Interlagos', c: 'br', d: '2026-11-06', t: ['22:30', '02:30', '22:00', '02:00', '01:00'], s: true, o: [0, 1, 1, 2, 3], track: 'Autódromo José Carlos Pace', stats: { len: '4.30 km', turns: 15, rec: '1:07.281 (Lewis Hamilton, 2018)', map: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Interlagos_track_map.svg' } },
    { n: '拉斯維加斯', l: 'Las Vegas', c: 'us', d: '2026-11-19', t: ['12:30', '16:00', '12:30', '12:00', '14:00'], o: [1, 1, 2, 2, 3], track: 'Las Vegas Strip Circuit', stats: { len: '6.20 km', turns: 17, rec: '1:32.312 (George Russell, 2024)', map: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Las_Vegas_Street_Circuit_2023.svg' } },
    { n: '卡達 (Sprint)', l: 'Lusail', c: 'qa', d: '2026-11-27', t: ['19:30', '23:30', '01:00', '01:00', '23:00'], s: true, o: [0, 0, 2, 2, 2], track: 'Lusail International Circuit', stats: { len: '5.41 km', turns: 16, rec: '1:19.387 (Oscar Piastri, 2025)', map: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Lusail_International_Circuit_2023.svg' } },
    { n: '阿布達比', l: 'Yas Marina', c: 'ae', d: '2026-12-04', t: ['17:30', '21:00', '18:30', '22:00', '21:00'], o: F_OFF, track: 'Yas Marina Circuit', stats: { len: '5.28 km', turns: 16, rec: '1:22.109 (Max Verstappen, 2021)', map: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Yas_Marina_Circuit_2021.svg' } }
];

let timerInterval;
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    const activeBtn = document.querySelector(`.nav-btn[data-series="${CONFIG.series}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    renderSchedule(true);
    setupEventListeners();
    updateNextRaceCountdown();
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        CONFIG.series = e.target.dataset.series;
        localStorage.setItem('gp_series', CONFIG.series);
        renderSchedule(true);
        updateNextRaceCountdown();
    }));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        CONFIG.filter = e.target.dataset.filter;
        renderSchedule(false);
    }));

    // Modal Close logic
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.id === 'track-modal') closeModal();
    });
}

function getSessionDate(baseDateStr, offset) {
    const d = new Date(baseDateStr);
    d.setDate(d.getDate() + offset);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function renderSchedule(shouldScroll = false) {
    const list = document.getElementById('race-list');
    let data = CONFIG.series === 'motogp' ? MOTOGP_SCHEDULE : F1_SCHEDULE;
    const now = new Date();

    if (CONFIG.filter === 'upcoming') data = data.filter(r => new Date(r.d) >= now || isRaceWeekendActive(r));
    else if (CONFIG.filter === 'past') data = data.filter(r => new Date(r.d) < now && !isRaceWeekendActive(r));

    list.innerHTML = '';
    if (data.length === 0) { list.innerHTML = `<div class="loader">暫無符合條件的數據</div>`; return; }

    let nextRaceElement = null;

    data.forEach((r, idx) => {
        const div = document.createElement('div');
        const raceDate = new Date(r.d);
        raceDate.setDate(raceDate.getDate() + 2);

        div.className = 'race-card animate-in';
        if (raceDate > now && !nextRaceElement) {
            div.id = 'next-race-card';
            nextRaceElement = div;
        }

        div.style.animationDelay = `${idx * 0.05}s`;

        // Add click event to open modal
        div.addEventListener('click', () => openModal(r));

        const sessions = CONFIG.series === 'motogp' ? MOTOGP_SESSIONS : (r.s ? F1_SPRINT_SESSIONS : F1_SESSIONS);
        let sHtml = '';
        sessions.forEach((sName, sIdx) => {
            const time = r.t[sIdx];
            if (time) {
                const sDate = getSessionDate(r.d, r.o[sIdx]);
                const isImp = sName === 'Race' || sName === 'Sprint';
                sHtml += `<div class="session-item ${isImp ? 'important' : ''}">
                    <div class="session-header">
                        <span class="session-name">${sName}</span>
                        <span class="session-date">${sDate}</span>
                    </div>
                    <span class="session-time">${time}</span>
                </div>`;
            }
        });

        const flagUrl = `https://flagcdn.com/w160/${r.c}.png`;

        div.innerHTML = `
            <div class="race-header-row">
                <div class="flag-container">
                    <img src="${flagUrl}" alt="${r.n}" class="flag-img">
                </div>
                <div class="race-main-info">
                    <div class="race-title-group">
                        <h3>${r.n}大獎賽</h3>
                        <span class="track-badge">TRACK</span>
                    </div>
                    <div class="track-full-name">${r.track}</div>
                </div>
            </div>
            <div class="race-meta-row">
                <div class="meta-item"><span class="icon">📅</span> ${r.d}</div>
                <div class="meta-item"><span class="icon">📍</span> ${r.l}</div>
            </div>
            <div class="sessions-grid">${sHtml}</div>
        `;
        list.appendChild(div);
    });

    if (shouldScroll && nextRaceElement) {
        setTimeout(() => {
            nextRaceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }
}

function openModal(race) {
    const modal = document.getElementById('track-modal');
    const modalBody = document.getElementById('modal-body');

    const stats = race.stats || { len: 'TBD', turns: 'TBD', rec: 'TBD', map: '' };

    // 智能載入邏輯：帶有重試機制
    const renderTrackMap = (baseUrl, retryCount = 0) => {
        if (!baseUrl) return `<div class="track-img-placeholder"><div><div style="font-size: 2rem; margin-bottom: 10px;">🎢</div><div>Circuit Layout Map TBD</div></div></div>`;
        const proxied = getProxiedUrl(baseUrl, retryCount);

        return `<img src="${proxied}" alt="${race.track} Map" class="track-map-img" 
            onerror="if(${retryCount} < 2) { this.src = getProxiedUrl('${baseUrl}', ${retryCount + 1}); } else { this.style.display='none'; this.parentElement.innerHTML='<div class=\\\'track-img-placeholder\\\'><div><div style=\\\'font-size: 2rem; margin-bottom: 10px;\\\'>🏁</div><div>Circuit Layout Map TBD</div></div></div>'; }">`;
    };

    modalBody.innerHTML = `
        <div class="track-detail-header">
            <h2>${race.track}</h2>
            <div class="location">📍 ${race.l}, ${race.n}</div>
        </div>
        <div class="track-stats-grid">
            <div class="stat-box">
                <span class="stat-label">Circuit Length</span>
                <span class="stat-value">${stats.len}</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Turns</span>
                <span class="stat-value">${stats.turns}</span>
            </div>
            <div class="stat-box" style="grid-column: span 2;">
                <span class="stat-label">Lap Record</span>
                <span class="stat-value">${stats.rec}</span>
            </div>
        </div>
        <div class="track-map-container">
            ${renderTrackMap(stats.map)}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeModal() {
    const modal = document.getElementById('track-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function isRaceWeekendActive(r) {
    const d = new Date(r.d); const end = new Date(d); end.setDate(end.getDate() + 4);
    return new Date() >= d && new Date() <= end;
}

function updateNextRaceCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    const data = CONFIG.series === 'motogp' ? MOTOGP_SCHEDULE : F1_SCHEDULE;
    const now = new Date();
    let nr = data.find(r => { const rd = new Date(r.d); rd.setDate(rd.getDate() + 2); return rd > now; });
    if (!nr) { document.getElementById('next-race-name').innerText = "賽季已結束"; document.getElementById('countdown-timer').style.display = 'none'; return; }
    document.getElementById('countdown-timer').style.display = 'flex'; document.getElementById('next-race-name').innerText = nr.n + "大獎賽";
    const rt = nr.t[nr.t.length - 1]; const td = new Date(nr.d + 'T' + rt + ':00+08:00'); td.setDate(td.getDate() + nr.o[nr.o.length - 1]);
    function update() {
        const diff = td - new Date();
        if (diff <= 0) { document.getElementById('countdown-timer').innerHTML = "比賽正式開始！"; clearInterval(timerInterval); return; }
        document.getElementById('days').innerText = String(Math.floor(diff / 86400000)).padStart(2, '0');
        document.getElementById('hours').innerText = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        document.getElementById('minutes').innerText = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        document.getElementById('seconds').innerText = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }
    timerInterval = setInterval(update, 1000); update();
}
