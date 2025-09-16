// import React from "react";
import './Home.css'
import { ShieldAlert, BrainCircuit, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// Hero Section
const HeroSection = () => (
  <section className="hero text-center text-white py-20 px-4">
    <div className="max-w-3xl mx-auto herodiv">
      <h1 className="text-5xl font-bold mb-4">Tadawi</h1>
      <p className="text-lg mb-6">
        Smart medicine network connecting patients to pharmacies across Egypt
      </p>
      <div className="flex justify-center gap-4">
        {/* زر بخلفية لبني */}
        <button className="services bg-blue-600 text-white font-semibold px-6 py-3 rounded-2xl shadow hover:bg-blue-700 transition border-0 outline-none focus:outline-none">
          See all services
        </button>
        {/* زر شفاف ببوردر أبيض */}
        <button className="contact bg-transparent text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white hover:text-blue-600 transition outline-none focus:outline-none">
          Contact us
        </button>
      </div>
    </div>
  </section>
);


// Problem Section
const ProblemSection = () => (
  <section className="bg-gray-50 text-center py-16 px-4">
    <div className="grid md:grid-cols-2 gap-12 items-center">
  {/* النص */}
  <div className="text-left mx-9">
    <h2 className="text-4xl font-bold mb-4 text-gray-800">The Problem</h2>
    <p className="mb-4 text-gray-700 text-lg font-semibold">
      Medicine shortages in Egypt are chronic and recurring.
    </p>
    <p className="text-gray-700 text-lg font-semibold">
      20–40% of drugs are sometimes unavailable, with no easy way to find safe alternatives or real-time stock data.
    </p>
  </div>

  {/* الصورة */}
  <div className="flex justify-center">
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-xl w-full">
      <img
        src="/problem1.png"
        alt="Problem illustration"
        className="w-full h-auto object-cover"
      />
    </div>
  </div>
</div>
  </section>
);
// البيانات الجديدة بأيقونات ووصف مناسب
// 1. أضفنا خاصية "path" لكل عنصر لتحديد الرابط الخاص به
const featuresData = [
  {
    icon: <ShieldAlert className="h-10 w-10 text-white" />,
    title: "AI Conflict System",
    description: "Our smart system automatically checks for potential drug conflicts and interactions to ensure your safety.",
    path: "/conflict-system", //  الرابط الأول
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-white" />,
    title: "AI Alternative Search",
    description: "Instantly find safe and effective medication alternatives when your prescribed drug is unavailable.",
    path: "/alternative-search", // الرابط الثاني
  },
  {
    icon: <Search className="h-10 w-10 text-white" />,
    title: "Smart Drug Search",
    description: "Quickly search for any medication and get real-time availability information from pharmacies near you.",
    path: "/drug-search", // الرابط الثالث
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {featuresData.map((feature, index) => (
            // 2. استخدمنا <Link> ليحيط بالـ div بالكامل
            // Key انتقلت للـ Link لأنه العنصر الخارجي
            // أضفنا className عشان نشيل الستايل الافتراضي للينكات
            <Link key={index} to={feature.path} className="no-underline text-inherit">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 max-w-xs">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
// Solution Section
const SolutionSection = () => {
  const features = [
    "Smart drug search",
    "AI-based alternative suggestions",
    "Nearby pharmacy locator",
    "Prescription upload (OCR)",
  ];

  return (
    <section className="text-center py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">Our Solution</h2>
        <p className="mb-12 text-gray-600 text-lg">
          Tadawi is a web platform that connects patients, doctors, and
          pharmacies in real time.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* نص + لستة المميزات */}
          <ul className="space-y-6 text-left">
            {features.map((item, idx) => (
              <li key={idx} className="flex items-center gap-4">
                <span className="w-5 h-5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <span className="text-gray-700 font-medium">{item}</span>
              </li>
            ))}
          </ul>

          {/* صورة */}
          <div className="flex justify-center">
            <img
              src="/soloution.png"
              alt="Solution illustration"
              className="rounded-2xl shadow-lg max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};


// Call to Action Section
const CallToAction = () => (
  <section className="regestier-sec bg-green-600 text-white text-center py-20 px-4">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Start using Tadawi now</h2>
      <p className="mb-6">
        Whether you're a patient, pharmacy, or doctor — Tadawi helps you access
        treatment faster and smarter.
      </p>
      <button className="regestier bg-white text-green-600 font-semibold px-6 py-3 rounded-2xl shadow hover:bg-gray-100 transition">
        Register for Free
      </button>
    </div>
  </section>
);
// Contact Us Section
const ContactUsSection = () => (
  <section className="bg-gray-100 py-16 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-4 text-gray-800">Contact Us</h2>
      <p className="mb-8 text-gray-600 text-lg">
        Have questions or need assistance? Reach out to us and we’ll get back to you as soon as possible.
      </p>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder="Your Name"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="text"
          placeholder="Subject"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 md:col-span-2"
        />
        <textarea
          placeholder="Message"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 md:col-span-2 h-32"
        ></textarea>
        <button
          type="submit"
          className="contact md:col-span-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-2xl shadow hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-white text-center py-6 px-4">
    <p>© 2025 Tadawi. All rights reserved.</p>
  </footer>
);

// Home Page
const Home = () => {
  return (
    <div>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <SolutionSection />
      <CallToAction />
      <ContactUsSection />  {/* <- Add here */}
      <Footer />
    </div>
  );
};


export default Home;
