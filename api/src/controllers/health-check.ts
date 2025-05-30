import express, {Request, Response} from 'express';
import {injectable} from 'inversify';
import {IHealthCheckController} from './interfaces/i-health-check';

@injectable()
export class HealthCheckController implements IHealthCheckController {

  public get Router(): any {
    return this._router;
  }

  private readonly _router: any;

  public constructor() {
    this._router = express.Router();
    this._router.get('/api/health', (req: Request, res: Response) => this.healthCheck(req, res));
  }

  private healthCheck(_req: Request, res: Response): void {
      res.sendStatus(200);
  }
}

