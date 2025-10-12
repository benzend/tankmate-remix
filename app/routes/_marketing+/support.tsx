import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { sendContactEmail } from "#app/utils/email.server.js";
import { useInView } from "#app/utils/use-in-view.ts";

const supportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  category: z.enum(["technical", "billing", "general", "feature"], {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData());

  try {
    const { name, email, subject, category, message } = supportSchema.parse(formData);

    await sendContactEmail({
      name,
      email,
      message: `Category: ${category}\nSubject: ${subject}\n\n${message}`,
    });

    return json({ success: true, error: null });
  } catch (error) {
    console.error("Failed to send support email:", error);
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

export default function SupportRoute() {
  const actionData = useActionData<typeof action>();
  const heroRef = useInView({ threshold: 0.2 });
  const faqRef = useInView({ threshold: 0.3 });
  const contactRef = useInView({ threshold: 0.2 });
  const resourcesRef = useInView({ threshold: 0.2 });

  return (
    <div className="min-h-screen bg-background text-gray-100">
      {/* Hero Section */}
      <section
        ref={heroRef.ref}
        className="hero-section relative flex h-[400px] items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 text-white overflow-hidden"
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
            Support Center
          </h1>
          <p
            className={`mx-auto max-w-2xl text-xl drop-shadow-lg transition-all duration-1000 delay-300 ${
              heroRef.isInView
                ? "animate-in fade-in slide-in-from-bottom-4"
                : "opacity-0 translate-y-8"
            }`}
          >
            We're here to help you get the most out of TankMate
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        ref={contactRef.ref}
        className="contact-section bg-gradient-to-l from-blue-900 to-slate-900 py-20"
      >
        <div className="container mx-auto max-w-4xl px-8">
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
            className={`text-center mb-12 text-xl transition-all duration-700 delay-200 ${
              contactRef.isInView
                ? "animate-in fade-in slide-in-from-top-4"
                : "opacity-0 -translate-y-8"
            }`}
          >
            Can't find what you're looking for? Reach out to me!
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div
              className={`transition-all duration-700 delay-400 ${
                contactRef.isInView
                  ? "animate-in fade-in slide-in-from-left-8"
                  : "opacity-0 -translate-x-12"
              }`}
            >
              <h3 className="text-2xl font-bold mb-8 text-blue-300">Contacts</h3>
              <div className="space-y-6">
                <ContactInfo
                  icon="📧"
                  title="Email Support"
                  info="support@tankmate.tech"
                  description="We typically respond within 24 hours"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div
              className={`transition-all duration-700 delay-600 ${
                contactRef.isInView
                  ? "animate-in fade-in slide-in-from-right-8"
                  : "opacity-0 translate-x-12"
              }`}
            >
              <Form method="post" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-white font-medium">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-white font-medium">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block mb-2 text-white font-medium">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Account</option>
                    <option value="feature">Feature Request</option>
                    <option value="general">General Question</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block mb-2 text-white font-medium">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block mb-2 text-white font-medium">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    minLength={10}
                    rows={5}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-vertical"
                    placeholder="Please provide as much detail as possible..."
                  ></textarea>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="inline-block transform rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    Send Message
                  </button>
                  {actionData?.success && (
                    <p className="mt-4 text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      Message sent successfully! We'll get back to you soon.
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
          </div>
        </div>
      </section>
    </div>
  );
}

// Component for Quick Help Cards
function QuickHelpCard({
  icon,
  title,
  description,
  link,
}: {
  icon: string;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <div className="quick-help-card rounded-lg bg-gradient-to-br from-blue-950 to-slate-900 p-8 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-2">
      <div className="mb-6 text-5xl">{icon}</div>
      <h3 className="mb-4 text-2xl font-bold text-blue-300">{title}</h3>
      <p className="mb-6 leading-relaxed">{description}</p>
      <a
        href={link}
        className="inline-block rounded bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-500"
      >
        Learn More
      </a>
    </div>
  );
}

// Component for FAQ Items
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="faq-item bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-3 text-blue-300">{question}</h3>
      <p className="leading-relaxed text-gray-300">{answer}</p>
    </div>
  );
}

// Component for Resource Cards
function ResourceCard({
  icon,
  title,
  description,
  link,
}: {
  icon: string;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <div className="resource-card rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-700">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-3 text-xl font-bold text-blue-300">{title}</h3>
      <p className="mb-4 leading-relaxed text-gray-300">{description}</p>
      <a
        href={link}
        className="inline-block rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
      >
        View Resource
      </a>
    </div>
  );
}

// Component for Contact Info
function ContactInfo({
  icon,
  title,
  info,
  description,
}: {
  icon: string;
  title: string;
  info: string;
  description: string;
}) {
  return (
    <div className="contact-info flex items-start space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="text-lg font-bold text-blue-300">{title}</h4>
        <p className="font-medium">{info}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}
