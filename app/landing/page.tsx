"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Archive,
  Shield,
  Upload,
  Mail,
  HardDrive,
  Eye,
  FileText,
  ImageIcon,
  Video,
  Music,
  ArrowRight,
  CheckCircle,
  Globe,
  Users,
  Sparkles,
  Zap,
  Cloud,
  Star,
  Layers,
  Infinity,
  Lock,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isNavFloating, setIsNavFloating] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsNavFloating(currentScrollY > 100)
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    }, observerOptions)

    // Observe all scroll-fade-in elements
    const elements = document.querySelectorAll(".scroll-fade-in")
    elements.forEach((el) => observer.observe(el))

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [])

  const features = [
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Personal Dumpyard",
      description: "Your private digital space to dump any type of file, document, or data without restrictions.",
      color: "from-gray-500 to-gray-700",
      delay: "0s",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secret & Secure",
      description: "Access your files with password protection. Only you can access your digital identity.",
      color: "from-gray-600 to-gray-800",
      delay: "0.2s",
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Unlimited File Types",
      description: "Images, videos, documents, code, archives - dump anything up to 100MB per file.",
      color: "from-gray-700 to-gray-900",
      delay: "0.4s",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Access",
      description: "Download your files anytime, anywhere. Bulk download multiple files as ZIP archives.",
      color: "from-gray-500 to-gray-700",
      delay: "0.6s",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Preview Everything",
      description: "Preview images, videos, PDFs, and text files directly in your browser.",
      color: "from-gray-600 to-gray-800",
      delay: "0.8s",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Cloud Powered",
      description: "Built on Vercel's infrastructure with enterprise-grade reliability and speed.",
      color: "from-gray-700 to-gray-900",
      delay: "1s",
    },
  ]

  const fileTypes = [
    {
      icon: <ImageIcon className="w-6 h-6" />,
      name: "Images",
      types: "JPG, PNG, GIF, SVG",
      color: "from-gray-400 to-gray-600",
    },
    {
      icon: <Video className="w-6 h-6" />,
      name: "Videos",
      types: "MP4, AVI, MOV, MKV",
      color: "from-gray-500 to-gray-700",
    },
    {
      icon: <Music className="w-6 h-6" />,
      name: "Audio",
      types: "MP3, WAV, FLAC, AAC",
      color: "from-gray-600 to-gray-800",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      name: "Documents",
      types: "PDF, DOC, TXT, MD",
      color: "from-gray-400 to-gray-600",
    },
    {
      icon: <Archive className="w-6 h-6" />,
      name: "Archives",
      types: "ZIP, RAR, 7Z, TAR",
      color: "from-gray-500 to-gray-700",
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      name: "Any File",
      types: "No restrictions",
      color: "from-gray-600 to-gray-800",
    },
  ]

  // Create floating letter components for ByteBox
  const createFloatingLetters = (text: string, baseDelay = 0) => {
    return text.split("").map((letter, index) => (
      <span
        key={index}
        className="letter-float"
        style={{
          animationDelay: `${baseDelay + index * 0.1}s`,
          animationDuration: `${2 + Math.random()}s`,
        }}
      >
        {letter}
      </span>
    ))
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-20 left-10 w-20 h-20 bg-gray-200/30 rounded-full float-animation"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-gray-300/20 rounded-full float-slow"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute bottom-40 left-20 w-24 h-24 bg-gray-400/20 rounded-full float-animation"
          style={{ animationDelay: "2s", transform: `translateY(${scrollY * 0.08}px)` }}
        />
        <div
          className="absolute bottom-20 right-40 w-12 h-12 bg-gray-500/20 rounded-full float-slow"
          style={{ animationDelay: "1s", transform: `translateY(${scrollY * 0.12}px)` }}
        />
      </div>

      {/* Floating Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isNavFloating
            ? "floating-nav visible bg-white/80 backdrop-blur-md border-b shadow-lg"
            : "relative bg-white/80 backdrop-blur-md border-b"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow">
                <Archive className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text-bw">ByteBox</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button className="hover-lift" onClick={() => router.push("/signup")}>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative" style={{ paddingTop: isNavFloating ? "120px" : "80px" }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium mb-8 hover-lift scroll-fade-in">
              <Lock className="w-4 h-4 icon-bounce" />
              Your Personal Secret Dumpyard
            </div>

            {/* Dynamic ByteBox Heading */}
            <div className="mb-6 scroll-fade-in">
              <h1 className="text-4xl sm:text-8xl font-bold text-gray-900 mb-4 title-pulse">
                <div className="mb-2">Your Digital</div>
                <div className="text-6xl sm:text-9xl">
                  <span className="gradient-text-bw bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {createFloatingLetters("Byte")}
                  </span>
                  <span className="gradient-text-bw bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent">
                    {createFloatingLetters("Box", 0.4)}
                  </span>
                </div>
              </h1>

              {/* Animated subtitle */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary icon-bounce" />
                <p className="text-2xl font-semibold text-gray-700">Secure • Protected • Private</p>
                <Sparkles className="w-6 h-6 text-primary icon-bounce" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed scroll-fade-in">
              ByteBox is your personal, password-protected online dumpyard where you can store any type of file,
              document, or data. Access everything through your secure ByteMail - protected by advanced security
              features.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 scroll-fade-in">
            <Button
              size="lg"
              className="text-lg px-8 py-6 hover-lift pulse-glow"
              onClick={() => router.push("/signup")}
            >
              <Lock className="w-5 h-5 mr-2 icon-bounce" />
              Create Your ByteBox
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover-lift">
              <Eye className="w-5 h-5 mr-2 icon-bounce" />
              See How It Works
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto scroll-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border p-8 hover-lift">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {fileTypes.map((type, index) => (
                  <Card
                    key={index}
                    className={`p-6 hover-lift float-animation`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <CardContent className="p-0 text-center">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mx-auto mb-3 icon-bounce`}
                      >
                        <div className="text-white">{type.icon}</div>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">{type.name}</h4>
                      <p className="text-xs text-gray-600">{type.types}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 float-animation">
              Why Choose <span className="gradient-text-bw">ByteBox</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More than just storage - it's your personal digital sanctuary where privacy meets convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-8 hover-lift cursor-pointer transition-all duration-500 float-animation scroll-fade-in ${
                  hoveredFeature === index ? "scale-105 shadow-xl" : ""
                }`}
                style={{ animationDelay: feature.delay }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-0">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 icon-bounce`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ByteMail Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="float-animation scroll-fade-in">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
                Access via Secure
                <span className="block gradient-text-bw">ByteMail</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your ByteMail is your secure identity for your digital dumpyard. Protected by a strong password that
                only you know, with advanced security features to keep your data safe.
              </p>
              <div className="space-y-4">
                {[
                  "Password-protected authentication",
                  "Advanced security features",
                  "Account lockout protection",
                  "Secure JWT sessions",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 float-animation scroll-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative float-slow scroll-fade-in">
              <Card className="p-8 shadow-2xl hover-lift">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow">
                      <Mail className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900">Secure Login</h3>
                    <div className="bg-gray-50 rounded-xl p-4 mb-3 border">
                      <p className="text-gray-600">your.secret@email.com</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border">
                      <p className="text-gray-600">••••••••••</p>
                    </div>
                    <Button className="w-full hover-lift" onClick={() => router.push("/login")}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Access Your Dumpyard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              {
                value: "100MB",
                label: "Max file size",
                icon: <Upload className="w-8 h-8" />,
                color: "from-gray-400 to-gray-600",
              },
              {
                value: "15GB",
                label: "Free storage",
                icon: <HardDrive className="w-8 h-8" />,
                color: "from-gray-500 to-gray-700",
              },
              {
                value: <Infinity className="w-12 h-12" />,
                label: "File types supported",
                icon: <Star className="w-8 h-8" />,
                color: "from-gray-600 to-gray-800",
              },
              {
                value: "24/7",
                label: "Access anytime",
                icon: <Globe className="w-8 h-8" />,
                color: "from-gray-700 to-gray-900",
              },
            ].map((stat, index) => (
              <div key={index} className="float-animation scroll-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow`}
                >
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="float-animation scroll-fade-in">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to Create Your Secret Dumpyard?</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of users who trust ByteBox with their digital files. Start dumping your files securely
              today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 hover-lift"
                onClick={() => router.push("/login")}
              >
                <Lock className="w-5 h-5 mr-2" />
                Secure Login
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-gray-900 hover-lift"
              >
                <Users className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="float-animation scroll-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Archive className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">ByteBox</span>
              </div>
              <p className="text-gray-400">Your personal secure dumpyard for all digital files.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Security", "Pricing"] },
              { title: "Support", links: ["Help Center", "Contact", "Status"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((section, index) => (
              <div key={index} className="float-animation scroll-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 scroll-fade-in">
            <p>&copy; 2024 ByteBox. All rights reserved. Built with ❤️ for digital privacy.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
