import { Capacitor, CapacitorHttp } from '@capacitor/core';

export interface TafsirResponse {
    id: number;
    sura: number;
    aya: number;
    text: string;
    footnotes: string;
}

const API_BASE_URL = "http://api.quran-tafseer.com/tafseer";
const TAFSIR_ID = 6; // Al-Mukhtasar fi Tafsir al-Quran

export const fetchTafsir = async (surah: number, ayah: number): Promise<TafsirResponse | null> => {
    const isNative = Capacitor.isNativePlatform();
    // Endpoint: /tafseer/{tafseer_id}/{sura_number}/{ayah_number}
    const url = `${API_BASE_URL}/${TAFSIR_ID}/${surah}/${ayah}`;

    try {
        let data;

        if (isNative) {
            const response = await CapacitorHttp.get({
                url: url,
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.status !== 200) {
                throw new Error(`API Error: ${response.status}`);
            }
            data = response.data;
        } else {
            const response = await fetch(url, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            data = await response.json();
        }

        // api.quran-tafseer.com response structure:
        // { "tafseer_id": 1, "tafseer_name": "...", "ayah_url": "...", "ayah_number": 1, "text": "..." }
        if (data && data.text) {
            return {
                id: data.tafseer_id || TAFSIR_ID,
                sura: surah,
                aya: ayah,
                text: data.text,
                footnotes: "" // New API doesn't seem to have separate footnotes
            };
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch Tafsir:", error);
        throw error;
    }
};
