import assert from 'assert';
import crypto from 'crypto';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import URLSafeBase64 from 'urlsafe-base64';
import getDB from '../data';
import { deleteConnection } from '../util';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const { recoveryToken, shouldResetToken } = JSON.parse(event.body || '{}');

    try {
        assert(typeof recoveryToken === 'string');
        assert(typeof shouldResetToken === 'boolean');
        assert(URLSafeBase64.validate(recoveryToken));
    } catch {
        return { statusCode: 400 };
    }

    const recoveryTokenData = JSON.parse(URLSafeBase64.decode(recoveryToken).toString('utf-8'));

    try {
        assert(typeof recoveryTokenData.id === 'string');
        assert(typeof recoveryTokenData.iss === 'number');
        assert(typeof recoveryTokenData.exp === 'number');
        assert(typeof recoveryTokenData.sig === 'string');
    } catch {
        return { statusCode: 400 };
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RECOVERY_TOKEN_SECRET || '')
        .update(`recover|${recoveryTokenData.id}|${recoveryTokenData.iss}|${recoveryTokenData.exp}`, 'utf-8')
        .digest('base64');

    if (
        expectedSignature != recoveryTokenData.sig ||
        typeof recoveryTokenData.exp !== 'number' ||
        new Date().getTime() > recoveryTokenData.exp
    ) {
        return { statusCode: 403 };
    }

    const db = await getDB();
    const user = await db.userGet(recoveryTokenData.id);

    if (!user) {
        return { statusCode: 404 };
    }

    let token = user.token;

    if (shouldResetToken) {
        token = crypto
            .createHash('sha512')
            .update(`${user.name}_${new Date().getTime()}_${Math.random()}`)
            .digest('hex');

        await Promise.all(user.connections.map(deleteConnection));
        await db.userUpdateToken(user._id, token);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ id: user._id.toHexString(), name: user.name, token }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
};
