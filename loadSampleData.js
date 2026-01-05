// Script to load sample collaborations into Firestore
// Run with: node loadSampleData.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration
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

const sampleCollaborations = [
    {
        title: "Migración Documental D2",
        status: "En curso",
        description: {
            short: "Migración de documentos históricos al nuevo sistema D2 con integración de metadatos y validación de integridad.",
            piezas: ["D2", "Integración D2", "Migración"],
            attributes: {
                operacional: "Sí",
                responsable: "Juan García",
                areaNegocio: "Operaciones",
                jefeProyecto: "María López",
                analistas: [],
                fechaNecesidad: "Q2 2025",
            },
        },
        situation: {
            updates: [
                {
                    id: "1",
                    date: Timestamp.fromDate(new Date(2025, 0, 15)),
                    text: "Completada fase de análisis de requisitos. Iniciando desarrollo de scripts de migración.",
                    isCurrent: true,
                },
            ],
        },
        risks: {
            level: "orange",
            description: "Posible retraso por dependencias con el equipo de infraestructura.",
        },
        deliveries: [
            {
                id: "1",
                date: Timestamp.fromDate(new Date(2025, 2, 31)),
                description: "Entrega piloto",
                type: "estimated",
            },
            {
                id: "2",
                date: Timestamp.fromDate(new Date(2025, 5, 30)),
                description: "Producción",
                type: "estimated",
            },
        ],
        ganttLink: "",
        createdBy: "system",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        title: "Implementación Firma Digital Certificada",
        status: "Nuevo",
        description: {
            short: "Implementación de sistema de firma digital certificada para contratos y documentos legales.",
            piezas: ["Firma digital certificada", "Firma Digital"],
            attributes: {
                operacional: "No",
                responsable: "Carlos Ruiz",
                areaNegocio: "Legal",
                jefeProyecto: "Ana Martínez",
                analistas: [],
                fechaNecesidad: "Q3 2025",
            },
        },
        situation: {
            updates: [
                {
                    id: "1",
                    date: Timestamp.fromDate(new Date(2025, 0, 10)),
                    text: "Proyecto aprobado. Pendiente asignación de recursos.",
                    isCurrent: true,
                },
            ],
        },
        risks: {
            level: "green",
            description: "",
        },
        deliveries: [
            {
                id: "1",
                date: Timestamp.fromDate(new Date(2025, 8, 30)),
                description: "MVP",
                type: "estimated",
            },
        ],
        ganttLink: "",
        createdBy: "system",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        title: "Optimización Exstream",
        status: "Soporte",
        description: {
            short: "Soporte continuo y optimización de plantillas Exstream para generación de documentos.",
            piezas: ["Exstream", "Generación"],
            attributes: {
                operacional: "Sí",
                responsable: "Laura Pérez",
                areaNegocio: "Producción",
                jefeProyecto: "Pedro Sánchez",
                analistas: [],
                fechaNecesidad: "Continuo",
            },
        },
        situation: {
            updates: [
                {
                    id: "1",
                    date: Timestamp.fromDate(new Date(2025, 0, 20)),
                    text: "Atendidas 5 solicitudes de optimización. Todas resueltas satisfactoriamente.",
                    isCurrent: true,
                },
            ],
        },
        risks: {
            level: "green",
            description: "",
        },
        deliveries: [],
        ganttLink: "",
        createdBy: "system",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        title: "Integración API GDOS",
        status: "En curso",
        description: {
            short: "Desarrollo de integración con API GDOS para sincronización de datos documentales.",
            piezas: ["Integración AGD / Integración API GDOS"],
            attributes: {
                operacional: "Sí",
                responsable: "Roberto Díaz",
                areaNegocio: "TI",
                jefeProyecto: "Isabel Fernández",
                analistas: [],
                fechaNecesidad: "Q1 2025",
            },
        },
        situation: {
            updates: [
                {
                    id: "1",
                    date: Timestamp.fromDate(new Date(2025, 0, 25)),
                    text: "Completado 70% del desarrollo. Pendiente testing de integración.",
                    isCurrent: true,
                },
            ],
        },
        risks: {
            level: "red",
            description: "Cambios en la API de GDOS requieren ajustes significativos. Posible impacto en fechas de entrega.",
        },
        deliveries: [
            {
                id: "1",
                date: Timestamp.fromDate(new Date(2025, 1, 28)),
                description: "Entrega inicial",
                type: "new",
            },
        ],
        ganttLink: "",
        createdBy: "system",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        title: "Proyecto Valija Digital",
        status: "Finalizado",
        description: {
            short: "Sistema de valija digital para distribución segura de documentos entre oficinas.",
            piezas: ["Valija digital", "Distribución Trazabilidad"],
            attributes: {
                operacional: "Sí",
                responsable: "Carmen Vega",
                areaNegocio: "Operaciones",
                jefeProyecto: "Luis Torres",
                analistas: [],
                fechaNecesidad: "Q4 2024",
            },
        },
        situation: {
            updates: [
                {
                    id: "1",
                    date: Timestamp.fromDate(new Date(2024, 11, 15)),
                    text: "Proyecto completado y en producción. Cierre administrativo pendiente.",
                    isCurrent: false,
                },
            ],
        },
        risks: {
            level: "green",
            description: "",
        },
        deliveries: [
            {
                id: "1",
                date: Timestamp.fromDate(new Date(2024, 11, 20)),
                description: "Producción",
                type: "actual",
            },
        ],
        ganttLink: "",
        createdBy: "system",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
];

async function loadSampleData() {
    console.log('🚀 Iniciando carga de datos de ejemplo...\n');

    try {
        for (const collab of sampleCollaborations) {
            const docRef = await addDoc(collection(db, 'collaborations'), collab);
            console.log(`✅ Creada colaboración: "${collab.title}" (ID: ${docRef.id})`);
        }

        console.log('\n✨ ¡Datos cargados exitosamente!');
        console.log(`📊 Total de colaboraciones creadas: ${sampleCollaborations.length}`);
        console.log('\n🌐 Ahora puedes ver las colaboraciones en tu aplicación.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        process.exit(1);
    }
}

loadSampleData();
