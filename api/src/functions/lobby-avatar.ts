import assert from 'assert';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import jdenticon from 'jdenticon';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    const { joinKey } = event.pathParameters || {};

    try {
        assert(typeof joinKey === 'string');
    } catch {
        return { statusCode: 400 };
    }

    const svg = jdenticon.toSvg(joinKey, 100);

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
        },
        body: svg,
    };
};
