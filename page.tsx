"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ViewMode, GenerationStatus, Project } from "@/types";
import { downloadHtml } from "@/lib/utils";
import toast from "react-hot-toast";
import PreviewPane from "@/components/builder/PreviewPane";
import CodePane from "@/components/builder/CodePane";
import PromptBar from "@/components/builder/PromptBar";
import StatusBar from "@/components/builder/StatusBar";
import BuilderNav from "@/components/builder/BuilderNav";

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [html, setHtml] = useState("");
  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectId, setProjectId] = useState<string | null>(searchParams.get("project"));
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Check auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  // Load existing project
  useEffect(() => {
    const pid = searchParams.get("project");
    if (pid) {
      supabase
        .from("projects")
        .select("*")
        .eq("id", pid)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setHtml(data.html_content);
            setPrompt(data.prompt);
            setProjectName(data.name);
            setProjectId(data.id);
            setStatus("done");
          }
        });
    }
  }, [searchParams, supabase]);

  // Auto-generate from URL param
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt && !searchParams.get("project")) {
      handleGenerate(urlPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (promptText?: string) => {
    const p = (promptText || prompt).trim();
    if (!p) {
      toast.error("Please describe the website you want to build");
      return;
    }

    setStatus("generating");
    setHtml("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed");
      }

      setHtml(data.html);
      setProjectName(data.name);
      setPrompt(p);
      setStatus("done");
      toast.success("Website generated!");
    } catch (err: any) {
      setStatus("error");
      toast.error(err.message || "Failed to generate website");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast("Sign in to save projects", { icon: "🔒" });
      router.push("/auth");
      return;
    }
    if (!html) {
      toast.error("Generate a website first");
      return;
    }

    setSaving(true);
    try {
      const method = projectId ? "PUT" : "POST";
      const res = await fetch("/api/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          name: projectName,
          prompt,
          html_content: html,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProjectId(data.id);
      toast.success("Project saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!html) {
      toast.error("Generate a website first");
      return;
    }
    downloadHtml(html, projectName);
    toast.success("Downloaded!");
  };

  return (
    <div className="h-screen bg-ink-950 flex flex-col overflow-hidden">
      {/* Top nav */}
      <BuilderNav
        projectName={projectName}
        onNameChange={setProjectName}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSave={handleSave}
        onDownload={handleDownload}
        saving={saving}
        hasContent={!!html}
        user={user}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview / Code pane */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "split" ? (
            <div className="h-full flex">
              <div className="flex-1 border-r border-ink-800">
                <PreviewPane html={html} status={status} />
              </div>
              <div className="flex-1">
                <CodePane html={html} onChange={setHtml} />
              </div>
            </div>
          ) : viewMode === "preview" ? (
            <PreviewPane html={html} status={status} />
          ) : (
            <CodePane html={html} onChange={setHtml} />
          )}
        </div>
      </div>

      {/* Bottom prompt bar */}
      <div className="border-t border-ink-800">
        <StatusBar status={status} />
        <PromptBar
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={() => handleGenerate()}
          disabled={status === "generating"}
        />
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-ink-950 flex items-center justify-center">
        <div className="text-ink-600 text-sm">Loading builder...</div>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
