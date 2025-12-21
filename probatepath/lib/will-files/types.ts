export type WillFileClient = {
  id: string;
  matterId: string;
  fileUrl: string;
  fileType: "pdf" | "image";
  originalFilename: string;
  pageIndex: number | null;
  uploadedBy: string | null;
  createdAt: string;
};
