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
    card: {
        backgroundColor: 'background-basic-color-2',
        marginBottom: 20,
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        justifyContent: 'space-between',
    },
});
