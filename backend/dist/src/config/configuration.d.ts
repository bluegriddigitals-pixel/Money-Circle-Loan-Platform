declare const _default: () => {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        synchronize: boolean;
        logging: boolean;
    };
    jwt: {
        secret: string;
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
    };
    redis: {
        host: string;
        port: number;
    };
    throttler: {
        ttl: number;
        limit: number;
    };
};
export default _default;
