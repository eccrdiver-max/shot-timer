import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';

const LoginView: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, logIn } = useAuth();
    const { t } = useI18n();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && (!firstName.trim() || !lastName.trim())) {
            setError(t('signup_error_name_required'));
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await logIn(email, password);
            } else {
                await signUp(email, password, firstName, lastName);
                setIsLogin(true); // Switch to login view after successful signup
            }
        } catch (err: any) {
            switch (err.code) {
                case 'auth/invalid-credential':
                    setError(t('login_error_invalid_credential'));
                    break;
                case 'auth/email-already-in-use':
                    setError(t('signup_error_email_in_use'));
                    break;
                case 'auth/weak-password':
                    setError(t('signup_error_weak_password'));
                    break;
                default:
                    setError(t('login_error_generic'));
                    console.error("Authentication error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-yellow-400">
                    Shot Timer Pro
                </h1>
                <h2 className="text-xl font-bold text-center text-gray-200">
                    {isLogin ? t('login_welcome_back') : t('login_create_account')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="text-sm font-bold text-gray-400 block">{t('first_name')}</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full p-2 mt-1 text-gray-100 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="text-sm font-bold text-gray-400 block">{t('last_name')}</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full p-2 mt-1 text-gray-100 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-400 block">{t('login_email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 mt-1 text-gray-100 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="text-sm font-bold text-gray-400 block">{t('login_password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 mt-1 text-gray-100 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-md disabled:bg-yellow-800">
                            {loading ? t('login_processing') : (isLogin ? t('login_button') : t('signup_button'))}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-yellow-400 hover:underline">
                        {isLogin ? t('login_toggle_signup') : t('login_toggle_login')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginView;