import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserRole } from "@/hooks/useUserRole";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useUserRole();

  const NavLinks = () => (
    <>
      <Link to="/how-it-works" className="text-foreground hover:text-primary transition-colors">
        How It Works
      </Link>
      <Link to="/about" className="text-foreground hover:text-primary transition-colors">
        About
      </Link>
      <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
        Contact
      </Link>
      {role === "admin" && (
        <Link to="/admin/verify-users" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Verify Users</span>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Holiday House Sitters" className="h-10 w-auto" />
          <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent hidden sm:inline">
            Holiday House Sitters
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
          <Link to="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link to="/register">
            <Button>Join Now</Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              <NavLinks />
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full">Log In</Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Join Now</Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
