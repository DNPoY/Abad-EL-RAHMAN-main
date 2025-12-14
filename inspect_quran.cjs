const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/quran-uthmani.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const surah = data.data.surahs.find(s => s.number === 20);
if (surah) {
    const ayah = surah.ayahs.find(a => a.numberInSurah === 10);
    if (ayah) {
        console.log('Ayah Text:', ayah.text);
        console.log('Ayah Text Characters:', ayah.text.split('').map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join(''));
    } else {
        console.log('Ayah 10 not found');
    }
} else {
    console.log('Surah 20 not found');
}
