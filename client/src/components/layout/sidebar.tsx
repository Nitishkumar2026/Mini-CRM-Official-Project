import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useLogout } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Audience Builder", href: "/audiences", icon: "👥" },
  { name: "Campaigns", href: "/campaigns", icon: "📢" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
  { name: "API Documentation", href: "/api-docs", icon: "💻" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useAuth();
  const logout = useLogout();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-slate-800">Xeno CRM</span>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors",
                    location === item.href && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout.mutate()}
              className="w-full text-xs text-slate-500 hover:text-slate-700"
            >
              Sign out
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
