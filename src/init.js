const process = require('process');

process.env.NODE_CONFIG_DIR = `${__dirname}/config`;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

process.env.FLATPAK_ENTITLEMENTS_SERVER_LISTENING_PORT =
    process.env.FLATPAK_ENTITLEMENTS_SERVER_LISTENING_PORT || '8080';
process.env.FLATPAK_ENTITLEMENTS_SERVER_FORCE_SEQUELIZE_SYNC =
    process.env.FLATPAK_ENTITLEMENTS_SERVER_FORCE_SEQUELIZE_SYNC || '0';
