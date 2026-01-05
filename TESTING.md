# Testing Guide

## 🧪 Suite de Testing

Este proyecto utiliza **Vitest** y **React Testing Library** para garantizar la calidad del código.

## 📦 Dependencias de Testing

- **Vitest**: Framework de testing moderno y rápido para Vite
- **@testing-library/react**: Utilidades para testing de componentes React
- **@testing-library/jest-dom**: Matchers personalizados para DOM
- **@testing-library/user-event**: Simulación de eventos de usuario
- **jsdom**: Entorno DOM para Node.js

## 🚀 Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (recomendado durante desarrollo)
npm test -- --watch

# Ejecutar tests con interfaz gráfica
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar un archivo específico
npm test -- src/test/components/StatusBadge.test.jsx
```

## 📁 Estructura de Tests

```
src/test/
├── setup.js                      # Configuración global de tests
├── components/                   # Tests de componentes
│   ├── StatusBadge.test.jsx
│   ├── RiskIndicator.test.jsx
│   └── ConfirmDialog.test.jsx
├── utils/                        # Tests de utilidades
│   ├── dateHelpers.test.js
│   └── constants.test.js
└── integration/                  # Tests de integración
    └── Home.test.jsx
```

## ✅ Cobertura Actual

Los tests cubren:

- ✓ Componentes básicos (StatusBadge, RiskIndicator, ConfirmDialog)
- ✓ Utilidades de fechas (formatDate, isCurrentMonth, getMonthName)
- ✓ Constantes de la aplicación (STATUSES, RISK_LEVELS, etc.)
- ✓ Integración básica de páginas (Home)

## 📝 Escribir Nuevos Tests

### Test de Componente Básico

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MiComponente from '../components/MiComponente';

describe('MiComponente', () => {
  it('renders correctly', () => {
    render(<MiComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

### Test con Interacción de Usuario

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MiBoton from '../components/MiBoton';

describe('MiBoton', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<MiBoton onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test de Utilidad

```javascript
import { describe, it, expect } from 'vitest';
import { miFuncion } from '../utils/helpers';

describe('miFuncion', () => {
  it('returns expected value', () => {
    expect(miFuncion('input')).toBe('expected output');
  });
});
```

## 🎯 Mejores Prácticas

1. **Nombrar tests descriptivamente**: Usa nombres que expliquen qué se está probando
2. **Arrange-Act-Assert**: Organiza tus tests en estas tres fases
3. **Un concepto por test**: Cada test debe verificar una sola cosa
4. **Evitar detalles de implementación**: Testea comportamiento, no implementación
5. **Usar mocks con moderación**: Solo mockea dependencias externas necesarias

## 🔍 Debugging Tests

```bash
# Ejecutar tests con más información
npm test -- --reporter=verbose

# Ejecutar un solo test
npm test -- -t "nombre del test"

# Ver output completo de errores
npm test -- --no-coverage
```

## 📊 CI/CD Integration

Los tests se ejecutan automáticamente en:
- Pre-commit hooks (opcional)
- Pull requests
- Antes del build de producción

## 🛠️ Configuración

La configuración de Vitest se encuentra en `vitest.config.js`:

```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎓 Próximos Pasos

Para mejorar la cobertura de tests:

1. Añadir tests para páginas complejas (CollaborationEdit, GanttView)
2. Tests E2E con Playwright o Cypress
3. Tests de accesibilidad con jest-axe
4. Snapshot testing para componentes visuales complejos
5. Tests de performance con React DevTools Profiler
