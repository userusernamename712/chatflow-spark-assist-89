
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_CUSTOMERS, DEFAULT_CUSTOMER_ID } from '@/types/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FormValues = {
  email: string;
  password: string;
  username?: string;
  customerId: string;
};

const LoginForm = () => {
  const { login, register, error, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      username: '',
      customerId: DEFAULT_CUSTOMER_ID,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (activeTab === 'login') {
        await login(values.email, values.password, values.customerId);
        toast({
          title: "Welcome back!",
          description: `You've logged in successfully. You're now connected to the ${values.customerId} client data.`,
        });
      } else {
        if (!values.username) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Username is required for registration",
          });
          return;
        }
        await register(values.email, values.password, values.username, values.customerId);
        toast({
          title: "Registration successful!",
          description: `You've registered and logged in as ${values.email}.`,
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Team Access Portal</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_CUSTOMERS.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <TabsContent value="register">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your.email@example.com" {...field} required />
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
                    <Input type="password" placeholder="••••••••" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : activeTab === 'login' ? "Login" : "Register"}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default LoginForm;
