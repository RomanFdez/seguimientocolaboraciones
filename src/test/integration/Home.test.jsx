import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';

// Mock del contexto de datos
vi.mock('../../context/DataContext', () => ({
    useData: () => ({
        collaborations: [
            {
                id: '1',
                title: 'Test Collaboration 1',
                status: 'En curso',
                risks: { level: 'green' },
            },
            {
                id: '2',
                title: 'Test Collaboration 2',
                status: 'Nuevo',
                risks: { level: 'orange' },
            },
        ],
        loading: false,
    }),
}));

describe('Home Page Integration', () => {
    const renderHome = () => {
        return render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
    };

    it('renders the home page without crashing', () => {
        renderHome();
        // Verificar que la página se renderiza
        expect(document.body).toBeInTheDocument();
    });

    it('displays collaboration statistics', () => {
        renderHome();
        // Verificar que se muestran estadísticas
        const stats = screen.getAllByText(/colaboraciones?/i);
        expect(stats.length).toBeGreaterThan(0);
    });

    it('shows total count of collaborations', () => {
        renderHome();
        // Verificar que se muestra el total (2 colaboraciones mockeadas)
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});
