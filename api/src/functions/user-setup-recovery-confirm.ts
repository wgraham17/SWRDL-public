import assert from 'assert';
import crypto from 'crypto';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import URLSafeBase64 from 'urlsafe-base64';
import getDB from '../data';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const { setupToken } = JSON.parse(event.body || '{}');

    try {
        assert(typeof setupToken === 'string');
        assert(URLSafeBase64.validate(setupToken));
    } catch {
        return { statusCode: 400 };
    }

    const setupTokenData = JSON.parse(URLSafeBase64.decode(setupToken).toString('utf-8'));

    try {
        assert(typeof setupTokenData.id === 'string');
        assert(typeof setupTokenData.iss === 'number');
        assert(typeof setupTokenData.exp === 'number');
        assert(typeof setupTokenData.sig === 'string');
        assert(typeof setupTokenData.emailHash === 'string');
    } catch {
        return { statusCode: 400 };
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RECOVERY_TOKEN_SECRET || '')
        .update(
            `setup|${setupTokenData.id}|${setupTokenData.iss}|${setupTokenData.exp}|${setupTokenData.emailHash}`,
            'utf-8',
        )
        .digest('base64');

    if (
        expectedSignature != setupTokenData.sig ||
        typeof setupTokenData.exp !== 'number' ||
        new Date().getTime() > setupTokenData.exp
    ) {
        return { statusCode: 403 };
    }

    const db = await getDB();
    const result = await db.userCompleteRecoverySetup(setupTokenData.id, setupTokenData.emailHash);

    if (result.modifiedCount === 1) {
        return { statusCode: 204 };
    } else {
        return { statusCode: 409 };
    }
};
