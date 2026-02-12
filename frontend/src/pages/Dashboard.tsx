import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { thumbnailApi } from "@/lib/api";
import ThumbnailCard from "@/components/ThumbnailCard";
import ThumbnailSkeleton from "@/components/ThumbnailSkeleton";
import EditDrawer from "@/components/EditDrawer";
import PageTransition from "@/components/PageTransition";

interface Thumbnail {
  _id: string;
  videoName: string;
  version: string;
  image: string;
  paid: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<Thumbnail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchThumbnails = async () => {
    setLoading(true);
    try {
      const res = await thumbnailApi.getAll();
      setThumbnails(res.data.thumbnails || res.data);
    } catch {
      toast.error("Failed to load thumbnails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchThumbnails(); }, []);

  const handleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleDelete = async (id: string) => {
    try {
      await thumbnailApi.delete(id);
      setThumbnails((prev) => prev.filter((t) => t._id !== id));
      setSelected((prev) => prev.filter((i) => i !== id));
      toast.success("Thumbnail deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await thumbnailApi.bulkDelete(selected);
      setThumbnails((prev) => prev.filter((t) => !selected.includes(t._id)));
      setSelected([]);
      toast.success(`${selected.length} thumbnails deleted`);
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  const openEdit = (t: Thumbnail) => {
    setEditTarget(t);
    setDrawerOpen(true);
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="dark">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between h-14 px-4 md:px-6">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <h1 className="text-lg font-semibold text-foreground hidden sm:block">Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                  {selected.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
                      <Trash2 size={14} />
                      Delete ({selected.length})
                    </Button>
                  )}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-4 md:p-6">
              <PageTransition>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <ThumbnailSkeleton key={i} />)}
                  </div>
                ) : thumbnails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ImageIcon size={28} className="text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-medium text-foreground mb-1">No thumbnails yet</h2>
                    <p className="text-sm text-muted-foreground">Upload your first thumbnail to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {thumbnails.map((t) => (
                        <ThumbnailCard
                          key={t._id}
                          thumbnail={t}
                          selected={selected.includes(t._id)}
                          onSelect={handleSelect}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </PageTransition>
            </div>
          </main>
        </div>
      </SidebarProvider>

      <EditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        thumbnail={editTarget}
        onUpdated={fetchThumbnails}
        onDelete={handleDelete}
      />
    </div>
  );
}
