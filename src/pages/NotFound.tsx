
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-2xl font-semibold">Página não encontrada</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A página que você está procurando não existe ou foi movida para outro local.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link to="/chips">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Gerenciar Chips
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
