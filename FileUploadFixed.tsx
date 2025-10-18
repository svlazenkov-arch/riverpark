import { useState } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface FileUploadFixedProps {
  onComplete: (fileUrl: string) => void;
  maxFileSize?: number;
}

export function FileUploadFixed({
  onComplete,
  maxFileSize = 50 * 1024 * 1024, // 50MB
}: FileUploadFixedProps) {
  const [showModal, setShowModal] = useState(false);
  
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize,
      },
      autoProceed: true,
    });
    
    uppyInstance.use(AwsS3, {
      shouldUseMultipart: false,
      getUploadParameters: async (file) => {
        console.log("✅ Getting upload URL for:", file.name);
        
        // Make request
        const res = await fetch("/api/objects/get-upload-url", {
          method: "POST",
          credentials: "include",
        });
        
        console.log("✅ Response status:", res.status);
        
        if (!res.ok) {
          const error = await res.text();
          console.error("❌ Upload URL error:", error);
          throw new Error(`Failed to get upload URL: ${error}`);
        }
        
        // Parse JSON properly
        const data = await res.json();
        console.log("✅ Upload URL received:", data.uploadURL);
        
        return {
          method: "PUT" as const,
          url: data.uploadURL,
        };
      },
    });
    
    uppyInstance.on("complete", async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
      console.log("✅ Upload complete:", result);
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const signedUrl = uploadedFile.uploadURL as string;
        
        console.log("✅ Signed URL:", signedUrl);
        
        // Set ACL
        const aclRes = await fetch("/api/documents-upload", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fileUrl: signedUrl }),
        });
        
        if (!aclRes.ok) {
          console.error("❌ ACL error");
          throw new Error("Failed to set file permissions");
        }
        
        const aclData = await aclRes.json();
        console.log("✅ File ready:", aclData.objectPath);
        
        onComplete(aclData.objectPath);
        setShowModal(false);
      }
    });
    
    return uppyInstance;
  });

  return (
    <>
      <Button 
        type="button"
        onClick={() => setShowModal(true)}
        data-testid="button-upload-file"
      >
        Выбрать файл
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </>
  );
}
