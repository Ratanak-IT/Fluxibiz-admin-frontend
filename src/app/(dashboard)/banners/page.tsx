"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  Power,
  Sparkles,
  RefreshCw,
  Search,
  ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  badge?: string;
  status: "OPEN" | "CLOSED";
  position: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/store");
  const [badgeText, setBadgeText] = useState("PROMOTION");
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const [position, setPosition] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/banners");
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin banners:", err);
      toast.error("Failed to load storefront banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateDialog = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setImageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80");
    setLinkUrl("/store");
    setBadgeText("GRAND OPENING");
    setStatus("OPEN");
    setPosition(banners.length + 1);
    setIsDialogOpen(true);
  };

  const openEditDialog = (banner: BannerItem) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setImageUrl(banner.imageUrl);
    setLinkUrl(banner.linkUrl || "/store");
    setBadgeText(banner.badge || "PROMOTION");
    setStatus(banner.status);
    setPosition(banner.position);
    setIsDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        toast.success("Image uploaded successfully");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error("Title and Image URL are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim(),
        badge: badgeText.trim(),
        status,
        position,
      };

      if (editingBanner) {
        const res = await fetch(`/api/v1/admin/banners/${editingBanner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success("Banner updated successfully");
        } else {
          toast.error("Failed to update banner");
        }
      } else {
        const res = await fetch("/api/v1/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success("Banner created successfully");
        } else {
          toast.error("Failed to create banner");
        }
      }

      setIsDialogOpen(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner: BannerItem) => {
    try {
      const res = await fetch(`/api/v1/admin/banners/${banner.id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        const nextStatus = banner.status === "OPEN" ? "CLOSED" : "OPEN";
        toast.success(`Banner status changed to ${nextStatus}`);
        fetchBanners();
      } else {
        toast.error("Failed to toggle banner status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update banner status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`/api/v1/admin/banners/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Banner deleted successfully");
        fetchBanners();
      } else {
        toast.error("Failed to delete banner");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete banner");
    }
  };

  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(search.toLowerCase())) ||
      (b.badge && b.badge.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openCount = banners.filter((b) => b.status === "OPEN").length;
  const closedCount = banners.filter((b) => b.status === "CLOSED").length;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-green-600" />
            Storefront Banner Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, update, upload images, and control (OPEN/CLOSE) storefront promo banners.
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
          className="gap-2 rounded-full bg-green-600 px-6 font-bold text-white shadow-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Create New Banner
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-0 bg-white shadow-sm dark:bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Banners</CardDescription>
            <CardTitle className="text-3xl font-extrabold">{banners.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-0 bg-emerald-50/60 shadow-sm dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Open Banners (Active on Storefront)</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{openCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-0 bg-red-50/60 shadow-sm dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">Closed Banners (Hidden)</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-red-600 dark:text-red-400">{closedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search banners by title, subtitle, or badge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-white dark:bg-card"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={selectedStatus === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("ALL")}
            className="rounded-full"
          >
            All ({banners.length})
          </Button>
          <Button
            variant={selectedStatus === "OPEN" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("OPEN")}
            className="rounded-full"
          >
            Open ({openCount})
          </Button>
          <Button
            variant={selectedStatus === "CLOSED" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("CLOSED")}
            className="rounded-full"
          >
            Closed ({closedCount})
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchBanners} className="rounded-full">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
          <ImageIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-4 text-lg font-bold">No Banners Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first storefront promo banner.
          </p>
          <Button onClick={openCreateDialog} className="mt-6 rounded-full bg-green-600 text-white hover:bg-green-700">
            Create Banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBanners.map((banner) => (
            <Card
              key={banner.id}
              className={`overflow-hidden transition-all border-0 shadow-md ${
                banner.status === "CLOSED" ? "opacity-75 bg-neutral-100 dark:bg-card/40" : "bg-white dark:bg-card"
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {banner.badge && (
                    <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-black uppercase text-white shadow-md">
                      {banner.badge}
                    </span>
                  )}
                </div>

                {/* Status Pill */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${
                      banner.status === "OPEN" ? "bg-emerald-600" : "bg-neutral-800"
                    }`}
                  >
                    {banner.status === "OPEN" ? "● OPEN (ACTIVE)" : "○ CLOSED (HIDDEN)"}
                  </span>
                </div>

                {/* Text Overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-extrabold line-clamp-1">{banner.title}</h3>
                  {banner.subtitle && <p className="text-xs text-neutral-200 line-clamp-1">{banner.subtitle}</p>}
                </div>
              </div>

              {/* Actions Footer */}
              <CardContent className="p-4 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={banner.status === "OPEN" ? "destructive" : "default"}
                    onClick={() => handleToggleStatus(banner)}
                    className="gap-1.5 rounded-full text-xs font-bold"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {banner.status === "OPEN" ? "CLOSE BANNER" : "OPEN BANNER"}
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => openEditDialog(banner)}
                    className="h-8 w-8 rounded-full"
                    title="Edit Banner"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(banner.id)}
                    className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                    title="Delete Banner"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog Overlay */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-card">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                {editingBanner ? "Edit Storefront Banner" : "Create Storefront Banner"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Set banner image, promo badge, text header, link, and toggle Open/Close status.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="font-bold text-xs">
                  Banner Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. GRAND OPENING! DISC UP TO 50%"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="subtitle" className="text-xs">Subtitle / Description</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g. SAVE THE DATE! Limited time promo"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="badge" className="text-xs">Promo Badge Text</Label>
                  <Input
                    id="badge"
                    placeholder="e.g. GRAND OPENING, MEGA DEALS"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs">Status (OPEN/CLOSED)</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "OPEN" | "CLOSED")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none"
                  >
                    <option value="OPEN">OPEN (Active on Storefront)</option>
                    <option value="CLOSED">CLOSED (Hidden from Storefront)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="imageUrl" className="font-bold text-xs">
                  Image URL or Upload File <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://images.unsplash.com/... or data:image/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-[130px] text-xs"
                  />
                </div>
              </div>

              {/* Live Preview */}
              {imageUrl && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">Banner Live Preview:</Label>
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-neutral-900">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      {badgeText && (
                        <span className="mb-1 inline-block rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                          {badgeText}
                        </span>
                      )}
                      <p className="text-sm font-extrabold">{title || "Banner Title"}</p>
                      {subtitle && <p className="text-xs text-neutral-300">{subtitle}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="linkUrl" className="text-xs">Target Link URL</Label>
                  <Input
                    id="linkUrl"
                    placeholder="/store"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="position" className="text-xs">Display Position (Order)</Label>
                  <Input
                    id="position"
                    type="number"
                    min={1}
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-green-600 text-white hover:bg-green-700">
                  {submitting ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
