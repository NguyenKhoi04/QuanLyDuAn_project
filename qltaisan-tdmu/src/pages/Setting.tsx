import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  Database,
  Globe,
  Key,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

type TabId = "general" | "account" | "notifications" | "security" | "appearance" | "system";

function Setting() {
  const tabs = useMemo(
    () => [
      { id: "general" as const, label: "Chung", icon: SettingsIcon },
      { id: "account" as const, label: "Tài khoản", icon: User },
      { id: "notifications" as const, label: "Thông báo", icon: Bell },
      { id: "security" as const, label: "Bảo mật", icon: Shield },
      { id: "appearance" as const, label: "Giao diện", icon: Palette },
      { id: "system" as const, label: "Hệ thống", icon: Database },
    ],
    [],
  );

  const [activeTab, setActiveTab] = useState<TabId>("general");

  const [settings, setSettings] = useState({
    appName: "Hệ thống Quản lý Tài sản",
    appDescription: "Ứng dụng quản lý tài sản phục vụ công tác quản trị tại đơn vị.",
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    language: "vi",
    accountEmail: "admin@tdmu.edu.vn",
    accountFullName: "Quản trị hệ thống",
    notifyEmail: true,
    notifyInApp: true,
    twoFactor: true,
    apiKeyMasked: "sk_live_••••••••••••••••••••••••",
    theme: "system" as "light" | "dark" | "system",
    autoBackup: true,
  });

  const onSave = () => {
    toast("Đã lưu cài đặt", {
      description: "Thay đổi của bạn đã được ghi nhận.",
    });
  };

  return (
    <AppShell>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <SettingsIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Cài đặt hệ thống</h2>
                  <p className="text-sm text-muted-foreground">Quản lý cấu hình ứng dụng</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Ngôn ngữ: {settings.language === "vi" ? "Tiếng Việt" : "English"}
                </Button>
                <Button onClick={onSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <aside className="w-72 shrink-0">
              <nav className="space-y-1 sticky top-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                        active
                          ? "bg-muted text-foreground border border-border"
                          : "hover:bg-muted/60 text-muted-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="flex-1 max-w-3xl space-y-6">
              {activeTab === "general" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin chung</CardTitle>
                    <CardDescription>Cấu hình cơ bản cho ứng dụng.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tên ứng dụng</Label>
                      <Input
                        value={settings.appName}
                        onChange={(e) => setSettings((s) => ({ ...s, appName: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mô tả ngắn</Label>
                      <Textarea
                        rows={3}
                        value={settings.appDescription}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, appDescription: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Múi giờ</Label>
                        <Select
                          value={settings.timezone}
                          onValueChange={(v) => setSettings((s) => ({ ...s, timezone: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn múi giờ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                            <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                            <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Đơn vị tiền tệ</Label>
                        <Select
                          value={settings.currency}
                          onValueChange={(v) => setSettings((s) => ({ ...s, currency: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tiền tệ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "account" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tài khoản</CardTitle>
                    <CardDescription>Thông tin hồ sơ người dùng đang đăng nhập.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Họ tên</Label>
                        <Input
                          value={settings.accountFullName}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, accountFullName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={settings.accountEmail}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, accountEmail: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Ngôn ngữ</p>
                        <p className="text-sm text-muted-foreground">
                          Áp dụng cho giao diện và định dạng hiển thị.
                        </p>
                      </div>
                      <Select
                        value={settings.language}
                        onValueChange={(v) => setSettings((s) => ({ ...s, language: v }))}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Chọn ngôn ngữ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông báo</CardTitle>
                    <CardDescription>Quản lý kênh và loại thông báo.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Thông báo qua Email</p>
                        <p className="text-sm text-muted-foreground">Nhận cảnh báo và báo cáo qua email.</p>
                      </div>
                      <Switch
                        checked={settings.notifyEmail}
                        onCheckedChange={(v) => setSettings((s) => ({ ...s, notifyEmail: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Thông báo trong ứng dụng</p>
                        <p className="text-sm text-muted-foreground">Hiển thị thông báo ngay trên hệ thống.</p>
                      </div>
                      <Switch
                        checked={settings.notifyInApp}
                        onCheckedChange={(v) => setSettings((s) => ({ ...s, notifyInApp: v }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "security" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bảo mật & Quyền riêng tư</CardTitle>
                    <CardDescription>Cấu hình các tuỳ chọn bảo mật.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Xác thực hai yếu tố (2FA)</p>
                        <p className="text-sm text-muted-foreground">Tăng cường bảo mật tài khoản.</p>
                      </div>
                      <Switch
                        checked={settings.twoFactor}
                        onCheckedChange={(v) => setSettings((s) => ({ ...s, twoFactor: v }))}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <p className="font-medium">API Keys</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
                          {settings.apiKeyMasked}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            toast("Đã sao chép", { description: "API key (masked) đã được sao chép." })
                          }
                        >
                          <Key className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "appearance" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Giao diện</CardTitle>
                    <CardDescription>Tuỳ chọn chủ đề hiển thị.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: "light" as const, label: "Light" },
                        { id: "dark" as const, label: "Dark" },
                        { id: "system" as const, label: "System" },
                      ].map((t) => {
                        const active = settings.theme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSettings((s) => ({ ...s, theme: t.id }))}
                            className={[
                              "rounded-lg border p-4 text-left transition-colors",
                              active ? "border-primary" : "border-border hover:border-primary/60",
                            ].join(" ")}
                          >
                            <div className="h-24 rounded-md bg-muted mb-3 flex items-center justify-center">
                              <Palette className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">{t.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "system" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hệ thống</CardTitle>
                    <CardDescription>Cấu hình vận hành và sao lưu.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Tự động sao lưu</p>
                        <p className="text-sm text-muted-foreground">Tạo bản sao lưu định kỳ dữ liệu hệ thống.</p>
                      </div>
                      <Switch
                        checked={settings.autoBackup}
                        onCheckedChange={(v) => setSettings((s) => ({ ...s, autoBackup: v }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Vùng nguy hiểm
                  </CardTitle>
                  <CardDescription>Hành động này không thể hoàn tác.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Xóa toàn bộ dữ liệu hệ thống
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa dữ liệu</AlertDialogTitle>
                        <AlertDialogDescription>
                          Thao tác này sẽ xóa dữ liệu hệ thống (demo UI). Bạn có chắc chắn muốn tiếp tục?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => toast("Đã thực hiện", { description: "Dữ liệu (demo) đã được xóa." })}
                        >
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </section>
          </div>
    </AppShell>
  );
}

export default Setting;
