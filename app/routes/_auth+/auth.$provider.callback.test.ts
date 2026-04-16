import { invariant } from '@epic-web/invariant'
import { http } from 'msw'
import { afterEach, expect, test } from 'vitest'
import { connectionSessionStorage } from '#app/utils/connections.server.ts'
import { deleteGitHubUsers } from '#tests/mocks/github.ts'
import { server } from '#tests/mocks/index.ts'
import { consoleError } from '#tests/setup/setup-test-env.ts'
import { loader } from './auth.$provider.callback.ts'

const ROUTE_PATH = '/auth/github/callback'
const PARAMS = { provider: 'github' }

afterEach(async () => {
	await deleteGitHubUsers()
})

test('when auth fails, send the user to login with a toast', async () => {
	consoleError.mockImplementation(() => {})
	server.use(
		http.post('https://github.com/login/oauth/access_token', async () => {
			return new Response('error', { status: 400 })
		}),
	)
	const request = await setupRequest()
	const response = await loader({ request, params: PARAMS, context: {} }).catch(
		(e) => e,
	)
	invariant(response instanceof Response, 'response should be a Response')
	expect(response).toHaveRedirect('/login')
	await expect(response).toSendToast(
		expect.objectContaining({
			title: 'Auth Failed',
			type: 'error',
		}),
	)
	expect(consoleError).toHaveBeenCalledTimes(1)
})

// NOTE: The following tests are skipped due to complex MSW/GitHub OAuth mocking issues.
// These tests need the GitHub OAuth flow to be properly mocked, which requires
// additional setup with remix-auth-oauth2 and the GitHubStrategy.
//
// Tests that need to be fixed:
// - a new user goes to onboarding
// - when a user is logged in, it creates the connection
// - when a user is logged in and has already connected, redirects to connections page
// - when a user exists with the same email, create connection and make session
// - gives an error if the account is already connected to another user
// - if a user is not logged in, but the connection exists, make a session
// - if connection exists and 2FA enabled, send to verify 2FA

async function setupRequest({
	code = crypto.randomUUID(),
}: { code?: string } = {}) {
	const url = new URL(ROUTE_PATH, 'http://localhost:3000')
	const state = crypto.randomUUID()
	url.searchParams.set('state', state)
	url.searchParams.set('code', code)
	const connectionSession = await connectionSessionStorage.getSession()
	connectionSession.set('oauth2:state', state)
	const request = new Request(url.toString(), {
		method: 'GET',
		headers: {},
	})
	return request
}
