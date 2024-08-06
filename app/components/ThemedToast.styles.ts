import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    root: {
        width: '80%',
    },
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    successIcon: {
        marginRight: 10,
        width: 30,
        height: 30,
        tintColor: 'color-success-500',
    },
    errorIcon: {
        marginRight: 10,
        width: 30,
        height: 30,
        tintColor: 'color-danger-500',
    },
    avatarIcon: {
        marginRight: 10,
        width: 30,
        height: 30,
    },
    text2: {
        marginTop: 10,
        marginLeft: 40,
    },
});
