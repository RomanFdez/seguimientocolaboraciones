import { Box, Typography } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import { RISK_LEVELS } from '../utils/constants';

const RiskIndicator = ({ level, size = 'medium' }) => {
    const riskConfig = RISK_LEVELS.find(r => r.value === level);

    if (!riskConfig) return null;

    const iconSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircleIcon
                sx={{
                    color: riskConfig.color,
                    fontSize: iconSize,
                }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {riskConfig.label}
            </Typography>
        </Box>
    );
};

export default RiskIndicator;
