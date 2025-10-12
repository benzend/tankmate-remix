import { invariant, invariantResponse } from '@epic-web/invariant'
import { ActionFunctionArgs, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, redirect, useActionData, useLoaderData, useSubmit } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { formatDateBasedOnRecency, useIsPending } from '#app/utils/misc.js'
import { useState } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
import { UploadButton, UploadDropzone } from '#app/utils/uploadthing.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })

	const user = await prisma.user.findFirst({
		select: {
			id: true,
			username: true,
			name: true,
		},
		where: {
			id: userId,
		},
	})

	invariantResponse(user, 'No user', { status: 404 })

  const galleries = await prisma.tankGallery.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      fishTankId: true,
      altText: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const tanks = await prisma.fishTank.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
    }
  });

	return json({ user, galleries, tanks })
}

export const meta: MetaFunction = () => [{ title: "TankMate | Galleries" }];

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: "/" });
  const data = await request.formData();

  const tankId = data.get('tankId') as null | string;

  invariantResponse(tankId, 'No tank ID provided');

  const tank = await prisma.fishTank.findFirst({
    where: { id: tankId, userId },
    select: { id: true },
  });

  if (!tank) {
    return redirect("/dashboard");
  }

  const intent = data.get("intent");

  if (intent === "add") {
    const imageUrl = data.get("imageUrl");
    const title = data.get("title");
    const description = data.get("description");
    const altText = data.get("altText");

    if (typeof imageUrl !== "string" || !imageUrl) {
      return json({ error: "Image URL is required", success: false });
    }

    try {
      await prisma.tankGallery.create({
        data: {
          imageUrl,
          title: typeof title === "string" ? title : null,
          description: typeof description === "string" ? description : null,
          altText: typeof altText === "string" ? altText : null,
          fishTankId: tank.id,
        },
      });
      return json({ error: null, success: true, intent: "add" });
    } catch {
      return json({ error: "Failed to add image to gallery", success: false });
    }
  }

  if (intent === "delete") {
    const imageId = data.get("imageId");
    
    if (typeof imageId !== "string") {
      return json({ error: "Image ID is required", success: false });
    }

    try {
      await prisma.tankGallery.delete({
        where: { id: imageId, fishTank: { userId } },
      });

      return json({ error: null, success: true, intent: "delete" });
    } catch {
      return json({ error: "Failed to delete image", success: false });
    }
  }

  if (intent === "update") {
    const imageId = data.get("imageId");
    const title = data.get("title");
    const description = data.get("description");
    const altText = data.get("altText");

    if (typeof imageId !== "string") {
      return json({ error: "Image ID is required", success: false });
    }

    try {
      await prisma.tankGallery.update({
        where: { id: imageId, fishTank: { userId } },
        data: {
          title: typeof title === "string" ? title : null,
          description: typeof description === "string" ? description : null,
          altText: typeof altText === "string" ? altText : null,
        },
      });
      return json({ error: null, success: true, intent: "update" });
    } catch {
      return json({ error: "Failed to update image", success: false });
    }
  }

  return json({ error: "Invalid intent", success: false });
}

