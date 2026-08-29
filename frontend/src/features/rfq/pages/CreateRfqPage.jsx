import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  useCreateRfq, 
  useAssignVendors, 
  useUploadRfqAttachment, 
  usePublishRfq 
} from '../api/rfqHooks';
import { useVendors } from '../../vendors/api/vendorHooks';
import { Loader2, Plus, X } from 'lucide-react';

const CreateRfqPage = () => {
  const navigate = useNavigate();
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      itemDetails: [{ name: '', quantity: 1, unit: 'pcs' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'itemDetails'
  });

  // API Hooks
  const { mutateAsync: createRfq } = useCreateRfq();
  const { mutateAsync: assignVendors } = useAssignVendors();
  const { mutateAsync: uploadAttachment } = useUploadRfqAttachment();
  const { mutateAsync: publishRfq } = usePublishRfq();
  
  // Fetch active vendors to pick from
  const { data: vendorsRes } = useVendors({ status: 'ACTIVE', limit: 100 });
  const activeVendors = vendorsRes?.data || [];

  const toggleVendor = (vid) => {
    if (selectedVendors.includes(vid)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vid));
    } else {
      setSelectedVendors([...selectedVendors, vid]);
    }
  };

  const onSubmit = async (data, isPublish) => {
    setIsSubmitting(true);
    try {
      // 1. Create RFQ (DRAFT)
      const res = await createRfq({
        title: data.title,
        description: data.description,
        deadline: new Date(data.deadline).toISOString(),
        itemDetails: data.itemDetails
      });
      const rfqId = res.data.id || res.data._id;

      // 2. Upload file if any
      if (file) {
        await uploadAttachment({ id: rfqId, file });
      }

      // 3. Assign vendors if any
      if (selectedVendors.length > 0) {
        await assignVendors({ id: rfqId, vendorIds: selectedVendors });
      }

      // 4. Publish if requested
      if (isPublish) {
        await publishRfq(rfqId);
      }

      navigate('/rfqs');
    } catch (error) {
      console.error('Failed to create RFQ', error);
      alert(error?.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Create RFQ</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            New Request
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => onSubmit(data, false))}
            className="px-4 py-2 rounded-[2px] border-[1.5px] border-[#231F16] bg-transparent text-[#231F16] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#E4DBC7] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Draft'}
          </button>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => onSubmit(data, true))}
            className="px-4 py-2 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send to Vendors →'}
          </button>
        </div>
      </div>

      <div className="p-9 max-w-[880px]">
        {/* Basic Details */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] mb-6">
          <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
            <h3 className="font-['Fraunces'] font-semibold text-[16.5px]">RFQ Details</h3>
            <p className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1">Basic information vendors will see</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">RFQ Title</label>
              <input 
                {...register('title', { required: 'Title is required' })}
                className="w-full p-[11px] border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] font-sans text-[13.5px] text-[#231F16] focus:outline-none focus:border-[#8A3223]"
              />
              {errors.title && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.title.message}</span>}
            </div>
            <div>
              <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">Submission Deadline</label>
              <input 
                type="date"
                {...register('deadline', { required: 'Deadline is required' })}
                className="w-full p-[11px] border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] font-sans text-[13.5px] text-[#231F16] focus:outline-none focus:border-[#8A3223]"
              />
              {errors.deadline && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.deadline.message}</span>}
            </div>
            <div>
              <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">Description / Scope</label>
              <textarea 
                {...register('description')}
                rows={3}
                className="w-full p-[11px] border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] font-sans text-[13.5px] text-[#231F16] focus:outline-none focus:border-[#8A3223] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Line Items & Attachments */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] mb-6">
          <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
            <h3 className="font-['Fraunces'] font-semibold text-[16.5px]">Product / Service line items</h3>
            <p className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1">Quantity and specification per item</p>
          </div>
          <div className="p-6">
            <div className="border-[1.5px] border-[#C9C0A8] mb-4">
              <div className="grid grid-cols-[1.6fr_90px_110px_40px] px-4 py-2.5 font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] border-b-[1.5px] border-[#C9C0A8] bg-[#E4DBC7]">
                <span>Item Name</span>
                <span>Qty</span>
                <span>Unit</span>
                <span></span>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1.6fr_90px_110px_40px] px-4 py-2.5 items-center border-b border-[#C9C0A8] last:border-0 gap-2">
                  <input 
                    {...register(`itemDetails.${index}.name`, { required: true })}
                    placeholder="Item specification..."
                    className="w-full p-2 border border-[#C9C0A8] bg-[#EDE6D6] text-[13px] rounded-[2px]"
                  />
                  <input 
                    type="number"
                    min="1"
                    {...register(`itemDetails.${index}.quantity`, { required: true, valueAsNumber: true })}
                    className="w-full p-2 border border-[#C9C0A8] bg-[#EDE6D6] text-[13px] rounded-[2px]"
                  />
                  <input 
                    {...register(`itemDetails.${index}.unit`, { required: true })}
                    placeholder="pcs, kg..."
                    className="w-full p-2 border border-[#C9C0A8] bg-[#EDE6D6] text-[13px] rounded-[2px]"
                  />
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="text-[#8A3223] font-['IBM_Plex_Mono'] flex justify-center items-center h-full w-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={() => append({ name: '', quantity: 1, unit: 'pcs' })}
              className="text-[#8A3223] font-['IBM_Plex_Mono'] text-[12px] flex items-center gap-1 hover:underline mb-6"
            >
              <Plus size={14} /> Add line item
            </button>

            <div>
              <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">Attachments</label>
              <div className="border-[1.5px] border-dashed border-[#C9C0A8] p-6 text-center">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E4DBC7] file:text-[#4A4535] hover:file:bg-[#C9C0A8]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Assignment */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] mb-6">
          <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
            <h3 className="font-['Fraunces'] font-semibold text-[16.5px]">Vendor Assignment</h3>
            <p className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1">Select which active vendors receive this RFQ</p>
          </div>
          <div className="p-6">
            {activeVendors.length === 0 ? (
              <p className="font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">No active vendors available.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {activeVendors.map(vendor => {
                  const isSelected = selectedVendors.includes(vendor.id || vendor._id);
                  return (
                    <div 
                      key={vendor.id || vendor._id}
                      onClick={() => toggleVendor(vendor.id || vendor._id)}
                      className={`border-[1.5px] px-3.5 py-2 text-[12.5px] rounded-full flex items-center gap-2 cursor-pointer transition-colors select-none ${isSelected ? 'border-[#8A3223] bg-[#EDE6D6] text-[#231F16]' : 'border-[#C9C0A8] text-[#4A4535] hover:bg-[#E4DBC7]'}`}
                    >
                      {vendor.companyName}
                      {isSelected && <X size={14} className="text-[#8A3223]" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateRfqPage;
