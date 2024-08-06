import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    container: {
        flexDirection: 'row',
        marginVertical: 3,
        alignItems: 'center',
    },
    title: {
        width: 15,
    },
    bar: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 4,
    },
    filled: {
        backgroundColor: 'color-primary-500',
        height: 16,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    empty: {
        height: 16,
    },
});
