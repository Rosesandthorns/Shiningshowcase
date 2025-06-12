"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilterControlsProps {
  tags: string[];
  selectedTags: string[];
  onTagChange: (tag: string, checked: boolean) => void;
}

export function FilterControls({ tags, selectedTags, onTagChange }: FilterControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline">Filter by Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag}`}
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) => onTagChange(tag, !!checked)}
                aria-labelledby={`label-tag-${tag}`}
              />
              <Label htmlFor={`tag-${tag}`} id={`label-tag-${tag}`} className="cursor-pointer text-sm">
                {tag}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
