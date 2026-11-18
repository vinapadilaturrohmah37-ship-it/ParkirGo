
// ==========================================
// APLIKASI PARKIR — SCRIPT.JS (LENGKAP)
// ==========================================

let tarifMotor = 2000;
let tarifMobil = 5000;
let sedangParkir = [];
let riwayatParkir = [];

const tabButtons = document.querySelectorAll('.tab-btn');
const elemenTanggal = document.getElementById('tanggal');
const elemenJam = document.getElementById('jam');
const formMasuk = document.getElementById('form-masuk');
const inputPlatMasuk = document.getElementById('plat-nomor');
const inputJenisKendaraan = document.getElementById('jenis-kendaraan');
const inputWaktuMasuk = document.getElementById('waktu-masuk');
const inputCariPlat = document.getElementById('cari-plat');
const btnCari = document.getElementById('btn-cari');
const infoKendaraan = document.getElementById('info-kendaraan');
const btnSelesai = document.getElementById('btn-selesai');
const formPengaturan = document.getElementById('form-pengaturan');
const inputTarifMotor = document.getElementById('tarif-motor');
const inputTarifMobil = document.getElementById('tarif-mobil');
const tabelParkir = document.getElementById('tabel-parkir');
const tabelRiwayat = document.getElementById('tabel-riwayat');
const jumlahParkir = document.getElementById('jumlah-parkir');
const totalPendapatan = document.getElementById('total-pendapatan');
const btnHapusRiwayat = document.getElementById('btn-hapus-riwayat');
const modalStruk = document.getElementById('modal-struk');
const isiStruk = document.getElementById('isi-struk');
const btnTutupModal = document.getElementById('btn-tutup-modal');

let kendaraanAktif = null;

document.addEventListener('DOMContentLoaded', function() {
    muatDataDariLocalStorage();
    perbaruiWaktu();
    setInterval(perbaruiWaktu, 1000);
    perbaruiTampilan();
    setupTabs();
});

function perbaruiWaktu() {
    const sekarang = new Date();
    elemenTanggal.textContent = sekarang.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    elemenJam.textContent = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (inputWaktuMasuk) inputWaktuMasuk.value = formatWaktu(sekarang);
}

function formatWaktu(tanggal) {
    const hari = String(tanggal.getDate()).padStart(2, '0');
    const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
    const tahun = tanggal.getFullYear();
    const jam = String(tanggal.getHours()).padStart(2, '0');
    const menit = String(tanggal.getMinutes()).padStart(2, '0');
    return `${hari}/${bulan}/${tahun} ${jam}:${menit}`;
}

function formatWaktuSingkat(tanggal) {
    const jam = String(tanggal.getHours()).padStart(2, '0');
    const menit = String(tanggal.getMinutes()).padStart(2, '0');
    return `${jam}:${menit}`;
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabTarget = this.getAttribute('data-tab');
            document.querySelectorAll('[data-tab]').forEach(btn => {
                btn.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
                btn.classList.add('text-gray-500');
            });
            this.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
            this.classList.remove('text-gray-500');
            document.querySelectorAll('.tab-content').forEach(konten => konten.classList.add('hidden'));
            document.getElementById(tabTarget).classList.remove('hidden');
        });
    });
}

function simpanKeLocalStorage() {
    localStorage.setItem('parkir_sedang', JSON.stringify(sedangParkir));
    localStorage.setItem('parkir_riwayat', JSON.stringify(riwayatParkir));
    localStorage.setItem('parkir_tarifMotor', tarifMotor);
    localStorage.setItem('parkir_tarifMobil', tarifMobil);
}

function muatDataDariLocalStorage() {
    const dataSedang = localStorage.getItem('parkir_sedang');
    const dataRiwayat = localStorage.getItem('parkir_riwayat');
    const dataTarifMotor = localStorage.getItem('parkir_tarifMotor');
    const dataTarifMobil = localStorage.getItem('parkir_tarifMobil');
    if (dataSedang) sedangParkir = JSON.parse(dataSedang);
    if (dataRiwayat) riwayatParkir = JSON.parse(dataRiwayat);
    if (dataTarifMotor) tarifMotor = parseInt(dataTarifMotor);
    if (dataTarifMobil) tarifMobil = parseInt(dataTarifMobil);
    if (inputTarifMotor) inputTarifMotor.value = tarifMotor;
    if (inputTarifMobil) inputTarifMobil.value = tarifMobil;
}

