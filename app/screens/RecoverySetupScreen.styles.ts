import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    container: {
        alignItems: 'stretch',
        padding: 10,
    },
    waitContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    para: {
        marginBottom: 20,
        lineHeight: 20,
    },
    infoButton: {
        alignSelf: 'flex-start',
    },
    formHeader: {
        marginVertical: 20,
    },
    submitButton: {
        marginVertical: 40,
    },
});
