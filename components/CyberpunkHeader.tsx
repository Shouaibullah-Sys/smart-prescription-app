// components/CyberpunkHeader.tsx - Fixed Version
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Home,
  User,
  LogOut,
  UserCheck,
  Activity,
  History,
  BrainCircuit,
  FlaskConical,
  Stethoscope,
  Pill,
  ChevronDown,
  FileText,
  HeartPulse,
  Cpu,
  Shield,
  Network,
  AlertTriangle,
  BatteryCharging,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

interface CyberpunkHeaderProps {
  todayPrescriptions?: number;
  monthlyPrescriptions?: number;
  onLogout?: () => void;
  systemStatus?: "optimal" | "warning" | "critical";
  cpuUsage?: number;
  networkLatency?: number;
}

interface NavigationItem {
  id: string;
  label: string;
  shortLabel: string; // Added short label for compact view
  icon: React.ReactNode;
  sectionId: string;
  alert?: boolean;
}

export function CyberpunkHeader({
  todayPrescriptions = 0,
  monthlyPrescriptions = 0,
  onLogout,
  systemStatus = "optimal",
  cpuUsage = 42,
  networkLatency = 24,
}: CyberpunkHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const [cyberEffects, setCyberEffects] = useState({
    scanlinePosition: 0,
    glowIntensity: 0.3,
    matrixRain: [] as Array<{ x: number; speed: number; opacity: number }>,
  });

  const headerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme } = useTheme();

  // Compact navigation items for better fit
  const navigationItems: NavigationItem[] = [
    {
      id: "patient-info",
      label: "BIOMETRIC DATA",
      shortLabel: "PATIENT",
      icon: <UserCheck className="h-4 w-4" />,
      sectionId: "patient-information",
    },
    {
      id: "chief-complaint",
      label: "SYMPTOMS LOG",
      shortLabel: "SYMPTOMS",
      icon: <FileText className="h-4 w-4" />,
      sectionId: "chief-complaint",
    },
    {
      id: "medical-history",
      label: "DATA ARCHIVES",
      shortLabel: "HISTORY",
      icon: <History className="h-4 w-4" />,
      sectionId: "medical-history",
    },
    {
      id: "vital-signs",
      label: "NEURAL MONITOR",
      shortLabel: "VITALS",
      icon: <Activity className="h-4 w-4" />,
      sectionId: "vital-signs",
      alert: todayPrescriptions > 50,
    },
    {
      id: "system-exams",
      label: "SYSTEM SCAN",
      shortLabel: "SCAN",
      icon: <BrainCircuit className="h-4 w-4" />,
      sectionId: "system-examinations",
    },
    {
      id: "medical-tests",
      label: "LAB ANALYSIS",
      shortLabel: "TESTS",
      icon: <FlaskConical className="h-4 w-4" />,
      sectionId: "medical-tests",
    },
    {
      id: "diagnosis",
      label: "CLINICAL ANALYSIS",
      shortLabel: "DIAGNOSIS",
      icon: <Stethoscope className="h-4 w-4" />,
      sectionId: "diagnosis",
    },
    {
      id: "doctor-info",
      label: "OPERATOR PROFILE",
      shortLabel: "DOCTOR",
      icon: <User className="h-4 w-4" />,
      sectionId: "doctor-info",
    },
    {
      id: "medications",
      label: "CHEMICAL DEPLOY",
      shortLabel: "RX",
      icon: <Pill className="h-4 w-4" />,
      sectionId: "medications-table",
      alert: monthlyPrescriptions > 300,
    },
    {
      id: "follow-up",
      label: "MONITORING",
      shortLabel: "FOLLOW-UP",
      icon: <HeartPulse className="h-4 w-4" />,
      sectionId: "follow-up",
    },
  ];

  // Interactive glow effect on mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (glowRef.current) {
      const rect = glowRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      glowRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, 
        rgba(0, 255, 255, 0.15), 
        rgba(0, 200, 255, 0.1) 40%, 
        transparent 70%)`;
    }
  };

  // Cyberpunk effects initialization
  useEffect(() => {
    setMounted(true);

    // Initialize matrix rain particles
    const particles = Array.from({ length: 15 }, (_, i) => ({
      x: Math.random() * 100,
      speed: 0.5 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.2,
    }));
    setCyberEffects((prev) => ({ ...prev, matrixRain: particles }));

    // Animate scanline
    const scanlineInterval = setInterval(() => {
      setCyberEffects((prev) => ({
        ...prev,
        scanlinePosition: (prev.scanlinePosition + 0.5) % 100,
      }));
    }, 16);

    // Scroll handling with enhanced effects
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const progress = Math.min(scrollPosition / 100, 1);

      setScrollProgress(progress);
      setIsScrolled(scrollPosition > 20);

      // Dynamic glow intensity based on scroll
      setCyberEffects((prev) => ({
        ...prev,
        glowIntensity: 0.3 + progress * 0.5,
      }));

      // Determine active section
      const sections = navigationItems.map((item) => item.sectionId);
      let currentSection = "";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = sectionId;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(scanlineInterval);
    };
  }, []);

  // Cyberpunk color scheme
  const getCyberpunkColors = () => {
    const isDark = theme === "dark";
    return {
      // Primary cyberpunk colors
      primaryGlow: "rgba(0, 255, 255, 0.8)",
      secondaryGlow: "rgba(255, 0, 255, 0.6)",
      accentGlow: "rgba(0, 200, 255, 0.7)",

      // Background gradients
      bgFrom: isDark ? "rgba(10, 15, 35, 0.95)" : "rgba(230, 240, 255, 0.95)",
      bgTo: isDark ? "rgba(5, 10, 25, 0.98)" : "rgba(210, 225, 245, 0.98)",

      // Border effects
      borderGlow: isDark ? "rgba(0, 255, 255, 0.3)" : "rgba(0, 150, 255, 0.2)",
      borderInner: isDark
        ? "rgba(255, 0, 255, 0.15)"
        : "rgba(200, 0, 255, 0.1)",

      // Text colors
      textPrimary: isDark ? "#00ffff" : "#0066cc",
      textSecondary: isDark ? "#ff00ff" : "#9900cc",
      textMuted: isDark ? "#88aaff" : "#667799",

      // Status colors
      statusOptimal: "#00ff88",
      statusWarning: "#ffaa00",
      statusCritical: "#ff0044",

      // Data visualization
      dataBar: isDark ? "rgba(0, 200, 255, 0.5)" : "rgba(0, 150, 255, 0.3)",
      dataGlow: isDark ? "rgba(0, 255, 255, 0.3)" : "rgba(0, 200, 255, 0.2)",
    };
  };

  const colors = getCyberpunkColors();

  // Calculate dynamic values
  const scaleValue = 1 - scrollProgress * 0.12;
  const opacityValue = 1 - scrollProgress * 0.03;
  const translateYValue = -15 * (1 - Math.min(scrollProgress * 4, 1));
  const widthValue = 100 - scrollProgress * 15;
  const blurValue = Math.min(scrollProgress * 8, 8);
  const borderRadiusValue = Math.min(scrollProgress * 12, 12);

  // Cyberpunk data visualization component - Compact version
  const DataBar = ({
    value,
    max = 100,
    label,
  }: {
    value: number;
    max?: number;
    label: string;
  }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="flex flex-col gap-0.5 min-w-[40px]">
        <div className="text-[9px] font-mono text-cyber-muted">{label}</div>
        <div className="relative h-1.5 bg-black/20 rounded-full overflow-hidden border border-cyber-border/20">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${colors.dataBar}, ${colors.primaryGlow})`,
              boxShadow: `0 0 4px ${colors.dataGlow}`,
            }}
          />
        </div>
        <div className="text-[9px] font-mono text-cyber-primary self-end">
          {value}
        </div>
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  // Compact system status indicator
  const StatusIndicator = ({ status }: { status: string }) => {
    const statusConfig = {
      optimal: {
        color: colors.statusOptimal,
        label: "OK",
        icon: <Shield className="h-3 w-3" />,
      },
      warning: {
        color: colors.statusWarning,
        label: "WARN",
        icon: <AlertTriangle className="h-3 w-3" />,
      },
      critical: {
        color: colors.statusCritical,
        label: "CRIT",
        icon: <AlertTriangle className="h-3 w-3" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.optimal;

    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/20 border border-cyber-border/30">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{
            backgroundColor: config.color,
            boxShadow: `0 0 4px ${config.color}`,
          }}
        />
        <span className="text-[9px] font-mono" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>
    );
  };

  if (!mounted) {
    return (
      <header className="w-full border-b border-cyber-border bg-gradient-to-b from-cyber-bg-from to-cyber-bg-to backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="w-32 h-8 bg-cyber-muted/20 rounded animate-pulse" />
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-cyber-muted/20 rounded animate-pulse"
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 bg-cyber-muted/20 rounded animate-pulse" />
              <div className="w-8 h-8 bg-cyber-muted/20 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-2 z-50 transition-all duration-300 ease-out cyberpunk-header"
        style={{
          transform: `translateY(${translateYValue}px) scale(${scaleValue})`,
          transformOrigin: "top center",
          width: `${widthValue}vw`, // Use viewport width instead of percentage
          left: "50%",
          translate: "-50% 0", // Use translate for precise centering
          opacity: opacityValue,
        }}
      >
        {/* Matrix rain background effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {cyberEffects.matrixRain.map((particle, i) => (
            <div
              key={i}
              className="absolute top-0 h-3 w-[1px]"
              style={{
                left: `${particle.x}%`,
                background: `linear-gradient(to bottom, transparent, ${colors.primaryGlow}, transparent)`,
                animation: `matrixRain ${
                  1.5 / particle.speed
                }s linear infinite`,
                animationDelay: `${i * 0.1}s`,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>

        {/* Main container with cyberpunk styling */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out relative border"
          style={{
            borderRadius: `${borderRadiusValue}px`,
            backdropFilter: `blur(${blurValue}px)`,
            borderColor: colors.borderGlow,
            borderWidth: "1px",
            background: `linear-gradient(135deg, ${colors.bgFrom}, ${colors.bgTo})`,
            boxShadow: `
              0 0 20px ${colors.primaryGlow}15,
              0 4px 15px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px ${colors.borderInner}
            `,
          }}
        >
          {/* Interactive glow layer */}
          <div
            ref={glowRef}
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              opacity: cyberEffects.glowIntensity,
            }}
          />

          {/* Scanning line effect */}
          <div
            className="absolute left-0 right-0 h-[1px] pointer-events-none z-10"
            style={{
              top: `${cyberEffects.scanlinePosition}%`,
              background: `linear-gradient(90deg, transparent, ${colors.primaryGlow}, transparent)`,
              boxShadow: `0 0 8px ${colors.primaryGlow}`,
            }}
          />

          <div
            className="container mx-auto px-4 transition-all duration-300 relative z-20"
            style={{
              paddingTop: `${1.25 - scrollProgress * 0.5}rem`,
              paddingBottom: `${1.25 - scrollProgress * 0.5}rem`,
            }}
          >
            <div className="flex items-center justify-between">
              {/* Left side - Logo and system info */}
              <div className="flex items-center gap-3 transition-all duration-300">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative overflow-hidden border border-cyber-border bg-black/20 hover:bg-cyber-primary/20 transition-all duration-300 group"
                    style={{
                      height: `${2.5 - scrollProgress * 0.5}rem`,
                      width: `${2.5 - scrollProgress * 0.5}rem`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary to-cyber-secondary opacity-0 group-hover:opacity-20 transition-opacity" />
                    <Cpu
                      className="text-cyber-primary group-hover:text-cyber-secondary transition-colors"
                      style={{
                        height: `${1.1 - scrollProgress * 0.25}rem`,
                        width: `${1.1 - scrollProgress * 0.25}rem`,
                      }}
                    />
                  </Button>
                </Link>
                <div className="flex flex-col">
                  <h2
                    className="font-bold font-mono bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent transition-all duration-300"
                    style={{
                      fontSize: `${1 - scrollProgress * 0.2}rem`,
                      lineHeight: `${1 - scrollProgress * 0.2}rem`,
                      textShadow: `0 0 8px ${colors.primaryGlow}40`,
                    }}
                  >
                    NEURO-MED v2.5
                  </h2>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="text-[9px] font-mono text-cyber-muted transition-all duration-300"
                      style={{
                        fontSize: `${0.65 - scrollProgress * 0.1}rem`,
                      }}
                    >
                      MED INTERFACE
                    </span>
                    <div className="w-1 h-1 rounded-full bg-cyber-primary animate-pulse" />
                    <span className="text-[9px] font-mono text-cyber-secondary">
                      ONLINE
                    </span>
                  </div>
                </div>
              </div>

              {/* Center - Compact Navigation */}
              <div className="hidden xl:flex items-center gap-0.5 max-w-4xl overflow-x-auto scrollbar-thin scrollbar-thumb-cyber-border scrollbar-track-transparent ">
                {navigationItems.map((item) => {
                  const isActive = activeSection === item.sectionId;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => scrollToSection(item.sectionId)}
                      className={`relative flex items-center gap-1 px-2 py-1.5 transition-all duration-300 group flex-shrink-0 ${
                        isActive
                          ? "text-violet-500 bg-black/30 border border-cyber-border/50"
                          : "text-violet-300 hover:text-cyber-primary hover:bg-black/15"
                      }`}
                      style={{
                        height: `${2.25 - scrollProgress * 0.5}rem`,
                        minWidth: "auto",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        className={`transition-transform duration-300 ${
                          isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-[9px] font-mono font-bold tracking-tight whitespace-nowrap">
                        {item.shortLabel}
                      </span>
                      {item.alert && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyber-secondary animate-pulse" />
                      )}

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-cyber-primary" />
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Mobile Navigation - Dropdown for small screens */}
              <div className="xl:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyber-primary border border-cyber-border/30"
                    >
                      <Network className="h-4 w-4 mr-1" />
                      SECTIONS
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="w-48 bg-cyber-bg-from border border-cyber-border backdrop-blur-lg"
                  >
                    {navigationItems.map((item) => {
                      const isActive = activeSection === item.sectionId;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => scrollToSection(item.sectionId)}
                          className={`font-mono text-sm cursor-pointer ${
                            isActive
                              ? "text-cyber-primary bg-cyber-primary/10"
                              : "text-cyber-muted hover:text-cyber-primary hover:bg-cyber-primary/5"
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {item.icon}
                            <span>{item.label}</span>
                            {item.alert && (
                              <div className="w-2 h-2 rounded-full bg-cyber-secondary animate-pulse ml-auto" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Right side - Compact System stats and user */}
              <div className="flex items-center gap-2 transition-all duration-300">
                {/* Compact System monitoring */}

                <div className="hidden md:flex items-center gap-2 px-2 py-1.5 bg-black/20 rounded-md border border-cyber-border/30">
                  <HeartPulse className="h-3 w-3 text-cyber-primary" />
                  <div className="flex flex-col">
                    <div className="text-[10px] font-mono">
                      <span className="text-cyber-primary font-bold">
                        {todayPrescriptions}
                      </span>
                      <span className="text-cyber-muted ml-0.5">/</span>
                      <span className="text-cyber-secondary ml-0.5">
                        {monthlyPrescriptions}
                      </span>
                    </div>
                    <div className="text-[8px] font-mono text-cyber-muted mt-0.5">
                      RX TODAY
                    </div>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="scale-90">
                  <ThemeToggle />
                </div>

                {/* Compact User Menu */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full p-0 border border-cyber-border/30 overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/10 to-cyber-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Avatar className="h-7 w-7 relative z-10">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-cyber-primary to-cyber-secondary text-black font-bold text-xs">
                            {getInitials(user.fullName || "OP")}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-cyber-bg-from border border-cyber-border backdrop-blur-lg"
                    >
                      <DropdownMenuLabel className="bg-gradient-to-r from-cyber-primary/10 to-cyber-secondary/10">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-mono font-bold text-cyber-primary">
                            {user.fullName || "OPERATOR"}
                          </p>
                          <p className="text-xs font-mono text-cyber-muted truncate">
                            {user.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-cyber-border/30" />
                      <DropdownMenuItem className="font-mono text-sm hover:bg-cyber-primary/10 focus:bg-cyber-primary/10">
                        <User className="h-4 w-4 ml-2 text-cyber-primary" />
                        PROFILE
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-mono text-sm hover:bg-cyber-primary/10 focus:bg-cyber-primary/10">
                        <Shield className="h-4 w-4 ml-2 text-cyber-primary" />
                        SECURITY
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-cyber-border/30" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="font-mono text-sm text-cyber-secondary hover:bg-cyber-secondary/10 focus:bg-cyber-secondary/10"
                      >
                        <LogOut className="h-4 w-4 ml-2" />
                        LOGOUT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div
        className="transition-all duration-300"
        style={{
          height: `${4.5 - scrollProgress * 1.5}rem`,
          opacity: 1 - scrollProgress * 0.5,
        }}
      />

      {/* Global styles for cyberpunk effects */}
      <style jsx global>{`
        @keyframes matrixRain {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
