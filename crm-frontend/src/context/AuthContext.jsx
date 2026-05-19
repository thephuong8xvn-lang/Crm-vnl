import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile từ bảng profiles
  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Lấy session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Lắng nghe thay đổi auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Đăng nhập email/password
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email hoặc mật khẩu không đúng.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.');
      }
      throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  // Đăng ký email/password
  const signUp = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('Email này đã được đăng ký. Vui lòng đăng nhập.');
      }
      throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  // Đăng nhập Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw new Error('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  // Quên mật khẩu
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error('Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.');
  };

  // Đăng xuất
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    signOut,
    refreshProfile: () => session?.user && loadProfile(session.user.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng trong AuthProvider');
  return ctx;
}
