import {Request, Response} from 'express';

export interface IIasMediaApiController {
  processMediaItem(req: Request, res: Response): Promise<void>
}
