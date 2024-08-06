import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ObjectId } from 'mongodb';
import getDB from '../data';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    const { userId } = event.requestContext.authorizer.lambda;

    if (!userId || !ObjectId.isValid(userId)) {
        return { statusCode: 400 };
    }

    const db = await getDB();
    const user = await db.userGet(userId);

    if (!user) {
        return { statusCode: 404 };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: user._id.toHexString(),
            name: user.name,
            token: user.token,
            notificationsEnabled: !!user.notifications?.enabled,
            notificationsPrompted: !!user.notifications?.prompted,
            recoveryEnabled: !!user.emailConfirmed && !!user.emailHash,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
};
