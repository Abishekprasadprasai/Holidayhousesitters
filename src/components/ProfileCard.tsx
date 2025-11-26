import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User } from "lucide-react";

type ProfileCardProps = {
  id: string;
  name: string;
  role: "sitter" | "homeowner";
  bio?: string;
  location?: string;
  photo_url?: string;
  skills?: string[];
  isHighlighted?: boolean;
  onClick: () => void;
};

export function ProfileCard({
  name,
  role,
  bio,
  location,
  photo_url,
  skills,
  isHighlighted,
  onClick,
}: ProfileCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all ${
        isHighlighted ? "ring-2 ring-primary shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {photo_url ? (
            <img
              src={photo_url}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base mb-1 truncate">{name}</CardTitle>
            <Badge
              variant={role === "sitter" ? "default" : "secondary"}
              className="text-xs"
            >
              {role === "sitter" ? "Sitter" : "Homeowner"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {bio}
          </p>
        )}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="text-xs bg-muted px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-xs text-muted-foreground px-2 py-0.5">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
