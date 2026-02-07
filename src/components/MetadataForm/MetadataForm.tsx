/**
 * MetadataForm Component
 * 
 * Mobile-optimized form for capturing place name and location metadata.
 * Features:
 * - Touch-friendly input fields (44px minimum height)
 * - Single column layout for mobile
 * - Real-time validation
 * - Accessible with ARIA labels
 */

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { MetadataFormProps, FormData, ValidationError } from '../../types';
import './MetadataForm.css';

export const MetadataForm: React.FC<MetadataFormProps> = ({
  disabled,
  onSubmit,
  onValidationError,
  initialValues
}) => {
  const [formData, setFormData] = useState<FormData>({
    placeName: initialValues?.placeName || '',
    location: initialValues?.location || ''
  });

  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Update form data when initialValues change
  useEffect(() => {
    if (initialValues) {
      setFormData({
        placeName: initialValues.placeName || '',
        location: initialValues.location || ''
      });
    }
  }, [initialValues]);

  const validateField = (field: keyof FormData, value: string): string | null => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return `${field === 'placeName' ? 'Place name' : 'Location'} is required`;
    }
    
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors = new Map<string, string>();
    const validationErrors: ValidationError[] = [];

    // Validate place name
    const placeNameError = validateField('placeName', formData.placeName);
    if (placeNameError) {
      newErrors.set('placeName', placeNameError);
      validationErrors.push({ field: 'placeName', message: placeNameError });
    }

    // Validate location
    const locationError = validateField('location', formData.location);
    if (locationError) {
      newErrors.set('location', locationError);
      validationErrors.push({ field: 'location', message: locationError });
    }

    setErrors(newErrors);

    if (validationErrors.length > 0) {
      onValidationError(validationErrors);
      return false;
    }

    return true;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors.has(name)) {
      const newErrors = new Map(errors);
      newErrors.delete(name);
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => new Set(prev).add(field));
    
    // Validate on blur
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => new Map(prev).set(field, error));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched(new Set(['placeName', 'location']));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Trim values before submitting
      const trimmedData: FormData = {
        placeName: formData.placeName.trim(),
        location: formData.location.trim()
      };

      await onSubmit(trimmedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.placeName.trim() !== '' && 
           formData.location.trim() !== '' &&
           errors.size === 0;
  };

  return (
    <form 
      className={`metadata-form ${disabled ? 'metadata-form--disabled' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="metadata-form__title">File Metadata</h2>
      <p className="metadata-form__description">
        Please provide information about the uploaded file
      </p>

      <div className="metadata-form__field">
        <label 
          htmlFor="placeName" 
          className="metadata-form__label"
        >
          Place Name <span className="metadata-form__required">*</span>
        </label>
        <input
          type="text"
          id="placeName"
          name="placeName"
          className={`metadata-form__input ${
            touched.has('placeName') && errors.has('placeName') 
              ? 'metadata-form__input--error' 
              : ''
          }`}
          value={formData.placeName}
          onChange={handleInputChange}
          onBlur={() => handleBlur('placeName')}
          disabled={disabled || isSubmitting}
          aria-required="true"
          aria-invalid={errors.has('placeName')}
          aria-describedby={errors.has('placeName') ? 'placeName-error' : undefined}
          placeholder="Enter place name"
        />
        {touched.has('placeName') && errors.has('placeName') && (
          <span 
            id="placeName-error" 
            className="metadata-form__error"
            role="alert"
          >
            {errors.get('placeName')}
          </span>
        )}
      </div>

      <div className="metadata-form__field">
        <label 
          htmlFor="location" 
          className="metadata-form__label"
        >
          Location <span className="metadata-form__required">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          className={`metadata-form__input ${
            touched.has('location') && errors.has('location') 
              ? 'metadata-form__input--error' 
              : ''
          }`}
          value={formData.location}
          onChange={handleInputChange}
          onBlur={() => handleBlur('location')}
          disabled={disabled || isSubmitting}
          aria-required="true"
          aria-invalid={errors.has('location')}
          aria-describedby={errors.has('location') ? 'location-error' : undefined}
          placeholder="Enter location"
        />
        {touched.has('location') && errors.has('location') && (
          <span 
            id="location-error" 
            className="metadata-form__error"
            role="alert"
          >
            {errors.get('location')}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="metadata-form__submit"
        disabled={disabled || isSubmitting || !isFormValid()}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="metadata-form__spinner" aria-hidden="true"></span>
            Submitting...
          </>
        ) : (
          'Submit'
        )}
      </button>
    </form>
  );
};
