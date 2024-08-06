import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    container: {
        alignSelf: 'stretch',
        marginHorizontal: 10,
        marginVertical: 10,
        flex: 1,
    },
    createButton: {
        marginVertical: 50,
    },
    explainer: {
        marginBottom: 40,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pinDigitContainer: {
        backgroundColor: 'background-basic-color-2',
        borderWidth: 1,
        borderColor: 'border-basic-color-3',
        margin: 2,
        width: '10%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    entryContainer: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    entryRow: {
        flexDirection: 'row',
    },
    button: {
        width: 70,
        height: 80,
        backgroundColor: 'background-basic-color-4',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0.5%',
        borderRadius: 5,
    },
    buttonDisabled: {
        backgroundColor: 'background-basic-color-1',
    },
    bufferRight: {
        marginRight: '5%',
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
