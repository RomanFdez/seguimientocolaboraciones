
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function checkDoc() {
    const docSnap = await getDoc(doc(db, 'collaborations', 'DfDMc4OEWlPqM1vOeDsG'));
    if (docSnap.exists()) {
        console.log(JSON.stringify(docSnap.data(), null, 2));
    } else {
        console.log('No such document!');
    }
    process.exit(0);
}

checkDoc();
