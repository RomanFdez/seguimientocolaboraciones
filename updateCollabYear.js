
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

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

async function addYearToCollab() {
    const q = collection(db, 'collaborations');
    const snapshot = await getDocs(q);

    let target = null;
    snapshot.forEach(doc => {
        const data = doc.data();
        // Look for similar title
        if (data.title && (data.title.includes('Exstream') || data.title.includes('34'))) {
            target = { id: doc.id, ...data };
        }
    });

    if (target) {
        console.log(`Encontrada: "${target.title}" (ID: ${target.id})`);
        const currentYears = target.years || [];
        if (!currentYears.includes(2026)) {
            const updatedYears = [...currentYears, 2026];
            await updateDoc(doc(db, 'collaborations', target.id), {
                years: updatedYears
            });
            console.log('✅ Actualizada con el año 2026.');
        } else {
            console.log('ℹ️ Ya tiene asignado el año 2026.');
        }
    } else {
        console.error('❌ No se encontró la colaboración "Opcimización Exstream 34".');
    }
    process.exit(0);
}

addYearToCollab();
