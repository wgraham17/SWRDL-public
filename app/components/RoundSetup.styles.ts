import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    root: {
        flex: 1,
    },
    explainer: {
        marginTop: 20,
        padding: 10,
        lineHeight: 25,
    },
    explainerCTA: {
        marginTop: 20,
    },
    inputContainer: {
        flex: 1,
        marginTop: 20,
        marginBottom: 40,
    },
    input: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    letterContainer: {
        backgroundColor: 'background-basic-color-2',
        borderWidth: 1,
        borderColor: 'border-basic-color-3',
        borderRadius: 16,
        margin: 2,
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
