// ==========================================
// APLIKASI PARKIR — SCRIPT.JS
// ==========================================

// ========== KONFIGURASI AWAL ==========
// Tarif default
let tarifMotor = 2000;
let tarifMobil = 5000;

// Data penyimpanan
let sedangParkir = [];
let riwayatParkir = [];

// ========== ELEMEN DOM ==========
// Tab
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Elemen waktu
const elemenTanggal = document.getElementById('tanggal');
const elemenJam = document.getElementById('jam');

// Form Masuk
const formMasuk = document.getElementById('form-masuk');
const inputPlatMasuk = document.getElementById('plat-nomor');
const inputJenisKendaraan = document.getElementById('jenis-kendaraan');
const inputWaktuMasuk = document.getElementById('waktu-masuk');

// Form Keluar
const inputCariPlat = document.getElementById('cari-plat');
const btnCari = document.getElementById('btn-cari');
const infoKendaraan = document.getElementById('info-kendaraan');
const btnSelesai = document.getElementById('btn-selesai');

// Pengaturan
const formPengaturan = document.getElementById('form-pengaturan');
const inputTarifMotor = document.getElementById('tarif-motor');
const inputTarifMobil = document.getElementById('tarif-mobil');

// Tabel
const tabelParkir = document.getElementById('tabel-parkir');
const tabelRiwayat = document.getElementById('tabel-riwayat');
const jumlahParkir = document.getElementById('jumlah-parkir');
const totalPendapatan = document.getElementById('total-pendapatan');
const btnHapusRiwayat = document.getElementById('btn-hapus-riwayat');

// Modal Struk
const modalStruk = document.getElementById('modal-struk');
const isiStruk = document.getElementById('isi-struk');
const btnTutupModal = document.getElementById('btn-tutup-modal');

// Variabel sementara untuk kendaraan yang akan keluar
let kendaraanAktif = null;

// ========== INISIALISASI ==========
document.addEventListener('DOMContentLoaded', function() {
    muatDataDariLocalStorage();
    perbaruiWaktu();
    setInterval(perbaruiWaktu, 1000);
    perbaruiTampilan();
});

// ========== FUNGSI WAKTU ==========
function perbaruiWaktu() {
    const sekarang = new Date();
    const opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const opsiJam = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    elemenTanggal.textContent = sekarang.toLocaleDateString('id-ID', opsiTanggal);
    elemenJam.textContent = sekarang.toLocaleTimeString('id-ID', opsiJam);
    
    // Isi waktu masuk saat ini
    if (inputWaktuMasuk) {
        inputWaktuMasuk.value = formatWaktu(sekarang);
    }
}

function formatWaktu(tanggal) {
    const hari = String(tanggal.getDate()).padStart(2, '0');
    const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
    const tahun = tanggal.getFullYear();
    const jam = String(tanggal.getHours()).padStart(2, '0');
    const menit = String(tanggal.getMinutes()).padStart(2, '0');
    const detik = String(tanggal.getSeconds()).padStart(2, '0');
    
    return `${hari}/${bulan}/${tahun} ${jam}:${menit}:${detik}`;
}

function formatWaktuSingkat(tanggal) {
    const jam = String(tanggal.getHours()).padStart(2, '0');
    const menit = String(tanggal.getMinutes()).padStart(2, '0');
    return `${jam}:${menit}`;
}

// ========== FUNGSI TAB NAVIGASI ==========
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        const tabTarget = this.getAttribute('data-tab');
        
        // Hapus kelas aktif dari semua tombol
        tabButtons.forEach(btn => {
            btn.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
            btn.classList.add('text-gray-500', 'hover:text-gray-700');
        });
        
        // Tandai tombol aktif
        this.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
        this.classList.remove('text-gray-500', 'hover:text-gray-700');
        
        // Sembunyikan semua konten tab
        tabContents.forEach(konten => {
            konten.classList.add('hidden');
            konten.classList.remove('block');
        });
        
        // Tampilkan konten tab yang dipilih
        const kontenAktif = document.getElementById(tabTarget);
        kontenAktif.classList.remove('hidden');
        kontenAktif.classList.add('block');
    });
});

// ========== FUNGSI SIMPAN & MUAT DATA ==========
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
    
    // Isi form pengaturan
    if (inputTarifMotor) inputTarifMotor.value = tarifMotor;
    if (inputTarifMobil) inputTarifMobil.value = tarifMobil;
}

