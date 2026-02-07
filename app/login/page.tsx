'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <Image src="/logo.png" alt="Utilyze Logo" width={48} height={48} />
                        <span className="text-3xl font-bold text-slate-900 tracking-tight">utilyze.</span>
                    </div>
                    <p className="text-slate-500">Smart Utility Payment Platform</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back</h1>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-slate-500 outline-none"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-slate-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-bold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-slate-900 font-semibold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Test Credentials for Development Only */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-500 text-center mb-2">Test Accounts:</p>
                            <div className="text-xs text-slate-400 space-y-1">
                                <p>📧 john@example.com / password123</p>
                                <p>📧 jane@example.com / password123</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
