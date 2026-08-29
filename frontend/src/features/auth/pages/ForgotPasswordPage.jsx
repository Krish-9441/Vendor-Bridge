import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../api/authHooks';
import { Loader2 } from 'lucide-react';

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
});

const ForgotPasswordPage = () => {
  const { mutate: forgotPassword, isPending, isError, error, isSuccess } = useForgotPassword();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = (data) => {
    forgotPassword(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-[#231F16] bg-[#EDE6D6] font-sans selection:bg-[#8A3223] selection:text-[#EDE6D6] relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-100"
        style={{
          backgroundImage: 'linear-gradient(rgba(35,31,22,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(35,31,22,0.05) 1px,transparent 1px)',
          backgroundSize: '22px 22px'
        }}
      />

      <div className="w-full max-w-[420px] p-10 relative z-10 bg-[#F4EFE3] border-[1.5px] border-[#231F16] rounded-sm shadow-[8px_8px_0px_#231F16]">
        
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-['Fraunces'] font-bold text-[19px]">
            <span className="w-6 h-6 border-2 border-[#8A3223] rounded-full relative flex-shrink-0">
              <span className="absolute inset-[3px] border border-[#8A3223] rounded-full"></span>
            </span>
            VendorBridge
          </Link>
        </div>

        <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#8A3223] tracking-[0.12em] uppercase mb-3 text-center">
          Account Recovery
        </div>
        <h1 className="font-['Fraunces'] font-semibold text-[26px] mb-2 text-center">Reset password</h1>
        <p className="text-[#6b6349] text-[13.5px] mb-8 text-center px-4">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {isSuccess ? (
          <div className="text-center">
            <div className="mb-6 p-4 border-[1.5px] border-[#4B6B4A] bg-[#eef5ef] text-[#4B6B4A] font-['IBM_Plex_Mono'] text-[13px] rounded-sm">
              If an account exists with that email, a password reset link has been sent.
            </div>
            <Link to="/login" className="inline-block font-['IBM_Plex_Mono'] text-[13px] text-[#231F16] border-b-[1.5px] border-[#231F16] pb-1 hover:text-[#8A3223] hover:border-[#8A3223] transition-colors">
              Return to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {isError && (
              <div className="mb-6 p-3 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] text-sm font-['IBM_Plex_Mono'] rounded-sm text-center">
                {error?.response?.data?.message || 'Something went wrong. Please try again.'}
              </div>
            )}

            <div className="mb-8">
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

            <button 
              type="submit"
              disabled={isPending}
              className="w-full p-3.5 rounded-[2px] border-[1.5px] border-[#231F16] text-[#EDE6D6] bg-[#231F16] font-['IBM_Plex_Mono'] font-medium text-[13.5px] tracking-[0.03em] cursor-pointer transition-all hover:bg-[#8A3223] hover:border-[#8A3223] active:translate-y-[1px] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mb-6"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending instructions...</>
              ) : (
                'Send instructions'
              )}
            </button>

            <div className="text-center text-[13px] text-[#6b6349]">
              Remembered your password? <Link to="/login" className="text-[#8A3223] font-['IBM_Plex_Mono'] text-[12.5px] hover:underline">Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
