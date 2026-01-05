import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../components/ConfirmDialog';

describe('ConfirmDialog', () => {
    it('does not render when open is false', () => {
        render(
            <ConfirmDialog
                open={false}
                title="Test Title"
                message="Test Message"
                onConfirm={() => { }}
                onCancel={() => { }}
            />
        );
        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('renders when open is true', () => {
        render(
            <ConfirmDialog
                open={true}
                title="Test Title"
                message="Test Message"
                onConfirm={() => { }}
                onCancel={() => { }}
            />
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmDialog
                open={true}
                title="Test Title"
                message="Test Message"
                onConfirm={onConfirm}
                onCancel={() => { }}
            />
        );

        const confirmButton = screen.getByText('Confirmar');
        fireEvent.click(confirmButton);
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
        const onCancel = vi.fn();
        render(
            <ConfirmDialog
                open={true}
                title="Test Title"
                message="Test Message"
                onConfirm={() => { }}
                onCancel={onCancel}
            />
        );

        const cancelButton = screen.getByText('Cancelar');
        fireEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('displays default button labels', () => {
        render(
            <ConfirmDialog
                open={true}
                title="Test Title"
                message="Test Message"
                onConfirm={() => { }}
                onCancel={() => { }}
            />
        );

        expect(screen.getByText('Confirmar')).toBeInTheDocument();
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
});
