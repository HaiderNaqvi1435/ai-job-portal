'use client';

import { UserPlus, FileSearch, Target, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up and build your professional profile in minutes.',
    step: '01',
  },
  {
    icon: FileSearch,
    title: 'Upload & Optimize Resume',
    description: 'Get AI-powered analysis and optimization for your resume.',
    step: '02',
  },
  {
    icon: Target,
    title: 'Find Perfect Matches',
    description: 'Browse jobs tailored to your skills and preferences.',
    step: '03',
  },
  {
    icon: CheckCircle,
    title: 'Apply & Get Hired',
    description: 'Apply with confidence and track your applications.',
    step: '04',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in 4 simple steps and find your dream job
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-lg shadow-md h-full">
                  <div className="absolute -top-4 -left-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  <div className="mt-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-blue-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
