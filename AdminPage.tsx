import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, FileText, Upload, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { News, Document, UploadUrlResponse, DocumentUploadResponse } from "@shared/schema";
import { insertNewsSchema, insertDocumentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileUploadFixed } from "@/components/FileUploadFixed";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form schema for creating/editing news
const newsFormSchema = insertNewsSchema.omit({ authorId: true }).extend({
  title: z.string().min(1, "Введите заголовок"),
  excerpt: z.string().min(1, "Введите краткое описание"),
  content: z.string().min(1, "Введите содержание"),
  imageUrl: z.string().optional(),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

// Form schema for creating/editing documents
const documentFormSchema = insertDocumentSchema.extend({
  title: z.string().min(1, "Введите название документа"),
  description: z.string().optional(),
  category: z.string().min(1, "Выберите категорию"),
  fileUrl: z.string().optional(),
  fileType: z.string().min(1, "Укажите тип файла"),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("news");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "news" | "document"; id: string | null }>({
    open: false,
    type: "news",
    id: null,
  });
  const [newsDialog, setNewsDialog] = useState<{ open: boolean; editId: string | null }>({
    open: false,
    editId: null,
  });
  const [documentDialog, setDocumentDialog] = useState<{ open: boolean; editId: string | null }>({
    open: false,
    editId: null,
  });
  const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("url");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const { toast } = useToast();

  // News form
  const newsForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      imageUrl: "",
    },
  });

  // Document form
  const documentForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Устав",
      fileUrl: "",
      fileType: "pdf",
    },
  });

  // Fetch news
  const { data: newsData = [], isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  // Fetch documents
  const { data: documentsData = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Delete news mutation
  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Новость удалена",
        description: "Новость успешно удалена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить новость",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Документ удалён",
        description: "Документ успешно удалён",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить документ",
        variant: "destructive",
      });
    },
  });

  // Create/update news mutation
  const saveNewsMutation = useMutation({
    mutationFn: async (data: NewsFormValues) => {
      if (newsDialog.editId) {
        return await apiRequest("PUT", `/api/news/${newsDialog.editId}`, data);
      } else {
        return await apiRequest("POST", "/api/news", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: newsDialog.editId ? "Новость обновлена" : "Новость создана",
        description: newsDialog.editId ? "Новость успешно обновлена" : "Новость успешно создана",
      });
      setNewsDialog({ open: false, editId: null });
      newsForm.reset();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить новость",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (deleteDialog.id) {
      if (deleteDialog.type === "news") {
        deleteNewsMutation.mutate(deleteDialog.id);
      } else {
        deleteDocumentMutation.mutate(deleteDialog.id);
      }
    }
    setDeleteDialog({ open: false, type: "news", id: null });
  };

  const handleCreateNews = () => {
    newsForm.reset();
    setNewsDialog({ open: true, editId: null });
  };

  const handleEditNews = (news: News) => {
    newsForm.reset({
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      imageUrl: news.imageUrl || "",
    });
    setNewsDialog({ open: true, editId: news.id });
  };

  const onNewsSubmit = (data: NewsFormValues) => {
    saveNewsMutation.mutate(data);
  };

  // Create/update document mutation
  const saveDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      if (documentDialog.editId) {
        return await apiRequest("PUT", `/api/documents/${documentDialog.editId}`, data);
      } else {
        return await apiRequest("POST", "/api/documents", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: documentDialog.editId ? "Документ обновлён" : "Документ создан",
        description: documentDialog.editId ? "Документ успешно обновлён" : "Документ успешно создан",
      });
      setDocumentDialog({ open: false, editId: null });
      documentForm.reset();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить документ",
        variant: "destructive",
      });
    },
  });

  const handleCreateDocument = () => {
    documentForm.reset();
    setUploadMethod("url");
    setUploadedFileUrl("");
    setDocumentDialog({ open: true, editId: null });
  };

  const handleEditDocument = (doc: Document) => {
    documentForm.reset({
      title: doc.title,
      description: doc.description || "",
      category: doc.category,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
    });
    // Set upload method based on whether fileUrl starts with /objects/
    setUploadMethod(doc.fileUrl.startsWith("/objects/") ? "upload" : "url");
    setUploadedFileUrl(doc.fileUrl.startsWith("/objects/") ? doc.fileUrl : "");
    setDocumentDialog({ open: true, editId: doc.id });
  };


  const onDocumentSubmit = (data: DocumentFormValues) => {
    // For upload method, use uploadedFileUrl instead of data.fileUrl
    const finalFileUrl = uploadMethod === "upload" ? uploadedFileUrl : data.fileUrl;
    
    console.log("[DEBUG] Submit - Upload method:", uploadMethod);
    console.log("[DEBUG] Submit - uploadedFileUrl:", uploadedFileUrl);
    console.log("[DEBUG] Submit - data.fileUrl:", data.fileUrl);
    console.log("[DEBUG] Submit - finalFileUrl:", finalFileUrl);
    
    // Validate that we have a file URL
    if (!finalFileUrl || finalFileUrl.trim() === "") {
      console.log("[DEBUG] Validation failed - no file URL");
      toast({
        title: "Ошибка",
        description: uploadMethod === "upload" ? "Загрузите файл перед сохранением" : "Укажите URL документа",
        variant: "destructive",
      });
      return;
    }
    
    // Validate URL protocol for external URLs
    if (uploadMethod === "url") {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(finalFileUrl)) {
        toast({
          title: "Ошибка",
          description: "URL должен начинаться с http:// или https://",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Update data with final file URL
    const submitData = {
      ...data,
      fileUrl: finalFileUrl
    };
    
    saveDocumentMutation.mutate(submitData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" data-testid="heading-admin">
          Панель администратора
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2" data-testid="tabs-admin">
          <TabsTrigger value="news" data-testid="tab-admin-news">
            Новости
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-admin-documents">
            Документы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Управление новостями и объявлениями
            </p>
            <Button size="sm" onClick={handleCreateNews} data-testid="button-create-news">
              <Plus className="h-4 w-4 mr-2" />
              Добавить новость
            </Button>
          </div>

          {newsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : newsData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Новостей пока нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {newsData.map((news) => (
                <Card key={news.id} data-testid={`card-news-${news.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base mb-1">{news.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {news.excerpt}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {news.views}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(news.publishedAt), "d MMMM yyyy", { locale: ru })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleEditNews(news)}
                          data-testid={`button-edit-news-${news.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteDialog({ open: true, type: "news", id: news.id })}
                          data-testid={`button-delete-news-${news.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Управление документами и файлами
            </p>
            <Button size="sm" onClick={handleCreateDocument} data-testid="button-create-document">
              <Plus className="h-4 w-4 mr-2" />
              Загрузить документ
            </Button>
          </div>

          {documentsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : documentsData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Документов пока нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {documentsData.map((doc) => (
                <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                        </div>
                        {doc.description && (
                          <CardDescription className="line-clamp-1">
                            {doc.description}
                          </CardDescription>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {doc.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doc.fileType.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(doc.uploadedAt), "d MMMM yyyy", { locale: ru })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditDocument(doc)}
                          data-testid={`button-edit-document-${doc.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteDialog({ open: true, type: "document", id: doc.id })}
                          data-testid={`button-delete-document-${doc.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={documentDialog.open} onOpenChange={(open) => setDocumentDialog({ ...documentDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-document">
              {documentDialog.editId ? "Редактировать документ" : "Новый документ"}
            </DialogTitle>
            <DialogDescription>
              Заполните форму для {documentDialog.editId ? "редактирования" : "создания"} документа
            </DialogDescription>
          </DialogHeader>
          
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-4">
              <FormField
                control={documentForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Введите название документа" data-testid="input-document-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={documentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Описание документа" rows={3} data-testid="input-document-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={documentForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-document-category">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Устав">Устав</SelectItem>
                        <SelectItem value="Протокол">Протокол</SelectItem>
                        <SelectItem value="Уведомление">Уведомление</SelectItem>
                        <SelectItem value="Договор">Договор</SelectItem>
                        <SelectItem value="Другое">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label>Способ добавления файла</Label>
                  <RadioGroup 
                    value={uploadMethod} 
                    onValueChange={(value: "url" | "upload") => {
                      setUploadMethod(value);
                      // Reset uploaded file when switching to URL method
                      if (value === "url") {
                        setUploadedFileUrl("");
                      }
                    }} 
                    className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="url" data-testid="radio-url" />
                      <Label htmlFor="url" className="flex items-center gap-2 cursor-pointer">
                        <LinkIcon className="h-4 w-4" />
                        <span>URL ссылка</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload" data-testid="radio-upload" />
                      <Label htmlFor="upload" className="flex items-center gap-2 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Загрузить файл</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {uploadMethod === "url" ? (
                  <FormField
                    control={documentForm.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL файла</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/document.pdf" data-testid="input-document-url" />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Укажите полный адрес документа (например: https://drive.google.com/file/...)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label>Файл документа</Label>
                    <div className="flex items-center gap-4">
                      <FileUploadFixed
                        maxFileSize={52428800}
                        onComplete={(fileUrl) => {
                          console.log("✅ File uploaded, URL:", fileUrl);
                          setUploadedFileUrl(fileUrl);
                        }}
                      />
                      {uploadedFileUrl && (
                        <Badge variant="outline" className="text-xs">
                          ✓ Файл загружен
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Максимальный размер файла: 50 МБ
                    </p>
                  </div>
                )}
              </div>

              <FormField
                control={documentForm.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип файла</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-document-type">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="doc">DOC</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="xls">XLS</SelectItem>
                        <SelectItem value="xlsx">XLSX</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDocumentDialog({ open: false, editId: null })}
                  data-testid="button-cancel-document"
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveDocumentMutation.isPending}
                  data-testid="button-save-document"
                >
                  {saveDocumentMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={newsDialog.open} onOpenChange={(open) => setNewsDialog({ ...newsDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-news">
              {newsDialog.editId ? "Редактировать новость" : "Новая новость"}
            </DialogTitle>
            <DialogDescription>
              Заполните форму для {newsDialog.editId ? "редактирования" : "создания"} новости
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newsForm}>
            <form onSubmit={newsForm.handleSubmit(onNewsSubmit)} className="space-y-4">
              <FormField
                control={newsForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Введите заголовок" data-testid="input-news-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newsForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Краткое описание</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Краткое описание для превью" rows={2} data-testid="input-news-excerpt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newsForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Содержание</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Полное содержание новости" rows={8} data-testid="input-news-content" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newsForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения (необязательно)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" data-testid="input-news-image" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewsDialog({ open: false, editId: null })}
                  data-testid="button-cancel-news"
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveNewsMutation.isPending}
                  data-testid="button-save-news"
                >
                  {saveNewsMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эт{deleteDialog.type === "news" ? "у новость" : "от документ"}? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover-elevate active-elevate-2"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
