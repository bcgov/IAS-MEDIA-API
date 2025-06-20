import {App} from './app';
import {Configuration} from './config/configuration';
import http, {Server} from 'http';
import log from './components/logger';
import * as jsJoda from '@js-joda/core';
import {CONFIG_ELEMENT} from './config/config-element';
// Add timestamp to log
Object.defineProperty(log, 'heading', {
  get: () => {
    return jsJoda.LocalDateTime.now().toString();
  },
});

class IasMediaApiApplication {
  private readonly _app: App;
  private readonly _port: number;
  private readonly _httpServer: Server;

  private constructor() {
    log.debug('Starting IAS Media API node app');
    this._app = new App();
    this._port = IasMediaApiApplication.normalizePort(Configuration.getConfig(CONFIG_ELEMENT.PORT));
    this._app.expressApplication.set('port', this._port);

    this._httpServer = http.createServer(this._app.expressApplication);
    /**
     * Listen on provided port, on all network interfaces.
     */
    this._httpServer.listen(this._port);
    this._httpServer.on('error', IasMediaApiApplication.onError);
    this._httpServer.on('listening', IasMediaApiApplication.onListening);
  }

  public get httpServer(): Server {
    return this._httpServer;
  }

  public get port(): number {
    return this._port;
  }

  public static start(): IasMediaApiApplication {
    return new IasMediaApiApplication();
  }

  /**
   * Normalize a port into a number, string, or false.
   */
  private static normalizePort(val: any): number {
    const portNumber = parseInt(val, 10);

    if (isNaN(portNumber)) {
      // named pipe
      return val;
    }

    if (portNumber >= 0) {
      // port number
      return portNumber;
    }

    return 0;
  }

  private static onError(error: any): void {
    if (error?.syscall !== 'listen') {
      throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error?.code) {
    case 'EACCES':
      console.error(`${iasMediaApiApplication.port} requires elevated privileges`);
      // process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${iasMediaApiApplication.port} is already in use`);
      // process.exit(1);
      break;
    default:
      throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  private static onListening(): void {
    const addr = iasMediaApiApplication.httpServer.address();
    const bind = typeof addr === 'string' ?
      `pipe  ${addr}` :
      `port  ${addr.port}`;
    log.info('Listening on ' + bind);
  }
}

export const iasMediaApiApplication = IasMediaApiApplication.start();


process.on('SIGINT', () => {
  iasMediaApiApplication.httpServer.close(() => {
    log.info('process terminated');
  });
});
process.on('SIGTERM', () => {
  iasMediaApiApplication.httpServer.close(() => {
    log.info('process terminated');
  });
});
// Prevent unhandled rejection from crashing application
process.on('unhandledRejection', err => {
  console.error('Error is ', err);
});
// Prevent unhandled errors from crashing application
process.on('error', err => {
  console.error('Error is ', err);
});