// ========== FUNGSI: KENDARAAN MASUK ==========
if (formMasuk) {
    formMasuk.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const platNomor = inputPlatMasuk.value.toUpperCase().trim();
        const jenis = inputJenisKendaraan.value;
        const waktuMasuk = new Date();
        
        // Validasi
        if (!platNomor || !jenis) {
            alert('⚠️ Silakan lengkapi data!');
            return;
        }
        
        // Cek apakah plat nomor sudah ada (belum keluar)
        const cekDuplikat = sedangParkir.find(k => k.platNomor === platNomor);
        if (cekDuplikat) {
            alert(`⚠️ Kendaraan dengan plat ${platNomor} masih berada di area parkir!`);
            return;
        }
        
        // Tambahkan ke daftar sedang parkir
        const kendaraan = {
            id: Date.now(),
            platNomor: platNomor,
            jenis: jenis,
            waktuMasuk: waktuMasuk.toISOString()
        };
        
        sedangParkir.push(kendaraan);
        simpanKeLocalStorage();
        perbaruiTampilan();
        
        // Reset form
        inputPlatMasuk.value = '';
        inputJenisKendaraan.value = '';
        inputWaktuMasuk.value = formatWaktu(new Date());
        
        alert(`✅ Kendaraan ${platNomor} tercatat masuk!`);
    });
}

// ========== FUNGSI: CARI KENDARAAN KELUAR ==========
if (btnCari) {
    btnCari.addEventListener('click', cariKendaraan);
    inputCariPlat.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') cariKendaraan();
    });
}

function cariKendaraan() {
    const platNomor = inputCariPlat.value.toUpperCase().trim();
    
    if (!platNomor) {
        alert('⚠️ Masukkan plat nomor!');
        return;
    }
    
    // Cari kendaraan
    const indeks = sedangParkir.findIndex(k => k.platNomor === platNomor);
    
    if (indeks === -1) {
        alert(`❌ Kendaraan ${platNomor} tidak ditemukan dalam daftar parkir!`);
        infoKendaraan.classList.add('hidden');
        btnSelesai.classList.add('hidden');
        kendaraanAktif = null;
        return;
    }
    
    kendaraanAktif = sedangParkir[indeks];
    tampilkanInfoKendaraan(kendaraanAktif);
}

function tampilkanInfoKendaraan(kendaraan) {
    const waktuMasuk = new Date(kendaraan.waktuMasuk);
    const waktuKeluar = new Date();
    const durasiMs = waktuKeluar - waktuMasuk;
    const durasiJam = durasiMs / (1000 * 60 * 60);
    const durasiMenit = Math.floor(durasiMs / (1000 * 60));
    
    // Hitung biaya (dibulatkan ke atas per jam)
    const jamParkir = Math.ceil(durasiJam);
    const tarifPerJam = kendaraan.jenis === 'Motor' ? tarifMotor : tarifMobil;
    const biaya = jamParkir * tarifPerJam;
    
    // Durasi format
    let durasiTeks = '';
    const j = Math.floor(durasiJam);
    const m = durasiMenit % 60;
    if (j > 0 && m > 0) durasiTeks = `${j} jam ${m} menit`;
    else if (j > 0) durasiTeks = `${j} jam`;
    else durasiTeks = `${m} menit`;
    
    // Isi ke elemen
    document.getElementById('info-plat').textContent = kendaraan.platNomor;
    document.getElementById('info-jenis').textContent = kendaraan.jenis;
    document.getElementById('info-masuk').textContent = formatWaktu(waktuMasuk);
    document.getElementById('info-keluar').textContent = formatWaktu(waktuKeluar);
    document.getElementById('info-durasi').textContent = durasiTeks;
    document.getElementById('info-biaya').textContent = `Rp ${biaya.toLocaleString('id-ID')}`;
    
    // Simpan data untuk transaksi
    kendaraanAktif.waktuKeluar = waktuKeluar.toISOString();
    kendaraanAktif.durasi = durasiTeks;
    kendaraanAktif.biaya = biaya;
    
    infoKendaraan.classList.remove('hidden');
    btnSelesai.classList.remove('hidden');
}

