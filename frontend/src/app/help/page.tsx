"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  Search,
  Video,
  Brain,
  Users,
  Target,
  FileText,
  Film,
  BookOpen,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronRight,
  Play,
  Zap,
  Keyboard,
  Upload,
  BarChart3,
  Shield,
} from "lucide-react";

const guides = [
  { icon: Upload, title: "Uploading Videos", desc: "Learn how to upload and manage your video library", category: "Getting Started" },
  { icon: Brain, title: "AI Analysis", desc: "Configure and run AI-powered video analysis", category: "Analysis" },
  { icon: Users, title: "Player Tracking", desc: "Track player movements and generate heat maps", category: "Analysis" },
  { icon: Target, title: "Tactical Board", desc: "Use the interactive tactical board for formations", category: "Tactics" },
  { icon: Film, title: "Creating Highlights", desc: "Build custom highlight reels from your footage", category: "Highlights" },
  { icon: FileText, title: "Generating Reports", desc: "Create and export professional analysis reports", category: "Reports" },
  { icon: BarChart3, title: "Performance Metrics", desc: "Understanding player and team performance data", category: "Analytics" },
  { icon: Shield, title: "Team Management", desc: "Manage your roster, staff, and permissions", category: "Team" },
];

const faqs = [
  { q: "What video formats are supported?", a: "VisionTrack supports MP4, MOV, and AVI formats. We recommend MP4 with H.264 encoding for the best analysis results. Maximum file size is 10GB per video." },
  { q: "How long does video analysis take?", a: "Analysis time depends on video length, resolution, and selected analysis type. A typical 90-minute match takes 15-30 minutes for full analysis. Player tracking is faster at 5-10 minutes." },
  { q: "Can I analyze multiple camera angles simultaneously?", a: "Yes! Multi-angle analysis lets you sync up to 4 camera feeds. Upload each angle separately and use the sync tool to align them by timestamp." },
  { q: "How accurate is the player tracking?", a: "Our AI achieves 95%+ accuracy for player detection and 90%+ for jersey number recognition in professional broadcast quality footage. Accuracy may vary with camera angle and video quality." },
  { q: "Can I export analysis data to other tools?", a: "Yes, you can export data in CSV, JSON, PDF, and PowerPoint formats. We also support API integration with popular sports analytics platforms." },
  { q: "How do I share analysis with my team?", a: "Use the Share button on any analysis, report, or highlight. You can share via direct link, email, or assign review tasks to specific team members." },
  { q: "What sports are supported for AI analysis?", a: "We currently support soccer/football, basketball, baseball, and tennis with sport-specific AI models. General pose estimation and action recognition work for all sports." },
  { q: "Is there a limit on video storage?", a: "Storage limits depend on your plan. Free accounts get 10GB, Pro accounts get 500GB, and Enterprise accounts have unlimited storage." },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Find answers, learn features, and get the most out of VisionTrack Sports Analytics
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guides, FAQs, tutorials..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Start */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Quick Start Guide</h3>
              <p className="text-sm text-muted-foreground mt-1">
                New to VisionTrack? Follow our step-by-step guide to upload your first video, run analysis, and generate insights in under 10 minutes.
              </p>
            </div>
            <Button variant="sport" className="shrink-0 gap-2">
              <Play className="h-4 w-4" />
              Start Tour
            </Button>
          </CardContent>
        </Card>

        {/* User Guides */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            User Guides
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Card key={guide.title} className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{guide.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{guide.desc}</p>
                      <Badge variant="outline" className="mt-2 text-[10px]">{guide.category}</Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Video Tutorials */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Tutorials
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: "Getting Started with VisionTrack", duration: "5:32" },
              { title: "Running Your First AI Analysis", duration: "8:15" },
              { title: "Creating Tactical Formations", duration: "6:48" },
            ].map((tutorial) => (
              <Card key={tutorial.title} className="hover:border-primary/50 transition-colors cursor-pointer group overflow-hidden">
                <div className="aspect-video bg-secondary flex items-center justify-center relative">
                  <Play className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  <Badge variant="secondary" className="absolute bottom-2 right-2 text-[10px]">{tutorial.duration}</Badge>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium">{tutorial.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Frequently Asked Questions
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {filteredFaqs.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-secondary/30 transition-colors"
                  >
                    <span className="font-medium text-sm pr-4">{faq.q}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expandedFaq === index && "rotate-180")} />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Essential Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-x-8 gap-y-2">
              {[
                { keys: "Space", action: "Play/Pause" },
                { keys: "←/→", action: "Frame step" },
                { keys: "F", action: "Fullscreen" },
                { keys: "M", action: "Add marker" },
                { keys: "D", action: "Drawing mode" },
                { keys: "S", action: "Screenshot" },
                { keys: "Ctrl+K", action: "Search" },
                { keys: "Ctrl+Z", action: "Undo" },
                { keys: "Ctrl+B", action: "Toggle sidebar" },
              ].map((s) => (
                <div key={s.keys} className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">{s.action}</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">{s.keys}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Still need help?</h3>
                <p className="text-sm text-muted-foreground">Contact our support team for personalized assistance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </Button>
              <Button variant="sport" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
