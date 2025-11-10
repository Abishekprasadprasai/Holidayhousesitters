import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

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
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Home className="h-6 w-6 text-primary" />
          <span className="bg-gradient-primary bg-clip-text text-transparent">
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
