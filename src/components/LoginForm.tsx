
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
import { Mail, Lock, LogIn } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <img 
              src="/lovable-uploads/550aab05-c6c5-4d4a-8ef2-665352be8d2e.png" 
              alt="bookline.AI Logo" 
              className="h-8 w-8 object-contain filter brightness-0 invert"
            />
          </div>
          <h1 className="text-3xl font-light text-slate-800 mb-2">bookline.AI</h1>
          <p className="text-slate-500 text-sm font-light">Data Analytics Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm">
              {error}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-sm font-medium">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="h-4 w-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          className="pl-12 h-12 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-300 focus:ring-indigo-200 transition-all duration-200"
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
                    <FormLabel className="text-slate-700 text-sm font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="h-4 w-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          className="pl-12 h-12 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-300 focus:ring-indigo-200 transition-all duration-200"
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
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="h-4 w-4 mr-3" />
                    Sign in
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400">
            Secure authentication powered by bookline.AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
