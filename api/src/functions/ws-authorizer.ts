import { APIGatewayAuthorizerWithContextResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import getDB from '../data';
import { UserContext } from './user-context';

export const handler = async (
    event: APIGatewayRequestAuthorizerEvent,
): Promise<APIGatewayAuthorizerWithContextResult<{ userId: string }>> => {
    const token = event.queryStringParameters?.['token'] || '';
    const context: UserContext = { userId: '' };
    if (!/^[A-Fa-f0-9]{128}$/.test(token)) throw new Error('Unauthorized');

    const db = await getDB();
    const user = await db.userGetByToken(token);
    if (!user) throw new Error('Unauthorized');

    context.userId = user._id.toHexString();
    return {
        principalId: user._id.toHexString(),
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.methodArn,
                },
            ],
        },
        context,
    };
};
