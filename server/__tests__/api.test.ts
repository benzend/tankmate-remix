/**
 * API Integration Tests for ReefChronicles REST API (Phase 0)
 *
 * These tests verify the /api/v1 endpoints work correctly.
 * Run with: npx vitest run server/__tests__/api.test.ts
 *
 * Prerequisites:
 *   - Database seeded with test user
 *   - Server running (or use supertest)
 *
 * Test strategy:
 *   - Auth endpoints tested first (login provides token for other tests)
 *   - Each domain (tanks, parameters, etc.) tested in isolation
 *   - Tests use a shared token from the auth test
 */

import { describe, it, expect, beforeAll } from 'vitest'

// Test config — point at running server or use supertest
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:8081/api/v1'

let authToken: string
let testUserId: string
let testTankId: string
let testParameterLogId: string
let testMaintenanceLogId: string

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function api(path: string, options: RequestInit = {}): Promise<{ status: number; data: any }> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) || {}),
	}
	if (authToken) {
		headers['Authorization'] = `Bearer ${authToken}`
	}
	const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
	const data = await res.json()
	return { status: res.status, data }
}

// ─── Auth ──────────────────────────────────────────

describe('Auth API', () => {
	const testUser = {
		email: `test-${Date.now()}@reefchronicles.test`,
		username: `testuser${Date.now()}`,
		password: 'TestPassword123!',
		name: 'Test User',
	}

	it('POST /auth/signup — creates account and returns token', async () => {
		const { status, data } = await api('/auth/signup', {
			method: 'POST',
			body: JSON.stringify(testUser),
		})

		expect(status).toBe(201)
		expect(data.token).toBeDefined()
		expect(data.expiresAt).toBeDefined()
		expect(data.userId).toBeDefined()

		authToken = data.token
		testUserId = data.userId
	})

	it('POST /auth/signup — rejects duplicate username', async () => {
		const { status, data } = await api('/auth/signup', {
			method: 'POST',
			body: JSON.stringify(testUser),
		})

		expect(status).toBe(409)
		expect(data.error).toContain('already')
	})

	it('POST /auth/login — authenticates with valid credentials', async () => {
		const { status, data } = await api('/auth/login', {
			method: 'POST',
			body: JSON.stringify({
				username: testUser.username,
				password: testUser.password,
			}),
		})

		expect(status).toBe(200)
		expect(data.token).toBeDefined()
		// Update token to the new session
		authToken = data.token
	})

	it('POST /auth/login — rejects invalid credentials', async () => {
		const { status } = await api('/auth/login', {
			method: 'POST',
			body: JSON.stringify({
				username: testUser.username,
				password: 'wrongpassword',
			}),
		})

		expect(status).toBe(401)
	})

	it('POST /auth/refresh — extends session', async () => {
		const { status, data } = await api('/auth/refresh', { method: 'POST' })

		expect(status).toBe(200)
		expect(data.token).toBeDefined()
		expect(new Date(data.expiresAt).getTime()).toBeGreaterThan(Date.now())
	})
})

// ─── Tanks ─────────────────────────────────────────

describe('Tanks API', () => {
	it('POST /tanks — creates a tank', async () => {
		const { status, data } = await api('/tanks', {
			method: 'POST',
			body: JSON.stringify({
				name: 'Test Reef Tank',
				waterType: 'saltwater',
				volume: 75,
			}),
		})

		expect(status).toBe(201)
		expect(data.tank.id).toBeDefined()
		testTankId = data.tank.id
	})

	it('GET /tanks — lists user tanks', async () => {
		const { status, data } = await api('/tanks')

		expect(status).toBe(200)
		expect(Array.isArray(data.tanks)).toBe(true)
		expect(data.tanks.length).toBeGreaterThan(0)
		expect(data.tanks[0].name).toBe('Test Reef Tank')
	})

	it('GET /tanks/:id — returns tank detail', async () => {
		const { status, data } = await api(`/tanks/${testTankId}`)

		expect(status).toBe(200)
		expect(data.tank.id).toBe(testTankId)
		expect(data.tank.name).toBe('Test Reef Tank')
		expect(data.tank.waterType).toBe('saltwater')
		expect(data.tank.parameterLogs).toBeDefined()
		expect(data.tank.fishTankMaintenances).toBeDefined()
	})

	it('PATCH /tanks/:id — updates tank', async () => {
		const { status, data } = await api(`/tanks/${testTankId}`, {
			method: 'PATCH',
			body: JSON.stringify({ name: 'Updated Tank Name' }),
		})

		expect(status).toBe(200)
		expect(data.tank.id).toBeDefined()
	})

	it('GET /tanks/:nonexistent — returns 404', async () => {
		const { status } = await api('/tanks/nonexistent-id')
		expect(status).toBe(404)
	})
})

