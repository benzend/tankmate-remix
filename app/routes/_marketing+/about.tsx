import { useInView } from "#app/utils/use-in-view.ts";

export default function AboutRoute() {
  const heroRef = useInView({ threshold: 0.2 });
  const missionRef = useInView({ threshold: 0.3 });
  const storyRef = useInView({ threshold: 0.3 });
  const valuesRef = useInView({ threshold: 0.2 });
  const teamRef = useInView({ threshold: 0.2 });

  return (
    <div className="min-h-screen bg-background text-gray-100">
      {/* Hero Section */}
      <section
        ref={heroRef.ref}
        className="hero-section relative flex h-[500px] items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 text-white overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1
            className={`font-serif mb-6 text-5xl font-extrabold drop-shadow-lg lg:text-7xl transition-all duration-1000 ${
              heroRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            About TankMate
          </h1>
          <p
            className={`mx-auto max-w-2xl text-xl drop-shadow-lg transition-all duration-1000 delay-300 ${
              heroRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            Building a community and creating modern software to make aquarium care effortless
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section
        ref={missionRef.ref}
        className="mission-section bg-slate-950 py-20"
      >
        <div className="container mx-auto max-w-4xl px-8">
          <h2
            className={`font-serif text-center mb-12 text-4xl font-bold text-white md:text-5xl transition-all duration-700 ${
              missionRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 -translate-y-8"
            }`}
          >
            Our Mission
          </h2>
          <div
            className={`text-center text-lg leading-relaxed transition-all duration-700 delay-200 ${
              missionRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            <p className="mb-6">
              At TankMate, we believe that every aquarium deserves the best care possible. Our mission is to empower aquarium enthusiasts—from beginners to experts—with modern software tools and a supportive community that makes tank maintenance effortless, enjoyable, and more effective.
            </p>
            <p className="mb-6">
              We're passionate about creating intuitive tools that not only simplify aquarium care but also connect you with fellow aquarists who share your passion. By combining smart tracking capabilities with community knowledge, we help you create thriving underwater worlds while building lasting friendships.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        ref={valuesRef.ref}
        className="values-section bg-slate-950 py-20"
      >
        <div className="container mx-auto max-w-6xl px-8">
          <h2
            className={`font-serif text-center mb-16 text-4xl font-bold text-white md:text-5xl transition-all duration-700 ${
              valuesRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 -translate-y-8"
            }`}
          >
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`text-center transition-all duration-700 delay-200 ${
                valuesRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-8"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <ValueCard
                icon="🔬"
                title="Innovation"
                description="We constantly push the boundaries of what's possible in aquarium care through modern software and intuitive design."
              />
            </div>
            <div
              className={`text-center transition-all duration-700 delay-400 ${
                valuesRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-8"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <ValueCard
                icon="🌱"
                title="Sustainability"
                description="We promote responsible aquarium keeping that protects both your fish and the environment."
              />
            </div>
            <div
              className={`text-center transition-all duration-700 delay-600 ${
                valuesRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-8"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <ValueCard
                icon="🤝"
                title="Community"
                description="We believe in building a supportive community where aquarium enthusiasts can learn and grow together."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section bg-gradient-to-l from-blue-900 to-slate-900 py-20">
        <div className="container mx-auto max-w-4xl px-8 text-center">
          <h2 className="font-serif mb-12 text-4xl font-bold text-white md:text-5xl">
            Modern Tools for Aquarium Care
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-6 text-blue-300">Smart Tracking & Community Features</h3>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  Intuitive parameter logging and maintenance scheduling
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  Photo galleries to document your tank's progress
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  Community sharing and knowledge exchange
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  Smart reminders and care recommendations
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-8 shadow-lg">
              <div className="text-6xl mb-4">🌐</div>
              <h4 className="text-xl font-bold mb-2">Connected Community</h4>
              <p>Join a thriving community of aquarists sharing experiences, tips, and celebrating beautiful tanks together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section bg-gradient-to-br from-indigo-600 to-blue-700 py-20 text-white">
        <div className="container mx-auto text-center max-w-2xl px-8">
          <h2 className="font-serif mb-6 text-4xl font-bold md:text-5xl">
            Ready to Transform Your Aquarium Care?
          </h2>
          <p className="mb-8 text-xl">
            Be the first of aquarium enthusiasts who trust TankMate to keep their tanks healthy and thriving.
          </p>
          <a
            href="/signup"
            className="inline-block transform rounded bg-white px-10 py-3 font-bold text-blue-600 transition duration-300 hover:scale-105 hover:bg-blue-50"
          >
            Create Your Free Account
          </a>
        </div>
      </section>
    </div>
  );
}

// ValueCard Component
function ValueCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="value-card rounded-lg bg-gradient-to-br from-blue-950 to-slate-900 p-8 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-2">
      <div className="mb-6 text-6xl animate-bounce">{icon}</div>
      <h3 className="mb-4 text-2xl font-bold text-blue-300">{title}</h3>
      <p className="leading-relaxed">{description}</p>
    </div>
  );
}
