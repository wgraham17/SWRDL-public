import { APIGatewayProxyResultV2 } from 'aws-lambda';
import assert from 'assert';
import getDB from '../data';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';

interface RequestModel {
    notifications: {
        enabled: boolean;
        token: string;
    };
}

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    const { userId } = event.requestContext.authorizer.lambda;
    let request: RequestModel;

    try {
        request = JSON.parse(event.body || '');
        assert(request);
        assert(typeof request === 'object');
        assert(request.notifications);
        assert(typeof request.notifications === 'object');
        assert(typeof request.notifications.enabled === 'boolean');
        assert(typeof request.notifications.token === 'string' || typeof request.notifications.token === 'undefined');
        assert(!request.notifications.enabled || (request.notifications.enabled && request.notifications.token));
    } catch {
        return { statusCode: 400 };
    }

    const db = await getDB();
    await db.userSavePreferences(userId, request.notifications);

    return { statusCode: 204 };
};
