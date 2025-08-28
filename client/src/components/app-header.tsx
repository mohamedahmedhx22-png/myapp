import { Phone, UserCircle } from "lucide-react";

interface AppHeaderProps {
  onUserMenuClick?: () => void;
}

export default function AppHeader({ onUserMenuClick }: AppHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Phone className="text-white w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">كاشف الأرقام</h1>
          </div>
          <button
            className="touch-target p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onUserMenuClick}
            data-testid="button-user-menu"
          >
            <UserCircle className="text-gray-600 w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
