// server/src/lib/init-middleware.ts
import type { NextApiRequest, NextApiResponse } from 'next'

type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (err?: unknown) => void
) => void

export default function initMiddleware(middleware: MiddlewareFunction) {
  return (req: NextApiRequest, res: NextApiResponse): Promise<void> =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) return reject(result)
        return resolve()
      })
    })
}
