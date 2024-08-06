import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        marginHorizontal: 8,
    },
    line2: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skeleton: {
        height: 12,
        width: 150,
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 4,
    },
    indicatorOpen: {
        backgroundColor: 'color-success-500',
    },
    indicatorConnecting: {
        backgroundColor: 'color-warning-500',
    },
    indicatorClosed: {
        backgroundColor: 'color-danger-500',
    },
});
