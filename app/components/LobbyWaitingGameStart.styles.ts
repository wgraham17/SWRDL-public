import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    headerIcon: {
        marginRight: 10,
        tintColor: 'text-basic-color',
        width: 20,
        height: 20,
    },
    container: {
        marginTop: 50,
    },
    playersHereCard: {
        backgroundColor: 'background-basic-color-2',
        marginBottom: 20,
    },
    inviteContainer: {
        marginTop: 10,
        paddingVertical: 10,
    },
    inviteMessage: {
        marginVertical: 20,
    },
});
