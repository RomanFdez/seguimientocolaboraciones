
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAtrDQsX_ReKKttmRE4roaJ63a-wZU1HBc",
    authDomain: "seguimientocolaboracione-1eea6.firebaseapp.com",
    projectId: "seguimientocolaboracione-1eea6",
    storageBucket: "seguimientocolaboracione-1eea6.firebasestorage.app",
    messagingSenderId: "125577135252",
    appId: "1:125577135252:web:330ad9d02c7179e3c96081"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function forceTimeline() {
    const collabId = 'DfDMc4OEWlPqM1vOeDsG';
    const defStart = new Date(2026, 0, 1).toISOString();
    const defEnd = new Date(2026, 0, 31).toISOString();

    await updateDoc(doc(db, 'collaborations', collabId), {
        'timeline.2026': {
            startDate: defStart,
            endDate: defEnd
        },
        // Also update legacy fields just in case
        startDate: defStart,
        endDate: defEnd
    });
    console.log('✅ Timeline 2026 forzado para "Optimización Exstream 34".');
    process.exit(0);
}

forceTimeline();
