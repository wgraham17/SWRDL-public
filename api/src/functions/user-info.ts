import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ObjectId } from 'mongodb';
import getDB from '../data';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    const { userID } = event.pathParameters || {};

    if (!userID || !ObjectId.isValid(userID)) {
        return { statusCode: 400 };
    }

    const db = await getDB();
    const user = await db.userGet(userID);

    if (!user) {
        return { statusCode: 404 };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ name: user.name }),
    };
};
