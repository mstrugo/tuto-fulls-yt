import 'dotenv-safe/config';

export const __ENV_BACKEND_PORT__ = process.env.PORT;
export const __ENV_DATABASE_URL__ = process.env.DATABASE_URL;
export const __ENV_FRONTEND_APP__ = process.env.FRONT_APP;
export const __ENV_SESSION_SECRET__ = process.env.SESSION_SECRET;
export const __ENV_REDIS_URL__ = process.env.REDIS_URL;
export const __PROD__ = process.env.NODE_ENV === 'production';

export const __FRONTEND_RECOVERY_PSW__ = `${__ENV_FRONTEND_APP__}/change-password`;

export const __COOKIE_NAME__ = 'uid';

export const __FORGET_PREFIX__ = 'forget-psw:';

export const __POST_LENGTH__ = 50;
