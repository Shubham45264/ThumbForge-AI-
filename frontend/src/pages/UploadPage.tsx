import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { thumbnailApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";

export default function UploadPage() {
  const navigate = useNavigate();
  const [videoName, setVideoName] = useState("");
  const [version, setVersion] = useState("");
  const [paid, setPaid] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !videoName || !version) {
      toast.error("All fields are required");
      return;
    }
    setUploading(true);
    setProgress(0);
    const fd = new FormData();
    fd.append("videoName", videoName);
    fd.append("version", version);
    fd.append("paid", String(paid));
    fd.append("image", file);

    try {
      await thumbnailApi.create(fd);
      toast.success("Thumbnail uploaded!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dark">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col min-h-screen">
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
              <div className="flex items-center h-14 px-4 md:px-6 gap-3">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-foreground">Upload Thumbnail</h1>
              </div>
            </header>

            <div className="flex-1 p-4 md:p-6 max-w-2xl mx-auto w-full">
              <PageTransition>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Drop zone */}
                  <div
                    onDrop={onDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragOver ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-md object-contain" />
                        <button type="button" onClick={removeFile} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <ImageIcon size={22} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Drop image here or click to browse</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                      </label>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Video Name</Label>
                    <Input placeholder="My YouTube Video" value={videoName} onChange={(e) => setVideoName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Version</Label>
                    <Input placeholder="v1.0" value={version} onChange={(e) => setVersion(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Paid Thumbnail</Label>
                    <Switch checked={paid} onCheckedChange={setPaid} />
                  </div>

                  {uploading && <Progress value={progress} className="h-1.5" />}

                  <Button type="submit" className="w-full gap-2" disabled={uploading}>
                    <Upload size={16} />
                    {uploading ? "Uploading…" : "Upload Thumbnail"}
                  </Button>
                </form>
              </PageTransition>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
