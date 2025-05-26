
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_CUSTOMER_ID } from '@/types/auth';
import { Mail, Lock, ArrowRight } from 'lucide-react';

type FormValues = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { login, error, loading } = useAuth();
  
  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password, DEFAULT_CUSTOMER_ID);
      toast({
        title: "Welcome back!",
        description: `You've logged in successfully to the bookline.AI team portal.`,
      });
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Logo and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center items-center p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-8">
            <img 
              src="/lovable-uploads/550aab05-c6c5-4d4a-8ef2-665352be8d2e.png" 
              alt="bookline.AI Logo" 
              className="h-10 w-10 object-contain"
            />
          </div>
          <h1 className="text-4xl font-light text-white mb-4">bookline.AI</h1>
          <p className="text-slate-400 text-lg font-light max-w-md">
            Transform your data into actionable insights with our advanced analytics platform
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
              <img 
                src="/lovable-uploads/550aab05-c6c5-4d4a-8ef2-665352be8d2e.png" 
                alt="bookline.AI Logo" 
                className="h-8 w-8 object-contain filter brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl font-light text-slate-900 mb-2">bookline.AI</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-light text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-600">Please sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          className="pl-11 h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          {...field} 
                          required 
                        />
                      </div>
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
                    <FormLabel className="text-slate-700 font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          className="pl-11 h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          {...field} 
                          required 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign in
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Secure authentication • bookline.AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
