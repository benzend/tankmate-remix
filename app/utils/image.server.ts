import { Result, err, ok } from "true-myth/result";
import fetch from 'node-fetch';

export async function getImgDataUrlFromUrl(imgUrl: string): Promise<Result<string, Error>> {
  const res = await fetch(imgUrl)

  if (res.status !== 200) {
    return err(Error('failed to get image. reason: ' + res.statusText))
  }

  const contentType = res.headers.get('Content-Type');

  const buffer = await res.buffer();
  const data = buffer.toString('base64');

  return ok('data:' + contentType + ';base64,' + data)
}