export default function DashboardGalleriesPage() {
  const actionData = useActionData<typeof action>();
  const { galleries, tanks } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const isPending = useIsPending();

  const [isAdding, setIsAdding] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    altText: "",
    tankId: "",
  });

  const [tempImages, setTempImages] = useState<Array<{url: string, name: string}>>([]);

  const handleAddImages = (uploadedFiles: Array<{url: string, name: string}>) => {
    setFormData({ title: "", description: "", altText: "" });
    setTempImages(uploadedFiles);
    setIsAdding(true);
  };

  const handleSubmitAdd = () => {
    if (tempImages.length === 0) return;

    // Add each image to the gallery
    tempImages.forEach((image, index) => {
      const data = new FormData();
      data.append("intent", "add");
      data.append("imageUrl", image.url);
      data.append("title", formData.title || `Image ${index + 1}`);
      data.append("description", formData.description);
      data.append("altText", formData.altText || image.name);
      
      submit(data, { method: "POST" });
    });
    
    setIsAdding(false);
    setFormData({ title: "", description: "", altText: "" });
    setTempImages([]);
  };

  const handleDelete = (imageId: string) => {
    setDeletingImage(imageId);
  };

  const confirmDelete = () => {
    if (!deletingImage) return;
    
    const data = new FormData();
    data.append("intent", "delete");
    data.append("imageId", deletingImage);
    submit(data, { method: "POST" });
    setDeletingImage(null);
  };

  const handleEdit = (image: any) => {
    setEditingImage(image.id);
    setFormData({
      title: image.title || "",
      description: image.description || "",
      altText: image.altText || "",
    });
  };

  const handleSubmitEdit = (imageId: string) => {
    const data = new FormData();
    data.append("intent", "update");
    data.append("imageId", imageId);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("altText", formData.altText);
    
    submit(data, { method: "POST" });
    setEditingImage(null);
    setFormData({ title: "", description: "", altText: "" });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingImage(null);
    setDeletingImage(null);
    setFormData({ title: "", description: "", altText: "" });
    setTempImages([]);
  };

  return (
    <div>
      <header className="mb-8">
        <Link to={`/dashboard`}>
          <span className="flex gap-1 text-muted-foreground">
            <Icon name="arrow-left" /> Back to Dashboard
          </span>
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Aquarium Galleries</h1>
        <p className="text-muted-foreground">
          Showcase your aquariums with beautiful pictures of their environments
        </p>
      </header>

      {/* Add Image Section */}
      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Add New Images</h2>
        <div className="space-y-4">
          {/* Upload Button */}
          <div className="flex flex-wrap gap-4">
            <UploadButton
              className="w-full md:w-40"
              appearance={{
                button: 'w-full text-sm font-medium'
              }}
              endpoint='galleryUploader'
              onClientUploadComplete={(data) => {
                const uploadedFiles = data.map(file => ({
                  url: file.ufsUrl,
                  name: file.name || 'gallery-image'
                }));
                handleAddImages(uploadedFiles);
              }}
              onUploadError={(error) => {
                console.log("onUploadError", error);
                alert('Upload error!');
              }}
              content={{ button: '+ Upload Images' }}
            />
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
            <UploadDropzone
              endpoint='galleryUploader'
              onClientUploadComplete={(data) => {
                const uploadedFiles = data.map(file => ({
                  url: file.ufsUrl,
                  name: file.name || 'gallery-image'
                }));
                handleAddImages(uploadedFiles);
              }}
              onUploadError={(error) => {
                console.log("onUploadError", error);
                alert('Upload error!');
              }}
              appearance={{
                label: "Drop images here or click to upload",
                allowedContent: "Images up to 8MB (JPEG, PNG, WebP, GIF)",
                button: "Choose Files",
              }}
            />
          </div>
        </div>

        {/* Add Image Form */}
        {isAdding && (
          <div className="mt-4 rounded border p-4 text-foreground">
            {/* Image Preview */}
            {tempImages.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Image Preview ({tempImages.length} image{tempImages.length !== 1 ? 's' : ''})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tempImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTempImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <Icon name="cross-1" className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Tank</Label>
                <select
                  value={formData.tankId}
                  onChange={(e) => setFormData(prev => ({ ...prev, tankId: e.target.value }))}
                  className="w-full rounded border px-3 py-2">
                  {tanks.map(tank => <option value={tank.id}>{tank.name}</option>)}
                </select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Title (optional)</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                  placeholder="e.g., Full Tank Shot"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Alt Text (optional)</Label>
                <Input
                  type="text"
                  value={formData.altText}
                  onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                  className="w-full rounded border px-3 py-2 text-foreground"
                  placeholder="e.g., Beautiful reef tank with colorful fish"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label className="block text-sm font-medium mb-2">Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded border px-3 py-2 text-foreground"
                rows={3}
                placeholder="Describe what's special about this photo..."
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSubmitAdd} disabled={tempImages.length === 0 || isPending}>
                {isPending ? "Adding..." : `Add ${tempImages.length} Image${tempImages.length !== 1 ? 's' : ''} to Gallery`}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Gallery Images</h2>
        {galleries.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <Icon name="camera" className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No images in your gallery yet</p>
            <p className="text-sm text-muted-foreground">Upload your first image to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-card">
                <img
                  src={image.imageUrl}
                  alt={image.altText || image.title || "Fish tank image"}
                  className="h-64 w-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Image Info Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {image.title && (
                      <h3 className="font-semibold mb-1">{image.title}</h3>
                    )}
                    {image.description && (
                      <p className="text-sm text-gray-200 mb-2">{image.description}</p>
                    )}
                    <p className="text-xs text-gray-300">
                      {formatDateBasedOnRecency(new Date(image.createdAt).toLocaleDateString())}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(image)}
                      className="h-8 w-8 p-0"
                    >
                      <Icon name="pencil-1" className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-foreground">
          <div className="w-full max-w-md rounded-lg bg-background p-6">
            <h3 className="mb-4 text-lg font-semibold">Edit Image</h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Title</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Alt Text</Label>
                <Input
                  type="text"
                  value={formData.altText}
                  onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => handleSubmitEdit(editingImage)} disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-foreground">
          <div className="w-full max-w-md rounded-lg bg-background p-6">
            <div className="text-center">
              <Icon name="trash" className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Delete Image?</h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. The image will be permanently removed from your gallery.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete Image"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="mt-4 rounded bg-destructive/10 p-4 text-destructive">
          {actionData.error}
        </div>
      )}
      
      {actionData?.success && (
        <div className="mt-4 rounded bg-green-50 border border-green-200 p-4 text-green-800">
          <div className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4" />
            <span>Operation completed successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
