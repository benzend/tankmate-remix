// app/routes/index.tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Link, useActionData, Form } from "@remix-run/react";
import { z } from "zod";
import { DosingCalculatorWidget } from "#app/components/dosing-calculator-widget.tsx";
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
  const calculatorRef = useInView({ threshold: 0.2 });
  const howItWorksRef = useInView({ threshold: 0.2 });
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
              The Easy Way to Dose & Track Your Reef Tank
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-xl drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              Stop guessing with your water chemistry. Get exact dosing calculations
              for Calcium, Alkalinity, and Magnesium — and track your parameters
              over time with beautiful charts.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Link
                to="/calculator"
                className="inline-block transform rounded bg-indigo-500 px-8 py-3 font-bold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400"
              >
                Try the Calculator
              </Link>
              <Link
                to="/signup"
                className="inline-block transform rounded border-2 border-white/30 px-8 py-3 font-bold text-white transition duration-300 hover:scale-105 hover:bg-white/10"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Demo Section */}
      <section
        ref={calculatorRef.ref}
        className="calculator-section bg-slate-950 py-20"
      >
        <div className="container mx-auto max-w-7xl px-8 text-center">
          <h2
            className={`font-serif mb-4 text-4xl font-bold text-white md:text-5xl transition-all duration-700 ${
              calculatorRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            Try It Now — No Account Needed
          </h2>
          <p
            className={`mx-auto mb-12 max-w-2xl text-xl text-slate-400 transition-all duration-700 delay-200 ${
              calculatorRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            Enter your tank volume, current levels, and desired levels. We will
            calculate the exact dose using real commercial products.
          </p>
          <div
            className={`transition-all duration-700 delay-400 ${
              calculatorRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-8"
                : "opacity-0 translate-y-12"
            }`}
          >
            <DosingCalculatorWidget />
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Supports Brightwell, Seachem, Red Sea, ESV, Tropic Marin, and more.
          </p>
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
            Everything Your Reef Tank Needs
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
                title="Precision Dosing Calculator"
                description="Calculate exact doses for Calcium, Alkalinity (dKH, meq/L, ppm), and Magnesium using coefficients from real commercial products like Brightwell, Seachem, and Red Sea."
                icon="🧪"
                imageUrl="/img/marketing/features-realtime-stats.webp"
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
                title="Track Parameters Over Time"
                description="Log salinity, calcium, alkalinity, magnesium, pH, nitrate, phosphate, and temperature. View trend charts with ideal range shading to keep your reef thriving."
                icon="📈"
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
                title="Smart Safety Warnings"
                description="Built-in pH impact alerts and manufacturer dosing warnings help you avoid overdosing. Know exactly what to expect before you add anything to your tank."
                icon="🛡️"
                imageUrl="/img/marketing/features-custom-notifications.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef.ref}
        className="how-it-works-section bg-slate-950 py-24"
      >
        <div className="container mx-auto max-w-5xl px-4">
          <h2
            className={`font-serif mb-16 text-center text-4xl font-bold text-white md:text-5xl transition-all duration-700 ${
              howItWorksRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Enter Your Tank Volume"
              description="Tell us how many gallons (or liters) your reef tank holds."
              delay={200}
              isInView={howItWorksRef.isInView}
            />
            <StepCard
              number="2"
              title="Set Current & Target Levels"
              description="Input your current Calcium, Alkalinity, and Magnesium readings and where you want them to be."
              delay={400}
              isInView={howItWorksRef.isInView}
            />
            <StepCard
              number="3"
              title="Get the Exact Dose"
              description="Pick your product and instantly see the precise amount to dose, with unit conversions and safety warnings."
              delay={600}
              isInView={howItWorksRef.isInView}
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        ref={ctaRef.ref}
        className="cta-section from-bg-indigo-200 bg-indigo-600 bg-gradient-to-br py-20 text-white"
      >
        <div className="container mx-auto text-center">
          <h2
            className={`font-serif mx-auto mb-3 max-w-2xl text-4xl font-bold text-white md:text-5xl leading-relaxed md:leading-relaxed transition-all duration-700 ${
              ctaRef.isInView
                ? "animate-in fade-in zoom-in-50"
                : "opacity-0 scale-75"
            }`}
          >
            Stop Guessing. Start Dosing with Confidence.
          </h2>
          <p
            className={`mx-auto mb-10 max-w-xl text-xl transition-all duration-700 delay-200 ${
              ctaRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            Create a free account to save your calculations, log parameters over time,
            and keep your reef tank in perfect balance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/signup"
              className={`inline-block transform rounded bg-blue-950 px-10 py-3 font-bold text-white transition-all duration-700 delay-400 hover:scale-105 hover:bg-blue-900 ${
                ctaRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-4"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Create Free Account
            </Link>
            <Link
              to="/calculator"
              className={`inline-block transform rounded border-2 border-white/30 px-10 py-3 font-bold text-white transition-all duration-700 delay-500 hover:scale-105 hover:bg-white/10 ${
                ctaRef.isInView
                  ? "animate-in fade-in slide-in-from-bottom-4"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Use Calculator
            </Link>
          </div>
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
            className={`mx-auto mb-10 max-w-lg text-xl text-center transition-all duration-700 delay-200 ${
              contactRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 -translate-y-8"
            }`}
          >
            Have questions about dosing, tracking, or anything reef-related?
            We are here to help.
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

// StepCard Component
function StepCard({
  number,
  title,
  description,
  delay,
  isInView,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
  isInView: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center transition-all duration-700 hover:border-indigo-500/50 hover:bg-slate-900 ${
        isInView
          ? "animate-in fade-in slide-in-from-bottom-8"
          : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
        {number}
      </div>
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