if (formMasuk) {
    formMasuk.addEventListener('submit', function(e) {
        e.preventDefault();
        const platNomor = inputPlatMasuk.value.toUpperCase().trim();
        const jenis = inputJenisKendaraan.value;
        if (!platNomor || !jenis) { alert('⚠️ Lengkapi data!'); return; }
        const cekDuplikat = sedangParkir.find(k => k.platNomor === platNomor);
        if (cekDuplikat) { alert(`⚠️ ${platNomor} masih parkir!`); return; }
        sedangParkir.push({ id: Date.now(), platNomor, jenis, waktuMasuk: new Date().toISOString() });
        simpanKeLocalStorage(); perbaruiTampilan();
        inputPlatMasuk.value = ''; inputJenisKendaraan.value = '';
        alert(`✅ ${platNomor} tercatat masuk!`);
    });
}

if (btnCari) {
    btnCari.addEventListener('click', cariKendaraan);
    inputCariPlat.addEventListener('keypress', e => e.key === 'Enter' && cariKendaraan());
}

function cariKendaraan() {
    const platNomor = inputCariPlat.value.toUpperCase().trim();
    if (!platNomor) { alert('⚠️ Masukkan plat nomor!'); return; }
    const indeks = sedangParkir.findIndex(k => k.platNomor === platNomor);
    if (indeks === -1) { alert(`❌ ${platNomor} tidak ditemukan!`); infoKendaraan.classList.add('hidden'); return; }
    kendaraanAktif = sedangParkir[indeks];
    tampilkanInfoKendaraan(kendaraanAktif);
}

function tampilkanInfoKendaraan(kendaraan) {
    const waktuMasuk = new Date(kendaraan.waktuMasuk);
    const waktuKeluar = new Date();
    const durasiMs = waktuKeluar - waktuMasuk;
    const durasiJam = durasiMs / (1000 * 60 * 60);
    const durasiMenit = Math.floor(durasiMs / (1000 * 60));
    const jamParkir = Math.ceil(durasiJam);
    const tarifPerJam = kendaraan.jenis === 'Motor' ? tarifMotor : tarifMobil;
    const biaya = jamParkir * tarifPerJam;
    const j = Math.floor(durasiJam), m = durasiMenit % 60;
    const durasiTeks = j > 0 && m > 0 ? `${j} jam ${m} menit` : j > 0 ? `${j} jam` : `${m} menit`;
    document.getElementById('info-plat').textContent = kendaraan.platNomor;
    document.getElementById('info-jenis').textContent = kendaraan.jenis;
    document.getElementById('info-masuk').textContent = formatWaktu(waktuMasuk);
    document.getElementById('info-keluar').textContent = formatWaktu(waktuKeluar);
    document.getElementById('info-durasi').textContent = durasiTeks;
    document.getElementById('info-biaya').textContent = `Rp ${biaya.toLocaleString('id-ID')}`;
    kendaraanAktif.waktuKeluar = waktuKeluar.toISOString();
    kendaraanAktif.durasi = durasiTeks;
    kendaraanAktif.biaya = biaya;
    infoKendaraan.classList.remove('hidden');
    btnSelesai.classList.remove('hidden');
}

if (btnSelesai) {
    btnSelesai.addEventListener('click', function() {
        if (!kendaraanAktif) return;
        sedangParkir = sedangParkir.filter(k => k.id !== kendaraanAktif.id);
        riwayatParkir.unshift(kendaraanAktif);
        simpanKeLocalStorage(); perbaruiTampilan();
        tampilkanStruk(kendaraanAktif);
        inputCariPlat.value = ''; infoKendaraan.classList.add('hidden'); btnSelesai.classList.add('hidden');
        kendaraanAktif = null;
    });
}

