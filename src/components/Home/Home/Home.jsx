// src/components/Home/Home.jsx
import React from "react";
import './Home.css';
import { ShieldAlert, BrainCircuit, Search, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

// Wrapper component to apply animations to each section
const AnimatedSection = ({ children }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
  >
    {children}
  </motion.section>
);

// Hero Section
const HeroSection = () => (
  <section className="hero-section text-center text-white py-24 px-4 relative overflow-hidden">
    <div className="absolute inset-0  hero-background opacity-90 z-10"
    style={{
    // backgroundImage: "url('/banner-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
    ></div>
    <div className="absolute inset-0  z-0"></div>
    <div className="relative z-20 max-w-4xl mx-auto">
      <motion.h1 
        className="text-6xl font-extrabold mb-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Tadawi
      </motion.h1>
      <motion.p 
        className="text-xl mb-8 text-indigo-100"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Your smart medicine network, connecting patients to pharmacies across Egypt.
      </motion.p>
      <motion.div 
        className="flex justify-center gap-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button className="services bg-white text-indigo-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-indigo transform hover:scale-105 transition-transform duration-300">
          Explore Services
        </button>
        <button className="contact bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-indigo-600 transition-colors duration-300">
          Contact Us
        </button>
      </motion.div>
    </div>
  </section>
);

// Problem Section
const ProblemSection = () => (
  <div className="bg-slate-50 py-20 px-4">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <div className="text-left">
        <h2 className="text-4xl font-bold mb-4 text-slate-800">The Problem We Solve</h2>
        <p className="mb-4 text-slate-600 text-lg">
          Medicine shortages in Egypt are a chronic and recurring issue. Patients often struggle to find necessary medications, facing a system with no easy way to find safe alternatives or real-time stock data.
        </p>
        <p className="text-slate-600 text-lg font-medium">
          Our platform directly addresses this by providing instant, reliable information.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <img
            src="/problem1.png"
            alt="Illustration of a person looking for medicine"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  </div>
);

// New Reusable Feature Card Component
const FeatureCard = ({ icon, title, description, path }) => (
  <Link to={path} className="feature-card-link">
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col items-center text-center border border-slate-200"
      whileHover={{ y: -10, scale: 1.03, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-indigo-600 text-white mb-5 shadow-indigo-300 shadow-md">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {title}
      </h3>
      <p className="text-slate-500">
        {description}
      </p>
    </motion.div>
  </Link>
);


const FeaturesSection = () => {
  const featuresData = [
    {
      icon: <ShieldAlert className="h-10 w-10" />,
      title: "AI Conflict System",
      description: "Our smart system checks for potential drug conflicts and interactions to ensure your safety.",
      path: "/conflict-system",
    },
    {
      icon: <BrainCircuit className="h-10 w-10" />,
      title: "AI Alternative Search",
      description: "Instantly find safe and effective medication alternatives when your prescribed drug is unavailable.",
      path: "/alternative-search",
    },
    {
      icon: <Search className="h-10 w-10" />,
      title: "Smart Drug Search",
      description: "Quickly locate any medication with real-time availability from pharmacies near you.",
      path: "/pharasearch",
    },
  ];

  return (
    <div className="bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800">Powerful Features, Simplified</h2>
            <p className="text-lg text-slate-600 mt-2">Everything you need for smarter medicine access.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};


// Solution Section
const SolutionSection = () => {
  const solutionFeatures = [
    "Smart drug search with real-time stock",
    "AI-based alternative suggestions",
    "Nearby pharmacy locator with maps",
    "Digital prescription upload (OCR)",
  ];

  return (
    <div className="bg-slate-50 py-20 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
         <div className="flex justify-center">
            <img
              src="/soloution.png"
              alt="Tadawi platform interface"
              className="rounded-2xl shadow-2xl max-w-full"
            />
          </div>
        <div className="text-left">
           <h2 className="text-4xl font-bold mb-4 text-slate-800">Our Solution: Tadawi</h2>
           <p className="mb-8 text-slate-600 text-lg">
             Tadawi is a smart web platform that connects patients, doctors, and pharmacies in real-time to create a seamless healthcare experience.
           </p>
          <ul className="space-y-4">
            {solutionFeatures.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-indigo-500 flex-shrink-0" />
                <span className="text-slate-700 font-medium text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};


// Call to Action Section
const CallToAction = () => (
  <div className="cta-section text-white text-center py-20 px-4">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold mb-4">Start Your Journey with Tadawi</h2>
      <p className="mb-8 text-lg opacity-90">
        Whether you're a patient, pharmacy, or doctor—Tadawi helps you access treatment faster and smarter.
      </p>
      <button className="regestier bg-white text-teal-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-teal-50 transform hover:scale-105 transition-transform duration-300">
        Register for Free
      </button>
    </div>
  </div>
);

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
    <div className="overflow-x-hidden"> {/* Prevents horizontal scroll from animations */}
      <HeroSection />
      <AnimatedSection><ProblemSection /></AnimatedSection>
      <AnimatedSection><FeaturesSection /></AnimatedSection>
      <AnimatedSection><SolutionSection /></AnimatedSection>
      <AnimatedSection><CallToAction /></AnimatedSection>
      <AnimatedSection><ContactUsSection /></AnimatedSection> 
      <Footer /> 
    </div>
  );
};

export default Home;