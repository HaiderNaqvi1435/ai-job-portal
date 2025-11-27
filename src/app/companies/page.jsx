'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Search,
  MapPin,
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  Star,
  ArrowRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { USER_ROLES, JOB_STATUS } from '@/types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Fetch all recruiter profiles
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', USER_ROLES.RECRUITER)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const recruiters = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch all active jobs to count jobs per company
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('status', '==', JOB_STATUS.ACTIVE)
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobs = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Aggregate company data
        const companyMap = new Map();

        recruiters.forEach(recruiter => {
          const companyName = recruiter.companyName || 'Unknown Company';
          const recruiterId = recruiter.uid;

          if (!companyMap.has(companyName)) {
            companyMap.set(companyName, {
              name: companyName,
              description: recruiter.companyDescription || 'No description available',
              industry: recruiter.industry || 'Technology',
              location: recruiter.location || 'Remote',
              website: recruiter.website || '',
              size: recruiter.companySize || '50-200',
              founded: recruiter.founded || '2020',
              recruiters: [],
              jobCount: 0,
              logo: recruiter.companyLogo || null
            });
          }

          const company = companyMap.get(companyName);
          company.recruiters.push(recruiterId);

          // Count jobs for this recruiter
          const recruiterJobs = jobs.filter(job => job.recruiterId === recruiterId);
          company.jobCount += recruiterJobs.length;
        });

        const companiesData = Array.from(companyMap.values());

        // Sort by job count
        companiesData.sort((a, b) => b.jobCount - a.jobCount);

        // Extract unique industries
        const uniqueIndustries = [...new Set(companiesData.map(c => c.industry))].filter(Boolean);
        setIndustries(uniqueIndustries);

        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (industryFilter && industryFilter !== 'all') {
      filtered = filtered.filter(company => company.industry === industryFilter);
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, industryFilter, companies]);

  const featuredIndustries = [
    { name: 'Technology', icon: Building2, color: 'text-blue-600' },
    { name: 'Finance', icon: TrendingUp, color: 'text-green-600' },
    { name: 'Healthcare', icon: Users, color: 'text-red-600' },
    { name: 'Education', icon: Briefcase, color: 'text-purple-600' },
  ];

  const stats = [
    { label: 'Companies', value: companies.length, icon: Building2 },
    { label: 'Active Jobs', value: companies.reduce((sum, c) => sum + c.jobCount, 0), icon: Briefcase },
    { label: 'Industries', value: industries.length, icon: TrendingUp },
    { label: 'Countries', value: '20+', icon: MapPin },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover Top Companies
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Explore leading companies hiring on our platform and find your perfect workplace
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Industries */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Browse by Industry
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredIndustries.map((industry, index) => {
                const Icon = industry.icon;
                return (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setIndustryFilter(industry.name)}
                  >
                    <CardContent className="pt-6 text-center">
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${industry.color}`} />
                      <p className="font-medium text-gray-900">{industry.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {companies.filter(c => c.industry === industry.name).length} companies
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <div className="bg-white border-b py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-full sm:w-64 h-12">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Companies List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {loading ? 'Loading...' : `${filteredCompanies.length} Companies`}
            </h2>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading companies...</p>
            </div>
          ) : filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 truncate">{company.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{company.location}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mb-3">
                      {company.industry}
                    </Badge>
                    <CardDescription className="line-clamp-2 mb-4">
                      {company.description}
                    </CardDescription>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Company Size
                        </span>
                        <span className="font-medium">{company.size} employees</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          Open Positions
                        </span>
                        <span className="font-medium text-blue-600">{company.jobCount} jobs</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" disabled={company.jobCount === 0}>
                        View Jobs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      {company.website && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(company.website, '_blank')}
                        >
                          Website
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No companies found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setIndustryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Is Your Company Hiring?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies finding top talent on our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  Post Your First Job
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Learn More
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
