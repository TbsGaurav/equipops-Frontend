import { NavLink } from 'react-router';

const stats = [
    { value: '1M+', label: 'Assets Tracked' },
    { value: '2M+', label: 'Loans Processed' },
    { value: '90%', label: 'Error Reduction' }
];

const features = [
    { title: 'Centralized Tracking', desc: 'All assets, one system, full visibility.' },
    { title: 'Mobile Scanning', desc: 'Scan QR & barcode from any phone.' },
    { title: 'Automated Workflow', desc: 'Request → Reserve → Loan → Return.' },
    { title: 'Compliance Ready', desc: 'Audit, insurance, certifications tracked.' }
];

export default function Landing() {
    return (
        <div className="bg-slate-950 text-white">
            {/* NAV */}
            <nav className="sticky top-0 z-20 backdrop-blur bg-slate-900/70 border-b border-slate-800">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        Equip<span className="text-indigo-400">Flow</span>
                    </h1>
                    <NavLink to="/login" className="px-4 py-2 rounded-lg hover:bg-slate-800">
                        Login
                    </NavLink>
                </div>
            </nav>

            {/* HERO */}
            <section className="text-center py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl" />
                <h2 className="relative text-5xl md:text-6xl font-extrabold">
                    Smarter Asset & Inventory
                    <br />
                    <span className="text-indigo-400">Management Platform</span>
                </h2>
                <p className="relative mt-6 max-w-2xl mx-auto text-slate-400">
                    Track, assign, and manage all your equipment and inventory in one platform.
                </p>
                <div className="relative mt-10 flex justify-center gap-4">
                    <button className="bg-indigo-600 px-8 py-3 rounded-xl hover:bg-indigo-700">Book a Demo</button>
                    <button className="border border-slate-700 px-8 py-3 rounded-xl hover:bg-slate-900">Get Started</button>
                </div>
            </section>

            {/* STATS */}
            <section className="py-20 bg-slate-900/40">
                <div className="container mx-auto grid md:grid-cols-3 gap-8 text-center">
                    {stats.map((s, i) => (
                        <div key={i}>
                            <h3 className="text-4xl font-bold text-indigo-400">{s.value}</h3>
                            <p className="text-slate-400 mt-2">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-28">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16">Why EquipFlow?</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500 transition"
                            >
                                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LIFECYCLE */}
            <section className="py-28 bg-slate-900/40 text-center">
                <h2 className="text-4xl font-bold mb-14">Equipment Lifecycle</h2>
                <div className="flex flex-wrap justify-center gap-10">
                    {['Request', 'Reserve', 'Loan', 'Return'].map((s, i) => (
                        <div key={i} className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center font-bold shadow-xl">
                            {s}
                        </div>
                    ))}
                </div>
                <p className="mt-10 text-slate-400 max-w-2xl mx-auto">
                    Automated workflows with status, user, and location tracking at every stage.
                </p>
            </section>

            {/* USE CASES */}
            <section className="py-28">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-14">Real-World Use Cases</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="bg-slate-900 p-6 rounded-xl">Sales teams close deals faster</div>
                        <div className="bg-slate-900 p-6 rounded-xl">Operations fulfill requests efficiently</div>
                        <div className="bg-slate-900 p-6 rounded-xl">Compliance teams pass audits easily</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-28 bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
                <h2 className="text-4xl font-extrabold">Ready to Transform Your Asset Management?</h2>
                <p className="mt-4 text-indigo-100">Start managing smarter with EquipFlow.</p>
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <button className="bg-black px-8 py-4 rounded-xl hover:bg-slate-900">Book Demo</button>
                    <button className="border border-white/30 px-8 py-4 rounded-xl">Free Trial</button>
                    <button className="bg-white text-black px-8 py-4 rounded-xl hover:bg-slate-200">Contact Sales</button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-10 text-center text-slate-500 bg-slate-950">
                © {new Date().getFullYear()} EquipFlow. All rights reserved.
            </footer>
        </div>
    );
}
