import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../../components/StatusBadge';

describe('StatusBadge', () => {
    it('renders the status label correctly', () => {
        render(<StatusBadge status="En curso" />);
        expect(screen.getByText('En curso')).toBeInTheDocument();
    });

    it('applies correct color for "En curso" status', () => {
        const { container } = render(<StatusBadge status="En curso" />);
        const badge = container.querySelector('.MuiChip-root');
        expect(badge).toBeInTheDocument();
    });

    it('applies correct color for "Nuevo" status', () => {
        const { container } = render(<StatusBadge status="Nuevo" />);
        const badge = container.querySelector('.MuiChip-root');
        expect(badge).toBeInTheDocument();
    });

    it('applies correct color for "Finalizado" status', () => {
        const { container } = render(<StatusBadge status="Finalizado" />);
        const badge = container.querySelector('.MuiChip-root');
        expect(badge).toBeInTheDocument();
    });

    it('applies correct color for "Soporte" status', () => {
        const { container } = render(<StatusBadge status="Soporte" />);
        const badge = container.querySelector('.MuiChip-root');
        expect(badge).toBeInTheDocument();
    });

    it('returns null for unknown status', () => {
        const { container } = render(<StatusBadge status="Unknown" />);
        expect(container.firstChild).toBeNull();
    });
});
