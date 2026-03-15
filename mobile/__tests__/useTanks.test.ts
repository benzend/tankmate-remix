/**
 * Tests for useTanks hooks — list, detail, create, update, delete mutations.
 *
 * Run with: npx jest __tests__/useTanks.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'

// Mock the API module
jest.mock('../lib/api', () => ({
	tanksApi: {
		list: jest.fn(),
		get: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
}))

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	})
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client: queryClient }, children)
	}
}

const mockTank = {
	id: 'tank-1',
	name: 'Reef Tank',
	waterType: 'saltwater',
	volume: 75,
	imageUrl: null,
	dimensionsWidth: null,
	dimensionsLength: null,
	dimensionsHeight: null,
	fishTankScores: [],
}

describe('useTanks', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch tank list', async () => {
		const { tanksApi } = require('../lib/api')
		tanksApi.list.mockResolvedValue({ tanks: [mockTank] })

		const { useTanks } = require('../hooks/useTanks')
		const { result } = renderHook(() => useTanks(), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual([mockTank])
		expect(tanksApi.list).toHaveBeenCalledTimes(1)
	})

	it('should return empty array when no tanks', async () => {
		const { tanksApi } = require('../lib/api')
		tanksApi.list.mockResolvedValue({ tanks: [] })

		const { useTanks } = require('../hooks/useTanks')
		const { result } = renderHook(() => useTanks(), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(result.current.data).toEqual([])
	})
})

describe('useTank', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch single tank detail', async () => {
		const { tanksApi } = require('../lib/api')
		const detailTank = {
			...mockTank,
			parameterLogs: [],
			fishTankMaintenances: [],
			gallery: [],
		}
		tanksApi.get.mockResolvedValue({ tank: detailTank })

		const { useTank } = require('../hooks/useTanks')
		const { result } = renderHook(() => useTank('tank-1'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(detailTank)
		expect(tanksApi.get).toHaveBeenCalledWith('tank-1')
	})

	it('should not fetch when id is empty', () => {
		const { tanksApi } = require('../lib/api')

		const { useTank } = require('../hooks/useTanks')
		renderHook(() => useTank(''), { wrapper: createWrapper() })

		expect(tanksApi.get).not.toHaveBeenCalled()
	})
})

describe('useCreateTank', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should create a tank and return ID', async () => {
		const { tanksApi } = require('../lib/api')
		tanksApi.create.mockResolvedValue({ tank: { id: 'new-tank-1' } })

		const { useCreateTank } = require('../hooks/useTanks')
		const { result } = renderHook(() => useCreateTank(), { wrapper: createWrapper() })

		const res = await result.current.mutateAsync({
			name: 'New Tank',
			waterType: 'freshwater',
			volume: 20,
		})

		expect(tanksApi.create).toHaveBeenCalledWith({
			name: 'New Tank',
			waterType: 'freshwater',
			volume: 20,
		})
		expect(res.tank.id).toBe('new-tank-1')
	})
})

describe('useUpdateTank', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should update tank fields', async () => {
		const { tanksApi } = require('../lib/api')
		tanksApi.update.mockResolvedValue({ tank: { id: 'tank-1' } })

		const { useUpdateTank } = require('../hooks/useTanks')
		const { result } = renderHook(() => useUpdateTank('tank-1'), { wrapper: createWrapper() })

		await result.current.mutateAsync({ name: 'Renamed Tank' })

		expect(tanksApi.update).toHaveBeenCalledWith('tank-1', { name: 'Renamed Tank' })
	})
})

describe('useDeleteTank', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should delete a tank', async () => {
		const { tanksApi } = require('../lib/api')
		tanksApi.delete.mockResolvedValue({ success: true, deletedTank: 'tank-1' })

		const { useDeleteTank } = require('../hooks/useTanks')
		const { result } = renderHook(() => useDeleteTank(), { wrapper: createWrapper() })

		const res = await result.current.mutateAsync('tank-1')

		expect(tanksApi.delete).toHaveBeenCalledWith('tank-1')
		expect(res.success).toBe(true)
	})
})
