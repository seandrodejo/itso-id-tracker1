import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import nuLogo from '../assets/images/nu-logo.png';
import { useAuth } from '../contexts/AuthContext';

const { height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState({
    email: '',
    studentNumber: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    studentNumber: false,
    password: false,
  });

  const router = useRouter();
  const { login } = useAuth();

  // Start animation when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refs for input fields
  const emailRef = useRef<TextInput>(null);
  const studentNumberRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return '';
  };

  const validateStudentNumber = (studentNumber: string) => {
    if (!studentNumber.trim()) return 'Student number is required';
    if (studentNumber.trim().length < 3) return 'Student number must be at least 3 characters';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) return 'Password is required';
    return '';
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'studentNumber':
        error = validateStudentNumber(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
    }
    return error;
  };

  const handleFieldChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'studentNumber':
        setStudentNumber(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }

    // Validate the field if it has been touched
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'email' ? email : field === 'studentNumber' ? studentNumber : password;
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAllFields = () => {
    const newErrors = {
      email: validateEmail(email),
      studentNumber: validateStudentNumber(studentNumber),
      password: validatePassword(password),
    };
    
    setErrors(newErrors);
    setTouched({ email: true, studentNumber: true, password: true });
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleLogin = async () => {
    if (!validateAllFields()) {
      return;
    }

    try {
      const success = await login(email.trim(), studentNumber.trim(), password.trim());

      if (!success) {
        setErrors(prev => ({
          ...prev,
          email: 'Invalid credentials',
          studentNumber: 'Invalid credentials',
          password: 'Invalid credentials',
        }));
        return;
      }

      router.push('/dashboard');
    } catch (error: any) {
      // Check if it's a student number not found error
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      if (errorMessage.includes('Student ID not found')) {
        setErrors(prev => ({
          ...prev,
          studentNumber: 'Invalid student number',
          email: '',
          password: '',
        }));
      } else if (errorMessage.includes('Invalid password')) {
        setErrors(prev => ({
          ...prev,
          password: 'Invalid password',
          email: '',
          studentNumber: '',
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: 'Login failed',
          studentNumber: 'Login failed',
          password: 'Login failed',
        }));
      }
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardOpeningTime={0}
      >
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <Image source={nuLogo} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.logoTextWrapper}>
          <Text style={styles.logoTitle}>NU Dasmarinas</Text>
          <Text style={styles.logoSubtitle}>ITSO ID Tracker</Text>
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Log in to your</Text>
      <Text style={styles.secheading}>Account</Text>
      <Text style={styles.subheading}>
        Enter your email and password to log in
      </Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        ref={emailRef}
        style={[
          styles.input,
          errors.email && touched.email && styles.inputError
        ]}
        value={email}
        onChangeText={(value) => handleFieldChange('email', value)}
        onBlur={() => handleFieldBlur('email')}
        placeholder="Enter your email"
        placeholderTextColor="#94a3b8"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => studentNumberRef.current?.focus()}
      />
      {errors.email && touched.email && (
        <Text style={styles.errorText}>{errors.email}</Text>
      )}

      {/* Student Number */}
      <Text style={styles.label}>Student Number</Text>
      <TextInput
        ref={studentNumberRef}
        style={[
          styles.input,
          errors.studentNumber && touched.studentNumber && styles.inputError
        ]}
        value={studentNumber}
        onChangeText={(value) => handleFieldChange('studentNumber', value)}
        onBlur={() => handleFieldBlur('studentNumber')}
        placeholder="Enter your student number"
        placeholderTextColor="#94a3b8"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      {errors.studentNumber && touched.studentNumber && (
        <Text style={styles.errorText}>{errors.studentNumber}</Text>
      )}

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={[
        styles.passwordWrapper,
        errors.password && touched.password && styles.passwordWrapperError
      ]}>
        <TextInput
          ref={passwordRef}
          style={styles.passwordInput}
          value={password}
          onChangeText={(value) => handleFieldChange('password', value)}
          onBlur={() => handleFieldBlur('password')}
          placeholder="Enter your password"
          placeholderTextColor="#94a3b8"
          secureTextEntry={!showPassword}
          textContentType="password"
          importantForAutofill="no"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#64748b"
          />
        </TouchableOpacity>
      </View>
      {errors.password && touched.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotButton}>
        <Text style={styles.forgotText}>Forgot Password ?</Text>
      </TouchableOpacity>

      {/* Log In Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      </KeyboardAwareScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 80,
    paddingTop: 0,
  },
  logoImage: {
    width: 55,
    height: 55,
    marginBottom: 0,
    marginRight: 12,
  },
  logoTextWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e40af',
  },
  logoSubtitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e40af',
  },
  heading: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
  },
  secheading: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#155fffff',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#eeeeeeff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeeeff',
    borderRadius: 25,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  passwordWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 8,
    marginLeft: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
