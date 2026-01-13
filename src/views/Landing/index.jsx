import { NavLink } from 'react-router';
import PropTypes from 'prop-types';

const features = [
    {
        title: 'AI Interviewer',
        desc: 'Adaptive questions that evolve based on candidate responses.',
        icon: '🤖'
    },
    {
        title: 'Voice & Text Analysis',
        desc: 'Measure tone, clarity, confidence, and content accuracy.',
        icon: '🎙️'
    },
    {
        title: 'Automated Scoring',
        desc: 'Instant AI-driven scoring with actionable insights.',
        icon: '📊'
    },
    {
        title: 'Bias-Free Hiring',
        desc: 'Fair, consistent evaluation for every candidate.',
        icon: '⚖️'
    }
];

const steps = ['Create Interview', 'Invite Candidate', 'AI Conducts Interview', 'Receive Smart Report'];

const FeatureCard = ({ icon, title, desc }) => (
    <div className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500 transition-all hover:-translate-y-2">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

FeatureCard.propTypes = {
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired
};

const Landing = () => {
    return (
        <div className="flex flex-col min-h-dvh bg-slate-950 text-white">
            {/* NAV */}
            <nav className="sticky top-0 z-20 backdrop-blur bg-slate-900/70 border-b border-slate-800">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <span className="text-xl font-bold tracking-wide">
                        AI <span className="text-indigo-400">Interview</span>
                    </span>

                    <NavLink to="/login" className="px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition">
                        Login
                    </NavLink>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative overflow-hidden text-center py-32 px-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl" />

                <h1 className="relative text-5xl md:text-6xl font-extrabold leading-tight">
                    AI-Powered Interviews
                    <br />
                    <span className="text-indigo-400">Hire Smarter. Faster.</span>
                </h1>

                <p className="relative mt-6 max-w-2xl mx-auto text-slate-400 text-lg">
                    Automate interviews, remove bias, and get deep insights into skills, communication, and confidence — powered by AI.
                </p>

                <div className="relative mt-10 flex justify-center gap-4 flex-wrap">
                    <button className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition">
                        Start Free Trial
                    </button>
                    <button className="border border-slate-700 px-8 py-3 rounded-xl hover:bg-slate-900 transition">Watch Demo</button>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="py-24 bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-14">Why Choose AI Interviewer?</h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <FeatureCard key={i} {...f} />
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="py-24">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-16">How It Works</h2>

                    <div className="grid md:grid-cols-4 gap-10">
                        {steps.map((step, i) => (
                            <div key={i} className="relative">
                                <div className="w-14 h-14 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/30">
                                    {i + 1}
                                </div>
                                <p className="mt-4 text-slate-400 font-medium">{step}</p>

                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-7 left-full w-full h-px bg-slate-700" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-28 bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
                <h2 className="text-4xl font-extrabold">Ready to Hire Smarter?</h2>
                <p className="mt-4 text-indigo-100 text-lg">Start your AI-powered interviews today.</p>

                <button className="mt-8 bg-black px-10 py-4 rounded-xl font-semibold hover:bg-slate-900 transition shadow-xl">
                    Get Started Now
                </button>
            </section>

            {/* FOOTER */}
            <footer className="py-10 text-center text-sm text-slate-500 bg-slate-950">
                © {new Date().getFullYear()} AI Interviewer. All rights reserved.
            </footer>
        </div>
    );
};

export default Landing;
