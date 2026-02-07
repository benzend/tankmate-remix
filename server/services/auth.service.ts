import bcrypt from 'bcryptjs'
import { prisma } from '../../app/utils/db.server.ts'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 // 30 days
const getSessionExpirationDate = () =>
	new Date(Date.now() + SESSION_EXPIRATION_TIME)

export async function loginUser({
	username,
	password,
}: {
	username: string
	password: string
}) {
	const userWithPassword = await prisma.user.findUnique({
		where: { username },
		select: { id: true, password: { select: { hash: true } } },
	})

	if (!userWithPassword?.password) return null

	const isValid = await bcrypt.compare(password, userWithPassword.password.hash)
	if (!isValid) return null

	const session = await prisma.session.create({
		select: { id: true, expirationDate: true, userId: true },
		data: {
			expirationDate: getSessionExpirationDate(),
			userId: userWithPassword.id,
		},
	})

	return session
}

export async function signupUser({
	email,
	username,
	password,
	name,
}: {
	email: string
	username: string
	password: string
	name: string
}) {
	const hash = await bcrypt.hash(password, 10)

	const session = await prisma.session.create({
		data: {
			expirationDate: getSessionExpirationDate(),
			user: {
				create: {
					email: email.toLowerCase(),
					username: username.toLowerCase(),
					name,
					roles: { connect: { name: 'user' } },
					password: { create: { hash } },
				},
			},
		},
		select: { id: true, expirationDate: true, userId: true },
	})

	return session
}

export async function logoutSession(sessionId: string) {
	await prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {})
}

export async function refreshSession(sessionId: string) {
	const session = await prisma.session.findUnique({
		where: { id: sessionId, expirationDate: { gt: new Date() } },
		select: { id: true, userId: true },
	})

	if (!session) return null

	const updated = await prisma.session.update({
		where: { id: sessionId },
		data: { expirationDate: getSessionExpirationDate() },
		select: { id: true, expirationDate: true, userId: true },
	})

	return updated
}

export async function getUserProfile(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			username: true,
			name: true,
			image: { select: { id: true } },
			createdAt: true,
		},
	})
}

export async function checkUsernameAvailable(username: string, excludeUserId?: string) {
	const existing = await prisma.user.findUnique({
		where: { username: username.toLowerCase() },
		select: { id: true },
	})
	if (!existing) return true
	if (excludeUserId && existing.id === excludeUserId) return true
	return false
}

export async function checkEmailAvailable(email: string) {
	const existing = await prisma.user.findUnique({
		where: { email: email.toLowerCase() },
		select: { id: true },
	})
	return !existing
}
