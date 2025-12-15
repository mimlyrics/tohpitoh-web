// src/mocks/react-router-dom.ts
export const useNavigate = () => {
  console.warn('useNavigate called but react-router-dom is not properly configured');
  return (path: string) => {
    console.log('Mock navigation to:', path);
    // You can implement simple hash-based navigation
    window.location.hash = path;
  };
};

export const Navigate = ({ to }: { to: string }) => {
  console.log('Mock Navigate to:', to);
  window.location.hash = to;
  return null;
};

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = ({ path, element }: { path: string; element: React.ReactNode }) => <>{element}</>;
export const Link = ({ to, children, ...props }: any) => (
  <a href={`#${to}`} {...props}>
    {children}
  </a>
);