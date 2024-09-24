import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const body = request.formData();
  console.log({ body });
  return null;
}
