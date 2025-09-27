import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/UI/Button';
import { ArrowRight, TrendingUp, Shield, Globe, Users, Zap, Star, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/UI/ThemeToggle';
import AnimatedBackground from '../components/UI/AnimatedBackground';
import AuthStatus from '../components/Auth/AuthStatus';

const Landing: React.FC = () => {
  console.log('Landing page rendered - user was redirected here');
  const features = [
    {
      icon: TrendingUp,
      title: 'Digital & Real-World Assets',
      description: 'Trade digital art, NFTs, and tokenized African real estate in one platform'
    },
    {
      icon: Shield,
      title: 'Professional Verification',
      description: 'Expert attestors verify asset authenticity and value for RWA assets'
    },
    {
      icon: Globe,
      title: 'Global Investment Access',
      description: 'Connect African assets with international investors worldwide'
    },
    {
      icon: Users,
      title: 'Enhanced Minting',
      description: 'Create collections, batch mint, and add rarity to your digital assets'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$12.4M', change: '+34.2%' },
    { label: 'Active Assets', value: '156', change: '+12%' },
    { label: 'Verified Attestors', value: '23', change: '+8.5%' },
    { label: 'Countries', value: '8', change: 'New' }
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect & Browse',
      description: 'Connect your wallet and browse digital art, NFTs, and real-world assets'
    },
    {
      number: '02',
      title: 'Create Digital Assets',
      description: 'Mint digital art, NFTs, and collections instantly with enhanced minting features'
    },
    {
      number: '03',
      title: 'List RWA Assets',
      description: 'Submit real-world assets for professional verification and tokenization'
    },
    {
      number: '04',
      title: 'Trade & Invest',
      description: 'Investors worldwide can purchase tokens and track performance'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-off-white relative overflow-hidden dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">TB</span>
              </div>
              <span className="text-lg font-semibold text-off-white">TrustBridge</span>
            </div>

            {/* Auth Status */}
            <div className="flex items-center space-x-4">
              <AuthStatus />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neon-green triangle floating"></div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-neon-green">TrustBridge</h1>
              <p className="text-xs text-electric-mint uppercase tracking-wider">Africa</p>
            </div>
          </div>
          
          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="#assets" className="text-off-white hover:text-neon-green transition-colors text-sm xl:text-base">Assets</a>
            <a href="#communities" className="text-off-white hover:text-neon-green transition-colors text-sm xl:text-base">Communities</a>
            <a href="#features" className="text-off-white hover:text-neon-green transition-colors text-sm xl:text-base">Features</a>
            <a href="#how-it-works" className="text-off-white hover:text-neon-green transition-colors text-sm xl:text-base">How It Works</a>
            <ThemeToggle />
            <Link to="/get-test-tokens">
              <Button variant="ghost" size="sm">Get Test Tokens</Button>
            </Link>
            <Link to="/auth">
              <Button variant="neon" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Tablet Navigation */}
          <div className="hidden md:flex lg:hidden items-center gap-3">
            <ThemeToggle />
            <Link to="/get-test-tokens">
              <Button variant="ghost" size="sm">Get Test Tokens</Button>
            </Link>
            <Link to="/auth">
              <Button variant="neon" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Link to="/get-test-tokens">
              <Button variant="ghost" size="sm">Test Tokens</Button>
            </Link>
            <Link to="/auth">
              <Button variant="neon" size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 min-h-screen flex items-center">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/countryside-people-out-field-together.jpg"
              alt="African farmers working together in vibrant green fields"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 dark:from-black/80 dark:via-black/60 dark:to-black/40 light:from-white/80 light:via-white/60 light:to-white/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent dark:from-black/90 light:from-white/90"></div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 border border-neon-green/30 rounded-full opacity-60 rotating"></div>
            <div className="absolute bottom-32 left-16 w-24 h-24 border border-electric-mint/30 rounded-full opacity-40 rotating" style={{ animationDirection: 'reverse' }}></div>
            <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-electric-mint rounded-full opacity-70 floating"></div>
            <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-neon-green rounded-full opacity-60 floating" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-2/3 right-1/3 w-20 h-20 border border-neon-green/20 morphing-shape opacity-30"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Zap className="w-4 h-4 text-neon-green" />
                <span className="text-sm font-semibold text-neon-green uppercase tracking-wider">Live on Hedera</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                <motion.span 
                  className="block text-neon-green drop-shadow-2xl dark:text-neon-green light:text-neon-green"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  AFRICAN
                </motion.span>
                <motion.span 
                  className="block text-electric-mint drop-shadow-2xl dark:text-electric-mint light:text-electric-mint"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  DIGITAL & REAL-WORLD
                </motion.span>
                <motion.span 
                  className="block text-white outlined-text drop-shadow-2xl dark:text-white light:text-black"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  ASSETS
                </motion.span>
              </h1>

              <motion.p 
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12 leading-relaxed drop-shadow-lg dark:text-white/90 light:text-black/90 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Discover, create, and trade digital art, NFTs, and real-world African assets in one unified marketplace. 
                <span className="text-neon-green font-bold dark:text-neon-green light:text-neon-green"> TrustBridge</span> connects creators, investors, and communities through blockchain technology.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Link to="/dashboard/marketplace">
                  <Button variant="primary" size="lg" className="group w-full sm:w-auto">
                    Launch App
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/dashboard/marketplace">
                  <Button variant="outline" size="lg" className="group w-full sm:w-auto">
                    Browse Assets
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 sm:p-6 bg-black/40 backdrop-blur-md rounded-xl border border-neon-green/30 hover:border-neon-green/50 transition-all duration-300 hover:scale-105 dark:bg-black/40 light:bg-white/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-neon-green mb-1 sm:mb-2 drop-shadow-lg dark:text-neon-green light:text-neon-green">{stat.value}</h3>
                  <p className="text-xs sm:text-sm text-white/80 mb-1 dark:text-white/80 light:text-black/80">{stat.label}</p>
                  <p className="text-xs text-electric-mint font-semibold dark:text-electric-mint light:text-electric-mint">{stat.change}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* African Assets Showcase */}
        <section id="assets" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
                <span className="text-electric-mint dark:text-electric-mint light:text-electric-mint">REAL AFRICAN</span>
                <br />
                <span className="text-neon-green dark:text-neon-green light:text-neon-green">ASSETS</span>
              </h2>
              <p className="text-lg sm:text-xl text-off-white/70 max-w-3xl mx-auto dark:text-off-white/70 light:text-black/70 px-4">
                Discover tokenized African farms, properties, and infrastructure assets available for global investment.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  title: 'Maize Farm - Kenya',
                  location: 'Nyeri County, Kenya',
                  value: '$2.4M',
                  image: '/images/countryside-workers-together-field.jpg',
                  type: 'Agriculture',
                  tokenized: true,
                  investors: 47
                },
                {
                  title: 'Coffee Plantation - Mount Kenya',
                  location: 'Mount Kenya Region',
                  value: '$5.8M',
                  image: '/images/1trs.jpeg',
                  type: 'Agriculture',
                  tokenized: true,
                  investors: 89
                },
                {
                  title: 'Commercial Building - Lagos',
                  location: 'Victoria Island, Nigeria',
                  value: '$12.5M',
                  image: '/images/2trs.jpg',
                  type: 'Real Estate',
                  tokenized: true,
                  investors: 156
                },
                {
                  title: 'Solar Farm - South Africa',
                  location: 'Northern Cape',
                  value: '$18.7M',
                  image: '/images/3trs.webp',
                  type: 'Infrastructure',
                  tokenized: true,
                  investors: 234
                }
              ].map((asset, index) => (
                <motion.div
                  key={asset.title}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-dark-gray border border-medium-gray hover:border-neon-green/50 transition-all duration-300">
                    {/* Image */}
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-neon-green">
                          <span className="text-lg">
                            {asset.type === 'Agriculture' ? '🌾' : 
                             asset.type === 'Real Estate' ? '🏢' : 
                             asset.type === 'Infrastructure' ? '⚡' : '📦'}
                          </span>
                          {asset.type}
                        </span>
                      </div>

                      {/* Tokenized Badge */}
                      {asset.tokenized && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neon-green/20 text-neon-green border border-neon-green/30">
                            <Shield className="w-3 h-3" />
                            Tokenized
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-off-white mb-2 group-hover:text-neon-green transition-colors">
                        {asset.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-medium-gray mb-3">
                        <MapPin className="w-4 h-4" />
                        {asset.location}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-neon-green">
                          {asset.value}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-medium-gray">
                          <Users className="w-4 h-4" />
                          {asset.investors}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link to="/dashboard/assets">
                <Button variant="outline" size="lg" className="group">
                  View All Assets
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* African Communities Section */}
        <section id="communities" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 dark:bg-gradient-to-br dark:from-deep-forest/20 dark:to-black light:bg-gray-50 relative">
          {/* Section Separator */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-mint/30 to-transparent"></div>
          
          {/* Text Readability Overlay */}
          <div className="absolute inset-0 dark:bg-black/20 light:bg-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-6">
                <div className="w-16 h-1 bg-gradient-to-r from-neon-green to-electric-mint mx-auto mb-4"></div>
                <h2 className="text-4xl lg:text-6xl font-bold">
                  <span className="text-neon-green dark:text-neon-green light:text-neon-green">EMPOWERING</span>
                  <br />
                  <span className="text-electric-mint dark:text-electric-mint light:text-electric-mint">AFRICAN COMMUNITIES</span>
                </h2>
              </div>
              <p className="text-xl text-off-white/70 max-w-3xl mx-auto dark:text-off-white/70 light:text-gray-800 dark:drop-shadow-lg">
                Real people, real stories. See how TrustBridge is transforming lives across Africa through asset tokenization.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Grace Mwangi',
                  role: 'Coffee Farmer',
                  location: 'Mount Kenya, Kenya',
                  story: 'Tokenized my 50-acre coffee farm and now have 200+ global investors supporting my business.',
                  image: '/images/medium-shot-man-wearing-native-attire.jpg',
                  value: '$2.1M'
                },
                {
                  name: 'Ahmed Hassan',
                  role: 'Property Developer',
                  location: 'Lagos, Nigeria',
                  story: 'My commercial building in Victoria Island is now accessible to international investors.',
                  image: '/images/4trs.jpeg',
                  value: '$8.5M'
                },
                {
                  name: 'Thabo Mthembu',
                  role: 'Solar Engineer',
                  location: 'Cape Town, South Africa',
                  story: 'Our solar farm project now has global backing, bringing clean energy to 50,000 homes.',
                  image: '/images/pexels-fatima-yusuf-323522203-30541315.jpg',
                  value: '$15.2M'
                }
              ].map((person, index) => (
                <motion.div
                  key={person.name}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-dark-gray border border-neon-green/20 hover:border-neon-green/40 transition-all duration-300 dark:bg-dark-gray light:bg-white light:shadow-lg">
                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Value Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-neon-green/20 text-neon-green border border-neon-green/30">
                          {person.value}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-off-white mb-1 dark:text-off-white light:text-gray-900">{person.name}</h3>
                      <p className="text-electric-mint font-medium mb-2 dark:text-electric-mint light:text-electric-mint">{person.role}</p>
                      <div className="flex items-center gap-2 text-sm text-medium-gray mb-4 dark:text-medium-gray light:text-gray-700">
                        <MapPin className="w-4 h-4" />
                        {person.location}
                      </div>
                      <p className="text-off-white/80 text-sm leading-relaxed italic dark:text-off-white/80 light:text-gray-800">
                        "{person.story}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-dark-gray/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="text-neon-green dark:text-neon-green light:text-neon-green">WHY</span>
                <span className="text-electric-mint dark:text-electric-mint light:text-electric-mint"> TRUSTBRIDGE</span>
              </h2>
              <p className="text-xl text-off-white/70 max-w-3xl mx-auto dark:text-off-white/70 light:text-black/70">
                We're building the future of African finance through blockchain technology and professional verification.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    className="text-center p-6 bg-dark-gray/30 rounded-xl border border-neon-green/20 hover:border-neon-green/40 transition-all duration-300 hover:scale-105"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                  >
                    <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-neon-green" />
                    </div>
                    <h3 className="text-xl font-bold text-off-white mb-3">{feature.title}</h3>
                    <p className="text-off-white/70">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="text-electric-mint dark:text-electric-mint light:text-electric-mint">HOW IT</span>
                <span className="text-neon-green dark:text-neon-green light:text-neon-green"> WORKS</span>
              </h2>
              <p className="text-xl text-off-white/70 max-w-3xl mx-auto dark:text-off-white/70 light:text-black/70">
                From asset listing to global investment in four simple steps.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-electric-mint rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-black">{step.number}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-neon-green to-electric-mint transform translate-x-4"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-off-white mb-3">{step.title}</h3>
                  <p className="text-off-white/70">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="text-neon-green dark:text-neon-green light:text-neon-green">READY TO</span>
                <br />
                <span className="text-electric-mint dark:text-electric-mint light:text-electric-mint">GET STARTED?</span>
              </h2>
              <p className="text-xl text-off-white/70 mb-12 dark:text-off-white/70 light:text-black/70">
                Join the future of African finance. Start investing or list your asset today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button variant="primary" size="lg" className="group">
                    <Zap className="w-5 h-5 mr-2" />
                    Start Investing
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="group">
                  <Users className="w-5 h-5 mr-2" />
                  List Your Asset
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-neon-green/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-neon-green triangle floating"></div>
                <div>
                  <h3 className="text-lg font-bold text-neon-green">TrustBridge</h3>
                  <p className="text-xs text-electric-mint uppercase tracking-wider">Africa</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-off-white/70">© 2024 TrustBridge Africa</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-neon-green">Live on Hedera</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
