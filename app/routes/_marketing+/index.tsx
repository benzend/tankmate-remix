// app/routes/index.tsx
import { Link, useActionData, Form } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { sendContactEmail } from "#app/utils/email.server.js";
import { useInView } from "#app/utils/use-in-view.ts";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData());

  try {
    const { name, email, message } = contactSchema.parse(formData);

    await sendContactEmail({
      name,
      email,
      message,
    });

    return json({ success: true, error: null });
  } catch (error) {
    return json(
      {
        success: false,
        error:
          error instanceof z.ZodError ? error.errors : "Failed to send message",
      },
      { status: 400 },
    );
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const featuresRef = useInView({ threshold: 0.2 });
  const prototypeRef = useInView({ threshold: 0.3 });
  const ctaRef = useInView({ threshold: 0.3 });
  const contactRef = useInView({ threshold: 0.2 });

  return (
    <div className="min-h-screen bg-background text-gray-100">
      {/* Hero Section */}
      <section className="hero-section relative flex h-[650px] items-center justify-center bg-[url('/img/marketing/hero.jpg')] bg-cover bg-center text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/50 md:bg-transparent"></div>
        
        {/* Wave Animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>
        
        {/* Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bubble bubble1"></div>
          <div className="bubble bubble2"></div>
          <div className="bubble bubble3"></div>
          <div className="bubble bubble4"></div>
          <div className="bubble bubble5"></div>
          <div className="bubble bubble6"></div>
        </div>
        
        {/* Light Refraction Effect */}
        <div className="absolute inset-0">
          <div className="light-shimmer shimmer1"></div>
          <div className="light-shimmer shimmer2"></div>
          <div className="light-shimmer shimmer3"></div>
        </div>
        
        {/* Fish Silhouettes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="fish fish1">🐠</div>
          <div className="fish fish2">🐟</div>
          <div className="fish fish3">🐡</div>
        </div>
        
        <div className="flex justify-between relative z-10">
          <div role="presentation"></div>
          <div className="relative px-4 md:w-1/2">
            <h1 className="font-serif leading-normal lg:leading-snug mb-6 text-4xl font-extrabold drop-shadow-lg lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Dive into the Future of Aquarium Care
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-xl drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              AI-powered aquarium tracking that analyzes fish counts, tank
              health, and more. Your underwater ecosystem, optimized with the
              latest tech.
            </p>
            <Link
              to="/signup"
              className="inline-block transform rounded bg-indigo-500 px-10 py-2 font-bold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 hover:animate-pulse"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef.ref}
        className="features-section bg-slate-950 bg-gradient-to-br from-blue-800 py-20 text-foreground"
        id="features"
      >
        <div className="container mx-auto max-w-7xl px-8 text-center">
          <h2
            className={`font-serif mb-20 text-4xl font-bold text-white md:text-5xl transition-all duration-700 ${
              featuresRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            Why TankMate?
          </h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div
              className={`transition-all duration-700 delay-200 ${
                featuresRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-8"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <FeatureCard
                title="AI-Powered Insights"
                description="Analyze fish counts, species, and tank conditions using AI-powered image recognition."
                icon="🐠"
                imageUrl="/img/marketing/features-ai.webp"
              />
            </div>
            <div
              className={`transition-all duration-700 delay-400 ${
                featuresRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-8"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <FeatureCard
                title="Real-time Stats"
                description="Track water parameters, plant health, and sand quality in real time."
                icon="📊"
                imageUrl="/img/marketing/features-realtime-stats.webp"
              />
            </div>
            <div
              className={`transition-all duration-700 delay-600 ${
                featuresRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-8"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <FeatureCard
                title="Custom Notifications"
                description="Receive alerts for maintenance and care based on your tank's conditions."
                icon="🔔"
                imageUrl="/img/marketing/features-custom-notifications.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Prototype Section */}
      <section
        ref={prototypeRef.ref}
        className="prototype-section bg-slate-950 bg-gradient-to-l from-blue-900 py-24 text-gray-100"
      >
        <div className="container mx-auto px-4 text-center">
          <h2
            className={`font-serif mb-4 text-4xl font-bold text-white md:text-5xl transition-all duration-700 ${
              prototypeRef.isInView
                ? "animate-in fade-in slide-in-from-left-4"
                : "opacity-0 -translate-x-8"
            }`}
          >
            Get an In-depth Analysis
          </h2>
          <p
            className={`mx-auto max-w-2xl text-xl mb-20 transition-all duration-700 delay-200 ${
              prototypeRef.isInView
                ? "animate-in fade-in slide-in-from-left-4"
                : "opacity-0 -translate-x-8"
            }`}
          >
            Simply snap a photo of your aquarium and let our AI generate
            detailed insights about your fish, plants, and water conditions
          </p>
          <img
            src="/img/marketing/prototype-example.png"
            alt="TankMate Prototype"
            className={`mx-auto mb-8 w-full max-w-lg rounded-lg shadow-lg hover:scale-105 transition-all duration-1000 delay-400 ${
              prototypeRef.isInView
                ? "animate-in fade-in slide-in-from-right-8"
                : "opacity-0 translate-x-12"
            }`}
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        ref={ctaRef.ref}
        className="cta-section from-bg-indigo-200 bg-indigo-600 bg-gradient-to-br py-20 text-white"
      >
        <div className="container mx-auto text-center">
          <h2
            className={`font-serif mx-auto mb-3 max-w-lg text-4xl font-bold text-white md:text-5xl leading-relaxed md:leading-relaxed transition-all duration-700 ${
              ctaRef.isInView
                ? "animate-in fade-in zoom-in-50"
                : "opacity-0 scale-75"
            }`}
          >
            Keep your tank healthy with TankMate!
          </h2>
          <p
            className={`mx-auto mb-10 max-w-lg text-2xl transition-all duration-700 delay-200 ${
              ctaRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            Join the aquarium enthusiasts who are using AI to revolutionize
            their tank care.
          </p>
          <Link
            to="/signup"
            className={`inline-block transform rounded bg-blue-950 px-10 py-2 font-bold text-white transition-all duration-700 delay-400 hover:scale-105 hover:bg-blue-900 hover:animate-bounce ${
              ctaRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            Start Tracking Now
          </Link>
        </div>
      </section>

      {/* Contact Us */}
      <section
        ref={contactRef.ref}
        className="contact-section bg-slate-950 py-20"
      >
        <div className="container mx-auto max-w-2xl px-8">
          <h2
            className={`font-serif text-center mb-12 text-4xl font-bold text-white md:text-5xl transition-all duration-700 ${
              contactRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 -translate-y-8"
            }`}
          >
            Get in Touch
          </h2>
          <p
            className={`mx-auto mb-10 max-w-lg text-2xl text-center transition-all duration-700 delay-200 ${
              contactRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 -translate-y-8"
            }`}
          >
            Reach out with questions, requests, support- pretty much anything
            that you can think of.
          </p>
          <Form
            method="post"
            className={`space-y-6 transition-all duration-700 delay-400 ${
              contactRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-8"
                : "opacity-0 translate-y-12"
            }`}
          >
            <div>
              <label htmlFor="name" className="block mb-2 text-white">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all duration-300 focus:scale-105"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-white">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all duration-300 focus:scale-105"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block mb-2 text-white">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all duration-300 focus:scale-105"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="inline-block transform rounded bg-indigo-500 px-10 py-2 font-bold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400 disabled:opacity-50 hover:animate-pulse"
              >
                Send Message
              </button>
              {actionData?.success && (
                <p className="mt-4 text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  Message sent successfully!
                </p>
              )}
              {actionData?.error && (
                <p className="mt-4 text-red-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {typeof actionData.error === "string"
                    ? actionData.error
                    : "Please check your input and try again."}
                </p>
              )}
            </div>
          </Form>
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
    <div className="feature-card rounded-lg bg-gradient-to-tl from-blue-950 to-slate-900 p-8 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-2">
      <img
        src={imageUrl}
        alt={title}
        className="mb-4 h-48 w-full rounded-lg object-cover transition-transform duration-300 hover:scale-110"
      />
      <div className="mb-6 text-5xl animate-bounce">{icon}</div>
      <h3 className="mb-4 text-2xl font-bold">{title}</h3>
      <p>{description}</p>
    </div>
  );
}
