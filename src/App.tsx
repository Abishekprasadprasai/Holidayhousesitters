import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Chatbot } from "@/components/Chatbot";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import PaymentSuccess from "./pages/PaymentSuccess";
import Browse from "./pages/Browse";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetails";
import NotFound from "./pages/NotFound";
import ProfileEdit from "./pages/ProfileEdit";
import AdminVerifyUsers from "./pages/AdminVerifyUsers";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/admin/verify-users" element={<AdminVerifyUsers />} />
          <Route path="/listings/new" element={<CreateListing />} />
          <Route path="/my-listings" element={<MyListings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
