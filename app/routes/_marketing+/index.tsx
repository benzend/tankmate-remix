


// app/routes/index.tsx
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="bg-background text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="hero-section h-screen bg-[url('/img/marketing/hero.jpg')] bg-cover bg-center relative flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black opacity-70"></div>
        <div className="relative text-center px-4">
          <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg">
            Dive into the Future of Aquarium Care
          </h1>
          <p className="text-xl mb-10 max-w-xl mx-auto drop-shadow-lg">
            AI-powered aquarium tracking that analyzes fish counts, tank health, and more.
            Your underwater ecosystem, optimized with the latest tech.
          </p>
          <Link
            to="/signup"
            className="btn-primary inline-block px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-lg transform transition duration-300 hover:scale-105"
          >
            Get Started
          </Link>
          <div className="absolute -bottom-20 inset-x-0 w-full flex justify-center">
            <a href="#features" className="text-teal-400 hover:text-teal-200 transition">
              <span className="animate-bounce block">▼</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 bg-gray-800 text-gray-100" id="features">
        <div className="container max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">Why TankMate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              title="AI-Powered Insights"
              description="Analyze fish counts, species, and tank conditions using AI-powered image recognition."
              icon="🐠"
              imageUrl="/img/marketing/features-ai.webp"
            />
            <FeatureCard
              title="Real-time Stats"
              description="Track water parameters, plant health, and sand quality in real time."
              icon="📊"
              imageUrl="/img/marketing/features-realtime-stats.webp"
            />
            <FeatureCard
              title="Custom Notifications"
              description="Receive alerts for maintenance and care based on your tank’s conditions."
              icon="🔔"
              imageUrl="/img/marketing/features-custom-notifications.webp"
            />
          </div>
        </div>
      </section>

      {/* Prototype Section */}
      <section className="prototype-section py-24 bg-background text-gray-100">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Try the TankMate Prototype!</h2>
          <p className="text-lg mb-12">
            Experience the power of TankMate firsthand. Upload an image of your tank and get real-time stats, fish counts, and more.
          </p>
          <img
            src="/img/marketing/prototype-screenshot.png"
            alt="TankMate Prototype"
            className="mx-auto mb-8 rounded-lg shadow-lg max-w-lg w-full"
          />
          <Link
            to="/prototype"
            className="btn-primary px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-semibold"
          >
            Try the Prototype
          </Link>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section py-20 bg-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Keep your tank healthy with TankMate!</h2>
          <p className="text-lg mb-10">
            Join the aquarium enthusiasts who are using AI to revolutionize their tank care.
          </p>
          <Link
            to="/signup"
            className="btn-primary px-8 py-3 bg-white hover:bg-gray-100 text-teal-600 rounded-lg font-semibold"
          >
            Start Tracking Now
          </Link>
        </div>
      </section>

    </div>
  );
}

// FeatureCard Component
function FeatureCard({
  title,
  description,
  icon,
  imageUrl,
}: {
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
}) {
  return (
    <div className="feature-card p-8 bg-gray-800 hover:bg-gray-700 shadow-lg rounded-lg">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover mb-4 rounded-lg" />
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

