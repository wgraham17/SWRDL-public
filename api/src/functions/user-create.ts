import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { createHash } from 'crypto';
import getDB from '../data';
import { Adjectives, Nouns } from '../data/name-components';

const getRandomName = () => {
    const adjective = Adjectives[Math.floor(Math.random() * Adjectives.length)];
    const noun = Nouns[Math.floor(Math.random() * Nouns.length)];
    const capitalizeFirst = (input: string) => `${input[0].toUpperCase()}${input.slice(1)}`;

    return `${capitalizeFirst(adjective)}${capitalizeFirst(noun)}#${Math.round(Math.random() * 9999)}`;
};

const findAvailableName = async () => {
    const db = await getDB();
    let name = getRandomName();

    while (true) {
        const available = !(await db.userGetByName(name));

        if (available) {
            break;
        }

        name = getRandomName();
    }

    return name;
};

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
    const name = await findAvailableName();
    const token = createHash('sha512').update(`${name}_${new Date().getTime()}_${Math.random()}`).digest('hex');

    const data = await getDB();
    const newUser = await data.userCreate({ name, token, connections: [] });

    return {
        statusCode: 200,
        body: JSON.stringify({ id: newUser.insertedId.toHexString(), name, token }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
};
