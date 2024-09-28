import { Form } from '@remix-run/react'
import { Tooltip } from 'react-tooltip';
import {
  type MetaFunction,
} from '@remix-run/node'
export const meta: MetaFunction = () => [{ title: 'TankMate | Prototype' }]

export default function PrototypePage() {
  return (
    <>
      <main className="font-poppins grid h-full place-items-center">
        <div className="grid place-items-center px-4 py-16 xl:grid-cols-2 xl:gap-24">
          <Form action="/tanks/parse" method="POST">
            <label className="text-sm">Image Url <a data-tooltip-id="image-url-tooltip" data-tooltip-content="Upload a clear image of your tank">
              <span className="text-slate-400 ml-1 text-xs">Tip</span>
              </a>
            </label>
            <br/>
            <input type="text" name="image_url" id="image_url" className="bg-transparent text-white border rounded border-white mr-2 px-2 py-1" />
            <button type="submit">Analyze</button>
          </Form>
        </div>
      </main>
       <Tooltip id="image-url-tooltip"></Tooltip>
    </>
  )
}
