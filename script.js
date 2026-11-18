
// ==========================================
// 1. DATA & INISIALISASI AWAL
// ==========================================
let sedangParkir = JSON.parse(localStorage.getItem("sedangParkir")) || [];
let riwayatParkir = JSON.parse(localStorage.getItem("riwayatParkir")) || [];
let tarifParkir = JSON.parse(localStorage.getItem("tarifParkir")) || {
  motor: 2000,
  mobil: 5000,
  truk: 10000
};

// Jalankan saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  isiWaktuOtomatis();
  setInterval(isiWaktuOtomatis, 1000); // Perbarui jam setiap detik
  perbaruiSemuaTampilan();
});

// ==========================================
// 2. SISTEM LOGIN
// ==========================================
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginPage = document.getElementById("loginPage");
  const loginMessage = document.getElementById("loginMessage");

  if (username === "admin" && password === "admin123") {
    if (loginPage) loginPage.style.display = "none";
    if (loginMessage) loginMessage.innerText = "";
    alert("Selamat datang Admin!");
  } else {
    if (loginMessage) {
      loginMessage.innerText = "Username atau password salah!";
    } else {
      alert("Username atau password salah!");
    }
  }
}

function logout() {
  const loginPage = document.getElementById("loginPage");
  if (loginPage) {
    loginPage.style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }
}

// ==========================================
// 3. NAVIGASI TAB MENU
// ==========================================
function bukaTab(namaTab, elemenTombol) {
  // Sembunyikan semua konten tab
  const semuaTab = document.querySelectorAll(".tab-content");
  semuaTab.forEach((tab) => {
    tab.style.display = "none";
  });

  // Hapus status aktif pada semua tombol navigasi
  const semuaTombol = document.querySelectorAll(".tab-btn, nav button");
  semuaTombol.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Tampilkan tab yang dipilih
  const targetTab = document.getElementById(namaTab);
  if (targetTab) {
    targetTab.style.display = "block";
  }

  // Tambahkan class active pada tombol yang diklik
  if (elemenTombol) {
    elemenTombol.classList.add("active");
  }
}

// ==========================================
// 4. WAKTU OTOMATIS & SIMPAN DATA
// ==========================================
function isiWaktuOtomatis() {
  const inputWaktu = document.getElementById("waktuMasuk");
  if (inputWaktu) {
    const sekarang = new Date();
    inputWaktu.value = sekarang.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "medium"
    });
  }
}

function simpanKeStorage() {
  localStorage.setItem("sedangParkir", JSON.stringify(sedangParkir));
  localStorage.setItem("riwayatParkir", JSON.stringify(riwayatParkir));
  localStorage.setItem("tarifParkir", JSON.stringify(tarifParkir));
}

function perbaruiSemuaTampilan() {
  perbaruiBadgeJumlah();
  perbaruiTabelSedangParkir();
  perbaruiTabelRiwayat();
}

function perbaruiBadgeJumlah() {
  const badge = document.getElementById("jumlahParkir");
  if (badge) {
    badge.innerText = sedangParkir.length;
  }
}

// ==========================================
// 5. KENDARAAN MASUK
// ==========================================
function catatMasuk() {
  const platInput = document.getElementById("platNomor");
  const jenisInput = document.getElementById("jenisKendaraan");

  if (!platInput || !jenisInput) return;

  const plat = platInput.value.trim().toUpperCase();
  const jenis = jenisInput.value;

  if (!plat) {
    alert("Harap masukkan nomor plat kendaraan!");
    return;
  }

  if (!jenis) {
    alert("Harap pilih jenis kendaraan!");
    return;
  }

  // Cek apakah plat nomor sudah ada di parkiran
  const sudahAda = sedangParkir.some((k) => k.plat === plat);
  if (sudahAda) {
    alert("Kendaraan dengan plat nomor " + plat + " masih berada di dalam area parkir!");
    return;
  }

  const dataBaru = {
    plat: plat,
    jenis: jenis,
    waktuMasuk: new Date().toISOString(),
    waktuMasukTeks: new Date().toLocaleString("id-ID")
  };

  sedangParkir.push(dataBaru);
  simpanKeStorage();
  perbaruiSemuaTampilan();

  // Reset form
  platInput.value = "";
  jenisInput.value = "";
  alert("Kendaraan " + plat + " berhasil dicatat masuk!");
}