// ─── Parameters ────────────────────────────────────

describe('Parameters API', () => {
	it('POST /tanks/:id/parameters — logs parameters', async () => {
		const { status, data } = await api(`/tanks/${testTankId}/parameters`, {
			method: 'POST',
			body: JSON.stringify({
				pH: 8.2,
				alk: 9.5,
				calcium: 420,
				magnesium: 1350,
				temp: 78,
				salinity: 1.025,
			}),
		})

		expect(status).toBe(201)
		expect(data.parameterLog.id).toBeDefined()
		testParameterLogId = data.parameterLog.id
	})

	it('GET /tanks/:id/parameters — lists parameter logs', async () => {
		const { status, data } = await api(`/tanks/${testTankId}/parameters`)

		expect(status).toBe(200)
		expect(Array.isArray(data.parameterLogs)).toBe(true)
		expect(data.parameterLogs.length).toBeGreaterThan(0)
	})

	it('GET /parameters/:id — returns single parameter log', async () => {
		const { status, data } = await api(`/parameters/${testParameterLogId}`)

		expect(status).toBe(200)
		expect(data.parameterLog.pH).toBe(8.2)
		expect(data.parameterLog.calcium).toBe(420)
	})
})

// ─── Maintenance ───────────────────────────────────

describe('Maintenance API', () => {
	it('POST /tanks/:id/maintenance — creates maintenance log', async () => {
		const { status, data } = await api(`/tanks/${testTankId}/maintenance`, {
			method: 'POST',
			body: JSON.stringify({
				maintenanceType: 'water_change',
				extraDetails: '25% water change',
			}),
		})

		expect(status).toBe(201)
		expect(data.maintenanceLog.id).toBeDefined()
		testMaintenanceLogId = data.maintenanceLog.id
	})

	it('GET /tanks/:id/maintenance — lists maintenance logs', async () => {
		const { status, data } = await api(`/tanks/${testTankId}/maintenance`)

		expect(status).toBe(200)
		expect(data.maintenanceLogs.length).toBeGreaterThan(0)
	})

	it('GET /maintenance/:id — returns single maintenance log', async () => {
		const { status, data } = await api(`/maintenance/${testMaintenanceLogId}`)

		expect(status).toBe(200)
		expect(data.maintenanceLog.maintenanceType).toBe('water_change')
	})
})

// ─── User ──────────────────────────────────────────

describe('User API', () => {
	it('GET /user/me — returns current user profile', async () => {
		const { status, data } = await api('/user/me')

		expect(status).toBe(200)
		expect(data.user.id).toBe(testUserId)
		expect(data.user.email).toBeDefined()
		expect(data.user.username).toBeDefined()
	})

	it('PATCH /user/me — updates profile', async () => {
		const { status, data } = await api('/user/me', {
			method: 'PATCH',
			body: JSON.stringify({ name: 'Updated Test Name' }),
		})

		expect(status).toBe(200)
		expect(data.user.name).toBe('Updated Test Name')
	})
})

// ─── Auth Guard ────────────────────────────────────

describe('Auth Guard', () => {
	it('rejects requests without token', async () => {
		const res = await fetch(`${BASE_URL}/tanks`, {
			headers: { 'Content-Type': 'application/json' },
		})

		expect(res.status).toBe(401)
	})

	it('rejects requests with invalid token', async () => {
		const res = await fetch(`${BASE_URL}/tanks`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer invalid-token-here',
			},
		})

		expect(res.status).toBe(401)
	})
})

// ─── Cleanup ───────────────────────────────────────

describe('Cleanup', () => {
	it('DELETE /tanks/:id — deletes the test tank', async () => {
		const { status, data } = await api(`/tanks/${testTankId}`, { method: 'DELETE' })

		expect(status).toBe(200)
		expect(data.success).toBe(true)
	})

	it('POST /auth/logout — invalidates session', async () => {
		const { status, data } = await api('/auth/logout', { method: 'POST' })

		expect(status).toBe(200)
		expect(data.success).toBe(true)
	})
})
