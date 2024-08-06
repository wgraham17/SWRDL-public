import { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerWithContextResult } from 'aws-lambda';
import getDB from '../data';
import { UserContext } from './user-context';

export const handler = async (
    event: APIGatewayRequestAuthorizerEventV2,
): Promise<APIGatewaySimpleAuthorizerWithContextResult<UserContext>> => {
    const [token] = event.identitySource;
    const context: UserContext = { userId: '' };
    if (!/^[A-Fa-f0-9]{128}$/.test(token)) return { isAuthorized: false, context };

    const db = await getDB();
    const user = await db.userGetByToken(token);
    if (!user) return { isAuthorized: false, context };

    context.userId = user._id.toHexString();
    return { isAuthorized: true, context };
};