// ==========================================
// 6. KENDARAAN KELUAR & HITUNG TARIF
// ==========================================
function prosesKeluar(platTarget) {
  const inputPlatKeluar = document.getElementById("platKeluar");
  const plat = (platTarget || (inputPlatKeluar ? inputPlatKeluar.value : "")).trim().toUpperCase();

  if (!plat) {
    alert("Masukkan plat nomor kendaraan yang akan keluar!");
    return;
  }

  const index = sedangParkir.findIndex((k) => k.plat === plat);
  if (index === -1) {
    alert("Data kendaraan dengan plat " + plat + " tidak ditemukan!");
    return;
  }

  const kendaraan = sedangParkir[index];
  const waktuMasuk = new Date(kendaraan.waktuMasuk);
  const waktuKeluar = new Date();

  // Hitung durasi dalam jam (minimal dihitung 1 jam)
  const selisihMs = waktuKeluar - waktuMasuk;
  const durasiJam = Math.max(1, Math.ceil(selisihMs / (1000 * 60 * 60)));

  const tarifPerJam = tarifParkir[kendaraan.jenis.toLowerCase()] || 2000;
  const totalBiaya = durasiJam * tarifPerJam;

  // Pindahkan dari sedangParkir ke riwayatParkir
  sedangParkir.splice(index, 1);
  riwayatParkir.unshift({
    plat: kendaraan.plat,
    jenis: kendaraan.jenis,
    waktuMasukTeks: kendaraan.waktuMasukTeks,
    waktuKeluarTeks: waktuKeluar.toLocaleString("id-ID"),
    durasi: durasiJam + " Jam",
    biaya: totalBiaya
  });

  simpanKeStorage();
  perbaruiSemuaTampilan();

  if (inputPlatKeluar) inputPlatKeluar.value = "";
  alert(
    `Kendaraan Keluar:\n` +
    `Plat: ${kendaraan.plat}\n` +
    `Durasi: ${durasiJam} Jam\n` +
    `Total Biaya: Rp ${totalBiaya.toLocaleString("id-ID")}`
  );
}

// ==========================================
// 7. RENDER TABEL SEDANG PARKIR & RIWAYAT
// ==========================================
function perbaruiTabelSedangParkir() {
  const tabelSedang = document.getElementById("tabelSedangParkir");
  if (!tabelSedang) return;

  if (sedangParkir.length === 0) {
    tabelSedang.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada kendaraan yang sedang parkir</td></tr>`;
    return;
  }

  tabelSedang.innerHTML = sedangParkir
    .map((k, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${k.plat}</strong></td>
        <td>${k.jenis}</td>
        <td>${k.waktuMasukTeks}</td>
        <td>
          <button onclick="prosesKeluar('${k.plat}')">Keluar</button>
        </td>
      </tr>
    `)
    .join("");
}

function perbaruiTabelRiwayat() {
  const tabelRiwayat = document.getElementById("tabelRiwayat");
  if (!tabelRiwayat) return;

  if (riwayatParkir.length === 0) {
    tabelRiwayat.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada riwayat parkir</td></tr>`;
    return;
  }

  tabelRiwayat.innerHTML = riwayatParkir
    .map((k, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${k.plat}</strong></td>
        <td>${k.jenis}</td>
        <td>${k.waktuMasukTeks}</td>
        <td>${k.waktuKeluarTeks}</td>
        <td>Rp ${k.biaya.toLocaleString("id-ID")}</td>
      </tr>
    `)
    .join("");
}

// ==========================================
// 8. PENGATURAN TARIF
// ==========================================
function simpanTarif() {
  const motor = parseInt(document.getElementById("tarifMotor")?.value);
  const mobil = parseInt(document.getElementById("tarifMobil")?.value);
  const truk = parseInt(document.getElementById("tarifTruk")?.value);

  if (!isNaN(motor)) tarifParkir.motor = motor;
  if (!isNaN(mobil)) tarifParkir.mobil = mobil;
  if (!isNaN(truk)) tarifParkir.truk = truk;

  simpanKeStorage();
  alert("Pengaturan tarif berhasil disimpan!");
}
if (username === "admin" && password === "admin123") {