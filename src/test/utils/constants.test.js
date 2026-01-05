import { describe, it, expect } from 'vitest';
import { STATUSES, RISK_LEVELS, COLLABORATION_TYPES, PIEZAS } from '../../utils/constants';

describe('constants', () => {
    describe('STATUSES', () => {
        it('contains all required status values', () => {
            const statusValues = STATUSES.map(s => s.value);
            expect(statusValues).toContain('Nuevo');
            expect(statusValues).toContain('En curso');
            expect(statusValues).toContain('Finalizado');
            expect(statusValues).toContain('Soporte');
        });

        it('each status has label and color', () => {
            STATUSES.forEach(status => {
                expect(status).toHaveProperty('value');
                expect(status).toHaveProperty('label');
                expect(status).toHaveProperty('color');
            });
        });
    });

    describe('RISK_LEVELS', () => {
        it('contains all risk levels', () => {
            const riskValues = RISK_LEVELS.map(r => r.value);
            expect(riskValues).toContain('green');
            expect(riskValues).toContain('orange');
            expect(riskValues).toContain('red');
        });

        it('each risk level has label and color', () => {
            RISK_LEVELS.forEach(risk => {
                expect(risk).toHaveProperty('value');
                expect(risk).toHaveProperty('label');
                expect(risk).toHaveProperty('color');
            });
        });
    });

    describe('COLLABORATION_TYPES', () => {
        it('is an array of objects', () => {
            expect(Array.isArray(COLLABORATION_TYPES)).toBe(true);
            COLLABORATION_TYPES.forEach(type => {
                expect(type).toHaveProperty('value');
                expect(type).toHaveProperty('label');
            });
        });

        it('contains expected collaboration types', () => {
            expect(COLLABORATION_TYPES.length).toBeGreaterThan(0);
            const values = COLLABORATION_TYPES.map(t => t.value);
            expect(values).toContain('Vida');
            expect(values).toContain('No vida');
        });
    });

    describe('PIEZAS', () => {
        it('is an array of strings', () => {
            expect(Array.isArray(PIEZAS)).toBe(true);
            PIEZAS.forEach(pieza => {
                expect(typeof pieza).toBe('string');
            });
        });

        it('contains expected piezas', () => {
            expect(PIEZAS.length).toBeGreaterThan(0);
            expect(PIEZAS).toContain('Exstream');
            expect(PIEZAS).toContain('D2');
            expect(PIEZAS).toContain('Firma Digital');
        });
    });
});
