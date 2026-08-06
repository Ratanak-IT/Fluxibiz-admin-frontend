"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageUploadRules } from "@/lib/api/image-upload";

export function useObjectUrls() {
  const urls = useRef<string[]>([]);

  useEffect(() => {
    const tracked = urls;
    return () => {
      tracked.current.forEach((url) => URL.revokeObjectURL(url));
      tracked.current = [];
    };
  }, []);

  const create = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    return url;
  }, []);

  const release = useCallback((url: string | null | undefined) => {
    if (!url || !url.startsWith("blob:")) {
      return;
    }
    URL.revokeObjectURL(url);
    urls.current = urls.current.filter((entry) => entry !== url);
  }, []);

  return { create, release };
}

export function useStagedImage(rules: ImageUploadRules, storedUrl: string) {
  const { create, release } = useObjectUrls();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(picked: File) {
    const message = rules.validate(picked);
    if (message) {
      setError(message);
      return;
    }

    release(blobUrl);
    setBlobUrl(create(picked));
    setFile(picked);
    setRemoved(false);
    setError(null);
  }

  function remove() {
    release(blobUrl);
    setBlobUrl(null);
    setFile(null);
    setRemoved(Boolean(storedUrl));
    setError(null);
  }

  function reset() {
    release(blobUrl);
    setBlobUrl(null);
    setFile(null);
    setRemoved(false);
    setError(null);
  }

  return {
    file,
    removed,
    error,
    setError,
    pick,
    remove,
    reset,
    preview: removed ? "" : blobUrl || storedUrl,
    isDirty: Boolean(file) || removed,
  };
}

type PickerBase = {
  rules: ImageUploadRules;
  disabled?: boolean;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
};

function useDropTarget({
  disabled,
  onFiles,
}: {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  function onDragOver(event: DragEvent) {
    if (disabled) return;
    event.preventDefault();
    setIsOver(true);
  }

  function onDragLeave() {
    setIsOver(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setIsOver(false);

    if (disabled) return;

    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length) {
      onFiles(files);
    }
  }

  return { isOver, dropProps: { onDragOver, onDragLeave, onDrop } };
}

export function ImagePicker({
  rules,
  disabled,
  hint,
  error,
  className,
  inputRef,
  label,
  preview,
  actions,
  busy,
  previewShape = "rect",
  onPick,
  onError,
}: PickerBase & {
  label: ReactNode;
  preview: ReactNode;
  actions?: ReactNode;
  busy?: boolean;
  previewShape?: "circle" | "rect";
  onPick: (file: File) => void;
  onError: (message: string) => void;
}) {
  function handleFiles(files: File[]) {
    const [file] = files;
    if (!file) return;

    const message = rules.validate(file);
    if (message) {
      onError(message);
      return;
    }

    onPick(file);
  }

  const { isOver, dropProps } = useDropTarget({
    disabled,
    onFiles: handleFiles,
  });

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <label
        {...dropProps}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#e4eae2] bg-white px-5 py-6 text-center outline-none transition-colors focus-within:border-[#00932a] hover:border-[#00932a]/50 dark:border-input dark:bg-card dark:hover:border-primary/50",
          isOver && "border-[#00932a] bg-[#f5f8f4] dark:bg-primary/10",
          disabled && "cursor-not-allowed opacity-60",
        )}>
        <input
          ref={inputRef}
          type="file"
          accept={rules.accept}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = "";
            handleFiles(files);
          }}
        />

        <span className="relative">
          {preview}
          {busy ? (
            <span
              className={cn(
                "absolute inset-0 grid place-items-center bg-white/70 text-xs font-semibold text-[#00932a] dark:bg-card/80",
                previewShape === "circle" ? "rounded-full" : "rounded-xl",
              )}
            >
              Uploading…
            </span>
          ) : null}
        </span>

        <span className="text-base font-bold leading-6 text-[#1a222b] dark:text-foreground">
          {label}
        </span>
        <span className="max-w-[220px] text-[11px] leading-[16.5px] text-[#424841] dark:text-muted-foreground">
          Drag and drop, or click to browse. {hint || rules.hint}
        </span>
      </label>

      {actions ? (
        <div className="flex items-center justify-center gap-3">{actions}</div>
      ) : null}

      <div className="min-h-4" aria-live="polite">
        {error ? (
          <p className="text-xs text-[#d14341] dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
