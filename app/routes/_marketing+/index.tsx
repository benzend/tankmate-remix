// app/routes/index.tsx
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="bg-background text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="hero-section h-screen bg-[url('/img/marketing/hero.jpg')] bg-cover bg-center relative flex items-center justify-center text-white">
        <div className="absolute inset-0 opacity-70"></div>
        <div className="flex justify-between">
          <div></div>
          <div className="relative md:w-1/2 px-4">
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 drop-shadow-lg">
              Dive into the Future of Aquarium Care
            </h1>
            <p className="text-xl mb-10 max-w-xl mx-auto drop-shadow-lg">
              AI-powered aquarium tracking that analyzes fish counts, tank health, and more.
              Your underwater ecosystem, optimized with the latest tech.
            </p>
            <Link
              to="/signup"
              className="inline-block px-10 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded transform transition duration-300 hover:scale-105"
            >
              Get Started
            </Link>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 bg-gradient-to-br bg-slate-950 from-blue-800 text-foreground" id="features">
        <div className="container max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-white">Why TankMate?</h2>
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
      <section className="prototype-section py-24  bg-gradient-to-l bg-slate-950 from-blue-900 text-gray-100">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-white">Get an In-depth Analysis</h2>
          <img
            src="/img/marketing/prototype-screenshot.png"
            alt="TankMate Prototype"
            className="mx-auto mb-8 rounded-lg shadow-lg max-w-lg w-full"
          />
          <Link
            to="/prototype"
            className="inline-block px-10 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded transform transition duration-300 hover:scale-105"
          >
            Try the Prototype
          </Link>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section py-20 bg-gradient-to-br bg-indigo-600 from-bg-indigo-200 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white max-w-lg mx-auto md:leading-relaxed">Keep your tank healthy with TankMate!</h2>
          <p className="text-2xl mb-10 max-w-lg mx-auto">
            Join the aquarium enthusiasts who are using AI to revolutionize their tank care.
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded transform transition duration-300 hover:scale-105"
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
    <div className="feature-card p-8 bg-gradient-to-tl from-blue-950 to-slate-900 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover mb-4 rounded-lg" />
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-accent-foreground">{description}</p>
    </div>
  );
}

