import { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda';

export interface UserContext {
    userId: string;
}

export type APIGatewayProxyEventWithUserContextV2 = APIGatewayProxyEventV2WithLambdaAuthorizer<UserContext>;
