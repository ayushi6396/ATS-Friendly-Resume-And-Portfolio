import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { resumeAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Sparkles, Target, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useResumes } from "@/hooks/useResumes";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import PersonalInfoSection from "@/components/resume/PersonalInfoSection";
import ExperienceSection from "@/components/resume/ExperienceSection";
import EducationSection from "@/components/resume/EducationSection";
import SkillsSection from "@/components/resume/SkillsSection";
import ResumePreview from "@/components/resume/ResumePreview";
import ATSAnalysis from "@/components/resume/ATSAnalysis";

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { updateResume } = useResumes();
  const [activeTab, setActiveTab] = useState("personal");

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: async () => {
      if (!id) throw new Error('Resume ID is required');
      return await resumeAPI.getById(id);
    },
    enabled: !!id,
  });

  /* eslint-disable react-hooks/exhaustive-deps */
  const [resumeState, setResumeState] = useState<any>(null);
  const saveTimeoutRef = useState<{ [key: string]: any }>({})[0];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (resume && !resumeState) {
      setResumeState(resume);
    }
  }, [resume]);

  const debouncedSave = (field: string, value: any) => {
    // Clear existing timeout for this field
    if (saveTimeoutRef[field]) {
      clearTimeout(saveTimeoutRef[field]);
    }

    // Set new timeout (autosave after 1 second of inactivity)
    saveTimeoutRef[field] = setTimeout(async () => {
      if (!id) return;
      await updateResume.mutateAsync({
        id,
        updates: { [field]: value },
      });
    }, 1000);
  };

  const handleUpdate = (field: string, value: any) => {
    if (!resumeState) return;

    // 1. Immediate local update for Real-time Preview
    setResumeState((prev: any) => ({
      ...prev,
      [field]: value
    }));

    // 2. Debounced server save
    debouncedSave(field, value);
  };

  const handleExportPDF = async () => {
    const previewElement = document.getElementById('resume-preview-content');
    if (!previewElement) {
      toast.error('Unable to find resume preview');
      return;
    }

    const options = {
      margin: 0.5,
      filename: `${resumeState?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'resume'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
    };

    try {
      toast.loading('Generating PDF...');
      await html2pdf().set(options).from(previewElement).save();
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resumeState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Resume not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{resumeState.title}</h1>
                <p className="text-sm text-muted-foreground">Resume Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-muted-foreground text-sm hidden sm:inline-block mr-2">
                  Hi, <span className="font-semibold text-foreground">{user.fullName}</span>
                </span>
              )}
              <Button variant="outline" onClick={() => setActiveTab("analysis")}>
                <Target className="mr-2 h-4 w-4" />
                ATS Check
              </Button>
              <Button variant="default" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="analysis">
                    <Sparkles className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                  <PersonalInfoSection
                    data={resumeState.personalInfo || {}}
                    onUpdate={(data) => handleUpdate('personalInfo', data)}
                  />
                </TabsContent>

                <TabsContent value="experience" className="mt-6">
                  <ExperienceSection
                    data={Array.isArray(resumeState.experience) ? resumeState.experience : []}
                    onUpdate={(data) => handleUpdate('experience', data)}
                  />
                </TabsContent>

                <TabsContent value="education" className="mt-6">
                  <EducationSection
                    data={Array.isArray(resumeState.education) ? resumeState.education : []}
                    onUpdate={(data) => handleUpdate('education', data)}
                  />
                </TabsContent>

                <TabsContent value="skills" className="mt-6">
                  <SkillsSection
                    data={(Array.isArray(resumeState.skills) ? resumeState.skills : []) as string[]}
                    onUpdate={(data) => handleUpdate('skills', data)}
                  />
                </TabsContent>

                <TabsContent value="analysis" className="mt-6">
                  <ATSAnalysis resumeId={id!} resumeData={resumeState} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="sticky top-24 h-fit">
            <div id="resume-preview-content">
              <ResumePreview resume={resumeState} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;