import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    root: {
        flex: 1,
        backgroundColor: 'background-basic-color-1',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        marginHorizontal: 10,
    },
    container: {
        alignSelf: 'stretch',
        flex: 1,
    },
    sectionHeader: {
        marginTop: 20,
    },
    scrollView: {
        paddingHorizontal: 20,
        flex: 1,
    },
    createButton: {
        marginVertical: 20,
    },
});
