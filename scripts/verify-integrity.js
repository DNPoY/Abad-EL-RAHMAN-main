
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

console.log(`${colors.cyan}Starting Divine Integrity Check...${colors.reset}\n`);

const paths = {
    uthmani: path.join(__dirname, '../src/lib/quran-uthmani.json'),
    warsh: path.join(__dirname, '../src/lib/quran-warsh.json'),
    azkar: path.join(__dirname, '../src/lib/azkar-data.ts')
};

function checkQuranFile(filePath, type) {
    if (!fs.existsSync(filePath)) {
        console.error(`${colors.red}[FAIL] ${type} file missing at ${filePath}${colors.reset}`);
        return;
    }

    try {
        const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let data;

        // Handle different JSON structures
        if (Array.isArray(fileContent)) {
            data = fileContent;
        } else if (fileContent.data && Array.isArray(fileContent.data.surahs)) {
            data = fileContent.data.surahs;
        } else if (fileContent.surahs && Array.isArray(fileContent.surahs)) {
            data = fileContent.surahs;
        } else {
            throw new Error("Unknown JSON structure. Expected array or { data: { surahs: [] } }");
        }

        // Check 1: Surah Count
        if (data.length !== 114) {
            console.error(`${colors.red}[FAIL] ${type}: Expected 114 Surahs, found ${data.length}${colors.reset}`);
        } else {
            console.log(`${colors.green}[PASS] ${type}: 114 Surahs verified.${colors.reset}`);
        }

        // Check 2: Ayah Count (Total should be 6236 for Hafs/Uthmani)
        let totalAyahs = 0;
        let corruptedAyahs = 0;
        data.forEach(surah => {
            if (!surah.ayahs || !Array.isArray(surah.ayahs)) {
                console.error(`${colors.red}[FAIL] ${type}: Surah ${surah.id || 'Unknown'} corrupted structure.${colors.reset}`);
                return;
            }
            totalAyahs += surah.ayahs.length;

            surah.ayahs.forEach(ayah => {
                if (!ayah.text || ayah.text.trim() === "") {
                    corruptedAyahs++;
                }
            });
        });

        if (totalAyahs === 6236) {
            console.log(`${colors.green}[PASS] ${type}: 6236 Ayahs verified (Hafs Standard).${colors.reset}`);
        } else {
            // Warsh might vary slightly in numbering count depending on the standard used, but usually matches in total text flow
            console.log(`${colors.yellow}[NOTE] ${type}: Found ${totalAyahs} Ayahs.${colors.reset}`);
        }

        if (corruptedAyahs > 0) {
            console.error(`${colors.red}[FAIL] ${type}: Found ${corruptedAyahs} corrupted/empty Ayahs!${colors.reset}`);
        } else {
            console.log(`${colors.green}[PASS] ${type}: No empty text blocks found.${colors.reset}`);
        }

    } catch (err) {
        console.error(`${colors.red}[CRITICAL] ${type}: File corrupted or invalid JSON. ${err.message}${colors.reset}`);
    }
}

// Run checks
checkQuranFile(paths.uthmani, 'Hafs (Uthmani)');
checkQuranFile(paths.warsh, 'Warsh');

console.log(`\n${colors.cyan}Integrity Check Complete.${colors.reset}`);
