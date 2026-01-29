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
  Menu,
  Bell,
  Target,
} from 'lucide-react';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
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

// Theme configuration - centralized styling aliases
const theme = {
  dark: {
    // Page & Sections
    pageBg: 'bg-[#0a0a0f]',
    sectionBg: 'bg-[#0a0a0f]',
    sectionAlt: 'bg-[#0d0d14]',
    // Cards
    bgCard: 'bg-white/[0.02]',
    bgCardHover: 'hover:bg-white/[0.04]',
    bgCardActive: 'bg-white/[0.05]',
    bgFloat: 'bg-[#12121a]/80 backdrop-blur-xl',
    bgMockup: 'bg-[#0d0d14]/90 backdrop-blur-sm',
    bgInput: 'bg-white/[0.03]',
    // Borders
    border: 'border-white/[0.06]',
    borderHover: 'hover:border-white/[0.12]',
    borderActive: 'border-purple-500/40',
    borderMockup: 'border-white/[0.08]',
    // Text
    text: 'text-white',
    textMuted: 'text-white/70',
    textSubtle: 'text-white/50',
    textTiny: 'text-white/35',
    // Shadows
    shadow: 'shadow-xl shadow-black/20',
    // Tooltip
    tooltipBg: 'bg-[#12121a]/95 backdrop-blur-xl',
    tooltipBorder: 'border-white/10',
    tooltipText: 'text-white',
    tooltipMuted: 'text-white/60',
    // Dividers
    divider: 'border-white/[0.06]',
  },
  light: {
    // Page & Sections
    pageBg: 'bg-[#fafafa]',
    sectionBg: 'bg-[#fafafa]',
    sectionAlt: 'bg-white',
    // Cards
    bgCard: 'bg-white',
    bgCardHover: 'hover:bg-gray-50',
    bgCardActive: 'bg-gray-50',
    bgFloat: 'bg-white/95 backdrop-blur-xl',
    bgMockup: 'bg-white',
    bgInput: 'bg-gray-50',
    // Borders
    border: 'border-gray-200/80',
    borderHover: 'hover:border-gray-300',
    borderActive: 'border-purple-300',
    borderMockup: 'border-gray-200',
    // Text
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textSubtle: 'text-gray-500',
    textTiny: 'text-gray-400',
    // Shadows
    shadow: 'shadow-xl shadow-gray-200/50',
    // Tooltip
    tooltipBg: 'bg-white',
    tooltipBorder: 'border-gray-200',
    tooltipText: 'text-gray-900',
    tooltipMuted: 'text-gray-500',
    // Dividers
    divider: 'border-gray-200',
  },
};

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Get current theme
  const th = isDark ? theme.dark : theme.light;

  // Theme-aware class helper (for inline usage)
  const t = (dark: string, light: string) => isDark ? dark : light;

  // Custom themed tooltip component
  const ThemedTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className={`px-3 py-2 rounded-lg border shadow-xl ${th.tooltipBg} ${th.tooltipBorder}`}>
        {label && <p className={`text-[10px] mb-1 ${th.tooltipMuted}`}>{label}</p>}
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className={`text-xs font-medium ${th.tooltipText}`}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states for scroll-triggered elements
      gsap.set('.stat-item, .feature-card, .pricing-card, .testimonial-card, .how-step, .comparison-row, .faq-item', {
        opacity: 0,
        y: 30,
      });

      // Set initial states for mockup sections
      gsap.set('.mockup-attendance, .mockup-mobile, .mockup-analytics', {
        opacity: 0,
        y: 60,
        scale: 0.95,
      });
      gsap.set('.mockup-student-row, .mockup-stat, .mockup-notif', {
        opacity: 0,
        x: -30,
      });
      gsap.set('.mockup-float-1, .mockup-float-2, .mockup-float-3, .mockup-float-4, .mockup-float-5, .mockup-float-6', {
        opacity: 0,
        scale: 0.8,
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

      // ========== MOCKUP SECTION ANIMATIONS ==========

      // Attendance Mockup - main card slides up
      ScrollTrigger.create({
        trigger: '.mockup-attendance-wrapper',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to('.mockup-attendance', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
          });
          // Stagger student rows
          gsap.to('.mockup-student-row', {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.4,
            ease: 'power3.out',
          });
          // Float in the stat cards
          gsap.to('.mockup-float-1, .mockup-float-2', {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            delay: 0.8,
            ease: 'back.out(1.7)',
          });
        },
      });

      // Mobile App Mockup - phone slides up with bounce
      ScrollTrigger.create({
        trigger: '.mockup-mobile-wrapper',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to('.mockup-mobile', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
          });
          // Stagger notifications
          gsap.to('.mockup-notif', {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.12,
            delay: 0.6,
            ease: 'power3.out',
          });
          // Float in badges
          gsap.to('.mockup-float-3, .mockup-float-4', {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.2,
            delay: 1,
            ease: 'back.out(1.7)',
          });
        },
      });

      // Analytics Mockup - dashboard with staggered stats
      ScrollTrigger.create({
        trigger: '.mockup-analytics-wrapper',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to('.mockup-analytics', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
          });
          // Stagger stat cards
          gsap.to('.mockup-stat', {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.4,
            ease: 'power3.out',
          });
          // Float in insights
          gsap.to('.mockup-float-5, .mockup-float-6', {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.2,
            delay: 0.9,
            ease: 'back.out(1.7)',
          });
        },
      });

      // Continuous floating animation for mockup floaters
      gsap.to('.mockup-float-1, .mockup-float-3, .mockup-float-5', {
        y: -12,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1.5,
      });
      gsap.to('.mockup-float-2, .mockup-float-4, .mockup-float-6', {
        y: 12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1.5,
      });

      // ========== END MOCKUP ANIMATIONS ==========

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

      // Safety: ensure all elements are visible after 4 seconds regardless of scroll
      setTimeout(() => {
        gsap.to('.stat-item, .feature-card, .pricing-card, .testimonial-card, .how-step, .comparison-row, .faq-item, .mockup-attendance, .mockup-mobile, .mockup-analytics, .mockup-student-row, .mockup-stat, .mockup-notif, .mockup-float-1, .mockup-float-2, .mockup-float-3, .mockup-float-4, .mockup-float-5, .mockup-float-6', {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }, 4000);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={`min-h-screen overflow-hidden transition-all duration-500 ${th.pageBg} ${th.text}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
        t('bg-[#0a0a0f]/90 border-white/[0.06]', 'bg-white/90 border-gray-200/80')
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold">Masst Campus</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>Features</a>
            <a href="#pricing" className={`text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>Pricing</a>
            <a href="#testimonials" className={`text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>Testimonials</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                t('bg-white/10 hover:bg-white/20 border border-white/10',
                  'bg-gray-100 hover:bg-gray-200 border border-gray-200')
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
            </button>
            <Link href="/login" className={`hidden sm:block text-sm transition-colors ${t('text-slate-400 hover:text-white', 'text-gray-600 hover:text-gray-900')}`}>
              Sign In
            </Link>
            <Link
              href="/login"
              className="hidden sm:block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity text-white"
            >
              Get Started
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all ${
                t('bg-white/10 hover:bg-white/20', 'bg-gray-100 hover:bg-gray-200')
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-80' : 'max-h-0'
        }`}>
          <div className={`px-4 py-4 space-y-3 border-t ${t('border-white/10', 'border-gray-200')}`}>
            <a
              href="#features"
              onClick={closeMobileMenu}
              className={`block py-2 text-sm font-medium ${t('text-slate-300 hover:text-white', 'text-gray-700 hover:text-gray-900')}`}
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={closeMobileMenu}
              className={`block py-2 text-sm font-medium ${t('text-slate-300 hover:text-white', 'text-gray-700 hover:text-gray-900')}`}
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={closeMobileMenu}
              className={`block py-2 text-sm font-medium ${t('text-slate-300 hover:text-white', 'text-gray-700 hover:text-gray-900')}`}
            >
              Testimonials
            </a>
            <div className="pt-3 flex flex-col gap-2 border-t ${t('border-white/10', 'border-gray-200')}">
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className={`py-2 text-sm font-medium ${t('text-slate-300 hover:text-white', 'text-gray-700 hover:text-gray-900')}`}
              >
                Sign In
              </Link>
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className={`relative min-h-screen flex items-center pt-16 sm:pt-20 ${th.sectionBg}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 rounded-full blur-3xl float-1 ${t('bg-blue-500/20', 'bg-blue-400/15')}`} />
          <div className={`absolute bottom-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 rounded-full blur-3xl float-2 ${t('bg-purple-500/20', 'bg-purple-400/15')}`} />
          <div className={`absolute top-1/2 left-1/2 w-36 sm:w-48 h-36 sm:h-48 rounded-full blur-3xl float-3 ${t('bg-cyan-500/15', 'bg-cyan-400/10')}`} />
        </div>

        <div className={`absolute inset-0 bg-[size:40px_40px] sm:bg-[size:50px_50px] ${
          t('bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]',
            'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]')
        }`} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border mb-5 text-xs ${
              t('bg-white/[0.04] border-white/[0.08]', 'bg-blue-50/80 border-blue-200/60')
            }`}>
              <Sparkles className="w-3 h-3 text-yellow-500" />
              <span className={th.textMuted}>Trusted by 100+ Schools</span>
            </div>

            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3">
              School Management
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className={`hero-subtitle text-sm sm:text-base mb-5 max-w-md mx-auto lg:mx-0 ${th.textMuted}`}>
              The all-in-one platform for attendance, fees, communication, and analytics.
              Built for Indian schools, priced for everyone.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-2.5 justify-center lg:justify-start">
              <Link
                href="/login"
                className="group px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 text-white"
              >
                Start Free Trial
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all border text-center ${
                  t('bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]',
                    'bg-white border-gray-200 hover:bg-gray-50')
                }`}
              >
                See Features
              </a>
            </div>

            <div className="mt-6 flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[
                  { initials: 'RK', gradient: 'from-blue-500 to-cyan-500' },
                  { initials: 'PS', gradient: 'from-purple-500 to-pink-500' },
                  { initials: 'AP', gradient: 'from-orange-500 to-red-500' },
                  { initials: 'SK', gradient: 'from-green-500 to-emerald-500' },
                ].map((user, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${user.gradient} border-2 flex items-center justify-center text-[9px] font-semibold text-white ${
                      t('border-[#0a0a0f]', 'border-white')
                    }`}
                  >
                    {user.initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className={`text-[11px] ${th.textSubtle}`}>Loved by educators</p>
              </div>
            </div>
          </div>

          <div className="hero-image relative hidden lg:block">
            <div className={`relative rounded-xl ${th.shadow} overflow-hidden ${
              t('bg-[#0d0d14]/90 backdrop-blur-sm border border-white/[0.06]',
                'bg-white border border-gray-200/80')
            }`}>
              <div className={`px-3 py-2.5 border-b flex items-center gap-2 ${t('border-white/[0.06] bg-white/[0.02]', 'border-gray-100 bg-gray-50/50')}`}>
                <div className="w-2 h-2 rounded-full bg-red-500/80" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <div className="w-2 h-2 rounded-full bg-green-500/80" />
                <span className={`ml-2 text-[10px] font-medium ${t('text-white/40', 'text-gray-400')}`}>Dashboard</span>
              </div>
              <div className="p-3">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Students', value: '1,234', color: 'from-blue-400 to-cyan-400', trend: '+12%' },
                    { label: 'Teachers', value: '48', color: 'from-purple-400 to-pink-400', trend: '+3%' },
                    { label: 'Collection', value: '₹12.4L', color: 'from-green-400 to-emerald-400', trend: '+18%' },
                  ].map((stat, i) => (
                    <div key={i} className={`dashboard-stat p-2.5 rounded-lg ${th.bgCard}`}>
                      <p className={`text-[10px] mb-0.5 ${th.textSubtle}`}>{stat.label}</p>
                      <p className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />{stat.trend}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Attendance Chart */}
                  <div className={`dashboard-chart p-2.5 rounded-lg ${th.bgCard}`}>
                    <p className={`text-[10px] font-medium mb-1.5 ${th.textMuted}`}>Attendance Trend</p>
                    <ChartContainer config={chartConfig} className="h-[80px] w-full [&>div]:!h-full">
                      <AreaChart data={attendanceData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <defs>
                          <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="attendance"
                          stroke="#3b82f6"
                          strokeWidth={1.5}
                          fill="url(#attendanceGradient)"
                        />
                        <ChartTooltip content={<ThemedTooltip />} />
                      </AreaChart>
                    </ChartContainer>
                  </div>

                  {/* Fee Collection Chart */}
                  <div className={`dashboard-chart p-2.5 rounded-lg ${th.bgCard}`}>
                    <p className={`text-[10px] font-medium mb-1.5 ${th.textMuted}`}>Fee Collection</p>
                    <ChartContainer config={chartConfig} className="h-[80px] w-full [&>div]:!h-full">
                      <BarChart data={feeCollectionData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <Bar dataKey="collected" fill="#22c55e" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="pending" fill="#f97316" radius={[2, 2, 0, 0]} />
                        <ChartTooltip content={<ThemedTooltip />} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>

                {/* Student Distribution */}
                <div className={`p-2.5 rounded-lg ${th.bgCard}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-[10px] font-medium mb-1 ${th.textMuted}`}>Distribution</p>
                      <div className="flex gap-2 mt-1">
                        {studentDistribution.map((item, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className={`text-[9px] ${th.textSubtle}`}>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ChartContainer config={chartConfig} className="h-[50px] w-[50px] [&>div]:!h-full">
                      <RechartsPieChart>
                        <Pie
                          data={studentDistribution}
                          dataKey="value"
                          innerRadius={14}
                          outerRadius={22}
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

            <div className={`float-card absolute -left-6 top-1/4 p-3 rounded-xl shadow-xl float-1 ${th.bgFloat} border ${th.border}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t('bg-green-500/20', 'bg-green-100')}`}>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${th.text}`}>Attendance Marked</p>
                  <p className={`text-[10px] ${th.textSubtle}`}>Class 10-A • Just now</p>
                </div>
              </div>
            </div>

            <div className={`float-card absolute -right-4 bottom-1/4 p-3 rounded-xl shadow-xl float-2 ${th.bgFloat} border ${th.border}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t('bg-blue-500/20', 'bg-blue-100')}`}>
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${th.text}`}>₹25,000 Received</p>
                  <p className={`text-[10px] ${th.textSubtle}`}>Fee Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce ${t('text-slate-500', 'text-gray-400')}`}>
          <span className="text-xs">Scroll to explore</span>
          <ChevronRight className="w-5 h-5 rotate-90" />
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className={`py-8 sm:py-12 border-y ${th.sectionAlt} ${t('border-white/[0.06]', 'border-gray-200/80')}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item text-center">
                <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                  t('bg-gradient-to-br from-blue-500/15 to-purple-500/15', 'bg-gradient-to-br from-blue-100 to-purple-100')
                }`}>
                  <stat.icon className={`w-5 h-5 ${t('text-blue-400', 'text-blue-600')}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-0.5">
                  {stat.value}
                </div>
                <p className={`text-xs ${th.textSubtle}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className={`py-14 sm:py-20 ${th.sectionBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border mb-4 text-xs ${
              t('bg-white/[0.04] border-white/[0.08]', 'bg-yellow-50/80 border-yellow-200/60')
            }`}>
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className={th.textMuted}>Powerful Features</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
              Everything You Need to
              <span className="block mt-1 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Run Your School
              </span>
            </h2>
            <p className={`text-sm ${th.textMuted}`}>
              From attendance to analytics, we've got every aspect of school management covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`feature-card group p-4 sm:p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  t('bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]',
                    'bg-white border-gray-200/80 hover:border-gray-300 shadow-sm')
                }`}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className={`text-xs leading-relaxed ${th.textMuted}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attendance Mockup Section */}
      <section className={`py-14 sm:py-20 overflow-hidden ${th.sectionAlt}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="mockup-attendance-wrapper relative max-w-lg mx-auto lg:mx-0">
                {/* Main Attendance Card */}
                <div className={`mockup-attendance relative rounded-xl ${th.shadow} overflow-hidden ${
                  t('bg-[#0d0d14]/90 backdrop-blur-sm border border-white/[0.06]', 'bg-white border border-gray-200/80')
                }`}>
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${t('border-white/[0.06] bg-white/[0.02]', 'border-gray-100 bg-gray-50/50')}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <ClipboardCheck className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${th.text}`}>Class 10-A Attendance</p>
                        <p className={`text-[11px] ${th.textSubtle}`}>Today, January 29, 2026</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-medium">
                      92% Present
                    </div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {[
                      { name: 'Rahul Sharma', roll: '01', status: 'present', avatar: 'RS' },
                      { name: 'Priya Patel', roll: '02', status: 'present', avatar: 'PP' },
                      { name: 'Amit Kumar', roll: '03', status: 'absent', avatar: 'AK' },
                      { name: 'Sneha Gupta', roll: '04', status: 'present', avatar: 'SG' },
                      { name: 'Vikram Singh', roll: '05', status: 'present', avatar: 'VS' },
                      { name: 'Neha Verma', roll: '06', status: 'present', avatar: 'NV' },
                    ].map((student, i) => (
                      <div key={i} className={`mockup-student-row flex items-center justify-between p-3 rounded-lg ${
                        t('bg-white/[0.03] hover:bg-white/[0.05]', 'bg-gray-50 hover:bg-gray-100')
                      } transition-colors`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white ${
                            student.status === 'present' ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-red-500 to-orange-500'
                          }`}>
                            {student.avatar}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${th.text}`}>{student.name}</p>
                            <p className={`text-[11px] ${th.textTiny}`}>Roll #{student.roll}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          student.status === 'present' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                        }`}>
                          {student.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating Quick Stats */}
                <div className={`mockup-float-1 absolute -right-4 top-8 p-2.5 rounded-xl shadow-xl ${th.bgFloat} border ${th.border}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">46</p>
                      <p className={`text-[9px] ${th.textSubtle}`}>Present</p>
                    </div>
                  </div>
                </div>
                <div className={`mockup-float-2 absolute -left-4 bottom-12 p-2.5 rounded-xl shadow-xl ${th.bgFloat} border ${th.border}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-400">4</p>
                      <p className={`text-[9px] ${th.textSubtle}`}>Absent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-xs ${
                t('bg-blue-500/10 border border-blue-500/20', 'bg-blue-50/80 border border-blue-100')
              }`}>
                <ClipboardCheck className="w-3 h-3 text-blue-400" />
                <span className={th.textMuted}>Smart Attendance</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Mark Attendance in
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Seconds</span>
              </h2>
              <p className={`text-sm mb-5 max-w-md mx-auto lg:mx-0 ${th.textMuted}`}>
                One-tap attendance marking with instant parent notifications. Track trends and never miss a pattern.
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {['One-tap marking', 'SMS alerts', 'Daily reports', 'Trend analysis'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${th.bgCard} ${th.textMuted}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Mockup Section */}
      <section className={`py-14 sm:py-20 overflow-hidden ${th.sectionBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="text-center lg:text-left">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-xs ${
                t('bg-purple-500/10 border border-purple-500/20', 'bg-purple-50/80 border border-purple-100')
              }`}>
                <Smartphone className="w-3 h-3 text-purple-400" />
                <span className={th.textMuted}>Parent App</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Parents Stay
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Connected</span>
              </h2>
              <p className={`text-sm mb-5 max-w-md mx-auto lg:mx-0 ${th.textMuted}`}>
                Real-time updates on attendance, fees, and announcements. Parents never miss important school information.
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {['Push notifications', 'Fee payments', 'Direct chat', 'Report cards'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${th.bgCard} border ${th.border} ${th.textMuted}`}>
                    <CheckCircle2 className="w-3 h-3 text-purple-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="mockup-mobile-wrapper relative">
                {/* Phone Frame */}
                <div className={`mockup-mobile relative w-[280px] sm:w-[320px] rounded-[40px] p-2 ${th.shadow} ${
                  t('bg-gradient-to-b from-white/[0.08] to-white/[0.03]', 'bg-gray-200')
                }`}>
                  <div className={`rounded-[36px] overflow-hidden ${t('bg-[#0a0a0f]', 'bg-white')}`}>
                    {/* Dynamic Island */}
                    <div className="flex justify-center pt-3">
                      <div className={`w-24 h-6 rounded-full ${t('bg-black', 'bg-gray-900')}`} />
                    </div>
                    {/* Screen Content */}
                    <div className="px-5 pb-5 pt-3 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-lg font-semibold ${th.text}`}>Hi, Mrs. Sharma</p>
                          <p className={`text-xs ${th.textSubtle}`}>Rahul's Parent</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                          RS
                        </div>
                      </div>
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className={`p-3 rounded-xl ${th.bgCard} border ${th.border}`}>
                          <p className={`text-xs ${th.textSubtle}`}>Attendance</p>
                          <p className="text-xl font-bold text-emerald-400">94%</p>
                        </div>
                        <div className={`p-3 rounded-xl ${th.bgCard} border ${th.border}`}>
                          <p className={`text-xs ${th.textSubtle}`}>Fee Status</p>
                          <p className="text-xl font-bold text-blue-400">Paid</p>
                        </div>
                      </div>
                      {/* Notifications */}
                      <div className="space-y-2">
                        <p className={`text-xs font-medium ${th.textMuted}`}>Today's Updates</p>
                        {[
                          { icon: CheckCircle2, text: 'Rahul marked present', time: '8:30 AM', color: 'text-emerald-400' },
                          { icon: MessageSquare, text: 'PTM scheduled for Feb 5', time: '10:15 AM', color: 'text-blue-400' },
                          { icon: Bell, text: 'Holiday: Republic Day', time: '9:00 AM', color: 'text-orange-400' },
                        ].map((notif, i) => (
                          <div key={i} className={`mockup-notif flex items-center gap-3 p-3 rounded-xl ${th.bgCard} border ${th.border} transition-colors`}>
                            <notif.icon className={`w-4 h-4 ${notif.color}`} />
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${th.text}`}>{notif.text}</p>
                              <p className={`text-[11px] ${th.textTiny}`}>{notif.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className={`mockup-float-3 absolute -left-8 top-20 p-3 rounded-xl ${th.shadow} ${th.bgFloat} border ${th.border}`}>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <span className={`text-xs font-medium ${th.text}`}>New message!</span>
                  </div>
                </div>
                <div className={`mockup-float-4 absolute -right-4 bottom-32 p-2 rounded-full ${th.shadow} ${
                  t('bg-emerald-500/20 border border-emerald-500/30', 'bg-emerald-100 border border-emerald-200')
                }`}>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Mockup Section */}
      <section className={`py-14 sm:py-20 overflow-hidden ${th.sectionAlt}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-xs ${
              t('bg-cyan-500/10 border border-cyan-500/20', 'bg-cyan-50/80 border border-cyan-100')
            }`}>
              <BarChart3 className="w-3 h-3 text-cyan-400" />
              <span className={th.textMuted}>Powerful Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Data-Driven
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Decisions</span>
            </h2>
            <p className={`text-sm ${th.textMuted}`}>
              Beautiful dashboards with actionable insights. Understand your school's performance at a glance.
            </p>
          </div>

          <div className="mockup-analytics-wrapper relative max-w-4xl mx-auto">
            {/* Main Analytics Dashboard */}
            <div className={`mockup-analytics rounded-xl ${th.shadow} overflow-hidden ${
              t('bg-[#0d0d14]/90 backdrop-blur-sm border border-white/[0.06]', 'bg-white border border-gray-200/80')
            }`}>
              <div className={`px-4 py-3 border-b flex items-center justify-between ${t('border-white/[0.06] bg-white/[0.02]', 'border-gray-100 bg-gray-50/50')}`}>
                <div className="flex items-center gap-2">
                  <BarChart3 className={`w-4 h-4 ${t('text-cyan-400', 'text-cyan-500')}`} />
                  <p className={`text-sm font-medium ${th.text}`}>Analytics Overview</p>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${th.bgCard} ${th.textSubtle}`}>
                  This Month
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Total Students', value: '1,234', change: '+12%', color: 'text-blue-400' },
                    { label: 'Avg Attendance', value: '94.2%', change: '+2.3%', color: 'text-emerald-400' },
                    { label: 'Fee Collection', value: '₹45.2L', change: '+18%', color: 'text-purple-400' },
                    { label: 'Active Teachers', value: '48', change: '+3', color: 'text-orange-400' },
                  ].map((stat, i) => (
                    <div key={i} className={`mockup-stat p-3.5 rounded-xl ${th.bgCard} border ${th.border}`}>
                      <p className={`text-xs mb-1 ${th.textSubtle}`}>{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-emerald-400 font-medium">{stat.change}</p>
                    </div>
                  ))}
                </div>
                {/* Chart Area */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`md:col-span-2 p-4 rounded-xl ${th.bgCard} border ${th.border}`}>
                    <p className={`text-sm font-medium mb-3 ${th.textMuted}`}>Monthly Attendance Trends</p>
                    <ChartContainer config={chartConfig} className="h-[160px] w-full [&>div]:!h-full">
                      <AreaChart data={attendanceData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <defs>
                          <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="attendance"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          fill="url(#analyticsGradient)"
                        />
                        <ChartTooltip content={<ThemedTooltip />} />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                  <div className={`p-4 rounded-xl ${th.bgCard} border ${th.border}`}>
                    <p className={`text-sm font-medium mb-3 ${th.textMuted}`}>Class Distribution</p>
                    <ChartContainer config={chartConfig} className="h-[160px] w-full [&>div]:!h-full">
                      <RechartsPieChart>
                        <Pie
                          data={studentDistribution}
                          dataKey="value"
                          innerRadius={35}
                          outerRadius={60}
                          paddingAngle={2}
                        >
                          {studentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ThemedTooltip />} />
                      </RechartsPieChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Insights */}
            <div className={`mockup-float-5 absolute -left-3 sm:-left-6 top-1/4 p-2.5 rounded-xl shadow-xl hidden sm:block ${th.bgFloat} border ${th.border}`}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className={`text-[10px] font-medium ${th.text}`}>+15% Growth</p>
                  <p className={`text-[9px] ${th.textSubtle}`}>vs last month</p>
                </div>
              </div>
            </div>
            <div className={`mockup-float-6 absolute -right-3 sm:-right-6 bottom-1/4 p-2.5 rounded-xl shadow-xl hidden sm:block ${th.bgFloat} border ${th.border}`}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <div>
                  <p className={`text-[10px] font-medium ${th.text}`}>98% Target</p>
                  <p className={`text-[9px] ${th.textSubtle}`}>Fee collection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className={`py-14 sm:py-20 ${th.sectionBg}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border mb-4 text-xs ${
              t('bg-white/[0.04] border-white/[0.08]', 'bg-blue-50/80 border-blue-200/60')
            }`}>
              <PlayCircle className="w-3 h-3 text-blue-500" />
              <span className={th.textMuted}>Simple Setup</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Get Started in
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"> 4 Easy Steps</span>
            </h2>
            <p className={`text-sm ${th.textMuted}`}>
              From signup to managing your school - it takes less than a day.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {howItWorks.map((step, i) => (
              <div key={i} className="how-step relative group">
                <div className={`p-4 rounded-xl border h-full transition-all duration-300 group-hover:-translate-y-0.5 flex flex-col ${
                  t('bg-white/[0.02] border-white/[0.06] group-hover:border-white/[0.12]',
                    'bg-white border-gray-200/80 group-hover:border-gray-300')
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-2xl font-bold leading-none ${t('text-white/[0.06]', 'text-gray-200')}`}>
                      {step.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <step.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                  <p className={`text-xs leading-relaxed ${th.textMuted}`}>{step.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className={`hidden lg:block absolute top-1/2 -right-2 ${th.textTiny}`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className={`py-6 sm:py-8 border-y ${th.sectionAlt} ${t('border-white/[0.06]', 'border-gray-200/80')}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {trustFeatures.map((feature, i) => (
              <div key={i} className={`flex items-center gap-2.5 p-3 rounded-lg transition-all ${
                t('bg-white/[0.02] hover:bg-white/[0.04]', 'bg-white hover:bg-gray-50')
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  t('bg-emerald-500/15', 'bg-emerald-100')
                }`}>
                  <feature.icon className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs">{feature.label}</p>
                  <p className={`text-[11px] truncate ${th.textSubtle}`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section ref={comparisonRef} className={`py-14 sm:py-20 ${th.sectionAlt}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Why Schools Choose
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> Us</span>
            </h2>
            <p className={`text-xs sm:text-sm ${th.textMuted}`}>
              See how we compare to traditional software.
            </p>
          </div>

          <div className={`rounded-xl border overflow-hidden overflow-x-auto ${th.shadow} ${
            t('bg-white/[0.02] border-white/[0.06]', 'bg-white border-gray-200/80')
          }`}>
            <div className={`grid grid-cols-3 p-3 sm:p-4 border-b text-xs font-semibold min-w-[320px] ${
              t('bg-white/[0.03] border-white/[0.06]', 'bg-gray-50/80 border-gray-200/80')
            }`}>
              <div className={th.textSubtle}>Feature</div>
              <div className="text-center text-blue-500">Masst Campus</div>
              <div className={`text-center ${th.textSubtle}`}>Others</div>
            </div>
            {comparisonFeatures.map((item, i) => (
              <div key={i} className={`comparison-row grid grid-cols-3 p-2.5 sm:p-3 border-b last:border-0 text-xs min-w-[320px] ${
                t('border-white/[0.04] hover:bg-white/[0.02]', 'border-gray-100 hover:bg-gray-50/50')
              } transition-colors`}>
                <div className={`pr-2 ${th.textMuted}`}>{item.feature}</div>
                <div className="text-center">
                  {typeof item.us === 'boolean' ? (
                    item.us ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />
                  ) : (
                    <span className="text-emerald-500 font-semibold text-[10px]">{item.us}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof item.others === 'boolean' ? (
                    item.others ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-red-400/60 mx-auto" />
                  ) : (
                    <span className={`text-[10px] ${th.textSubtle}`}>{item.others}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className={`py-14 sm:py-20 ${th.sectionBg}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 ${
              t('bg-white/[0.03] border-white/[0.08]', 'bg-green-50 border-green-200/80')
            }`}>
              <CreditCard className="w-3.5 h-3.5 text-green-500" />
              <span className={`text-xs font-medium ${t('text-white/70', 'text-green-700')}`}>Simple Pricing</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              70% Cheaper Than
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"> Competitors</span>
            </h2>
            <p className={`text-xs sm:text-sm ${th.textMuted}`}>
              World-class features at prices that make sense for Indian schools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                className={`pricing-card relative p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  tier.popular
                    ? `${t('bg-gradient-to-br from-blue-500/15 to-purple-500/15 border-blue-500/30', 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/80')} ${th.shadow}`
                    : t('bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]', 'bg-white border-gray-200/80 shadow-sm hover:shadow-md')
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-[10px] font-semibold text-white shadow-md whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <h3 className="text-sm font-semibold mb-1">{tier.name}</h3>
                <p className={`text-[10px] mb-3 ${th.textSubtle}`}>{tier.description}</p>
                <div className="mb-4">
                  <span className="text-xl font-bold">{tier.price}</span>
                  <span className={`text-[10px] ${th.textSubtle}`}>{tier.period}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className={th.textMuted}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-md hover:shadow-purple-500/20 text-white'
                    : t('bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06]', 'bg-gray-100 hover:bg-gray-200 border border-gray-200/80')
                }`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} id="testimonials" className={`py-14 sm:py-20 ${th.sectionAlt}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 ${
              t('bg-white/[0.03] border-white/[0.08]', 'bg-amber-50 border-amber-200/80')
            }`}>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className={`text-xs font-medium ${t('text-white/70', 'text-amber-700')}`}>Testimonials</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Loved by Educators
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> Across India</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`testimonial-card p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  t('bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]',
                    'bg-white border-gray-200/80 shadow-sm hover:shadow-md')
                }`}
              >
                <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className={`text-xs mb-4 leading-relaxed ${th.textMuted}`}>"{testimonial.quote}"</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-[10px] font-bold text-white shadow-md`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{testimonial.author}</p>
                    <p className={`text-[10px] ${th.textSubtle}`}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className={`py-14 sm:py-20 ${th.sectionBg}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 ${
              t('bg-white/[0.03] border-white/[0.08]', 'bg-purple-50 border-purple-200/80')
            }`}>
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              <span className={`text-xs font-medium ${t('text-white/70', 'text-purple-700')}`}>FAQ</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Frequently Asked
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"> Questions</span>
            </h2>
            <p className={`text-xs sm:text-sm ${th.textMuted}`}>
              Everything you need to know about Masst Campus.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item rounded-xl border overflow-hidden transition-all duration-300 ${
                  openFaq === i
                    ? t('bg-white/[0.03] border-purple-500/25', 'bg-white border-purple-200/80 shadow-sm')
                    : t('bg-white/[0.02] border-white/[0.05] hover:border-white/[0.08]', 'bg-white border-gray-200/80 hover:border-gray-300/80')
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className={`font-medium pr-3 text-xs sm:text-sm ${
                    openFaq === i ? t('text-white', 'text-purple-700') : th.textMuted
                  }`}>{faq.question}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openFaq === i
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 rotate-180'
                      : t('bg-white/[0.05] hover:bg-white/[0.08]', 'bg-gray-100 hover:bg-gray-200')
                  }`}>
                    <ChevronDown className={`w-3.5 h-3.5 transition-colors ${
                      openFaq === i ? 'text-white' : th.textSubtle
                    }`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  openFaq === i ? 'max-h-64' : 'max-h-0'
                }`}>
                  <p className={`px-4 pb-4 text-xs leading-relaxed ${th.textMuted}`}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className={`py-14 sm:py-20 ${th.sectionAlt}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className={`cta-content relative p-6 sm:p-8 md:p-10 rounded-xl border text-center overflow-hidden ${
            t('bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-pink-500/15 border-white/[0.1]',
              'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 border-transparent') + ' ' + th.shadow
          }`}>
            <div className={`absolute inset-0 ${t('bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-2xl', 'bg-black/10')}`} />
            <div className={`absolute inset-0 ${t('', 'bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]')}`} />

            <div className="relative">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 ${
                t('bg-white/[0.08] border border-white/[0.1]', 'bg-white/20 backdrop-blur-sm')
              }`}>
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className={`text-[10px] font-medium ${t('text-white/80', 'text-white')}`}>Limited Time Offer</span>
              </div>
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 ${t('', 'text-white')}`}>
                Ready to Transform Your School?
              </h2>
              <p className={`text-xs sm:text-sm mb-5 max-w-md mx-auto ${t('text-white/70', 'text-white/90')}`}>
                Join hundreds of schools already using Masst Campus. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2.5">
                <Link
                  href="/login"
                  className={`group px-5 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                    t('bg-white text-slate-900 hover:bg-slate-100 shadow-md',
                      'bg-white text-purple-600 hover:bg-gray-100 shadow-md hover:shadow-lg')
                  }`}
                >
                  Start Free Trial
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#"
                  className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-all border text-center ${
                    t('bg-white/[0.05] border-white/[0.15] hover:bg-white/[0.1]',
                      'bg-transparent border-white/40 text-white hover:bg-white/10 hover:border-white/60')
                  }`}
                >
                  Schedule Demo
                </a>
              </div>
              <p className={`mt-4 text-[10px] ${t('text-white/50', 'text-white/70')}`}>
                No credit card required • Free 14-day trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-10 sm:py-12 border-t ${t('border-white/[0.06]', 'border-gray-200/80')} ${th.sectionBg}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 mb-8">
            <div className="col-span-2 sm:col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold">Masst Campus</span>
              </div>
              <p className={`text-xs leading-relaxed mb-4 max-w-xs ${th.textSubtle}`}>
                Modern school management for the digital age. Built in India, for India.
              </p>
              <div className="flex items-center gap-2">
                {['twitter', 'linkedin', 'facebook', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                      t('bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70', 'bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600')
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-medium text-xs mb-3">{col.title}</h4>
                <ul className={`space-y-2 text-xs ${th.textSubtle}`}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className={`transition-colors hover:underline underline-offset-4 ${t('hover:text-white/70', 'hover:text-gray-700')}`}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${t('border-white/[0.06]', 'border-gray-200/80')}`}>
            <p className={`text-[10px] text-center sm:text-left ${th.textTiny}`}>
              © 2026 Masst Campus (hey.school). All rights reserved.
            </p>
            <div className={`flex items-center gap-1.5 ${th.textTiny}`}>
              <Globe className="w-3 h-3" />
              <span className="text-[10px]">Available in 35+ countries</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
