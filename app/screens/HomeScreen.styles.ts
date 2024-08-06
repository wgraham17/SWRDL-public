import { StyleService } from '@ui-kitten/components';

export default StyleService.create({
    root: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    card: {
        padding: 20,
        marginVertical: 10,
    },
    cardButton: {
        marginTop: 30,
    },
    sectionTitle: {
        marginTop: 30,
        marginBottom: 5,
    },
    loadingSkeleton: {
        height: 180,
        alignSelf: 'stretch',
    },
});
