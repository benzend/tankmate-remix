import { useInView } from '#app/utils/use-in-view.ts'

export default function PrivacyRoute() {
	const heroRef = useInView({ threshold: 0.2 })
	const contentRef = useInView({ threshold: 0.1 })

	return (
		<div className="min-h-screen bg-background text-gray-100">
			{/* Hero Section */}
			<section
				ref={heroRef.ref}
				className="hero-section relative flex h-[400px] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 text-white"
			>
				<div className="absolute inset-0 opacity-20">
					<div className="wave wave1"></div>
					<div className="wave wave2"></div>
					<div className="wave wave3"></div>
				</div>

				<div className="relative z-10 px-4 text-center">
					<h1
						className={`font-serif mb-6 text-5xl font-extrabold drop-shadow-lg lg:text-7xl transition-all duration-1000 ${
							heroRef.isInView
								? 'animate-in fade-in slide-in-from-bottom-4'
								: 'opacity-0 translate-y-8'
						}`}
					>
						Privacy Policy
					</h1>
					<p
						className={`mx-auto max-w-2xl text-xl drop-shadow-lg transition-all duration-1000 delay-300 ${
							heroRef.isInView
								? 'animate-in fade-in slide-in-from-bottom-4'
								: 'opacity-0 translate-y-8'
						}`}
					>
						How we collect, use, and protect your information
					</p>
				</div>
			</section>

			{/* Content Section */}
			<section
				ref={contentRef.ref}
				className="bg-slate-950 py-20"
			>
				<div
					className={`container mx-auto max-w-4xl px-8 transition-all duration-700 ${
						contentRef.isInView
							? 'animate-in fade-in slide-in-from-bottom-4'
							: 'opacity-0 translate-y-8'
					}`}
				>
					<p className="mb-12 text-sm text-gray-400">
						Last updated: February 8, 2026
					</p>

					<PolicySection title="1. Introduction">
						<p>
							TankMate ("we", "our", or "us") operates the TankMate
							website and mobile application. This Privacy Policy
							explains how we collect, use, disclose, and safeguard
							your information when you use our service. Please read
							this policy carefully. By using TankMate, you agree to
							the collection and use of information in accordance with
							this policy.
						</p>
					</PolicySection>

					<PolicySection title="2. Information We Collect">
						<h4 className="mb-3 text-lg font-semibold text-blue-300">
							Account Information
						</h4>
						<p className="mb-4">
							When you create an account, we collect your email
							address, username, and optionally your display name. If
							you sign up via GitHub OAuth, we receive your public
							profile information from GitHub.
						</p>

						<h4 className="mb-3 text-lg font-semibold text-blue-300">
							Aquarium Data
						</h4>
						<p className="mb-4">
							You may provide information about your aquariums
							including tank dimensions, water type, fish and plant
							species, water parameter logs (pH, temperature,
							salinity, calcium, alkalinity, magnesium, nitrate,
							phosphate), maintenance records, and coral analysis
							data. This data is stored to provide you with tracking
							and analysis features.
						</p>

						<h4 className="mb-3 text-lg font-semibold text-blue-300">
							Photos and Images
						</h4>
						<p className="mb-4">
							You may upload photos of your aquariums to your tank
							gallery or for coral analysis. Images are compressed on
							your device before upload and stored via our CDN
							provider (UploadThing). If you choose to publish your
							gallery, your images will be visible to other users.
						</p>

						<h4 className="mb-3 text-lg font-semibold text-blue-300">
							Device Information
						</h4>
						<p>
							If you enable push notifications on the mobile app, we
							store your device push token and platform type (iOS or
							Android) to deliver notifications. We also store
							authentication tokens securely on your device using
							encrypted storage.
						</p>
					</PolicySection>

					<PolicySection title="3. How We Use Your Information">
						<ul className="list-inside list-disc space-y-2">
							<li>
								Provide, maintain, and improve the TankMate service
							</li>
							<li>
								Display your aquarium data, parameter trends, and
								maintenance history
							</li>
							<li>
								Send push notifications for maintenance reminders
								and updates (when enabled)
							</li>
							<li>
								Enable community features such as public tank
								galleries
							</li>
							<li>
								Authenticate your identity and secure your account
							</li>
							<li>
								Respond to support requests and communicate with
								you about the service
							</li>
						</ul>
					</PolicySection>

					<PolicySection title="4. Data Sharing and Disclosure">
						<p className="mb-4">
							We do not sell your personal information. We may share
							your information only in the following circumstances:
						</p>
						<ul className="list-inside list-disc space-y-2">
							<li>
								<strong className="text-white">
									Public galleries:
								</strong>{' '}
								If you publish your tank gallery, your aquarium
								photos and tank name will be visible to other users
							</li>
							<li>
								<strong className="text-white">
									Service providers:
								</strong>{' '}
								We use third-party services for image hosting
								(UploadThing), application hosting (Fly.io), and
								authentication (GitHub OAuth). These providers only
								access data necessary to perform their services
							</li>
							<li>
								<strong className="text-white">
									Legal requirements:
								</strong>{' '}
								We may disclose information if required by law or in
								response to valid legal process
							</li>
						</ul>
					</PolicySection>

					<PolicySection title="5. Data Security">
						<p>
							We take reasonable measures to protect your information.
							Passwords are hashed using industry-standard algorithms
							and are never stored in plain text. Authentication
							tokens on mobile devices are stored in encrypted secure
							storage. The mobile app supports biometric
							authentication (Face ID / Touch ID) as an additional
							security layer. However, no method of transmission over
							the internet or electronic storage is 100% secure, and
							we cannot guarantee absolute security.
						</p>
					</PolicySection>

					<PolicySection title="6. Data Retention">
						<p>
							We retain your account and aquarium data for as long as
							your account is active. If you delete your account, all
							associated data — including tanks, parameter logs,
							maintenance records, gallery images, and coral analyses
							— will be permanently deleted. Push notification tokens
							are removed when you log out or delete your account.
						</p>
					</PolicySection>

					<PolicySection title="7. Your Rights">
						<p className="mb-4">You have the right to:</p>
						<ul className="list-inside list-disc space-y-2">
							<li>
								Access the personal data we hold about you
							</li>
							<li>
								Update or correct your account information
							</li>
							<li>
								Delete your account and all associated data
							</li>
							<li>
								Opt out of push notifications at any time through
								your device settings
							</li>
							<li>
								Unpublish your tank gallery to remove it from
								public view
							</li>
						</ul>
					</PolicySection>

					<PolicySection title="8. Camera and Photo Library Access">
						<p>
							The TankMate mobile app requests access to your
							device's camera and photo library solely for the purpose
							of capturing and uploading aquarium photos. We do not
							access your camera or photos for any other purpose.
							Images are compressed on your device before being
							uploaded. You can revoke these permissions at any time
							through your device settings.
						</p>
					</PolicySection>

					<PolicySection title="9. Children's Privacy">
						<p>
							TankMate is not directed at children under the age of
							13. We do not knowingly collect personal information
							from children under 13. If we become aware that we have
							collected personal information from a child under 13, we
							will take steps to delete that information.
						</p>
					</PolicySection>

					<PolicySection title="10. Changes to This Policy">
						<p>
							We may update this Privacy Policy from time to time. We
							will notify you of any changes by posting the new policy
							on this page and updating the "Last updated" date. Your
							continued use of TankMate after changes are posted
							constitutes your acceptance of the updated policy.
						</p>
					</PolicySection>

					<PolicySection title="11. Contact Us" last>
						<p>
							If you have questions about this Privacy Policy or your
							data, please contact us at{' '}
							<a
								href="mailto:support@tankmate.tech"
								className="text-blue-400 underline transition-colors hover:text-blue-300"
							>
								support@tankmate.tech
							</a>
							.
						</p>
					</PolicySection>
				</div>
			</section>
		</div>
	)
}

function PolicySection({
	title,
	children,
	last = false,
}: {
	title: string
	children: React.ReactNode
	last?: boolean
}) {
	return (
		<div className={last ? '' : 'mb-12'}>
			<h3 className="mb-4 text-2xl font-bold text-blue-300">{title}</h3>
			<div className="leading-relaxed text-gray-300">{children}</div>
		</div>
	)
}
