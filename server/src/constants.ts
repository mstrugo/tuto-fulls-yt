export const __PROD__ = process.env.NODE_ENV === 'production';

export const __FRONTEND_APP__ = 'http://localhost:3000';
export const __FRONTEND_RECOVERY_PSW__ = `${__FRONTEND_APP__}/change-password`;

export const __COOKIE_NAME__ = 'uid';

export const ___FORGET_PREFIX__ = 'forget-psw:';
