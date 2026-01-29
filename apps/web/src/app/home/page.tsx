'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  CreditCard,
  BarChart3,
  Calendar,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  School,
  ClipboardCheck,
  MessageSquare,
  PieChart,
  Zap,
  Star,
  ChevronRight,
  Sun,
  Moon,
  TrendingUp,
  Shield,
  Smartphone,
  Cloud,
  HeadphonesIcon,
  PlayCircle,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart as RechartsPieChart } from 'recharts';

gsap.registerPlugin(ScrollTrigger);

// Demo chart data
const attendanceData = [
  { month: 'Jan', attendance: 92 },
  { month: 'Feb', attendance: 88 },
  { month: 'Mar', attendance: 95 },
  { month: 'Apr', attendance: 91 },
  { month: 'May', attendance: 94 },
  { month: 'Jun', attendance: 89 },
];

const feeCollectionData = [
  { month: 'Jan', collected: 85000, pending: 15000 },
  { month: 'Feb', collected: 92000, pending: 8000 },
  { month: 'Mar', collected: 78000, pending: 22000 },
  { month: 'Apr', collected: 95000, pending: 5000 },
  { month: 'May', collected: 88000, pending: 12000 },
  { month: 'Jun', collected: 98000, pending: 2000 },
];

const studentDistribution = [
  { name: 'Primary', value: 450, fill: '#3b82f6' },
  { name: 'Middle', value: 380, fill: '#8b5cf6' },
  { name: 'High', value: 320, fill: '#ec4899' },
  { name: 'Senior', value: 180, fill: '#f97316' },
];

const chartConfig = {
  attendance: { label: 'Attendance %', color: '#3b82f6' },
  collected: { label: 'Collected', color: '#22c55e' },
  pending: { label: 'Pending', color: '#f97316' },
};

const features = [
  {
    icon: ClipboardCheck,
    title: 'Smart Attendance',
    description: 'Mark attendance in seconds with our intuitive interface. Real-time sync across all devices.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Automated fee collection, reminders, and detailed payment tracking with multiple payment modes.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Student Management',
    description: 'Complete student profiles, enrollment tracking, and academic history in one place.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: MessageSquare,
    title: 'Parent Communication',
    description: 'Instant notifications, announcements, and direct messaging with parents.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Powerful insights with customizable reports on attendance, fees, and performance.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Calendar,
    title: 'Class Scheduling',
    description: 'Effortless timetable management with conflict detection and teacher allocation.',
    color: 'from-teal-500 to-cyan-500',
  },
];

