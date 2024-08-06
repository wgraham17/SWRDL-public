import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    root: {
        flex: 1,
    },
    container: {
        alignSelf: 'stretch',
        alignItems: 'stretch',
        padding: 10,
        paddingTop: 20,
    },
    section: {
        alignItems: 'stretch',
    },
    sectionTitle: {
        marginBottom: 5,
    },
    sectionDivider: {
        marginVertical: 25,
    },
    notificationsToggle: {
        alignSelf: 'flex-start',
    },
    notificationsPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    notificationsSpinner: {
        marginVertical: 2,
        marginLeft: 13,
        marginRight: 23,
    },
    recoveryHint: {
        marginBottom: 20,
    },
    recoverySuccess: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recoveryIcon: {
        width: 30,
        height: 30,
        tintColor: 'color-success-500',
        marginRight: 10,
    },
});
