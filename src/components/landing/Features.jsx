'use client';

import { FileText, Target, BarChart3, Video, DollarSign, Sparkles } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'AI Resume Analyzer',
    description: 'Get instant feedback on your resume with AI-powered analysis and scoring.',
    color: 'blue',
  },
  {
    icon: Target,
    title: 'ATS Optimization',
    description: 'Optimize your resume to pass Applicant Tracking Systems and get noticed.',
    color: 'purple',
  },
  {
    icon: BarChart3,
    title: 'Skill Gap Analysis',
    description: 'Identify missing skills and get personalized recommendations to improve.',
    color: 'green',
  },
  {
    icon: Video,
    title: 'Online Interviews',
    description: 'Conduct or attend video interviews directly on our platform.',
    color: 'red',
  },
  {
    icon: DollarSign,
    title: 'Salary Insights',
    description: 'Get data-driven salary expectations based on your skills and location.',
    color: 'yellow',
  },
  {
    icon: Sparkles,
    title: 'AI Job Matching',
    description: 'Find the perfect job match using advanced AI algorithms.',
    color: 'pink',
  },
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  pink: 'bg-pink-100 text-pink-600',
};

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features to Boost Your Career
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to find the right job or hire the perfect candidate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${colorClasses[feature.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
