require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Food Factory API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection', { reason }));
process.on('uncaughtException', (err) => { logger.error('Uncaught Exception', { error: err.message, stack: err.stack }); process.exit(1); });
