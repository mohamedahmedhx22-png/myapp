import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Plus, Phone, User, MapPin, Calendar, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface PhoneName {
  id: string;
  phoneNumber: string;
  name: string;
  isVerified: boolean;
  verificationMethod?: string;
  verificationDate?: string;
  createdAt: string;
  addedByUser: {
    id: string;
    name: string;
    city?: string;
    country?: string;
    region?: string;
  };
}

interface SearchResult {
  users: any[];
  phoneContacts: any[];
  totalContacts: number;
}

export default function PhoneDiscoveryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'phone' | 'name'>('phone');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [phoneNames, setPhoneNames] = useState<PhoneName[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingName, setIsAddingName] = useState(false);
  
  // Add name dialog state
  const [showAddNameDialog, setShowAddNameDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');

  useEffect(() => {
    // Check if there's a phone number in the URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const phoneParam = urlParams.get('phone');
    if (phoneParam) {
      setSearchQuery(phoneParam);
      setSearchType('phone');
      handleSearch(phoneParam, 'phone');
    }
  }, []);

  const handleSearch = async (query: string, type: 'phone' | 'name') => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=${type}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        
        // If searching by phone, also get the names
        if (type === 'phone') {
          await fetchPhoneNames(query);
        }
      } else {
        toast({
          title: "خطأ في البحث",
          description: "حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const fetchPhoneNames = async (phoneNumber: string) => {
    try {
      const response = await fetch(`/api/phone-numbers/${phoneNumber}/names`);
      if (response.ok) {
        const names = await response.json();
        setPhoneNames(names);
      }
    } catch (error) {
      console.error('Error fetching phone names:', error);
    }
  };

  const handleAddName = async () => {
    if (!isAuthenticated) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يجب تسجيل الدخول لإضافة اسم جديد",
        variant: "destructive",
      });
      return;
    }

    if (!newName.trim() || !selectedPhoneNumber.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال الاسم ورقم الهاتف",
        variant: "destructive",
      });
      return;
    }

    setIsAddingName(true);
    try {
      const response = await fetch(`/api/phone-numbers/${selectedPhoneNumber}/names`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        toast({
          title: "تم الإضافة بنجاح",
          description: "تم إضافة الاسم الجديد للرقم",
        });
        
        // Refresh the phone names
        await fetchPhoneNames(selectedPhoneNumber);
        
        // Reset form
        setNewName('');
        setShowAddNameDialog(false);
      } else {
        const error = await response.json();
        toast({
          title: "خطأ في الإضافة",
          description: error.message || "حدث خطأ أثناء إضافة الاسم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الإضافة",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsAddingName(false);
    }
  };

  const handleVerifyName = async (nameId: string, method: string) => {
    try {
      const response = await fetch(`/api/phone-numbers/names/${nameId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationMethod: method }),
      });

      if (response.ok) {
        toast({
          title: "تم التحقق",
          description: "تم التحقق من الاسم بنجاح",
        });
        
        // Refresh the phone names
        if (searchQuery) {
          await fetchPhoneNames(searchQuery);
        }
      } else {
        const error = await response.json();
        toast({
          title: "خطأ في التحقق",
          description: error.message || "حدث خطأ أثناء التحقق",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في التحقق",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">كاشف الأرقام المتقدم</h1>
        <p className="text-center text-muted-foreground">
          اكتشف الأرقام والأسماء مع معلومات مفصلة عن كل جهة اتصال
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>البحث</CardTitle>
          <CardDescription>
            ابحث عن رقم هاتف أو اسم للعثور على المعلومات المتاحة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={searchType === 'phone' ? 'أدخل رقم الهاتف' : 'أدخل الاسم'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery, searchType)}
              />
            </div>
            <Select value={searchType} onValueChange={(value: 'phone' | 'name') => setSearchType(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">بحث برقم الهاتف</SelectItem>
                <SelectItem value="name">بحث بالاسم</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => handleSearch(searchQuery, searchType)}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full sm:w-auto"
            >
              {isSearching ? 'جاري البحث...' : <Search className="w-4 h-4 ml-2" />}
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {searchResults && (
        <div className="space-y-6">
          {/* Phone Names Section (when searching by phone) */}
          {searchType === 'phone' && phoneNames.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      أسماء الرقم {searchQuery}
                    </CardTitle>
                    <CardDescription>
                      الأسماء المسجلة لهذا الرقم مع معلومات من أضافها
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedPhoneNumber(searchQuery);
                      setShowAddNameDialog(true);
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة اسم جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phoneNames.map((name) => (
                    <div key={name.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">{name.name}</span>
                          {name.isVerified && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              موثق
                            </Badge>
                          )}
                        </div>
                        {!name.isVerified && isAuthenticated && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyName(name.id, 'manual')}
                          >
                            <Shield className="w-3 h-3 ml-1" />
                            توثيق
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>أضيف بواسطة: {name.addedByUser.name}</span>
                        </div>
                        
                        {name.addedByUser.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{name.addedByUser.city}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>تاريخ الإضافة: {formatDate(name.createdAt)}</span>
                        </div>
                        
                        {name.verificationDate && (
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>تاريخ التوثيق: {formatDate(name.verificationDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          <Card>
            <CardHeader>
              <CardTitle>نتائج البحث</CardTitle>
              <CardDescription>
                {searchType === 'phone' 
                  ? `نتائج البحث عن الرقم ${searchQuery}`
                  : `نتائج البحث عن الاسم ${searchQuery}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users">المستخدمون المسجلون</TabsTrigger>
                  <TabsTrigger value="contacts">جهات الاتصال</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-4">
                  {searchResults.users.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.users.map((user) => (
                        <div key={user.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <Badge variant={user.accountType === 'business' ? 'default' : 'secondary'}>
                              {user.accountType === 'business' ? 'عمل تجاري' : 'شخصي'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{user.phone}</span>
                            </div>
                            
                            {user.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{user.city}</span>
                              </div>
                            )}
                            
                            {user.category && (
                              <div className="flex items-center gap-2">
                                <span>الفئة: {user.category}</span>
                              </div>
                            )}
                          </div>
                          
                          {user.description && (
                            <p className="mt-3 text-sm">{user.description}</p>
                          )}
                          
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/profile/${user.id}`)}
                            >
                              عرض الملف الشخصي
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد نتائج للمستخدمين المسجلين</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="contacts" className="mt-4">
                  {searchResults.phoneContacts.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.phoneContacts.map((contact: any) => (
                        <div key={contact.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{contact.contactName}</h3>
                            {contact.isVerified && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                موثق
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>أضيف بواسطة: {contact.addedByUser.name}</span>
                            </div>
                            
                            {contact.addedByUser.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{contact.addedByUser.city}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>تاريخ الإضافة: {formatDate(contact.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد نتائج لجهات الاتصال</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Name Dialog */}
      <Dialog open={showAddNameDialog} onOpenChange={setShowAddNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة اسم جديد للرقم</DialogTitle>
            <DialogDescription>
              أضف اسم جديد للرقم {selectedPhoneNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">رقم الهاتف</Label>
              <Input
                id="phoneNumber"
                value={selectedPhoneNumber}
                disabled
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                placeholder="أدخل الاسم"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddNameDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddName}
                disabled={isAddingName || !newName.trim()}
              >
                {isAddingName ? 'جاري الإضافة...' : 'إضافة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}