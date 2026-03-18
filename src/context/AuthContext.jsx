import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [authMethod, setAuthMethod] = useState(null); // email, google, github, microsoft, biometric

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedBiometric = localStorage.getItem('biometricEnabled');
    
    if (savedUser && savedAuth === 'true') {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    if (savedBiometric === 'true') {
      setBiometricEnabled(true);
    }
    
    setLoading(false);
  }, []);

  // Check for biometric support
  const checkBiometricSupport = async () => {
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
      } catch (error) {
        console.error('Biometric check error:', error);
        return false;
      }
    }
    return false;
  };

  // Email/Password Sign In
  const signInWithEmail = async (email, password) => {
    try {
      // Simulate API call - Replace with actual authentication
      // In production, this would call your backend
      if (email && password) {
        // Demo credentials - In production, validate with backend
        if (email === 'demo@expense.com' && password === 'password') {
          const userData = {
            id: '1',
            email,
            name: 'Demo User',
            avatar: `https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff`,
            provider: 'email',
            createdAt: new Date().toISOString(),
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          setAuthMethod('email');
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isAuthenticated', 'true');
          
          toast.success('Welcome back!');
          return { success: true };
        } else {
          toast.error('Invalid email or password');
          return { success: false, error: 'Invalid credentials' };
        }
      }
    } catch (error) {
      toast.error('Login failed');
      return { success: false, error: error.message };
    }
  };

  // Sign Up with Email
  const signUpWithEmail = async (name, email, password) => {
    try {
      // Simulate signup - Replace with actual backend
      const userData = {
        id: Date.now().toString(),
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthMethod('email');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      toast.error('Sign up failed');
      return { success: false, error: error.message };
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      // Simulate Google OAuth - Replace with actual Google OAuth
      // In production, use Firebase or OAuth2.0
      const userData = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthMethod('google');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      toast.success('Signed in with Google');
      return { success: true };
    } catch (error) {
      toast.error('Google sign in failed');
      return { success: false };
    }
  };

  // GitHub Sign In
  const signInWithGithub = async () => {
    try {
      // Simulate GitHub OAuth
      const userData = {
        id: 'github_' + Date.now(),
        email: 'user@github.com',
        name: 'GitHub User',
        avatar: 'https://avatars.githubusercontent.com/u/default',
        provider: 'github',
        createdAt: new Date().toISOString(),
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthMethod('github');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      toast.success('Signed in with GitHub');
      return { success: true };
    } catch (error) {
      toast.error('GitHub sign in failed');
      return { success: false };
    }
  };

  // Microsoft Sign In
  const signInWithMicrosoft = async () => {
    try {
      // Simulate Microsoft OAuth
      const userData = {
        id: 'microsoft_' + Date.now(),
        email: 'user@outlook.com',
        name: 'Microsoft User',
        avatar: 'https://ui-avatars.com/api/?name=Microsoft+User&background=00a4ef&color=fff',
        provider: 'microsoft',
        createdAt: new Date().toISOString(),
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthMethod('microsoft');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      toast.success('Signed in with Microsoft');
      return { success: true };
    } catch (error) {
      toast.error('Microsoft sign in failed');
      return { success: false };
    }
  };

  // Biometric Login
  const signInWithBiometric = async () => {
    try {
      const supported = await checkBiometricSupport();
      if (!supported) {
        toast.error('Biometric authentication not supported on this device');
        return { success: false };
      }

      // Simulate biometric authentication
      // In production, use WebAuthn API
      const confirmed = window.confirm('Use biometric to login?');
      if (confirmed) {
        // Get stored user for biometric
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          setAuthMethod('biometric');
          toast.success('Biometric authentication successful');
          return { success: true };
        } else {
          toast.error('No user found. Please login first with email/social');
          return { success: false };
        }
      }
    } catch (error) {
      toast.error('Biometric authentication failed');
      return { success: false };
    }
  };

  // Enable Biometric
  const enableBiometric = async () => {
    try {
      const supported = await checkBiometricSupport();
      if (!supported) {
        toast.error('Biometric not supported on this device');
        return false;
      }

      setBiometricEnabled(true);
      localStorage.setItem('biometricEnabled', 'true');
      toast.success('Biometric login enabled');
      return true;
    } catch (error) {
      toast.error('Failed to enable biometric');
      return false;
    }
  };

  // Disable Biometric
  const disableBiometric = () => {
    setBiometricEnabled(false);
    localStorage.setItem('biometricEnabled', 'false');
    toast.success('Biometric login disabled');
  };

  // Sign Out
  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthMethod(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    // Keep biometric setting
    toast.success('Signed out successfully');
  };

  // Update Profile
  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    authMethod,
    biometricEnabled,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signInWithMicrosoft,
    signInWithBiometric,
    enableBiometric,
    disableBiometric,
    signOut,
    updateProfile,
    checkBiometricSupport,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};