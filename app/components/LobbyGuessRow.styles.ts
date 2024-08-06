import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 5,
        borderBottomColor: 'background-basic-color-4',
        borderBottomWidth: 1,
    },
    bufferBottom: {
        marginBottom: 40,
    },
    letterContainer: {
        backgroundColor: 'background-basic-color-2',
        borderWidth: 1,
        borderColor: 'border-basic-color-3',
        borderRadius: 16,
        margin: 2,
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    mask: {
        position: 'absolute',
        height: 50,
        width: 50,
        borderRadius: 16,
    },
    mask1: {
        backgroundColor: 'background-basic-color-1',
        borderWidth: 1,
        borderColor: 'border-basic-color-3',
    },
    mask2: {
        backgroundColor: 'color-warning-600',
    },
    mask3: {
        backgroundColor: 'color-primary-400',
    },
    letter: {
        zIndex: 10,
    },
    guessNumber: {
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'center',
        width: '10%',
        marginRight: 6,
    },
    guessNumberWithMask: {
        backgroundColor: 'background-basic-color-2',
        borderRadius: 16,
    },
    maskResultContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    maskResult: {
        padding: 5,
    },
    maskResultText: {
        color: '#ffffff',
    },
});
