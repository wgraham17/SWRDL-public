import { createAvatar } from '@dicebear/avatars';
import * as avatarStyle from '@dicebear/pixel-art-neutral';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';

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

    const svg = createAvatar(avatarStyle, {
        seed: userID,
    });

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
        },
        body: svg,
    };
};
