import express, {Request, Response} from 'express';
import logger from '../components/logger';
import {injectable} from 'inversify';
import {IHealthCheckController} from './interfaces/i-health-check';

@injectable()
export class HealthCheckController implements IHealthCheckController {

  private readonly _router: any;

  public constructor() {
    this._router = express.Router();
    this._router.get('/api/health', (req: Request, res: Response) => this.healthCheck(req, res));
  }

  public get Router(): any {
    return this._router;
  }

  private healthCheck(_req: Request, res: Response): void {
    logger.debug('Health check endpoint hit');
    res.sendStatus(200);
  }
}

