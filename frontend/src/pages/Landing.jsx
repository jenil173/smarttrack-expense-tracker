import { TrendingUp, PieChart, Shield, Zap, ArrowRight, CheckCircle2, Github, Linkedin, Mail, ExternalLink, X, Instagram, Brain, Layers, Calculator, Activity, Layout } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/20">
            {/* Navbar */}
            <nav className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-[60]">
                <div className="flex items-center space-x-2 group cursor-pointer">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <TrendingUp className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">SmartTrack</span>
                </div>
                <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-600">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <button onClick={() => setIsAboutOpen(true)} className="hover:text-primary transition-colors cursor-pointer">About</button>
                    <Link to="/login" className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all font-bold">Login</Link>
                    <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-bold">Start Free</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-fade-in">
                    <Zap size={14} />
                    <span>The #1 Financial Companion</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-8">
                    Master Your Money <br />
                    <span className="text-primary italic">Without the Stress.</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    The ultra-intelligent expense tracker that actually helps you save. Track spending, visualize trends, and reach your goals faster than ever.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link to="/register" className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center group">
                        Get Started Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto border-2 border-gray-100 text-gray-600 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all">
                        View Demo
                    </Link>
                </div>

                {/* Dashboard Mockup Preview */}
                <div className="relative px-4 md:px-0 max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75 -z-10 animate-pulse"></div>
                    <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-[12px] border-gray-800 transform perspective-1000 rotate-x-2 hover:rotate-x-0 transition-all duration-700 ease-out group overflow-hidden">
                        <div className="bg-white rounded-[2rem] overflow-hidden aspect-video flex items-center justify-center relative">
                             <img 
                                src="/dashboard-preview.png" 
                                alt="Dashboard Preview" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                             />
                             <div className="hidden absolute inset-0 bg-gray-50 items-center justify-center flex-col">
                                <TrendingUp className="text-primary animate-pulse mb-4" size={60} />
                                <span className="text-gray-400 font-bold">Interactive Dashboard Powered by Smart Analytics</span>
                             </div>
                        </div>
                    </div>
                    <p className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Interactive Dashboard Powered by Smart Financial Analytics
                    </p>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-32 bg-gray-50/50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Everything You Need</h2>
                        <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                            Professional-grade tools for personal financial freedom. Built with modern technology and deep behavioral insights.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {[
                            { icon: Activity, title: "Smart Tracking", desc: "Visualize your income and expenses with stunning, interactive charts and real-time movement.", color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: PieChart, title: "Category Breakdown", desc: "Instantly see where your money goes with automatic and deep audits.", color: "text-purple-500", bg: "bg-purple-50" },
                            { icon: Brain, title: "Mood Insights", desc: "Understand how your emotional state correlates with your spending habits.", color: "text-indigo-500", bg: "bg-indigo-50" },
                            { icon: Layers, title: "Recurring Detection", desc: "Never miss a subscription. Automatically track your recurring expenses.", color: "text-orange-500", bg: "bg-orange-50" },
                            { icon: Calculator, title: "What-If Simulator", desc: "Simulate future savings scenarios and see the impact of your daily choices.", color: "text-emerald-500", bg: "bg-emerald-50" },
                            { icon: Activity, title: "Spending Heatmap", desc: "Track your daily spending activity with a professional-grade color-coded heatmap.", color: "text-green-500", bg: "bg-green-50" }
                        ].map((feat, i) => (
                            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group relative overflow-hidden">
                                <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                                    <feat.icon size={160} />
                                </div>
                                <div className={`h-16 w-16 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    <feat.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{feat.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium relative z-10">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About the Developer Section */}
            <section id="developer" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12 backdrop-visible">
                    <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
                        <div className="w-full md:w-1/2 relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl transform rotate-6 scale-90 group-hover:rotate-12 transition-transform"></div>
                            <div className="relative aspect-auto rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl bg-gray-100">
                                <img 
                                    src="/profile.jpg" 
                                    alt="Jenil Gajipara" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Jenil+Gajipara&background=6366f1&color=fff&size=512'; }}
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl flex items-center space-x-4 border border-gray-100 animate-bounce group-hover:animate-none">
                                <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-black text-gray-900">Available for Projects</span>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-1/2 text-left">
                            <h4 className="text-primary font-black uppercase tracking-widest text-sm mb-4">Meet the Creator</h4>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">Jenil Gajipara</h2>
                            <p className="text-xl text-gray-500 leading-relaxed mb-10 font-medium italic">
                                "Jenil is a full-stack developer focused on building modern web applications and AI-powered tools that solve real-world problems."
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mb-10">
                                {[
                                    { icon: Github, link: "https://github.com/jenil173", label: "GitHub", color: "hover:bg-gray-900" },
                                    { icon: Linkedin, link: "https://www.linkedin.com/in/jenil-gajipara/", label: "LinkedIn", color: "hover:bg-blue-600" },
                                    { icon: Instagram, link: "https://www.instagram.com/jenil_gajipara", label: "Instagram", color: "hover:bg-pink-600" },
                                    { icon: Mail, link: "mailto:dev.jenil17@gmail.com", label: "Contact", color: "hover:bg-primary" }
                                ].map((social, i) => (
                                    <a 
                                        key={i} 
                                        href={social.link} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className={`flex items-center space-x-3 px-6 py-3 rounded-2xl bg-gray-50 text-gray-600 font-bold transition-all ${social.color} hover:text-white group`}
                                    >
                                        <social.icon size={20} className="group-hover:scale-110 transition-transform" />
                                        <span>{social.label}</span>
                                    </a>
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                                <div>
                                    <p className="text-3xl font-black text-gray-900">MERN</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Stack Mastered</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900">Secure</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Architecture</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900">Data</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Driven Design</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Modal */}
            {isAboutOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsAboutOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setIsAboutOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-[110]"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-5">
                            <div className="md:col-span-2 bg-gradient-to-br from-primary to-purple-700 p-10 text-white flex flex-col justify-between">
                                <div>
                                    <div className="h-24 w-24 bg-white/20 rounded-3xl backdrop-blur-md overflow-hidden flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                                         <img 
                                            src="/profile.jpg" 
                                            alt="Jenil" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Jenil+Gajipara&background=fff&color=6366f1'; }}
                                        />
                                    </div>
                                    <h3 className="text-3xl font-black mb-1">Jenil Gajipara</h3>
                                    <p className="text-white/70 text-sm font-medium mb-8 uppercase tracking-widest font-black">Full Stack Developer</p>
                                    
                                    <div className="space-y-4">
                                        <a href="mailto:dev.jenil17@gmail.com" className="flex items-center space-x-4 text-sm hover:text-white/80 transition-colors group">
                                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                                <Mail size={16} />
                                            </div>
                                            <span>dev.jenil17@gmail.com</span>
                                        </a>
                                        <a href="https://github.com/jenil173" target="_blank" rel="noreferrer" className="flex items-center space-x-4 text-sm hover:text-white/80 transition-colors group">
                                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                                <Github size={16} />
                                            </div>
                                            <span>/jenil173</span>
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="pt-8 border-t border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Core Technology</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['MongoDB', 'Express', 'React', 'Node', 'Tailwind'].map(t => (
                                            <span key={t} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black tracking-tight">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-3 p-10 text-left">
                                <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                                    <Layout className="mr-2 text-primary" size={24} />
                                    Project: SmartTrack
                                </h4>
                                <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium italic">
                                    SmartTrack is a professional-grade personal finance management system designed to simplify complex financial data. 
                                    Built with a focus on premium UX and academic rigor, it features NLP entries and mood-based analytics.
                                </p>
                                
                                <div className="space-y-3 mb-10">
                                    {[
                                        "Monthly Financial Reports Engine",
                                        "Real-time Spending Heatmap Analysis",
                                        "Smart Habit & Correlation Insights"
                                    ].map((list, i) => (
                                        <div key={i} className="flex items-center space-x-3 text-gray-700 font-bold">
                                            <CheckCircle2 size={18} className="text-primary shrink-0" />
                                            <span className="text-sm">{list}</span>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <section className="py-32 px-6 md:px-12 max-w-6xl mx-auto text-center">
                <div className="bg-primary rounded-[4rem] py-20 px-8 relative overflow-hidden shadow-2xl shadow-primary/40">
                    <div className="absolute top-0 right-0 h-96 w-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 h-96 w-96 bg-purple-500/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 relative tracking-tight">Ready to take control?</h2>
                    <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto relative font-medium leading-relaxed">Join thousands of users who are already mastering their financial future with SmartTrack.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative">
                        <Link to="/register" className="bg-white text-primary px-12 py-5 rounded-[2rem] text-xl font-black hover:scale-105 transition-all shadow-2xl">Start Saving Now</Link>
                        <div className="flex items-center text-white/90 text-md font-bold">
                            <CheckCircle2 size={24} className="mr-3" /> Free Forever Plan
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 md:px-12 border-t border-gray-100 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="text-left space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-white" size={16} />
                        </div>
                        <span className="text-xl font-black text-gray-900">SmartTrack</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium italic max-w-xs">Elevating personal finance through modern technology and design.</p>
                </div>
                
                <div className="flex flex-col items-center">
                    <p className="text-gray-400 text-sm font-black uppercase tracking-widest mb-4">Developed by</p>
                    <p className="text-gray-900 font-black text-lg">Jenil Gajipara</p>
                </div>

                <div className="flex flex-col md:items-end space-y-4">
                    <div className="flex space-x-8 text-sm font-black text-gray-500 uppercase tracking-widest">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                    <p className="text-gray-300 text-xs font-medium italic">© 2026 SmartTrack. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
