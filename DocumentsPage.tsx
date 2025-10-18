import DocumentCard from "@/components/DocumentCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Document } from "@shared/schema";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocumentOpen = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск документов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-documents"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Загрузка...</p>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <DocumentCard 
              key={document.id}
              document={{
                id: document.id,
                title: document.title,
                type: document.fileType,
                date: new Date(document.uploadedAt || Date.now()).toLocaleDateString("ru-RU"),
                size: document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} КБ` : "N/A"
              }}
              onDownload={() => handleDocumentOpen(document)}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Документы не найдены
          </p>
        )}
      </div>
    </div>
  );
}
