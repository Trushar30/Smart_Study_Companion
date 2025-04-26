import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { 
  BarChart2, 
  FileText, 
  Lightbulb, 
  HelpCircle, 
  Calendar 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: <BarChart2 className="w-5 h-5" /> },
  { name: "Notes Generator", path: "/notes", icon: <FileText className="w-5 h-5" /> },
  { 
    name: "Real-World Explanations", 
    path: "/explanations", 
    icon: <Lightbulb className="w-5 h-5" /> 
  },
  { name: "Quiz", path: "/quiz", icon: <HelpCircle className="w-5 h-5" /> },
  { 
    name: "Study Plan Generator", 
    path: "/study-plan-generator", 
    icon: <Calendar className="w-5 h-5" /> 
  },
];

const Sidebar = () => {
  const [location] = useLocation();

  return (
    <nav className="w-full lg:w-64 bg-sidebar shadow-md lg:min-h-screen">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">
            <span className="text-primary">SMART</span> STUDY
            <div>COMPANION</div>
          </div>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "block px-4 py-3 rounded-lg font-medium transition-colors",
                location === item.path
                  ? "bg-primary/10 text-primary dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-primary/10"
              )}
            >
              <div className="flex items-center">
                <div className="w-5 mr-2 flex-shrink-0">
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
