import type { ProjectCreationForm } from '@cgames/types';

export function validateStep(step: number, formData: ProjectCreationForm): boolean {
  switch (step) {
    case 1:
      return !!(formData.name && formData.position && formData.department);
    case 2:
      return !!(formData.roleTitle);
    case 3:
      return !!(formData.managementStyle);
    case 4:
      return true; // Step 4 has no required fields
    default:
      return false;
  }
}

export function validateField(field: keyof ProjectCreationForm, value: any): string | null {
  switch (field) {
    case 'name':
      if (!value || value.trim().length < 3) {
        return 'Project name must be at least 3 characters long';
      }
      break;
    case 'position':
      if (!value || value.trim().length < 2) {
        return 'Position title is required';
      }
      break;
    case 'department':
      if (!value || value.trim().length < 2) {
        return 'Department is required';
      }
      break;
    case 'deadline':
      if (value && new Date(value) < new Date()) {
        return 'Deadline cannot be in the past';
      }
      break;
    default:
      break;
  }
  return null;
}

export function validateForm(formData: ProjectCreationForm): string[] {
  const errors: string[] = [];
  
  const nameError = validateField('name', formData.name);
  if (nameError) errors.push(nameError);
  
  const positionError = validateField('position', formData.position);
  if (positionError) errors.push(positionError);
  
  const departmentError = validateField('department', formData.department);
  if (departmentError) errors.push(departmentError);
  
  const deadlineError = validateField('deadline', formData.deadline);
  if (deadlineError) errors.push(deadlineError);
  
  return errors;
} 