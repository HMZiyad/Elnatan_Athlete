import React, { useState, useRef } from 'react';
import { FileText, Shield, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { apiCall, apiUpload } from '../../../utils/api';

interface VerificationStepProps {
  onBack: () => void;
  onContinue: () => void;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({ onBack, onContinue }) => {
  const [docUrl, setDocUrl] = useState('');
  const [docName, setDocName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setDocName(file.name);

    try {
      const res = await apiUpload(file, 'id_doc');
      const url = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
      setDocUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      setDocName('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!docUrl) {
      setError('Please upload an ID document to complete verification');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await apiCall('/athletes/me/onboarding/verification', {
        method: 'PUT',
        body: JSON.stringify({
          id_document_url: docUrl,
        }),
      });
      
      // Update onboarding_complete locally since they finished step 5
      localStorage.setItem('userOnboardingComplete', 'true');
      onContinue();
    } catch (err: any) {
      setError(err.message || 'Failed to save verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">ID Verification</h2>
        <p className="text-white/40 text-lg max-w-lg">UAG is for athletes who put in the work when no one is watching.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Upload Area */}
        <div 
          onClick={handleUploadClick}
          className="border-2 border-dashed border-white/5 rounded-2xl p-24 flex flex-col items-center justify-center text-center bg-dark-400 hover:bg-dark-300 transition-all group cursor-pointer relative"
        >
          <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {docUrl ? (
              <Check className="text-accent-green" />
            ) : (
              <FileText className="text-white/40" />
            )}
          </div>
          
          {uploading ? (
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Uploading file...</h3>
          ) : docUrl ? (
            <>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-accent-green">ID Uploaded Successfully</h3>
              <p className="text-xs text-white/60 font-medium mb-6 truncate max-w-xs">{docName}</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Upload ID Document</h3>
              <p className="text-xs text-white/20 uppercase tracking-widest font-black mb-6">
                JPEG, PNG, or PDF • Max 10MB
              </p>
            </>
          )}

          <p className="text-sm text-white/40 font-bold hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
            {docUrl ? 'Change document' : 'Click to browse'}
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            className="hidden" 
          />
        </div>

        {/* Security Banner */}
        <div className="bg-accent-green/5 border border-accent-green/10 rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-accent-green" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-accent-green">Data security</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              All documents are end-to-end encrypted and synced to your devices. Available without internet.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-12">
        <Button variant="outline" onClick={onBack} className="px-10 uppercase tracking-widest text-xs" disabled={submitting}>Back</Button>
        <Button onClick={handleSubmit} className="px-12 uppercase tracking-widest text-xs group" disabled={submitting}>
          {submitting ? 'Saving...' : 'Finish Onboarding'} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Button>
      </div>
    </div>
  );
};
