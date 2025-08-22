/**
 * Test Script untuk Generate Data Harian
 * 
 * Script ini digunakan untuk testing manual generate data harian
 * tanpa perlu menjalankan aplikasi NestJS
 */

// Fungsi untuk menghitung jumlah hari dalam bulan
function getDaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

// Fungsi untuk menghitung jumlah hari minggu dalam bulan
function getSundaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(date);
  let sundayCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    if (currentDate.getDay() === 0) { // 0 = Sunday
      sundayCount++;
    }
  }

  return sundayCount;
}

// Fungsi untuk generate data harian (simulasi)
function generateDailyData(planDate, totalValues) {
  const totalDays = getDaysInMonth(planDate);
  const totalSundays = getSundaysInMonth(planDate);
  const totalAvailableDays = totalDays - totalSundays;

  console.log(`\n📅 Generate Data untuk Bulan: ${planDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`);
  console.log(`📊 Total Hari: ${totalDays}`);
  console.log(`🏖️  Total Hari Minggu: ${totalSundays}`);
  console.log(`✅ Total Hari Tersedia: ${totalAvailableDays}`);

  const dailyData = [];

  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(planDate.getFullYear(), planDate.getMonth(), day);
    const isSunday = currentDate.getDay() === 0;

    // Hitung nilai per hari
    const dailyEwh = totalValues.averageDayEwh / totalDays;
    const dailyObTarget = totalValues.obTarget / totalDays;
    const dailyOreTarget = totalValues.oreTarget / totalDays;
    const dailyQuarry = totalValues.quarryTarget / totalDays;
    const dailyOreShipment = totalValues.oreShipmentTarget / totalDays;

    // Hitung nilai shift
    const shiftObTarget = dailyObTarget / 2;
    const shiftOreTarget = dailyOreTarget / 2;
    const shiftQuarry = dailyQuarry / 2;
    const shiftSrTarget = shiftObTarget / shiftOreTarget;

    // Hitung remaining stock
    const oldStock = totalValues.sisaStock;
    const remainingStock = oldStock - dailyOreShipment + dailyOreTarget;

    const dailyRecord = {
      tanggal: currentDate.toLocaleDateString('id-ID'),
      hari: currentDate.toLocaleDateString('id-ID', { weekday: 'long' }),
      is_calender_day: true,
      is_holiday_day: isSunday,
      is_available_day: !isSunday,
      average_day_ewh: dailyEwh.toFixed(2),
      ob_target: dailyObTarget.toFixed(2),
      ore_target: dailyOreTarget.toFixed(2),
      quarry: dailyQuarry.toFixed(2),
      sr_target: (dailyObTarget / dailyOreTarget).toFixed(2),
      ore_shipment_target: dailyOreShipment.toFixed(2),
      daily_old_stock: oldStock,
      shift_ob_target: shiftObTarget.toFixed(2),
      shift_ore_target: shiftOreTarget.toFixed(2),
      shift_quarry: shiftQuarry.toFixed(2),
      shift_sr_target: shiftSrTarget.toFixed(2),
      remaining_stock: remainingStock.toFixed(2),
    };

    dailyData.push(dailyRecord);
  }

  return dailyData;
}

// Test cases untuk berbagai bulan
const testCases = [
  {
    name: 'Januari 2025',
    date: new Date('2025-01-15'),
    expectedDays: 31,
    expectedSundays: 5,
  },
  {
    name: 'Februari 2025',
    date: new Date('2025-02-15'),
    expectedDays: 28,
    expectedSundays: 4,
  },
  {
    name: 'April 2025',
    date: new Date('2025-04-15'),
    expectedDays: 30,
    expectedSundays: 4,
  },
  {
    name: 'Agustus 2025',
    date: new Date('2025-08-15'),
    expectedDays: 31,
    expectedSundays: 5,
  },
  {
    name: 'Desember 2025',
    date: new Date('2025-12-15'),
    expectedDays: 31,
    expectedSundays: 5,
  },
];

// Data total bulanan (contoh)
const totalValues = {
  averageDayEwh: 150.0,
  averageMonthEwh: 4500.0,
  obTarget: 1500000.0,
  oreTarget: 750000.0,
  quarryTarget: 300000.0,
  srTarget: 2.0,
  oreShipmentTarget: 600000.0,
  remainingStock: 100000.0,
  sisaStock: 50000.0,
  fleet: 25,
};

console.log('🚀 Test Generate Data Harian Otomatis');
console.log('=====================================');

// Jalankan test cases
testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Test: ${testCase.name}`);
  console.log('─'.repeat(50));

  // Test perhitungan hari
  const actualDays = getDaysInMonth(testCase.date);
  const actualSundays = getSundaysInMonth(testCase.date);
  const actualAvailableDays = actualDays - actualSundays;

  console.log(`📊 Hasil Perhitungan:`);
  console.log(`   Expected Days: ${testCase.expectedDays} | Actual: ${actualDays} | ✅ ${actualDays === testCase.expectedDays ? 'PASS' : 'FAIL'}`);
  console.log(`   Expected Sundays: ${testCase.expectedSundays} | Actual: ${actualSundays} | ✅ ${actualSundays === testCase.expectedSundays ? 'PASS' : 'FAIL'}`);
  console.log(`   Available Days: ${actualAvailableDays}`);

  // Generate data harian
  const dailyData = generateDailyData(testCase.date, totalValues);
  
  console.log(`\n📋 Data Harian yang Di-Generate (${dailyData.length} records):`);
  console.log(`   Tanggal 1: ${dailyData[0].tanggal} (${dailyData[0].hari})`);
  console.log(`   Tanggal ${actualDays}: ${dailyData[actualDays - 1].tanggal} (${dailyData[actualDays - 1].hari})`);
  
  // Tampilkan beberapa contoh data
  console.log(`\n🔍 Contoh Data Harian:`);
  dailyData.slice(0, 3).forEach((record, idx) => {
    console.log(`   ${idx + 1}. ${record.tanggal} (${record.hari}):`);
    console.log(`      EWH: ${record.average_day_ewh}, OB: ${record.ob_target}, Ore: ${record.ore_target}`);
    console.log(`      Holiday: ${record.is_holiday_day}, Available: ${record.is_available_day}`);
  });

  if (dailyData.length > 3) {
    console.log(`   ... dan ${dailyData.length - 3} data lainnya`);
  }
});

console.log('\n✅ Test Generate Data Harian Selesai!');
console.log('\n📝 Kesimpulan:');
console.log('   - Setiap bulan akan generate data sesuai jumlah hari');
console.log('   - Januari, Maret, Mei, Juli, Agustus, Oktober, Desember: 31 hari');
console.log('   - April, Juni, September, November: 30 hari');
console.log('   - Februari: 28 hari (tahun biasa) atau 29 hari (tahun kabisat)');
console.log('   - Hari Minggu otomatis dianggap hari libur');
console.log('   - Semua nilai harian dihitung otomatis dari total bulanan');
