import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiskIndicator from '../../components/RiskIndicator';

describe('RiskIndicator', () => {
    it('renders green indicator for low risk', () => {
        render(<RiskIndicator level="green" />);
        expect(screen.getByText('Sin riesgo')).toBeInTheDocument();
    });

    it('renders orange indicator for medium risk', () => {
        render(<RiskIndicator level="orange" />);
        expect(screen.getByText('Riesgo moderado')).toBeInTheDocument();
    });

    it('renders red indicator for high risk', () => {
        render(<RiskIndicator level="red" />);
        expect(screen.getByText('Riesgo alto')).toBeInTheDocument();
    });

    it('returns null when no level is provided', () => {
        const { container } = render(<RiskIndicator />);
        expect(container.firstChild).toBeNull();
    });

    it('returns null for invalid level', () => {
        const { container } = render(<RiskIndicator level="invalid" />);
        expect(container.firstChild).toBeNull();
    });
});
