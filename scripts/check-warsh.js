const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/quran-warsh.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    console.log("Root content keys:", Object.keys(data));

    if (data.quran) {
        console.log("Found 'quran' key. Is array?", Array.isArray(data.quran));
        if (Array.isArray(data.quran) && data.quran.length > 0) {
            console.log("First item:", data.quran[0]);
        }
    }

    // Check for 'surahs' just in case
    if (data.data && data.data.surahs) {
        console.log("Found data.surahs (Correct Structure?)");
    }

} catch (e) {
    console.error("Error parsing JSON:", e.message);
}
