
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation, useDummyLoginMutation } from '../features/auth/authApi';
import { selectCurrentToken } from '../features/auth/authSlice';
import { useAppSelector } from '../app/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  email: z.string().min(3, {
    message: 'email must be at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = useAppSelector(selectCurrentToken);
  const [login, { isLoading, isError, error }] = useLoginMutation();
  const [dummyLogin, { isLoading: isDummyLoading, isError: isDummyError, error: dummyError }] = useDummyLoginMutation();
  const [activeTab, setActiveTab] = useState<string>('mongodb');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'himanshubisen14@gmail.com',
      password: '123456',
    },
  });

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const onSubmit = async (values: FormValues) => {
    try {
      const credentials = {
        email: values.email,
        password: values.password
      };
      
      if (activeTab === 'mongodb') {
        await login(credentials).unwrap();
        localStorage.setItem('user', JSON.stringify({ email: values.email, username: values.email.split('@')[0] }));
      } else {
        await dummyLogin(credentials).unwrap();
      }
      
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">F</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mongodb" onValueChange={setActiveTab} className="mb-4">
            {/* <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
              <TabsTrigger value="dummy">Demo API</TabsTrigger>
            </TabsList> */}
          </Tabs>
          
          {activeTab === 'mongodb' && isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {(error as any)?.data?.message || 'Login failed. Please check your credentials.'}
              </AlertDescription>
            </Alert>
          )}
          
          {activeTab === 'dummy' && isDummyError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {(dummyError as any)?.data?.message || 'Login failed. Please check your credentials.'}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={activeTab === 'mongodb' ? isLoading : isDummyLoading}
              >
                {(activeTab === 'mongodb' ? isLoading : isDummyLoading) ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => navigate('/register')}>
                Register
              </Button>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <div>
            {activeTab === 'dummy' && (
              <p>For demo use: email: <strong>himanshubisen@gmail.com</strong>, Password: <strong>123456</strong></p>
            )}
            {activeTab === 'mongodb' && (
              <p>Register to create a MongoDB account</p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
