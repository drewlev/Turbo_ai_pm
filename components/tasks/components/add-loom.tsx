import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Check, Trash2, ExternalLink } from "lucide-react";
import { addLoomToTask, deleteLoomFromTask } from "@/app/actions/loom";
import { motion, AnimatePresence } from "framer-motion";

interface AddLoomProps {
  taskId: number;
  onLoomAdded?: (loomUrl: string) => void;
  existingLoomUrl?: string;
  onLoomDeleted?: () => void;
  loomUrl?: string;
}

export const AddLoom: React.FC<AddLoomProps> = ({
  taskId,
  onLoomAdded,
  onLoomDeleted,
  loomUrl: initialLoomUrl,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loomUrl, setLoomUrl] = useState(initialLoomUrl || "");
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentLoomUrl, setCurrentLoomUrl] = useState(initialLoomUrl);

  const handleAddLoom = async (taskId: number) => {
    if (!loomUrl) return;

    try {
      const result = await addLoomToTask(taskId, loomUrl);

      if (result.success) {
        setShowSuccess(true);
        setCurrentLoomUrl(loomUrl);
        onLoomAdded?.(loomUrl);
        setTimeout(() => {
          setShowSuccess(false);
          setIsEditing(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to add Loom:", error);
    }
  };

  const handleDeleteLoom = async () => {
    // setIsDeleting(true);
    try {
      const result = await deleteLoomFromTask(taskId);
      if (result.success) {
        setCurrentLoomUrl(undefined);
        onLoomDeleted?.();
        setTimeout(() => {
          // setIsDeleting(false);
        }, 500);
      }
    } catch (error) {
      console.error("Failed to delete Loom:", error);
      // setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showSuccess && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 text-green-500"
        >
          <Check className="h-4 w-4" />
          <span>Loom saved!</span>
        </motion.div>
      )}

      {!showSuccess && isEditing && (
        <motion.div
          key="edit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <Input
            value={loomUrl}
            onChange={(e) => setLoomUrl(e.target.value)}
            placeholder="www.loom.com/share/..."
            className="h-8 text-sm border-gray-700 text-gray-300"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddLoom(taskId)}
            className="w-auto h-8 p-0 hover:bg-white/10"
          >
            <Check className="h-4 w-4 text-green-300" />
          </Button>
        </motion.div>
      )}

      {!showSuccess && !isEditing && currentLoomUrl ? (
        <motion.div
          key="view"
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={() => {
              window.open(currentLoomUrl, "_blank");
            }}
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2",
              "bg-white/10 hover:bg-white/20",
              "text-gray-300 hover:text-white",
              "border-gray-700 hover:border-gray-600",
              "transition-colors duration-200"
            )}
          >
            <Image
              src="https://n1v74cls2c.ufs.sh/f/XAC5NGVjIxRTz7K1NTsejx7Tur9JViP05Y6ZMsC4DNpwOHWU"
              alt="Loom"
              width={20}
              height={20}
            />
            <span>View Loom</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteLoom}
              className="h-8 w-8 p-0 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        !showSuccess &&
        !isEditing &&
        !currentLoomUrl && (
          <motion.div
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className={cn(
                // "flex items-center gap-2",
                // "bg-white/10 hover:bg-white/20",
                // "text-gray-300 hover:text-white",
                // "border-gray-700 hover:border-gray-600",
                // "transition-colors duration-200"
              )}
            >
              <Image
                src="https://n1v74cls2c.ufs.sh/f/XAC5NGVjIxRTz7K1NTsejx7Tur9JViP05Y6ZMsC4DNpwOHWU"
                alt="Loom"
                width={20}
                height={20}
              />
              <span>Add Loom</span>
            </Button>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};
