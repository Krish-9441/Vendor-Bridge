import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/authHooks';
import { Loader2 } from 'lucide-react';

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending, isError, error } = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data) => {
    login(data, {
      onSuccess: (res) => {
        if (res.success) {
          navigate('/dashboard');
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex text-[#231F16] bg-[#EDE6D6] font-sans selection:bg-[#8A3223] selection:text-[#EDE6D6]">
      {/* Left Side (Decorative) */}
      <div 
        className="hidden md:flex w-[44%] min-w-[380px] bg-[#231F16] text-[#EDE6D6] p-14 flex-col justify-between relative overflow-hidden"
      >
        {/* Grid pattern background */}
        <div 
          className="absolute inset-0 z-0 opacity-100"
          style={{
            backgroundImage: 'linear-gradient(rgba(237,230,214,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(237,230,214,0.05) 1px,transparent 1px)',
            backgroundSize: '34px 34px'
          }}
        />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 font-['Fraunces'] font-bold text-[19px]">
            <span className="w-6 h-6 border-2 border-[#D89A57] rounded-full relative flex-shrink-0">
              <span className="absolute inset-[3px] border border-[#D89A57] rounded-full"></span>
            </span>
            VendorBridge
          </Link>
        </div>

        <div className="relative z-10 max-w-[380px]">
          <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#D89A57] tracking-[0.12em] uppercase mb-4 flex items-center gap-2">
            Procurement Manifest · ERP
          </div>
          <h2 className="font-['Fraunces'] text-[28px] leading-[1.25] text-[#EDE6D6] font-semibold">
            Every vendor, quotation and approval — filed against one record.
          </h2>
        </div>

        <div className="relative z-10 border-t border-[rgba(237,230,214,0.2)] pt-4 font-['IBM_Plex_Mono'] text-[12px] text-[#B9AF97]">
          <div className="flex justify-between py-1.5">
            <span>Active vendors</span><span>128</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Open RFQs</span><span>12</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Pending approvals</span><span>4</span>
          </div>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="flex-1 flex items-center justify-center p-10 relative">
        <div className="w-full max-w-[400px]">
          
          <div className="flex border-[1.5px] border-[#231F16] mb-9">
            <div className="flex-1 text-center p-3 font-['IBM_Plex_Mono'] text-[13px] tracking-[0.04em] bg-[#231F16] text-[#EDE6D6] cursor-default">
              Sign in
            </div>
            <Link to="/signup" className="flex-1 text-center p-3 font-['IBM_Plex_Mono'] text-[13px] tracking-[0.04em] text-[#6b6349] hover:text-[#231F16] transition-colors cursor-pointer">
              Create account
            </Link>
          </div>

          <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#8A3223] tracking-[0.12em] uppercase mb-3 flex items-center gap-2">
            Welcome back
          </div>
          <h1 className="font-['Fraunces'] font-semibold text-[30px] mb-2">Sign in to your ledger</h1>
          <p className="text-[#6b6349] text-[14px] mb-8">
            Use your work email — access is scoped to your assigned role.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {isError && (
              <div className="mb-6 p-3 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] text-sm font-['IBM_Plex_Mono'] rounded-sm">
                {error?.response?.data?.message || 'Login failed. Please check your credentials.'}
              </div>
            )}

            <div className="mb-5">
              <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                Email address
              </label>
              <input 
                type="email"
                {...register('email')}
                className={`w-full p-3 border-[1.5px] ${errors.email ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.email.message}</p>}
            </div>

            <div className="mb-6">
              <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                Password
              </label>
              <input 
                type="password"
                {...register('password')}
                className={`w-full p-3 border-[1.5px] ${errors.password ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.password.message}</p>}
            </div>

            <div className="flex justify-between items-center text-[13px] mb-7">
              <label className="flex items-center gap-2 text-[#6b6349] cursor-pointer">
                <input type="checkbox" className="accent-[#8A3223] w-3.5 h-3.5 cursor-pointer" />
                <span>Keep me signed in</span>
              </label>
              <Link to="/forgot-password" className="text-[#8A3223] font-['IBM_Plex_Mono'] text-[12.5px] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit"
              disabled={isPending}
              className="w-full p-3.5 rounded-[2px] border-[1.5px] border-[#231F16] text-[#EDE6D6] bg-[#231F16] font-['IBM_Plex_Mono'] font-medium text-[13.5px] tracking-[0.03em] cursor-pointer transition-all hover:bg-[#8A3223] hover:border-[#8A3223] active:translate-y-[1px] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>

            <div className="text-center mt-6 text-[13px] text-[#6b6349]">
              Don't have an account? <Link to="/signup" className="text-[#8A3223] font-['IBM_Plex_Mono'] text-[12.5px] hover:underline">Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
