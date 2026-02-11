import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { UPLOADS_BASE } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Thumbnail {
  _id: string;
  videoName: string;
  version: string;
  image: string;
  paid: boolean;
}

interface Props {
  thumbnail: Thumbnail;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (t: Thumbnail) => void;
  onDelete: (id: string) => void;
}

export default function ThumbnailCard({ thumbnail, selected, onSelect, onEdit, onDelete }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-lg ${
        selected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(thumbnail._id)}
          className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
        />
      </div>

      {/* Image */}
      <div className="aspect-video bg-muted overflow-hidden">
        <img
          src={`${UPLOADS_BASE}${thumbnail.image}`}
          alt={thumbnail.videoName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-medium text-foreground truncate">{thumbnail.videoName}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{thumbnail.version}</Badge>
          {thumbnail.paid && (
            <Badge className="bg-primary text-primary-foreground text-xs">Paid</Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(thumbnail)}
          className="h-7 w-7 rounded-md bg-card/90 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground border border-border transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(thumbnail._id)}
          className="h-7 w-7 rounded-md bg-card/90 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-destructive border border-border transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
