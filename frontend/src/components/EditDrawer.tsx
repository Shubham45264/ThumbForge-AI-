import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { thumbnailApi } from "@/lib/api";

interface Thumbnail {
  _id: string;
  videoName: string;
  version: string;
  image: string;
  paid: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  thumbnail: Thumbnail | null;
  onUpdated: () => void;
  onDelete: (id: string) => void;
}

export default function EditDrawer({ open, onClose, thumbnail, onUpdated, onDelete }: Props) {
  const [videoName, setVideoName] = useState("");
  const [version, setVersion] = useState("");
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (thumbnail) {
      setVideoName(thumbnail.videoName);
      setVersion(thumbnail.version);
      setPaid(thumbnail.paid);
    }
  }, [thumbnail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnail) return;
    setLoading(true);
    try {
      await thumbnailApi.update(thumbnail._id, { videoName, version, paid });
      toast.success("Thumbnail updated");
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!thumbnail) return;
    if (confirm("Are you sure you want to delete this thumbnail?")) {
      onDelete(thumbnail._id);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Edit Thumbnail</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-1.5">
            <Label>Video Name</Label>
            <Input value={videoName} onChange={(e) => setVideoName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Version</Label>
            <Input value={version} onChange={(e) => setVersion(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Paid</Label>
            <Switch checked={paid} onCheckedChange={setPaid} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Thumbnail
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
