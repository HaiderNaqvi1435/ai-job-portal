import { z } from 'zod';
import { USER_ROLES, JOB_STATUS, APPLICATION_STATUS } from '@/types';

// User Profile Schema
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum([USER_ROLES.JOB_SEEKER, USER_ROLES.RECRUITER]),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),

  // Job Seeker specific
  skills: z.array(z.string()).optional(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string(),
    description: z.string().optional(),
  })).optional(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
  })).optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),

  // Recruiter specific
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companySize: z.string().optional(),
  industry: z.string().optional(),
});

// Job Schema
export const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  responsibilities: z.array(z.string()).min(1, 'Add at least one responsibility'),
  requirements: z.array(z.string()).min(1, 'Add at least one requirement'),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  location: z.string().min(2, 'Location is required'),
  locationType: z.enum(['remote', 'onsite', 'hybrid']),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  benefits: z.array(z.string()).optional(),
  status: z.enum([JOB_STATUS.ACTIVE, JOB_STATUS.CLOSED, JOB_STATUS.DRAFT]).default(JOB_STATUS.ACTIVE),
});

// Application Schema
export const applicationSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').optional(),
  resumeUrl: z.string().url('Valid resume URL is required'),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Register Schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum([USER_ROLES.JOB_SEEKER, USER_ROLES.RECRUITER]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// AI Job Generation Schema
export const aiJobGenerationSchema = z.object({
  jobTitle: z.string().min(3, 'Job title is required'),
  companyIndustry: z.string().min(2, 'Industry is required'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']),
  keySkills: z.string().min(10, 'Provide key skills (comma-separated)'),
  location: z.string().min(2, 'Location is required'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
});

// Resume Upload Schema
export const resumeUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5000000,
    'File size should be less than 5MB'
  ).refine(
    (file) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
    'Only PDF and DOC/DOCX files are allowed'
  ),
});
