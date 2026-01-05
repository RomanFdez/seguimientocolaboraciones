import { Chip } from '@mui/material';
import { STATUSES } from '../utils/constants';

const StatusBadge = ({ status, size = 'small' }) => {
    const statusConfig = STATUSES.find(s => s.value === status);

    if (!statusConfig) return null;

    return (
        <Chip
            label={statusConfig.label}
            size={size}
            sx={{
                backgroundColor: statusConfig.color,
                color: 'white',
                fontWeight: 500,
            }}
        />
    );
};

export default StatusBadge;
