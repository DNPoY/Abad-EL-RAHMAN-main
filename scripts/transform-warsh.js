import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const warshPath = path.join(__dirname, '../src/lib/quran-warsh.json');
const uthmaniPath = path.join(__dirname, '../src/lib/quran-uthmani.json');
const outputPath = path.join(__dirname, '../src/lib/quran-warsh-fixed.json');

async function transform() {
    try {
        console.log("Reading files...");
        const warshRaw = fs.readFileSync(warshPath, 'utf8');
        const uthmaniRaw = fs.readFileSync(uthmaniPath, 'utf8');

        const warshData = JSON.parse(warshRaw);
        const uthmaniData = JSON.parse(uthmaniRaw);

        console.log("Warsh keys:", Object.keys(warshData));

        let warshVerses = [];
        if (Array.isArray(warshData.quran)) {
            warshVerses = warshData.quran;
        } else if (warshData.data && Array.isArray(warshData.data.surahs)) {
            console.log("Warsh is already structured? Check keys.");
            // If it has surahs, maybe it's already good but structure is slightly different?
            // But user says it crashes.
            // Let's assume it is the flat array format from Fawaz Ahmed API.
            warshVerses = warshData.quran || [];
        }

        if (warshVerses.length === 0) {
            console.error("Could not find Warsh verses flat array.");
            // Determine structure
            console.log("Structure dump:", JSON.stringify(warshData).substring(0, 200));
            return;
        }

        console.log(`Loaded ${warshVerses.length} Warsh verses.`);

        // Create specific lookup map for speed
        const warshMap = new Map();
        warshVerses.forEach(v => {
            warshMap.set(`${v.chapter}:${v.verse}`, v.text);
        });

        // Clone Uthmani structure
        // Uthmani structure: { data: { surahs: [...] } } or { default: ... } if loaded via require default
        // The file on disk likely has { data: { surahs: [...] } }

        let validUthmaniData = uthmaniData;
        if (uthmaniData.data) validUthmaniData = uthmaniData.data; // Simplify to root being the data object if wrapped
        // Wait, surahView expects { data: { surahs: [] } }
        // Let's inspect uthmaniData structure locally

        const surahs = validUthmaniData.surahs || (uthmaniData.data && uthmaniData.data.surahs);

        if (!surahs) {
            console.error("Could not find Uthmani surahs.");
            return;
        }

        console.log("Transforming...");

        const newSurahs = surahs.map(surah => {
            const newAyahs = surah.ayahs.map(ayah => {
                const warshText = warshMap.get(`${surah.number}:${ayah.numberInSurah}`);
                // Use Warsh text if found, else keep Uthmani (fallback)
                // Note: Uthmani typically has Basmalah in text for verse 1 except Fatiha/Tawbah?
                // Fawaz Ahmed text usually includes Basmalah for verse 1.
                // We will trust the API text.
                return {
                    ...ayah,
                    text: warshText || ayah.text
                };
            });

            return {
                ...surah,
                ayahs: newAyahs
            };
        });

        const outputData = {
            data: {
                surahs: newSurahs
            }
        };

        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        console.log("Transformation complete. Saved to quran-warsh-fixed.json");

    } catch (e) {
        console.error("Transform failed:", e);
    }
}

transform();