// ========== FUNGSI: KENDARAAN SELESAI / KELUAR ==========
if (btnSelesai) {
    btnSelesai.addEventListener('click', function() {
        if (!kendaraanAktif) return;
        
        // Pindahkan dari sedang parkir ke riwayat
        sedangParkir = sedangParkir.filter(k => k.id !== kendaraanAktif.id);
        riwayatParkir.unshift(kendaraanAktif);
        
        simpanKeLocalStorage();
        perbaruiTampilan();
        
        // Tampilkan struk
        tampilkanStruk(kendaraanAktif);
        
        // Reset form keluar
        inputCariPlat.value = '';
        infoKendaraan.classList.add('hidden');
        btnSelesai.classList.add('hidden');
        kendaraanAktif = null;
    });
}

// ========== FUNGSI: TAMPILKAN STRUK ==========
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
            <span>TOTAL:</span>
            <span>Rp ${kendaraan.biaya.toLocaleString('id-ID')}</span>
        </div>
    `;
    
    modalStruk.classList.remove('hidden');
}

// Tutup Modal Struk
if (btnTutupModal) {
    btnTutupModal.addEventListener('click', function() {
        modalStruk.classList.add('hidden');
    });
    modalStruk.addEventListener('click', function(e) {
        if (e.target === modalStruk) {
            modalStruk.classList.add('hidden');
        }
    });
}

// ========== FUNGSI: PENGATURAN TARIF ==========
if (formPengaturan) {
    formPengaturan.addEventListener('submit', function(e) {
        e.preventDefault();
        
        tarifMotor = parseInt(inputTarifMotor.value) || 0;
        tarifMobil = parseInt(inputTarifMobil.value) || 0;
        
        simpanKeLocalStorage();
        alert('✅ Tarif parkir berhasil diperbarui!');
    });
}

// ========== FUNGSI: HAPUS RIWAYAT ==========
if (btnHapusRiwayat) {
    btnHapusRiwayat.addEventListener('click', function() {
        if (confirm('⚠️ Yakin ingin menghapus semua riwayat transaksi? Tindakan ini tidak dapat dibatalkan!')) {
            riwayatParkir = [];
            simpanKeLocalStorage();
            perbaruiTampilan();
        }
    });
}

// ========== FUNGSI: PERBARUI TAMPILAN ==========
function perbaruiTampilan() {
    perbaruiTabelSedangParkir();
    perbaruiTabelRiwayat();
    perbaruiJumlahParkir();
    perbaruiTotalPendapatan();
}

function perbaruiJumlahParkir() {
    if (jumlahParkir) {
        jumlahParkir.textContent = sedangParkir.length;
    }
}

function perbaruiTabelSedangParkir() {
    if (!tabelParkir) return;
    
    if (sedangParkir.length === 0) {
        tabelParkir.innerHTML = `
            <tr id="kosong-parkir">
                <td colspan="5" class="py-8 text-center text-gray-500">
                    <i class="fa fa-info-circle mr-1"></i> Tidak ada kendaraan yang sedang parkir
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    sedangParkir.forEach((kendaraan, indeks) => {
        const waktuMasuk = new Date(kendaraan.waktuMasuk);
        html += `
            <tr>
                <td>${indeks + 1}</td>
                <td class="font-medium">${kendaraan.platNomor}</td>
                <td>
                    <span class="px-2 py-1 rounded text-xs ${kendaraan.jenis === 'Motor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">
                        ${kendaraan.jenis}
                    </span>
                </td>
                <td>${formatWaktu(waktuMasuk)}</td>
                <td>
                    <button onclick="panggilKeluar('${kendaraan.platNomor}')" 
                        class="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded">
                        <i class="fa fa-sign-out mr-1"></i>Keluar
                    </button>
                </td>
            </tr>
        `;
    });
    
    tabelParkir.innerHTML = html;
}

// Fungsi bantuan — langsung cari di tab keluar
window.panggilKeluar = function(platNomor) {
    // Pindah ke tab keluar
    tabButtons.forEach(btn => {
        btn.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
        btn.classList.add('text-gray-500', 'hover:text-gray-700');
        if (btn.getAttribute('data-tab') === 'keluar') {
            btn.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
            btn.classList.remove('text-gray-500', 'hover:text-gray-700');
        }
    });
    tabContents.forEach(k => k.classList.add('hidden'));
    document.getElementById('keluar').classList.remove('hidden');
    
    inputCariPlat.value = platNomor;
    cariKendaraan();
};

function perbaruiTabelRiwayat() {
    if (!tabelRiwayat) return;
    
    if
