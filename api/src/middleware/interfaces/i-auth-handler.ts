import {NextFunction, Request, Response} from 'express';

export interface IAuthHandler {
  validateScope(requiredScopes: string[]): (req: Request, res: Response, next: NextFunction) => Promise<void>
  getIASApiToken(): Promise<string>
}
