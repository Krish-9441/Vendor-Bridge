import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useSignup, useLogin } from '../api/authHooks';
import { Loader2 } from 'lucide-react';

const baseSchema = {
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  role: yup.string().oneOf(['PROCUREMENT_OFFICER', 'VENDOR']).required('Role is required'),
};

const vendorSchema = {
  ...baseSchema,
  companyName: yup.string().when('role', {
    is: 'VENDOR',
    then: () => yup.string().required('Company name is required'),
  }),
  gstNumber: yup.string().when('role', {
    is: 'VENDOR',
    then: () => yup.string().required('GST number is required'),
  }),
  category: yup.string().when('role', {
    is: 'VENDOR',
    then: () => yup.string().required('Category is required'),
  }),
  contactName: yup.string().when('role', {
    is: 'VENDOR',
    then: () => yup.string().required('Contact name is required'),
  }),
  phone: yup.string().when('role', {
    is: 'VENDOR',
    then: () => yup.string().required('Phone number is required'),
  }),
};

const signupSchema = yup.object().shape(vendorSchema);

const SignupPage = () => {
  const navigate = useNavigate();
  const { mutate: signup, isPending, isError, error } = useSignup();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      role: 'PROCUREMENT_OFFICER'
    }
  });

  const selectedRole = watch('role');

  const { mutate: login } = useLogin();

  const onSubmit = (data) => {
    signup(data, {
      onSuccess: (res) => {
        if (res.success) {
          // After signup, automatically login
          login({ email: data.email, password: data.password }, {
            onSuccess: (loginRes) => {
              if (loginRes.success) {
                navigate('/dashboard');
              }
            }
          });
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex text-[#231F16] bg-[#EDE6D6] font-sans selection:bg-[#8A3223] selection:text-[#EDE6D6]">
      {/* Left Side (Decorative) */}
      <div 
        className="hidden md:flex w-[44%] min-w-[380px] bg-[#231F16] text-[#EDE6D6] p-14 flex-col justify-between relative overflow-hidden"
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0 }}
      >
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
      <div className="flex-1 md:ml-[44%] flex items-center justify-center p-10 relative">
        <div className="w-full max-w-[440px] py-10">
          
          {/* Tabs */}
          <div className="flex border-[1.5px] border-[#231F16] mb-9 rounded-sm overflow-hidden">
            <Link to="/login" className="flex-1 text-center p-3 font-['IBM_Plex_Mono'] text-[13px] tracking-[0.04em] text-[#6b6349] hover:text-[#231F16] transition-colors cursor-pointer">
              Sign in
            </Link>
            <div className="flex-1 text-center p-3 font-['IBM_Plex_Mono'] text-[13px] tracking-[0.04em] bg-[#231F16] text-[#EDE6D6] cursor-default">
              Create account
            </div>
          </div>

          <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#8A3223] tracking-[0.12em] uppercase mb-3 flex items-center gap-2">
            Get started
          </div>
          <h1 className="font-['Fraunces'] font-semibold text-[30px] mb-2">Create your account</h1>
          <p className="text-[#6b6349] text-[14px] mb-8">
            Set up your profile to start managing RFQs, quotations, and approvals.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {isError && (
              <div className="mb-6 p-3 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] text-sm font-['IBM_Plex_Mono'] rounded-sm">
                {error?.response?.data?.message || 'Signup failed. Please try again.'}
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setValue('role', 'PROCUREMENT_OFFICER')}
                  className={`border-[1.5px] p-3 text-center font-['IBM_Plex_Mono'] text-[12px] cursor-pointer transition-colors ${selectedRole === 'PROCUREMENT_OFFICER' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:border-[#231F16]'}`}
                >
                  Procurement Officer
                </div>
                <div 
                  onClick={() => setValue('role', 'VENDOR')}
                  className={`border-[1.5px] p-3 text-center font-['IBM_Plex_Mono'] text-[12px] cursor-pointer transition-colors ${selectedRole === 'VENDOR' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:border-[#231F16]'}`}
                >
                  Vendor / Supplier
                </div>
                <input type="hidden" {...register('role')} />
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                  Full Name
                </label>
                <input 
                  type="text"
                  {...register('name')}
                  className={`w-full p-3 border-[1.5px] ${errors.name ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                  Email Address
                </label>
                <input 
                  type="email"
                  {...register('email')}
                  className={`w-full p-3 border-[1.5px] ${errors.email ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                  placeholder="you@company.com"
                />
                {errors.email && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.email.message}</p>}
              </div>
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

            {/* Vendor Specific Fields */}
            {selectedRole === 'VENDOR' && (
              <div className="border-t border-[#C9C0A8] pt-6 mb-6">
                <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#231F16] tracking-[0.12em] uppercase mb-4">
                  Vendor Details
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                      Company Name
                    </label>
                    <input 
                      type="text"
                      {...register('companyName')}
                      className={`w-full p-3 border-[1.5px] ${errors.companyName ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                      placeholder="Acme Corp"
                    />
                    {errors.companyName && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.companyName.message}</p>}
                  </div>
                  <div>
                    <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                      GST Number
                    </label>
                    <input 
                      type="text"
                      {...register('gstNumber')}
                      className={`w-full p-3 border-[1.5px] ${errors.gstNumber ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                      placeholder="27ABCDE1234F1Z5"
                    />
                    {errors.gstNumber && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.gstNumber.message}</p>}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                    Category
                  </label>
                  <select 
                    {...register('category')}
                    className={`w-full p-3 border-[1.5px] ${errors.category ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                  >
                    <option value="">Select a category...</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Software">Software</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Services">Services</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.category.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                  <div>
                    <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                      Contact Name
                    </label>
                    <input 
                      type="text"
                      {...register('contactName')}
                      className={`w-full p-3 border-[1.5px] ${errors.contactName ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                      placeholder="Contact Person"
                    />
                    {errors.contactName && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.contactName.message}</p>}
                  </div>
                  <div>
                    <label className="block font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">
                      Phone Number
                    </label>
                    <input 
                      type="text"
                      {...register('phone')}
                      className={`w-full p-3 border-[1.5px] ${errors.phone ? 'border-[#8A3223]' : 'border-[#C9C0A8] focus:border-[#8A3223]'} bg-[#F4EFE3] font-sans text-[14px] text-[#231F16] rounded-[2px] outline-none transition-colors`}
                      placeholder="+91 9876543210"
                    />
                    {errors.phone && <p className="text-[#8A3223] text-[11px] mt-1.5 font-['IBM_Plex_Mono']">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isPending}
              className="mt-4 w-full p-3.5 rounded-[2px] border-[1.5px] border-[#231F16] text-[#EDE6D6] bg-[#231F16] font-['IBM_Plex_Mono'] font-medium text-[13.5px] tracking-[0.03em] cursor-pointer transition-all hover:bg-[#8A3223] hover:border-[#8A3223] active:translate-y-[1px] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                'Create account'
              )}
            </button>

            <div className="text-center mt-6 text-[13px] text-[#6b6349]">
              Already have an account? <Link to="/login" className="text-[#8A3223] font-['IBM_Plex_Mono'] text-[12.5px] hover:underline">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
