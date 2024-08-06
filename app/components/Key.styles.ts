import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    button: {
        width: '9%',
        height: 60,
        backgroundColor: 'background-basic-color-4',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0.5%',
        borderRadius: 5,
    },
    buttonDisabled: {
        backgroundColor: 'background-basic-color-1',
    },
    buttonCorrect: {
        backgroundColor: 'color-primary-500',
    },
    buttonContained: {
        backgroundColor: 'color-warning-600',
    },
    iconButton: {
        width: '12%',
    },
    icon: {
        width: 20,
        height: 20,
        tintColor: 'text-basic-color',
    },
    iconDisabled: {
        tintColor: 'text-hint-color',
    },
});
