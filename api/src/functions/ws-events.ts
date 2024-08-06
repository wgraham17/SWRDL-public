import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyWithLambdaAuthorizerEvent } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import getDB from '../data';
import { UserContext } from './user-context';

const sns = new SNS({
    region: process.env.AWS_REGION,
});

export const connectHandler = async (
    event: APIGatewayProxyWithLambdaAuthorizerEvent<UserContext>,
): Promise<APIGatewayProxyResult> => {
    console.debug(event);
    try {
        const { connectionId } = event.requestContext;
        const { userId } = event.requestContext.authorizer;

        const db = await getDB();

        if (!connectionId || !userId) throw 'Error, connectionId or userId missing';

        console.log('storing connectionId=', connectionId, 'userId=', userId);
        const result = await db.userConnect(userId, connectionId);

        console.debug('update result', result);
        console.log('queueing lobby sync');
        await sns
            .publish({
                Message: userId,
                TopicArn: process.env.LOBBY_SYNC_TOPIC_ARN,
            })
            .promise();
        return { statusCode: 200, body: '' };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: '' };
    }
};

export const disconnectHandler = async (event: APIGatewayProxyEvent) => {
    console.debug(event);
    const { connectionId } = event.requestContext;

    if (connectionId) {
        const db = await getDB();
        await db.userDisconnect(connectionId);
    }
};
