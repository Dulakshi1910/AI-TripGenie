import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FormField, AuthButton } from '../../components';
import { tripApi } from '../../services/tripApi';
import type { TripData } from '../../services/tripApi';

const PlanTrip: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState<TripData>({
    tripName: '',
    startPlace: '',
    destinationCountry: '',
    returnCountry: '',
    budget: 0,
    currency: 'USD',
    startDate: '',
    endDate: '',
    numberOfPeople: 1,
    preferences: {
      accommodation: 'any',
      transportation: 'economy',
      activities: [],
      dietaryRestrictions: [],
      travelStyle: 'comfort'
    },
    personalNeeds: {
      accessibilityRequirements: '',
      medicalNeeds: '',
      specialRequests: ''
    },
    status: 'draft'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof TripData] as Record<string, unknown>),
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'budget' || name === 'numberOfPeople' ? Number(value) : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof TripData] as Record<string, unknown>),
        [field]: value.split(',').map(item => item.trim()).filter(item => item)
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.tripName) newErrors.tripName = 'Trip name is required';
      if (!formData.startPlace) newErrors.startPlace = 'Start place is required';
      if (!formData.destinationCountry) newErrors.destinationCountry = 'Destination country is required';
      if (!formData.returnCountry) newErrors.returnCountry = 'Return country is required';
      if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Valid budget is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.numberOfPeople || formData.numberOfPeople <= 0) newErrors.numberOfPeople = 'Number of people is required';

      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (status: 'draft' | 'planning') => {
    if (!validateStep(1)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const tripData = { ...formData, status };
      const response = await tripApi.createTrip(tripData) as { success: boolean };
      
      if (response.success) {
        // Show success message or redirect based on status
        if (status === 'draft') {
          alert('Trip saved as draft successfully!');
        } else {
          alert('Trip plan generated successfully!');
        }
        navigate('/dashboard/trips');
      }
    } catch (error: any) {
      console.error('Create trip error:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors: {[key: string]: string} = {};
        error.response.data.errors.forEach((err: string) => {
          backendErrors.general = err;
        });
        setErrors(backendErrors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to create trip' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">Plan Your Trip</h1>
          <p className="text-gray-300">Create your perfect travel experience with AI assistance</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step <= currentStep
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Basic Trip Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Trip Name"
                  name="tripName"
                  type="text"
                  value={formData.tripName}
                  onChange={handleChange}
                  error={errors.tripName}
                  placeholder="My Amazing Trip"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                />

                <FormField
                  label="Start Place"
                  name="startPlace"
                  type="text"
                  value={formData.startPlace}
                  onChange={handleChange}
                  error={errors.startPlace}
                  placeholder="New York, USA"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Destination Country"
                  name="destinationCountry"
                  type="text"
                  value={formData.destinationCountry}
                  onChange={handleChange}
                  error={errors.destinationCountry}
                  placeholder="Japan"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />

                <FormField
                  label="Return Country"
                  name="returnCountry"
                  type="text"
                  value={formData.returnCountry}
                  onChange={handleChange}
                  error={errors.returnCountry}
                  placeholder="USA"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Budget"
                  name="budget"
                  type="number"
                  value={formData.budget.toString()}
                  onChange={handleChange}
                  error={errors.budget}
                  placeholder="5000"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <FormField
                  label="Number of People"
                  name="numberOfPeople"
                  type="number"
                  value={formData.numberOfPeople.toString()}
                  onChange={handleChange}
                  error={errors.numberOfPeople}
                  placeholder="2"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  placeholder=""
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />

                <FormField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                  placeholder=""
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Travel Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Accommodation</label>
                  <select
                    name="preferences.accommodation"
                    value={formData.preferences?.accommodation || 'any'}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="any">Any</option>
                    <option value="budget">Budget</option>
                    <option value="mid-range">Mid-range</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Transportation</label>
                  <select
                    name="preferences.transportation"
                    value={formData.preferences?.transportation || 'economy'}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first-class">First Class</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Activities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'sightseeing', label: 'Sightseeing' },
                    { value: 'adventure', label: 'Adventure' },
                    { value: 'cultural', label: 'Cultural' },
                    { value: 'food', label: 'Food & Dining' },
                    { value: 'shopping', label: 'Shopping' },
                    { value: 'nightlife', label: 'Nightlife' },
                    { value: 'relaxation', label: 'Relaxation' },
                    { value: 'nature', label: 'Nature' }
                  ].map((activity) => (
                    <label key={activity.value} className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.activities?.includes(activity.value) || false}
                        onChange={(e) => {
                          const currentActivities = formData.preferences?.activities || [];
                          let newActivities;
                          
                          if (e.target.checked) {
                            newActivities = [...currentActivities, activity.value];
                          } else {
                            newActivities = currentActivities.filter(a => a !== activity.value);
                          }
                          
                          setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              activities: newActivities
                            }
                          }));
                        }}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span>{activity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Dietary Restrictions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'vegan', label: 'Vegan' },
                    { value: 'halal', label: 'Halal' },
                    { value: 'kosher', label: 'Kosher' },
                    { value: 'gluten-free', label: 'Gluten-Free' },
                    { value: 'lactose-free', label: 'Lactose-Free' },
                    { value: 'nut-free', label: 'Nut-Free' },
                    { value: 'diabetic', label: 'Diabetic' }
                  ].map((restriction) => (
                    <label key={restriction.value} className="flex items-center space-x-2 text-white text-sm">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.dietaryRestrictions?.includes(restriction.value as "none" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free" | "lactose-free" | "nut-free" | "diabetic") || false}
                        onChange={(e) => {
                          const currentRestrictions = formData.preferences?.dietaryRestrictions || [];
                          let newRestrictions;
                          
                          if (e.target.checked) {
                            newRestrictions = [...currentRestrictions, restriction.value as "none" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free" | "lactose-free" | "nut-free" | "diabetic"];
                          } else {
                            newRestrictions = currentRestrictions.filter(r => r !== restriction.value);
                          }
                          
                          setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              dietaryRestrictions: newRestrictions
                            }
                          }));
                        }}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span>{restriction.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Travel Style</label>
                <select
                  name="preferences.travelStyle"
                  value={formData.preferences?.travelStyle || 'comfort'}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="backpacker">Backpacker</option>
                  <option value="comfort">Comfort</option>
                  <option value="luxury">Luxury</option>
                  <option value="family">Family</option>
                  <option value="romantic">Romantic</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Personal Needs (Optional)</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Accessibility Requirements</label>
                  <textarea
                    name="personalNeeds.accessibilityRequirements"
                    value={formData.personalNeeds?.accessibilityRequirements || ''}
                    onChange={handleChange}
                    placeholder="Wheelchair access, mobility aids, etc."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Medical Needs</label>
                  <textarea
                    name="personalNeeds.medicalNeeds"
                    value={formData.personalNeeds?.medicalNeeds || ''}
                    onChange={handleChange}
                    placeholder="Medications, medical equipment, etc."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Special Requests</label>
                  <textarea
                    name="personalNeeds.specialRequests"
                    value={formData.personalNeeds?.specialRequests || ''}
                    onChange={handleChange}
                    placeholder="Any other special requirements or preferences"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-left">
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <div className="flex space-x-4">
                  <AuthButton
                    onClick={() => handleSubmit('draft')}
                    disabled={isLoading}
                    loading={isLoading}
                    variant="google"
                  >
                    Save as Draft
                  </AuthButton>
                  
                  <AuthButton
                    onClick={() => handleSubmit('planning')}
                    disabled={isLoading}
                    loading={isLoading}
                    variant="primary"
                  >
                    Generate Trip Plan
                  </AuthButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlanTrip;
