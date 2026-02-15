import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Shield, Lock, User, Eye, EyeOff,
    ArrowRight, AlertCircle,
    Clock, Users, TrendingUp,
    Sparkles, Zap, Heart, Star,
    CreditCard, Briefcase, Target, CheckCircle,
    Menu, X, UserPlus, Phone,
    LogIn,
    Mail, CircleDollarSign, ChevronRight
} from 'lucide-react';
import { useAuth } from '@lib/hooks/use-auth';

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

type ScreenSize = 'phone' | 'tablet' | 'laptop' | 'desktop' | 'ultrawide';

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();
    const loginFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;

            if (width < 480) setScreenSize('phone');
            else if (width >= 480 && width < 768) setScreenSize('tablet');
            else if (width >= 768 && width < 1024) setScreenSize('laptop');
            else if (width >= 1024 && width < 1920) setScreenSize('desktop');
            else setScreenSize('ultrawide');
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const getResponsiveValue = <T,>(
        phone: T,
        tablet: T,
        laptop: T,
        desktop: T,
        ultrawide: T
    ): T => {
        switch (screenSize) {
            case 'phone': return phone;
            case 'tablet': return tablet;
            case 'laptop': return laptop;
            case 'desktop': return desktop;
            case 'ultrawide': return ultrawide;
            default: return desktop;
        }
    };

    const handleInputChange = (field: keyof LoginFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            setErrors({});

            try {
                await login(formData.email, formData.password);
            } catch (error: any) {
                setErrors({
                    form: error.message || 'Login failed. Please check your credentials.'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleApplyNow = () => {
        navigate('/borrower/apply');
    };

    const scrollToLoginForm = () => {
        if (loginFormRef.current) {
            loginFormRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        setShowMobileMenu(false);
    };

    const features = [
        { icon: <Zap size={24} />, text: 'Instant Approvals', color: '#06b6d4' },
        { icon: <Shield size={24} />, text: 'Bank-Level Security', color: '#8b5cf6' },
        { icon: <Clock size={24} />, text: '24/7 Support', color: '#f59e0b' },
        { icon: <Users size={24} />, text: 'Dedicated Manager', color: '#ec4899' },
        { icon: <CreditCard size={24} />, text: 'Flexible Payments', color: '#10b981' },
        { icon: <TrendingUp size={24} />, text: 'High Returns', color: '#3b82f6' },
    ];

    const borrowerBenefits = [
        { icon: <CheckCircle size={20} />, text: 'Low APR from 8.5%' },
        { icon: <CheckCircle size={20} />, text: 'No Hidden Fees' },
        { icon: <CheckCircle size={20} />, text: 'Flexible Repayment Terms' },
        { icon: <CheckCircle size={20} />, text: 'Quick Approval in 24h' },
    ];

    const lenderBenefits = [
        { icon: <TrendingUp size={20} />, text: 'Up to 15% ROI' },
        { icon: <Shield size={20} />, text: 'Risk-Diversified Portfolios' },
        { icon: <Target size={20} />, text: 'Auto-Invest Options' },
        { icon: <Briefcase size={20} />, text: 'Portfolio Tracking' },
    ];

    const stats = [
        { value: '10K+', label: 'Active Users', icon: <Users size={20} /> },
        { value: '98%', label: 'Satisfaction', icon: <Heart size={20} /> },
        { value: '24h', label: 'Avg Approval', icon: <Clock size={20} /> },
        { value: '4.9', label: 'App Rating', icon: <Star size={20} /> },
    ];

    const menuItems = [
        {
            text: 'Sign In',
            icon: <User size={20} />,
            onClick: scrollToLoginForm,
            isActive: true
        },
        {
            text: 'Apply for Loan',
            icon: <CreditCard size={20} />,
            onClick: () => {
                handleApplyNow();
                setShowMobileMenu(false);
            }
        },
        {
            text: 'Contact',
            icon: <Phone size={20} />,
            onClick: () => {
                navigate('/contact');
                setShowMobileMenu(false);
            }
        },
    ];

    const flexValue = getResponsiveValue('0 0 auto', '0 0 auto', '1', '1', '1');
    const flexDirection = getResponsiveValue('column', 'column', 'row', 'row', 'row');
    const textAlign = getResponsiveValue('center', 'center', 'left', 'left', 'left');

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
            display: 'flex',
            flexDirection: 'column' as const,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            color: '#e6eef8',
            overflow: 'auto',
            position: 'relative' as const,
        },

        backgroundOrb1: {
            position: 'absolute' as const,
            top: getResponsiveValue('-100px', '-150px', '-200px', '-200px', '-250px'),
            left: getResponsiveValue('-100px', '-150px', '-200px', '-200px', '-250px'),
            width: getResponsiveValue('300px', '400px', '500px', '600px', '800px'),
            height: getResponsiveValue('300px', '400px', '500px', '600px', '800px'),
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: 'float 12s ease-in-out infinite',
        },

        backgroundOrb2: {
            position: 'absolute' as const,
            bottom: getResponsiveValue('-150px', '-200px', '-250px', '-300px', '-400px'),
            right: getResponsiveValue('-100px', '-150px', '-200px', '-200px', '-300px'),
            width: getResponsiveValue('400px', '500px', '600px', '800px', '1200px'),
            height: getResponsiveValue('400px', '500px', '600px', '800px', '1200px'),
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            animation: 'float 15s ease-in-out infinite reverse',
        },

        gridOverlay: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(245, 158, 11, 0.05) 1px, transparent 1px)`,
            backgroundSize: getResponsiveValue('40px 40px', '60px 60px', '80px 80px', '80px 80px', '100px 100px'),
            opacity: 0.3,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        },

        mobileHeader: {
            display: getResponsiveValue('flex', 'none', 'none', 'none', 'none') as 'flex' | 'none',
            justifyContent: 'space-between' as const,
            alignItems: 'center' as const,
            marginBottom: '30px',
            zIndex: 2,
            padding: getResponsiveValue('20px 20px 0', '0', '0', '0', '0'),
        },

        menuButton: {
            background: 'none',
            border: 'none',
            color: '#e6eef8',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        } as React.CSSProperties,

        mobileMenu: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column' as const,
            padding: '20px',
        },

        menuHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
        },

        menuContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '24px',
            overflowY: 'auto' as const,
        },

        menuItem: {
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#e6eef8',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
        } as React.CSSProperties,

        mainContent: {
            flex: 1,
            display: 'flex',
            flexDirection: flexDirection as 'column' | 'row',
            zIndex: 1,
            padding: getResponsiveValue('20px', '30px', '40px', '60px 5%', '80px 10%'),
            gap: getResponsiveValue('40px', '50px', '60px', '80px', '120px'),
            maxWidth: getResponsiveValue('100%', '100%', '100%', '1600px', '2000px'),
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box' as const,
        },

        leftPanel: {
            flex: flexValue,
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: getResponsiveValue('flex-start', 'flex-start', 'center', 'center', 'center'),
            paddingRight: getResponsiveValue('0', '0', '20px', '60px', '100px'),
            marginBottom: getResponsiveValue('40px', '50px', '0', '0', '0'),
        },

        header: {
            marginBottom: getResponsiveValue('30px', '40px', '50px', '60px', '80px'),
        },

        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('12px', '14px', '16px', '16px', '20px'),
            marginBottom: getResponsiveValue('20px', '30px', '40px', '40px', '60px'),
            justifyContent: getResponsiveValue('center', 'center', 'flex-start', 'flex-start', 'flex-start'),
        },

        logoIcon: {
            width: getResponsiveValue('44px', '48px', '52px', '56px', '64px'),
            height: getResponsiveValue('44px', '48px', '52px', '56px', '64px'),
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: getResponsiveValue('12px', '14px', '16px', '16px', '20px'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)',
        },

        logoText: {
            fontSize: getResponsiveValue('24px', '26px', '30px', '32px', '36px'),
            fontWeight: '800',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
        },

        tagline: {
            fontSize: getResponsiveValue('12px', '14px', '16px', '18px', '20px'),
            color: '#94a3b8',
            fontWeight: '600',
            textTransform: 'uppercase' as const,
            letterSpacing: getResponsiveValue('2px', '3px', '4px', '4px', '5px'),
            marginBottom: getResponsiveValue('12px', '14px', '16px', '16px', '20px'),
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('8px', '10px', '12px', '12px', '16px'),
            justifyContent: getResponsiveValue('center', 'center', 'flex-start', 'flex-start', 'flex-start'),
        },

        title: {
            fontSize: getResponsiveValue('32px', '40px', '48px', '56px', '64px'),
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: getResponsiveValue('20px', '24px', '28px', '32px', '40px'),
            background: 'linear-gradient(135deg, #e6eef8 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: textAlign as 'center' | 'left',
        },

        titleHighlight: {
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },

        subtitle: {
            fontSize: getResponsiveValue('14px', '16px', '18px', '20px', '22px'),
            color: '#94a3b8',
            lineHeight: '1.6',
            marginBottom: getResponsiveValue('30px', '35px', '40px', '40px', '50px'),
            maxWidth: '100%',
            textAlign: textAlign as 'center' | 'left',
        },

        platformInfo: {
            display: 'flex',
            flexDirection: getResponsiveValue('column', 'column', 'row', 'row', 'row') as 'column' | 'row',
            gap: getResponsiveValue('20px', '25px', '30px', '40px', '60px'),
            marginBottom: getResponsiveValue('30px', '35px', '40px', '40px', '60px'),
        },

        infoCard: {
            flex: 1,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: getResponsiveValue('16px', '18px', '20px', '20px', '24px'),
            padding: getResponsiveValue('20px', '22px', '24px', '28px', '32px'),
        },

        infoCardTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('8px', '10px', '12px', '12px', '16px'),
            fontSize: getResponsiveValue('16px', '18px', '20px', '20px', '24px'),
            fontWeight: '600',
            color: '#e6eef8',
            marginBottom: getResponsiveValue('16px', '18px', '20px', '20px', '24px'),
        },

        infoCardList: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: getResponsiveValue('8px', '10px', '12px', '12px', '16px'),
        },

        infoCardItem: {
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('8px', '9px', '10px', '10px', '12px'),
            fontSize: getResponsiveValue('12px', '13px', '14px', '14px', '16px'),
            color: '#94a3b8',
        },

        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: getResponsiveValue(
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(3, 1fr)'
            ),
            gap: getResponsiveValue('12px', '14px', '16px', '20px', '24px'),
            marginBottom: getResponsiveValue('40px', '45px', '50px', '60px', '80px'),
        },

        featureCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: getResponsiveValue('14px', '16px', '16px', '16px', '20px'),
            padding: getResponsiveValue('16px', '18px', '20px', '24px', '28px'),
            display: 'flex',
            flexDirection: getResponsiveValue('column', 'column', 'row', 'row', 'row') as 'column' | 'row',
            alignItems: 'center',
            gap: getResponsiveValue('12px', '14px', '16px', '16px', '20px'),
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            textAlign: getResponsiveValue('center', 'center', 'left', 'left', 'left') as 'center' | 'left',
        },

        featureIconWrapper: {
            width: getResponsiveValue('44px', '46px', '48px', '56px', '64px'),
            height: getResponsiveValue('44px', '46px', '48px', '56px', '64px'),
            borderRadius: getResponsiveValue('10px', '12px', '12px', '14px', '16px'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.3s ease',
        },

        featureText: {
            fontSize: getResponsiveValue('12px', '13px', '14px', '16px', '18px'),
            fontWeight: '600',
            color: '#e6eef8',
        },

        statsContainer: {
            display: 'grid',
            gridTemplateColumns: getResponsiveValue(
                'repeat(2, 1fr)',
                'repeat(4, 1fr)',
                'repeat(4, 1fr)',
                'repeat(4, 1fr)',
                'repeat(4, 1fr)'
            ),
            gap: getResponsiveValue('20px', '25px', '30px', '40px', '60px'),
            marginBottom: getResponsiveValue('40px', '45px', '50px', '60px', '80px'),
        },

        statItem: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: getResponsiveValue('4px', '6px', '8px', '8px', '12px'),
            alignItems: 'center',
            textAlign: 'center' as const,
        },

        statValue: {
            fontSize: getResponsiveValue('24px', '28px', '32px', '36px', '42px'),
            fontWeight: '800',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },

        statLabel: {
            fontSize: getResponsiveValue('10px', '11px', '12px', '14px', '16px'),
            color: '#94a3b8',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('4px', '6px', '8px', '8px', '12px'),
        },

        rightPanel: {
            width: getResponsiveValue('100%', '100%', '400px', '460px', '520px'),
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center',
            flexShrink: 0,
        },

        loginCard: {
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: getResponsiveValue('20px', '22px', '24px', '28px', '32px'),
            padding: getResponsiveValue('24px', '28px', '32px', '40px', '48px'),
            boxShadow: '0 40px 80px rgba(2, 6, 23, 0.8)',
            position: 'relative' as const,
            overflow: 'hidden',
        },

        cardGlow: {
            position: 'absolute' as const,
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
        },

        loginHeader: {
            textAlign: 'center' as const,
            marginBottom: getResponsiveValue('30px', '32px', '35px', '40px', '48px'),
        },

        loginTitle: {
            fontSize: getResponsiveValue('24px', '26px', '28px', '32px', '36px'),
            fontWeight: '700',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: getResponsiveValue('8px', '10px', '12px', '12px', '16px'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: getResponsiveValue('12px', '14px', '16px', '16px', '20px'),
        },

        loginSubtitle: {
            fontSize: getResponsiveValue('14px', '15px', '16px', '16px', '18px'),
            color: '#94a3b8',
            lineHeight: '1.5',
        },

        form: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: getResponsiveValue('20px', '22px', '24px', '28px', '32px'),
        },

        formGroup: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: getResponsiveValue('8px', '10px', '12px', '12px', '16px'),
        },

        inputLabel: {
            fontSize: getResponsiveValue('14px', '15px', '16px', '16px', '18px'),
            fontWeight: '600',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('8px', '9px', '10px', '10px', '12px'),
        },

        requiredStar: {
            color: '#ef4444',
        },

        inputWrapper: {
            position: 'relative' as const,
        },

        input: {
            width: '100%',
            padding: getResponsiveValue('16px 20px', '18px 22px', '20px 24px', '20px 24px', '24px 28px'),
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#e6eef8',
            fontSize: getResponsiveValue('14px', '15px', '16px', '16px', '18px'),
            outline: 'none',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box' as const,
        } as React.CSSProperties,

        passwordToggle: {
            position: 'absolute' as const,
            right: getResponsiveValue('16px', '18px', '20px', '20px', '24px'),
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            transition: 'color 0.2s',
        } as React.CSSProperties,

        formOptions: {
            display: 'flex',
            flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row') as 'column' | 'row',
            justifyContent: 'space-between',
            alignItems: getResponsiveValue('stretch', 'center', 'center', 'center', 'center') as 'stretch' | 'center',
            gap: getResponsiveValue('12px', '0', '0', '0', '0'),
            marginTop: getResponsiveValue('0', '8px', '8px', '8px', '12px'),
        },

        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('8px', '10px', '12px', '12px', '16px'),
            cursor: 'pointer',
            order: getResponsiveValue(2, 1, 1, 1, 1),
        },

        checkboxInput: {
            width: '20px',
            height: '20px',
            accentColor: '#f59e0b',
            cursor: 'pointer',
        },

        checkboxLabel: {
            fontSize: getResponsiveValue('13px', '14px', '14px', '14px', '16px'),
            color: '#94a3b8',
            cursor: 'pointer',
        },

        forgotLink: {
            fontSize: getResponsiveValue('13px', '14px', '14px', '14px', '16px'),
            color: '#f59e0b',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.2s',
            textAlign: getResponsiveValue('center', 'right', 'right', 'right', 'right') as 'center' | 'right',
            order: getResponsiveValue(1, 2, 2, 2, 2),
        } as React.CSSProperties,

        loginButton: {
            width: '100%',
            padding: getResponsiveValue('18px', '20px', '22px', '22px', '26px'),
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            border: 'none',
            borderRadius: '12px',
            color: '#020617',
            fontSize: getResponsiveValue('16px', '17px', '18px', '18px', '20px'),
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: getResponsiveValue('10px', '11px', '12px', '12px', '16px'),
            marginTop: getResponsiveValue('20px', '10px', '10px', '10px', '16px'),
            position: 'relative' as const,
            overflow: 'hidden',
        } as React.CSSProperties,

        buttonGlow: {
            position: 'absolute' as const,
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            opacity: 0,
            transition: 'opacity 0.3s',
        },

        applySection: {
            marginTop: getResponsiveValue('24px', '26px', '28px', '30px', '36px'),
            paddingTop: getResponsiveValue('24px', '26px', '28px', '30px', '36px'),
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        },

        applyTitle: {
            fontSize: getResponsiveValue('16px', '17px', '18px', '18px', '20px'),
            fontWeight: '600',
            color: '#e6eef8',
            marginBottom: getResponsiveValue('16px', '18px', '20px', '20px', '24px'),
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('8px', '9px', '10px', '10px', '12px'),
        },

        applyButton: {
            width: '100%',
            padding: getResponsiveValue('16px', '18px', '20px', '20px', '24px'),
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: getResponsiveValue('14px', '15px', '16px', '16px', '18px'),
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: getResponsiveValue('8px', '9px', '10px', '10px', '12px'),
        } as React.CSSProperties,

        errorText: {
            fontSize: getResponsiveValue('12px', '13px', '14px', '14px', '16px'),
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue('6px', '8px', '8px', '8px', '12px'),
        },

        errorForm: {
            fontSize: getResponsiveValue('13px', '14px', '14px', '14px', '16px'),
            color: '#ef4444',
            textAlign: 'center' as const,
            padding: getResponsiveValue('12px', '14px', '16px', '16px', '20px'),
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            marginBottom: '20px',
        },

        footer: {
            marginTop: getResponsiveValue('40px', '45px', '50px', '60px', '80px'),
            textAlign: 'center' as const,
            color: '#64748b',
            fontSize: getResponsiveValue('12px', '13px', '14px', '14px', '16px'),
            padding: getResponsiveValue('20px', '25px', '30px', '30px', '40px'),
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        },
    };

    return (
        <div style={styles.container}>
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

            <div style={styles.backgroundOrb1} />
            <div style={styles.backgroundOrb2} />
            <div style={styles.gridOverlay} />

            <div style={styles.mobileHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.logoIcon}>
                        <CircleDollarSign size={getResponsiveValue(20, 22, 24, 24, 28)} color="white" />
                    </div>
                    <div style={styles.logoText}>MoneyCircle</div>
                </div>
                <button
                    style={styles.menuButton}
                    onClick={() => setShowMobileMenu(true)}
                >
                    <Menu size={24} />
                </button>
            </div>

            {showMobileMenu && (
                <div style={styles.mobileMenu}>
                    <div style={styles.menuHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={styles.logoIcon}>
                                <CircleDollarSign size={24} color="white" />
                            </div>
                            <div style={styles.logoText}>MoneyCircle</div>
                        </div>
                        <button
                            style={styles.menuButton}
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div style={styles.menuContent}>
                        {menuItems.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.menuItem,
                                    background: item.isActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    border: item.isActive ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                                onClick={item.onClick}
                            >
                                {item.icon}
                                {item.text}
                                <ChevronRight size={20} style={{ marginLeft: 'auto' }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={styles.mainContent}>
                <div style={styles.leftPanel}>
                    <div style={styles.header}>
                        <div style={styles.logo}>
                            <div style={styles.logoIcon}>
                                <CircleDollarSign size={getResponsiveValue(24, 26, 28, 28, 32)} color="white" />
                            </div>
                            <div style={styles.logoText}>MoneyCircle</div>
                        </div>

                        <div style={styles.tagline}>
                            <Sparkles size={getResponsiveValue(14, 16, 18, 18, 20)} />
                            PEER TO PEER LENDING PLATFORM
                        </div>

                        <h1 style={styles.title}>
                            Connect. Lend.
                            <br />
                            <span style={styles.titleHighlight}>Grow Together</span>
                        </h1>

                        <p style={styles.subtitle}>
                            MoneyCircle bridges ambitious borrowers with strategic lenders in a secure,
                            AI-powered ecosystem. Experience seamless financial transactions with
                            cutting-edge technology and unparalleled security.
                        </p>
                    </div>

                    <div style={styles.platformInfo}>
                        <div style={styles.infoCard}>
                            <div style={styles.infoCardTitle}>
                                <CreditCard size={20} />
                                For Borrowers
                            </div>
                            <div style={styles.infoCardList}>
                                {borrowerBenefits.map((benefit, index) => (
                                    <div key={index} style={styles.infoCardItem}>
                                        {benefit.icon}
                                        {benefit.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <div style={styles.infoCardTitle}>
                                <TrendingUp size={20} />
                                For Lenders
                            </div>
                            <div style={styles.infoCardList}>
                                {lenderBenefits.map((benefit, index) => (
                                    <div key={index} style={styles.infoCardItem}>
                                        {benefit.icon}
                                        {benefit.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.featureCard,
                                    transform: hoveredCard === index ? 'translateY(-4px)' : 'none',
                                    borderColor: hoveredCard === index ? feature.color + '40' : 'rgba(255, 255, 255, 0.08)',
                                    boxShadow: hoveredCard === index ? `0 8px 32px ${feature.color}20` : 'none',
                                }}
                                onMouseEnter={() => setHoveredCard(index)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div
                                    style={{
                                        ...styles.featureIconWrapper,
                                        background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                                        border: `1px solid ${feature.color}30`,
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <div style={styles.featureText}>{feature.text}</div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.statsContainer}>
                        {stats.map((stat, index) => (
                            <div key={index} style={styles.statItem}>
                                <div style={styles.statValue}>{stat.value}</div>
                                <div style={styles.statLabel}>
                                    {stat.icon}
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.rightPanel} ref={loginFormRef}>
                    <div style={styles.loginCard}>
                        <div style={styles.cardGlow} />

                        <div style={styles.loginHeader}>
                            <h2 style={styles.loginTitle}>
                                <LogIn size={28} />
                                Welcome Back
                            </h2>
                            <p style={styles.loginSubtitle}>
                                Sign in to access your dashboard and manage your financial portfolio
                            </p>
                        </div>

                        {errors.form && (
                            <div style={styles.errorForm}>
                                <AlertCircle size={16} style={{ marginRight: '8px' }} />
                                {errors.form}
                            </div>
                        )}

                        <form style={styles.form} onSubmit={handleLogin}>
                            <div style={styles.formGroup}>
                                <label style={styles.inputLabel}>
                                    <Mail size={18} />
                                    Email Address
                                    <span style={styles.requiredStar}>*</span>
                                </label>
                                <div style={styles.inputWrapper}>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter your email"
                                        style={{
                                            ...styles.input,
                                            borderColor: errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                        }}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && (
                                    <div style={styles.errorText}>
                                        <AlertCircle size={14} />
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.inputLabel}>
                                    <Lock size={18} />
                                    Password
                                    <span style={styles.requiredStar}>*</span>
                                </label>
                                <div style={styles.inputWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter your password"
                                        style={{
                                            ...styles.input,
                                            borderColor: errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                        }}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        style={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div style={styles.errorText}>
                                        <AlertCircle size={14} />
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            <div style={styles.formOptions}>
                                <label style={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                        style={styles.checkboxInput}
                                        disabled={loading}
                                    />
                                    <span style={styles.checkboxLabel}>Remember me</span>
                                </label>
                                <Link
                                    to="/auth/forgot-password"
                                    style={styles.forgotLink}
                                    onClick={(e) => loading && e.preventDefault()}
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    ...styles.loginButton,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                                disabled={loading}
                            >
                                <div className="button-glow" style={styles.buttonGlow} />
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid transparent',
                                            borderTop: '2px solid currentColor',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={styles.applySection}>
                            <h3 style={styles.applyTitle}>
                                <CreditCard size={20} />
                                New to MoneyCircle?
                            </h3>
                            <button
                                style={styles.applyButton}
                                onClick={handleApplyNow}
                                disabled={loading}
                            >
                                <UserPlus size={20} />
                                Apply for a Loan
                            </button>
                            <p style={{
                                fontSize: getResponsiveValue('12px', '13px', '14px', '14px', '16px'),
                                color: '#94a3b8',
                                textAlign: 'center',
                                marginTop: '16px',
                            }}>
                                No account required to apply
                            </p>
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <p style={{ marginBottom: '12px' }}>
                            © 2024 MoneyCircle. All rights reserved.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
                            <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</Link>
                            <Link to="/security" style={{ color: '#64748b', textDecoration: 'none' }}>Security</Link>
                            <Link to="/contact" style={{ color: '#64748b', textDecoration: 'none' }}>Contact</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;