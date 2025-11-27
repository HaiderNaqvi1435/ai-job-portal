'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Target,
  Eye,
  Heart,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { label: 'Active Jobs', value: '10,000+', icon: Briefcase },
    { label: 'Companies', value: '5,000+', icon: Users },
    { label: 'Job Seekers', value: '50,000+', icon: Globe },
    { label: 'Success Rate', value: '95%', icon: TrendingUp },
  ];

  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to revolutionize the job search and recruitment process.'
    },
    {
      icon: Heart,
      title: 'Transparency',
      description: 'We believe in honest communication and clear expectations for both job seekers and employers.'
    },
    {
      icon: Shield,
      title: 'Quality',
      description: 'We ensure every job posting meets our high standards and every candidate is properly vetted.'
    },
    {
      icon: Users,
      title: 'Inclusivity',
      description: 'We create equal opportunities for everyone, regardless of background or experience level.'
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      description: 'Our advanced algorithms match candidates with the perfect opportunities based on skills, experience, and preferences.'
    },
    {
      icon: Award,
      title: 'Resume Analysis',
      description: 'Get instant feedback on your resume with our AI-powered ATS optimization and skill gap analysis.'
    },
    {
      icon: Globe,
      title: 'Video Interviews',
      description: 'Conduct seamless online interviews with built-in video conferencing and recording capabilities.'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Access personalized learning recommendations and career development resources.'
    },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/team/ceo.jpg',
      description: '15+ years in HR tech and talent acquisition'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/team/cto.jpg',
      description: 'AI/ML expert with background in recruitment tech'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: '/team/product.jpg',
      description: 'Product strategist focused on user experience'
    },
    {
      name: 'David Kim',
      role: 'Head of Partnerships',
      image: '/team/partnerships.jpg',
      description: 'Building relationships with leading companies'
    },
  ];

  const milestones = [
    { year: '2020', event: 'Company Founded', description: 'Started with a vision to transform recruitment' },
    { year: '2021', event: '1,000 Companies', description: 'Reached our first major milestone' },
    { year: '2022', event: 'AI Integration', description: 'Launched advanced AI matching algorithms' },
    { year: '2023', event: '50,000 Users', description: 'Built a thriving community of job seekers' },
    { year: '2024', event: 'Global Expansion', description: 'Expanded to 20+ countries worldwide' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Transforming Career Opportunities with AI
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                We're on a mission to connect talented professionals with their dream jobs
                using cutting-edge artificial intelligence and innovative technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/jobs">
                  <Button size="lg" variant="secondary">
                    Explore Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/companies">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                    View Companies
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="border-t-4 border-t-blue-600">
                <CardContent className="pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    To empower individuals and organizations by creating seamless connections
                    between talent and opportunity. We leverage artificial intelligence to make
                    the job search process more efficient, transparent, and successful for everyone
                    involved.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-indigo-600">
                <CardContent className="pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Eye className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    To become the world's most trusted AI-powered job platform, where every
                    professional finds their perfect career match and every company builds their
                    dream team. We envision a future where technology eliminates barriers in
                    recruitment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do and shape our culture
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full mb-4">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide powerful tools and features that make job searching and hiring easier
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Major milestones in our mission to transform recruitment
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 hidden md:block" />

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="flex-1 md:pr-8 md:pl-8">
                      <Card className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.event}</h3>
                          <p className="text-gray-600">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white hidden md:block" />

                    <div className="flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The passionate people behind our success
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-16 w-16 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals and companies who trust our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
