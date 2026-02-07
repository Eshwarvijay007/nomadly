/**
 * MetadataForm Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetadataForm } from './MetadataForm';
import { FormData, ValidationError } from '../../types';

describe('MetadataForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnValidationError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with title and description', () => {
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      expect(screen.getByText('File Metadata')).toBeInTheDocument();
      expect(screen.getByText(/Please provide information/)).toBeInTheDocument();
    });

    it('should render place name input field', () => {
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      expect(placeNameInput).toBeInTheDocument();
      expect(placeNameInput).toHaveAttribute('type', 'text');
      expect(placeNameInput).toHaveAttribute('placeholder', 'Enter place name');
    });

    it('should render location input field', () => {
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const locationInput = screen.getByLabelText(/Location/);
      expect(locationInput).toBeInTheDocument();
      expect(locationInput).toHaveAttribute('type', 'text');
      expect(locationInput).toHaveAttribute('placeholder', 'Enter location');
    });

    it('should render submit button', () => {
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should mark fields as required', () => {
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const locationInput = screen.getByLabelText(/Location/);

      expect(placeNameInput).toHaveAttribute('aria-required', 'true');
      expect(locationInput).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Form State Management', () => {
    it('should update place name value on input', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/) as HTMLInputElement;
      await user.type(placeNameInput, 'Eiffel Tower');

      expect(placeNameInput.value).toBe('Eiffel Tower');
    });

    it('should update location value on input', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const locationInput = screen.getByLabelText(/Location/) as HTMLInputElement;
      await user.type(locationInput, 'Paris, France');

      expect(locationInput.value).toBe('Paris, France');
    });
  });

  describe('Validation', () => {
    it('should show error when place name is empty on blur', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      await user.click(placeNameInput);
      await user.tab(); // Blur

      await waitFor(() => {
        expect(screen.getByText('Place name is required')).toBeInTheDocument();
      });
    });

    it('should show error when location is empty on blur', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const locationInput = screen.getByLabelText(/Location/);
      await user.click(locationInput);
      await user.tab(); // Blur

      await waitFor(() => {
        expect(screen.getByText('Location is required')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      
      // Trigger error
      await user.click(placeNameInput);
      await user.tab();
      await waitFor(() => {
        expect(screen.getByText('Place name is required')).toBeInTheDocument();
      });

      // Start typing
      await user.type(placeNameInput, 'E');

      await waitFor(() => {
        expect(screen.queryByText('Place name is required')).not.toBeInTheDocument();
      });
    });

    it('should disable submit button when fields are empty', () => {
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when both fields are filled', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const locationInput = screen.getByLabelText(/Location/);
      const submitButton = screen.getByRole('button', { name: /Submit/i });

      await user.type(placeNameInput, 'Eiffel Tower');
      await user.type(locationInput, 'Paris, France');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should treat whitespace-only input as empty', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const submitButton = screen.getByRole('button', { name: /Submit/i });

      await user.type(placeNameInput, '   ');

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with trimmed values when form is valid', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const locationInput = screen.getByLabelText(/Location/);
      const submitButton = screen.getByRole('button', { name: /Submit/i });

      await user.type(placeNameInput, '  Eiffel Tower  ');
      await user.type(locationInput, '  Paris, France  ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          placeName: 'Eiffel Tower',
          location: 'Paris, France'
        });
      });
    });

    it('should not call onSubmit when fields are empty', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      
      // Button should be disabled, but try to click anyway
      expect(submitButton).toBeDisabled();
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onValidationError when validation fails', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const locationInput = screen.getByLabelText(/Location/);

      // Fill only one field
      await user.type(placeNameInput, 'Eiffel Tower');
      
      // Try to submit (button will be disabled, but we can test the form submit event)
      const form = placeNameInput.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnValidationError).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const slowSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <MetadataForm
          disabled={false}
          onSubmit={slowSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const locationInput = screen.getByLabelText(/Location/);
      const submitButton = screen.getByRole('button', { name: /Submit/i });

      await user.type(placeNameInput, 'Eiffel Tower');
      await user.type(locationInput, 'Paris, France');
      await user.click(submitButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText(/Submitting/)).toBeInTheDocument();
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.queryByText(/Submitting/)).not.toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Disabled State', () => {
    it('should disable all inputs when disabled prop is true', () => {
      render(
        <MetadataForm
          disabled={true}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const locationInput = screen.getByLabelText(/Location/);
      const submitButton = screen.getByRole('button', { name: /Submit/i });

      expect(placeNameInput).toBeDisabled();
      expect(locationInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      const locationInput = screen.getByLabelText(/Location/);

      expect(placeNameInput).toHaveAttribute('aria-required', 'true');
      expect(locationInput).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when field has error', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      
      await user.click(placeNameInput);
      await user.tab();

      await waitFor(() => {
        expect(placeNameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should associate error message with input using aria-describedby', async () => {
      const user = userEvent.setup();
      render(
        <MetadataForm
          disabled={false}
          onSubmit={mockOnSubmit}
          onValidationError={mockOnValidationError}
        />
      );

      const placeNameInput = screen.getByLabelText(/Place Name/);
      
      await user.click(placeNameInput);
      await user.tab();

      await waitFor(() => {
        expect(placeNameInput).toHaveAttribute('aria-describedby', 'placeName-error');
        expect(screen.getByRole('alert')).toHaveAttribute('id', 'placeName-error');
      });
    });
  });
});
