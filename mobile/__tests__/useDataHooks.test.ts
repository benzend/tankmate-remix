/**
 * Tests for useParameters and useMaintenance hooks.
 *
 * Run with: npx jest __tests__/useDataHooks.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock API
jest.mock('../lib/api', () => ({
	parametersApi: {
		listForTank: jest.fn(),
		create: jest.fn(),
		get: jest.fn(),
	},
	maintenanceApi: {
		listForTank: jest.fn(),
		create: jest.fn(),
		get: jest.fn(),
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

// ─── Parameters ──────────────────────────────────────

describe('useParameterLogs', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch parameter logs for a tank', async () => {
		const { parametersApi } = require('../lib/api')
		const mockLogs = [
			{ id: 'p1', pH: 8.2, alk: 9.5, calcium: 420, createdAt: '2024-06-01' },
			{ id: 'p2', pH: 8.1, alk: 9.0, calcium: 430, createdAt: '2024-06-02' },
		]
		parametersApi.listForTank.mockResolvedValue({ parameterLogs: mockLogs })

		const { useParameterLogs } = require('../hooks/useParameters')
		const { result } = renderHook(() => useParameterLogs('tank-1'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockLogs)
		expect(parametersApi.listForTank).toHaveBeenCalledWith('tank-1')
	})

	it('should not fetch when tankId is empty', () => {
		const { parametersApi } = require('../lib/api')

		const { useParameterLogs } = require('../hooks/useParameters')
		renderHook(() => useParameterLogs(''), { wrapper: createWrapper() })

		expect(parametersApi.listForTank).not.toHaveBeenCalled()
	})
})

describe('useCreateParameterLog', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should create a parameter log', async () => {
		const { parametersApi } = require('../lib/api')
		parametersApi.create.mockResolvedValue({ parameterLog: { id: 'new-p1' } })

		const { useCreateParameterLog } = require('../hooks/useParameters')
		const { result } = renderHook(() => useCreateParameterLog('tank-1'), { wrapper: createWrapper() })

		const res = await result.current.mutateAsync({
			pH: 8.3,
			alk: 10.0,
			calcium: null,
			magnesium: null,
			nitrate: null,
			phosphate: null,
			temp: 78,
			salinity: 1.025,
		})

		expect(parametersApi.create).toHaveBeenCalledWith('tank-1', {
			pH: 8.3,
			alk: 10.0,
			calcium: null,
			magnesium: null,
			nitrate: null,
			phosphate: null,
			temp: 78,
			salinity: 1.025,
		})
		expect(res.parameterLog.id).toBe('new-p1')
	})

	it('should handle partial parameter logs', async () => {
		const { parametersApi } = require('../lib/api')
		parametersApi.create.mockResolvedValue({ parameterLog: { id: 'new-p2' } })

		const { useCreateParameterLog } = require('../hooks/useParameters')
		const { result } = renderHook(() => useCreateParameterLog('tank-1'), { wrapper: createWrapper() })

		await result.current.mutateAsync({ pH: 8.0 })

		expect(parametersApi.create).toHaveBeenCalledWith('tank-1', { pH: 8.0 })
	})
})

// ─── Maintenance ─────────────────────────────────────

describe('useMaintenanceLogs', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch maintenance logs for a tank', async () => {
		const { maintenanceApi } = require('../lib/api')
		const mockLogs = [
			{ id: 'm1', maintenanceType: 'water_change', extraDetails: '25%', createdAt: '2024-06-01' },
		]
		maintenanceApi.listForTank.mockResolvedValue({ maintenanceLogs: mockLogs })

		const { useMaintenanceLogs } = require('../hooks/useMaintenance')
		const { result } = renderHook(() => useMaintenanceLogs('tank-1'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockLogs)
		expect(maintenanceApi.listForTank).toHaveBeenCalledWith('tank-1')
	})
})

describe('useCreateMaintenanceLog', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should create a maintenance log with type and details', async () => {
		const { maintenanceApi } = require('../lib/api')
		maintenanceApi.create.mockResolvedValue({ maintenanceLog: { id: 'new-m1' } })

		const { useCreateMaintenanceLog } = require('../hooks/useMaintenance')
		const { result } = renderHook(() => useCreateMaintenanceLog('tank-1'), { wrapper: createWrapper() })

		const res = await result.current.mutateAsync({
			maintenanceType: 'filter_change',
			extraDetails: 'Replaced filter media',
		})

		expect(maintenanceApi.create).toHaveBeenCalledWith('tank-1', {
			maintenanceType: 'filter_change',
			extraDetails: 'Replaced filter media',
		})
		expect(res.maintenanceLog.id).toBe('new-m1')
	})

	it('should create a maintenance log without extra details', async () => {
		const { maintenanceApi } = require('../lib/api')
		maintenanceApi.create.mockResolvedValue({ maintenanceLog: { id: 'new-m2' } })

		const { useCreateMaintenanceLog } = require('../hooks/useMaintenance')
		const { result } = renderHook(() => useCreateMaintenanceLog('tank-1'), { wrapper: createWrapper() })

		await result.current.mutateAsync({ maintenanceType: 'water_change' })

		expect(maintenanceApi.create).toHaveBeenCalledWith('tank-1', {
			maintenanceType: 'water_change',
		})
	})
})
