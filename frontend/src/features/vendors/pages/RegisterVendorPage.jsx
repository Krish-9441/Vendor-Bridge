import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateVendor } from '../api/vendorHooks';
import { Loader2 } from 'lucide-react';

const RegisterVendorPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { mutate: createVendor, isPending, error } = useCreateVendor();

  const onSubmit = (data) => {
    createVendor(data, {
      onSuccess: () => {
        navigate('/vendors');
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Register Vendor</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            Add a new supplier to the directory
          </div>
        </div>
        <button 
          onClick={() => navigate('/vendors')}
          className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline"
        >
          ← Back to Vendors
        </button>
      </div>

      <div className="p-9 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] rounded-sm font-['IBM_Plex_Mono'] text-[13px]">
              {error.response?.data?.message || error.message}
            </div>
          )}

          <div className="space-y-4 border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
            <h2 className="font-['Fraunces'] font-semibold text-[18px]">Company Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-wide text-[#6b6349]">Company Name</label>
                <input
                  {...register('companyName', { required: 'Company name is required' })}
                  className="w-full border-[1.5px] border-[#C9C0A8] bg-transparent px-3 py-2 text-[13.5px] rounded-sm focus:outline-none focus:border-[#8A3223]"
                />
                {errors.companyName && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.companyName.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-wide text-[#6b6349]">GST Number</label>
                <input
                  {...register('gstNumber', { 
                    required: 'GST number is required',
                    minLength: { value: 15, message: 'GST must be 15 characters' },
                    maxLength: { value: 15, message: 'GST must be 15 characters' }
                  })}
                  className="w-full border-[1.5px] border-[#C9C0A8] bg-transparent px-3 py-2 text-[13.5px] rounded-sm focus:outline-none focus:border-[#8A3223] font-['IBM_Plex_Mono'] uppercase"
                  placeholder="24ABCDE1234F1Z5"
                />
                {errors.gstNumber && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.gstNumber.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-wide text-[#6b6349]">Category</label>
                <input
                  {...register('category')}
                  className="w-full border-[1.5px] border-[#C9C0A8] bg-transparent px-3 py-2 text-[13.5px] rounded-sm focus:outline-none focus:border-[#8A3223]"
                  placeholder="e.g. IT Equipment"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
            <h2 className="font-['Fraunces'] font-semibold text-[18px]">Contact Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-wide text-[#6b6349]">Contact Name (Optional)</label>
                <input
                  {...register('contactName')}
                  className="w-full border-[1.5px] border-[#C9C0A8] bg-transparent px-3 py-2 text-[13.5px] rounded-sm focus:outline-none focus:border-[#8A3223]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-wide text-[#6b6349]">Contact Email</label>
                <input
                  type="email"
                  {...register('contactEmail', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className="w-full border-[1.5px] border-[#C9C0A8] bg-transparent px-3 py-2 text-[13.5px] rounded-sm focus:outline-none focus:border-[#8A3223]"
                />
                {errors.contactEmail && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.contactEmail.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="font-['IBM_Plex_Mono'] text-[11.5px] uppercase tracking-wide text-[#6b6349]">Contact Phone</label>
                <input
                  {...register('contactPhone', { required: 'Phone is required' })}
                  className="w-full border-[1.5px] border-[#C9C0A8] bg-transparent px-3 py-2 text-[13.5px] rounded-sm focus:outline-none focus:border-[#8A3223]"
                />
                {errors.contactPhone && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.contactPhone.message}</span>}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="px-6 py-3 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[13px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : 'Register Vendor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterVendorPage;
