import { initializeApp } from "firebase/app";
import { getRemoteConfig } from "firebase/remote-config";

// Firebase configuration for Ibad Al-Rahman
const firebaseConfig = {
    apiKey: "AIzaSyBv0izFgTF4G4PM8R1BOIqIPmcAucT3U-E",
    authDomain: "ibad-elrahman.firebaseapp.com",
    projectId: "ibad-elrahman",
    storageBucket: "ibad-elrahman.firebasestorage.app",
    messagingSenderId: "2896776268",
    appId: "1:2896776268:web:a881f25946c72e0313f8e9",
    measurementId: "G-B00E04LWCL"
};

const app = initializeApp(firebaseConfig);
export const remoteConfig = getRemoteConfig(app);
