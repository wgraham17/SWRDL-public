import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    container: {
        padding: 20,
        minWidth: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerIcon: {
        marginRight: 10,
        tintColor: 'text-basic-color',
        width: 30,
        height: 30,
    },
    action: {
        marginTop: 20,
    },
    timeContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    timeStatsContainer: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    guessCountStat: {
        flexDirection: 'row',
        marginVertical: 2.5,
    },
});