const stats = [
  { value: '218M+', label: 'Students in India', icon: GraduationCap },
  { value: '1.55M', label: 'Schools', icon: School },
  { value: '70%', label: 'Cost Savings', icon: PieChart },
  { value: '24/7', label: 'Support', icon: Zap },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '₹20',
    period: '/student/year',
    description: 'Perfect for small schools getting started',
    features: [
      'Up to 500 students',
      'Attendance management',
      'Basic fee collection',
      'Parent app access',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹35',
    period: '/student/year',
    description: 'Most popular for growing institutions',
    features: [
      'Unlimited students',
      'All Starter features',
      'Advanced analytics',
      'Custom reports',
      'SMS notifications',
      'Priority support',
      'API access',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large institutions & chains',
    features: [
      'Everything in Professional',
      'Multi-branch management',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  {
    quote: "Masst Campus transformed how we manage our school. Fee collection is now 3x faster.",
    author: 'Rajesh Kumar',
    role: 'Principal, Delhi Public School',
    avatar: 'RK',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    quote: "The parent communication feature alone saved us countless hours every week.",
    author: 'Priya Sharma',
    role: "Administrator, St. Mary's Convent",
    avatar: 'PS',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    quote: "Finally, a school management system that actually understands Indian schools.",
    author: 'Amit Patel',
    role: 'Director, Sunrise Academy',
    avatar: 'AP',
    gradient: 'from-orange-500 to-red-500',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Sign Up & Setup',
    description: 'Create your school account in under 5 minutes. Import existing data or start fresh.',
    icon: GraduationCap,
  },
  {
    step: '02',
    title: 'Add Your Team',
    description: 'Invite teachers, staff, and administrators. Each gets their own role-based dashboard.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Connect Parents',
    description: 'Parents download the app and instantly connect. Real-time updates begin flowing.',
    icon: Smartphone,
  },
  {
    step: '04',
    title: 'Start Managing',
    description: 'Attendance, fees, communication - everything works seamlessly from day one.',
    icon: Zap,
  },
];

const trustFeatures = [
  { icon: Shield, label: 'Bank-grade Security', description: 'Your data is encrypted and secure' },
  { icon: Cloud, label: '99.9% Uptime', description: 'Always available when you need it' },
  { icon: HeadphonesIcon, label: '24/7 Support', description: 'Help available in Hindi & English' },
  { icon: Smartphone, label: 'Mobile Apps', description: 'iOS & Android for parents' },
];

const comparisonFeatures = [
  { feature: 'Attendance Management', us: true, others: true },
  { feature: 'Fee Collection', us: true, others: true },
  { feature: 'Parent Mobile App', us: true, others: false },
  { feature: 'SMS/WhatsApp Notifications', us: true, others: false },
  { feature: 'Real-time Analytics', us: true, others: false },
  { feature: 'Multi-branch Support', us: true, others: false },
  { feature: 'Offline Mode', us: true, others: false },
  { feature: 'Indian Language Support', us: true, others: false },
  { feature: 'Starting Price', us: '₹20/student/year', others: '₹60+/student/year' },
];

const faqs = [
  {
    question: 'How long does it take to set up?',
    answer: 'Most schools are up and running within a day. Our team helps you import existing data and train your staff at no extra cost.',
  },
  {
    question: 'Can parents use it without smartphones?',
    answer: 'Yes! Parents receive SMS notifications for attendance and fee reminders. The app is optional but recommended for the best experience.',
  },
  {
    question: 'Is my data safe?',
    answer: 'Absolutely. We use bank-grade encryption, regular backups, and comply with all Indian data protection regulations. Your data never leaves Indian servers.',
  },
  {
    question: 'What if we need help?',
    answer: 'Our support team is available 24/7 via chat, phone, and email. We also provide free training sessions and video tutorials in Hindi and English.',
  },
  {
    question: 'Can we try before buying?',
    answer: 'Yes! Start with a free 14-day trial with full features. No credit card required. If you love it, choose a plan that fits your school.',
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleTheme = () => setIsDark(!isDark);

  // Theme-aware class helper
  const t = (dark: string, light: string) => isDark ? dark : light;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states for scroll-triggered elements
      gsap.set('.stat-item, .feature-card, .pricing-card, .testimonial-card, .how-step, .comparison-row, .faq-item', {
        opacity: 0,
        y: 30,
      });

      // Hero text animations
      gsap.from('.hero-title', { y: 100, opacity: 0, duration: 1, ease: 'power4.out' });
      gsap.from('.hero-subtitle', { y: 50, opacity: 0, duration: 1, delay: 0.3, ease: 'power4.out' });
      gsap.from('.hero-cta', { y: 30, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power4.out' });

      // Dashboard animation with staggered elements
      gsap.from('.hero-image', { scale: 0.9, opacity: 0, duration: 1, delay: 0.4, ease: 'power4.out' });
      gsap.from('.dashboard-stat', { y: 20, opacity: 0, duration: 0.6, delay: 0.8, stagger: 0.1, ease: 'power3.out' });
      gsap.from('.dashboard-chart', { scale: 0.9, opacity: 0, duration: 0.8, delay: 1.1, stagger: 0.15, ease: 'power3.out' });

      // Floating elements
      gsap.to('.float-1', { y: -20, duration: 2, repeat: -1, yoyo: true, ease: 'power1.inOut' });
      gsap.to('.float-2', { y: 20, duration: 2.5, repeat: -1, yoyo: true, ease: 'power1.inOut' });
      gsap.to('.float-3', { y: -15, duration: 3, repeat: -1, yoyo: true, ease: 'power1.inOut' });

      // Floating notification cards
      gsap.from('.float-card', { x: -50, opacity: 0, duration: 0.8, delay: 1.2, stagger: 0.2, ease: 'power3.out' });

      // Stats section
      ScrollTrigger.batch('.stat-item', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }),
      });

      // Features - batch animation for reliability
      ScrollTrigger.batch('.feature-card', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }),
      });

      // Pricing cards
      ScrollTrigger.batch('.pricing-card', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }),
      });

      // Testimonials
      ScrollTrigger.batch('.testimonial-card', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }),
      });

      // How it works steps
      ScrollTrigger.batch('.how-step', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }),
      });

      // Comparison table
      ScrollTrigger.batch('.comparison-row', {
        start: 'top 95%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: 'power3.out' }),
      });

      // FAQ items
      ScrollTrigger.batch('.faq-item', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' }),
      });

      // CTA section
      gsap.from('.cta-content', {
        scrollTrigger: { trigger: ctaRef.current, start: 'top 90%', once: true },
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      });

      // Safety: ensure all elements are visible after 3 seconds regardless of scroll
      setTimeout(() => {
        gsap.to('.stat-item, .feature-card, .pricing-card, .testimonial-card, .how-step, .comparison-row, .faq-item', {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }, 3000);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={`min-h-screen overflow-hidden transition-all duration-500 ${
      t('bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white',
        'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900')
    }`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
        t('bg-slate-950/80 border-white/10', 'bg-white/80 border-gray-200')
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Masst Campus</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>Features</a>
            <a href="#pricing" className={`text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>Pricing</a>
            <a href="#testimonials" className={`text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                t('bg-white/10 hover:bg-white/20 border border-white/10',
                  'bg-gray-100 hover:bg-gray-200 border border-gray-200')
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <Link href="/login" className={`text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl float-1 ${t('bg-blue-500/30', 'bg-blue-400/20')}`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl float-2 ${t('bg-purple-500/30', 'bg-purple-400/20')}`} />
          <div className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl float-3 ${t('bg-cyan-500/20', 'bg-cyan-400/10')}`} />
        </div>

        <div className={`absolute inset-0 bg-[size:64px_64px] ${
          t('bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]',
            'bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)]')
        }`} />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 ${
              t('bg-white/10 border-white/20', 'bg-blue-50 border-blue-200')
            }`}>
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className={t('text-slate-300', 'text-blue-700')}>Trusted by 100+ Schools</span>
            </div>

            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              School Management
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className={`hero-subtitle text-xl mb-8 max-w-lg ${t('text-slate-400', 'text-gray-600')}`}>
              The all-in-one platform for attendance, fees, communication, and analytics.
              Built for Indian schools, priced for everyone.
            </p>

            <div className="hero-cta flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 text-white"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all border ${
                  t('bg-white/10 border-white/20 hover:bg-white/20',
                    'bg-white border-gray-200 hover:bg-gray-50 shadow-sm')
                }`}
              >
                See Features
              </a>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[
                  { initials: 'RK', gradient: 'from-blue-500 to-cyan-500' },
                  { initials: 'PS', gradient: 'from-purple-500 to-pink-500' },
                  { initials: 'AP', gradient: 'from-orange-500 to-red-500' },
                  { initials: 'SK', gradient: 'from-green-500 to-emerald-500' },
                ].map((user, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.gradient} border-2 flex items-center justify-center text-xs font-bold text-white ${
                      t('border-slate-900', 'border-white')
                    }`}
                  >
                    {user.initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className={`text-sm ${t('text-slate-400', 'text-gray-500')}`}>Loved by educators</p>
              </div>
            </div>
          </div>

          <div className="hero-image relative">
            <div className={`relative rounded-2xl border shadow-2xl overflow-hidden ${
              t('bg-gradient-to-br from-slate-800 to-slate-900 border-white/10',
                'bg-white border-gray-200')
            }`}>
              <div className={`p-4 border-b flex items-center gap-2 ${t('border-white/10', 'border-gray-100')}`}>
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className={`ml-2 text-xs ${t('text-slate-400', 'text-gray-500')}`}>Dashboard</span>
              </div>
              <div className="p-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Students', value: '1,234', color: 'from-blue-500 to-cyan-500', trend: '+12%' },
                    { label: 'Teachers', value: '48', color: 'from-purple-500 to-pink-500', trend: '+3%' },
                    { label: 'Collection', value: '₹12.4L', color: 'from-green-500 to-emerald-500', trend: '+18%' },
                  ].map((stat, i) => (
                    <div key={i} className={`dashboard-stat p-3 rounded-xl border ${
                      t('bg-white/5 border-white/10', 'bg-gray-50 border-gray-100')
                    }`}>
                      <p className={`text-xs mb-1 ${t('text-slate-400', 'text-gray-500')}`}>{stat.label}</p>
                      <p className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />{stat.trend}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Attendance Chart */}
                  <div className={`dashboard-chart p-3 rounded-xl border ${t('bg-white/5 border-white/10', 'bg-gray-50 border-gray-100')}`}>
                    <p className={`text-xs font-medium mb-2 ${t('text-slate-300', 'text-gray-700')}`}>Attendance Trend</p>
                    <ChartContainer config={chartConfig} className="h-[100px] w-full">
                      <AreaChart data={attendanceData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <defs>
                          <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="attendance"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#attendanceGradient)"
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </AreaChart>
                    </ChartContainer>
                  </div>

                  {/* Fee Collection Chart */}
                  <div className={`dashboard-chart p-3 rounded-xl border ${t('bg-white/5 border-white/10', 'bg-gray-50 border-gray-100')}`}>
                    <p className={`text-xs font-medium mb-2 ${t('text-slate-300', 'text-gray-700')}`}>Fee Collection</p>
                    <ChartContainer config={chartConfig} className="h-[100px] w-full">
                      <BarChart data={feeCollectionData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <Bar dataKey="collected" fill="#22c55e" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="pending" fill="#f97316" radius={[2, 2, 0, 0]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>

                {/* Student Distribution */}
                <div className={`p-3 rounded-xl border ${t('bg-white/5 border-white/10', 'bg-gray-50 border-gray-100')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-medium mb-1 ${t('text-slate-300', 'text-gray-700')}`}>Student Distribution</p>
                      <div className="flex gap-3 mt-2">
                        {studentDistribution.map((item, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className={`text-xs ${t('text-slate-400', 'text-gray-500')}`}>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ChartContainer config={chartConfig} className="h-[70px] w-[70px]">
                      <RechartsPieChart>
                        <Pie
                          data={studentDistribution}
                          dataKey="value"
                          innerRadius={20}
                          outerRadius={32}
                          paddingAngle={2}
                        >
                          {studentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className={`float-card absolute -left-8 top-1/4 p-4 rounded-xl border shadow-xl float-1 ${
              t('bg-slate-800 border-white/10', 'bg-white border-gray-200')
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Attendance Marked</p>
                  <p className={`text-xs ${t('text-slate-400', 'text-gray-500')}`}>Class 10-A • Just now</p>
                </div>
              </div>
            </div>

            <div className={`float-card absolute -right-4 bottom-1/4 p-4 rounded-xl border shadow-xl float-2 ${
              t('bg-slate-800 border-white/10', 'bg-white border-gray-200')
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">₹25,000 Received</p>
                  <p className={`text-xs ${t('text-slate-400', 'text-gray-500')}`}>Fee Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce ${t('text-slate-500', 'text-gray-400')}`}>
          <span className="text-xs">Scroll to explore</span>
          <ChevronRight className="w-5 h-5 rotate-90" />
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className={`py-20 border-y ${t('border-white/10 bg-white/[0.02]', 'border-gray-200 bg-gray-50')}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  t('bg-gradient-to-br from-blue-500/20 to-purple-500/20', 'bg-gradient-to-br from-blue-100 to-purple-100')
                }`}>
                  <stat.icon className={`w-8 h-8 ${t('text-blue-400', 'text-blue-600')}`} />
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className={t('text-slate-400', 'text-gray-600')}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${
              t('bg-white/10 border-white/20', 'bg-yellow-50 border-yellow-200')
            }`}>
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className={t('text-slate-300', 'text-yellow-700')}>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Run Your School
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${t('text-slate-400', 'text-gray-600')}`}>
              From attendance to analytics, we've got every aspect of school management covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`feature-card group p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                  t('bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20',
                    'bg-white border-gray-200 hover:border-gray-300 shadow-sm')
                }`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className={`leading-relaxed ${t('text-slate-400', 'text-gray-600')}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className={`py-20 ${t('bg-white/[0.02]', 'bg-gray-50')}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${
              t('bg-white/10 border-white/20', 'bg-blue-50 border-blue-200')
            }`}>
              <PlayCircle className="w-4 h-4 text-blue-500" />
              <span className={t('text-slate-300', 'text-blue-700')}>Simple Setup</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Get Started in
              <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                4 Easy Steps
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${t('text-slate-400', 'text-gray-600')}`}>
              From signup to managing your school - it takes less than a day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="how-step relative">
                <div className={`p-6 rounded-2xl border h-full ${
                  t('bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10',
                    'bg-white border-gray-200 shadow-sm')
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`text-4xl font-bold ${t('text-white/20', 'text-gray-200')}`}>
                      {step.step}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className={`text-sm ${t('text-slate-400', 'text-gray-600')}`}>{step.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className={`hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 ${t('bg-white/20', 'bg-gray-300')}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustFeatures.map((feature, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${
                t('bg-white/5 border-white/10', 'bg-white border-gray-200 shadow-sm')
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  t('bg-green-500/20', 'bg-green-100')
                }`}>
                  <feature.icon className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{feature.label}</p>
                  <p className={`text-xs ${t('text-slate-400', 'text-gray-500')}`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section ref={comparisonRef} className={`py-20 ${t('bg-white/[0.02]', 'bg-gray-50')}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Schools Choose
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> Masst Campus</span>
            </h2>
            <p className={`text-lg ${t('text-slate-400', 'text-gray-600')}`}>
              See how we compare to traditional school management software.
            </p>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            t('bg-white/5 border-white/10', 'bg-white border-gray-200 shadow-lg')
          }`}>
            <div className={`grid grid-cols-3 p-4 border-b font-semibold ${
              t('bg-white/10 border-white/10', 'bg-gray-50 border-gray-200')
            }`}>
              <div>Feature</div>
              <div className="text-center text-blue-500">Masst Campus</div>
              <div className={`text-center ${t('text-slate-400', 'text-gray-500')}`}>Others</div>
            </div>
            {comparisonFeatures.map((item, i) => (
              <div key={i} className={`comparison-row grid grid-cols-3 p-4 border-b last:border-0 ${
                t('border-white/5', 'border-gray-100')
              }`}>
                <div className={t('text-slate-300', 'text-gray-700')}>{item.feature}</div>
                <div className="text-center">
                  {typeof item.us === 'boolean' ? (
                    item.us ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                  ) : (
                    <span className="text-green-500 font-semibold">{item.us}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof item.others === 'boolean' ? (
                    item.others ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                  ) : (
                    <span className={t('text-slate-400', 'text-gray-500')}>{item.others}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
              t('bg-white/10 border-white/20', 'bg-green-50 border-green-200')
            }`}>
              <CreditCard className="w-4 h-4 text-green-500" />
              <span className={t('text-slate-300', 'text-green-700')}>Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              70% Cheaper Than
              <span className="block bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Competitors
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${t('text-slate-400', 'text-gray-600')}`}>
              World-class features at prices that make sense for Indian schools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                className={`pricing-card relative p-8 rounded-2xl border transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : t('bg-white/5 border-white/10', 'bg-white border-gray-200 shadow-sm')
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <p className={`text-sm mb-6 ${t('text-slate-400', 'text-gray-500')}`}>{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className={t('text-slate-400', 'text-gray-500')}>{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className={t('text-slate-300', 'text-gray-700')}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-medium transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white'
                    : t('bg-white/10 hover:bg-white/20', 'bg-gray-100 hover:bg-gray-200')
                }`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
              t('bg-white/10 border-white/20', 'bg-yellow-50 border-yellow-200')
            }`}>
              <Star className="w-4 h-4 text-yellow-500" />
              <span className={t('text-slate-300', 'text-yellow-700')}>Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Educators
              <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Across India
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`testimonial-card p-8 rounded-2xl border transition-all ${
                  t('bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10',
                    'bg-white border-gray-200 shadow-sm')
                }`}
              >
                <div className="flex items-center gap-1 text-yellow-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className={`text-lg mb-6 leading-relaxed ${t('text-slate-300', 'text-gray-700')}`}>"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center font-bold text-white`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className={`text-sm ${t('text-slate-400', 'text-gray-500')}`}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className={`py-20 ${t('bg-white/[0.02]', 'bg-gray-50')}`}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${
              t('bg-white/10 border-white/20', 'bg-purple-50 border-purple-200')
            }`}>
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span className={t('text-slate-300', 'text-purple-700')}>FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className={`text-lg ${t('text-slate-400', 'text-gray-600')}`}>
              Everything you need to know about Masst Campus.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item rounded-xl border overflow-hidden ${
                  t('bg-white/5 border-white/10', 'bg-white border-gray-200 shadow-sm')
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={`w-full p-5 flex items-center justify-between text-left transition-colors ${
                    t('hover:bg-white/5', 'hover:bg-gray-50')
                  }`}
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                    openFaq === i ? 'rotate-180' : ''
                  } ${t('text-slate-400', 'text-gray-500')}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  openFaq === i ? 'max-h-48' : 'max-h-0'
                }`}>
                  <p className={`px-5 pb-5 ${t('text-slate-400', 'text-gray-600')}`}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className={`cta-content relative p-12 md:p-16 rounded-3xl border text-center overflow-hidden ${
            t('bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border-white/10',
              'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-gray-200')
          }`}>
            <div className={`absolute inset-0 blur-3xl ${t('bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10', 'opacity-0')}`} />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your School?
              </h2>
              <p className={`text-xl mb-8 max-w-2xl mx-auto ${t('text-slate-300', 'text-gray-600')}`}>
                Join hundreds of schools already using Masst Campus. Start your free trial today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/login"
                  className={`group px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center gap-2 ${
                    t('bg-white text-slate-900 hover:bg-slate-100',
                      'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25')
                  }`}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#"
                  className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all border ${
                    t('bg-white/10 border-white/20 hover:bg-white/20',
                      'bg-white border-gray-200 hover:bg-gray-50')
                  }`}
                >
                  Schedule Demo
                </a>
              </div>
              <p className={`mt-6 text-sm ${t('text-slate-400', 'text-gray-500')}`}>
                No credit card required • Free 14-day trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 border-t ${t('border-white/10', 'border-gray-200')}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Masst Campus</span>
              </div>
              <p className={`text-sm ${t('text-slate-400', 'text-gray-600')}`}>
                Modern school management for the digital age. Built in India, for India.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className={`space-y-2 text-sm ${t('text-slate-400', 'text-gray-600')}`}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className={`transition-colors ${t('hover:text-white', 'hover:text-gray-900')}`}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${t('border-white/10', 'border-gray-200')}`}>
            <p className={`text-sm ${t('text-slate-400', 'text-gray-600')}`}>
              © 2026 Masst Campus (hey.school). All rights reserved.
            </p>
            <div className={`flex items-center gap-4 ${t('text-slate-400', 'text-gray-600')}`}>
              <Globe className="w-4 h-4" />
              <span className="text-sm">Available in 35+ countries</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
