const navFlag = (process.env.NAV_V1 ?? 'on').toLowerCase();
export const NAV_V1 = navFlag === 'on';
export const APP_LOCALE = process.env.APP_LOCALE ?? 'ru';
