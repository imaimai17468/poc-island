import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ServiceCardProps = {
  id: string;
  name: string;
  prompt: string;
  description: string | null;
  url: string;
  createdAt: Date | string;
};

export const ServiceCard = ({
  id,
  name,
  prompt,
  description,
  url,
  createdAt,
}: ServiceCardProps) => {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {description ?? prompt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">
          {date.toLocaleDateString("ja-JP")}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/services/$id" params={{ id }}>
            Details
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            Open
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};
