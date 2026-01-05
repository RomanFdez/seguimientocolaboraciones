// Collaboration statuses
export const STATUSES = [
    { value: 'Nuevo', label: 'Nuevo', color: '#2196f3' },
    { value: 'En curso', label: 'En curso', color: '#4caf50' },
    { value: 'Especial', label: 'Especial', color: '#ff9800' },
    { value: 'En pausa', label: 'En pausa', color: '#9e9e9e' },
    { value: 'Soporte', label: 'Soporte', color: '#00bcd4' },
    { value: 'Finalizado', label: 'Finalizado', color: '#607d8b' },
    { value: 'Cancelados', label: 'Cancelados', color: '#f44336' },
];

// Collaboration types
export const COLLABORATION_TYPES = [
    { value: 'Vida', label: 'Vida' },
    { value: 'No vida', label: 'No vida' },
];

// Piezas (tags)
export const PIEZAS = [
    'Exstream',
    'Generación',
    'Geatyc / ALVEO',
    'Odeón',
    'Mapa Documental',
    'D2',
    'Integración D2',
    'Integración AGD / Integración API GDOS',
    'Firma TdC',
    'Firma Biométrica',
    'Firma Digital',
    'Firma digital certificada',
    'DED',
    'Distribución Trazabilidad',
    'WP Digital ó WP Papel',
    'Valija digital',
    'Carga Masiva',
    'Gestión Consentimiento',
    'Gestor DNI',
    'Captura y catalogación',
    'Migración',
    'Comunicación Certificada Digital',
    'Digitalización y custodia',
];

// Risk levels
export const RISK_LEVELS = [
    { value: 'green', label: 'Sin riesgo', color: '#4caf50' },
    { value: 'orange', label: 'Riesgo moderado', color: '#ff9800' },
    { value: 'red', label: 'Riesgo alto', color: '#f44336' },
];

// Delivery types
export const DELIVERY_TYPES = [
    { value: 'estimated', label: 'Fecha estimada', color: '#2196f3' },
    { value: 'new', label: 'Nueva entrega prevista', color: '#ff9800' },
    { value: 'actual', label: 'Fecha real', color: '#4caf50' },
];

// User roles
export const USER_ROLES = [
    { value: 'admin', label: 'Administrador' },
    { value: 'analista', label: 'Analista' },
    { value: 'seguimiento', label: 'Seguimiento (Solo lectura)' },
];
