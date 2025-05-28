import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGoogleAuth } from "@/lib/auth";

interface GoogleAuthProps {
  isVisible: boolean;
}

export function GoogleAuth({ isVisible }: GoogleAuthProps) {
  const { handleGoogleLogin } = useGoogleAuth();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Xeno CRM</h2>
            <p className="text-gray-600">Sign in to access your campaign management platform</p>
          </div>
          
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