function tampilkanStruk(kendaraan) {
    const waktuMasuk = new Date(kendaraan.waktuMasuk);
    const waktuKeluar = new Date(kendaraan.waktuKeluar);
    isiStruk.innerHTML = `
        <div class="flex justify-between"><span>Plat:</span><span>${kendaraan.platNomor}</span></div>
        <div class="flex justify-between"><span>Jenis:</span><span>${kendaraan.jenis}</span></div>
        <div class="flex justify-between"><span>Masuk:</span><span>${formatWaktuSingkat(waktuMasuk)}</span></div>
        <div class="flex justify-between"><span>Keluar:</span><span>${formatWaktuSingkat(waktuKeluar)}</span></div>
        <div class="flex justify-between"><span>Lama:</span><span>${kendaraan.durasi}</span></div>
        <div class="border-b border-dashed border-gray-400 my-2"></div>
        <div class="flex justify-between font-bold text-lg">
            <span>TOTAL:</span><span>Rp ${kendaraan.biaya.toLocaleString('id-ID')}</span>
        </div>`;
    modalStruk.classList.remove('hidden');
}

if (btnTutupModal) {
    btnTutupModal.addEventListener('click', () => modalStruk.classList.add('hidden'));
    modalStruk.addEventListener('click', e => e.target === modalStruk && modalStruk.classList.add('hidden'));
}

if (formPengaturan) {
    formPengaturan.addEventListener('submit', function(e) {
        e.preventDefault();
        tarifMotor = parseInt(inputTarifMotor.value) || 0;
        tarifMobil = parseInt(inputTarifMobil.value) || 0;
        simpanKeLocalStorage();
        alert('✅ Tarif diperbarui!');
    });
}

if (btnHapusRiwayat) {
    btnHapusRiwayat.addEventListener('click', function() {
        if (confirm('Yakin hapus semua riwayat?')) {
            riwayatParkir = []; simpanKeLocalStorage(); perbaruiTampilan();
        }
    });
}

window.panggilKeluar = function(platNomor) {
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
        if (btn.getAttribute('data-tab') === 'keluar') btn.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
    });
    document.querySelectorAll('.tab-content').forEach(k => k.classList.add('hidden'));
    document.getElementById('keluar').classList.remove('hidden');
    inputCariPlat.value = platNomor;
    cariKendaraan();
};

function perbaruiTampilan() {
    perbaruiTabelSedangParkir();
    perbaruiTabelRiwayat();
    if (jumlahParkir) jumlahParkir.textContent = sedangParkir.length;
    const total = riwayatParkir.reduce((sum, t) => sum + t.biaya, 0);
    if (totalPendapatan) totalPendapatan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function perbaruiTabelSedangParkir() {
    if (!tabelParkir) return;
    if (sedangParkir.length === 0) {
        tabelParkir.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-500"><i class="fa fa-info-circle mr-1"></i> Tidak ada kendaraan yang sedang parkir</td></tr>`;
        return;
    }
    tabelParkir.innerHTML = sedangParkir.map((k, i) => {
        const t = new Date(k.waktuMasuk);
        return `<tr>
            <td>${i + 1}</td>
            <td class="font-medium">${k.platNomor}</td>
            <td><span class="px-2 py-1 rounded text-xs ${k.jenis==='Motor'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}">${k.jenis}</span></td>
            <td>${formatWaktu(t)}</td>
            <td><button onclick="panggilKeluar('${k.platNomor}')" class="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded">Keluar</button></td>
        </tr>`;
    }).join('');
}

function perbaruiTabelRiwayat() {
    if (!tabelRiwayat) return;
    if (riwayatParkir.length === 0) {
        tabelRiwayat.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-500"><i class="fa fa-info-circle mr-1"></i> Belum ada riwayat</td></tr>`;
        return;
    }
    tabelRiwayat.innerHTML = riwayatParkir.map((k, i) => {
        const m = new Date(k.waktuMasuk);
        const k2 = new Date(k.waktuKeluar);
        return `<tr>
            <td>${i + 1}</td>
            <td class="font-medium">${k.platNomor}</td>
            <td>${k.jenis}</td>
            <td>${formatWaktu(m)}</td>
            <td>${formatWaktu(k2)}</td>
            <td>${k.durasi}</td>
            <td class="text-right font-medium">Rp ${k.biaya.toLocaleString('id-ID')}</td>
        </tr>`;
    }).join('');
}
