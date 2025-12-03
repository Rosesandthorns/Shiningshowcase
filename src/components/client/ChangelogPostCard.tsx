'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { ChangelogPost } from '@/types/changelog';
import { Badge } from '../ui/badge';

interface ChangelogPostCardProps {
    post: ChangelogPost;
}

// A simple markdown-to-HTML converter
function simpleMarkdown(text: string) {
    let html = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>') // Naive list
        .replace(/<\/ul><ul>/g, '') // Merge consecutive lists
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')
        .replace(/\n/gim, '<br />');
    return html;
}

export function ChangelogPostCard({ post }: ChangelogPostCardProps) {
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <div className="flex items-center gap-2 pt-2">
                    <Avatar className="h-6 w-6">
                        {post.userPhotoURL && <AvatarImage src={post.userPhotoURL} alt={post.userDisplayName} />}
                        <AvatarFallback>{post.userDisplayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                        {post.userDisplayName}
                    </span>
                    <Badge variant="outline">Dev</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: simpleMarkdown(post.content) }} />
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </CardFooter>
        </Card>
    );
}
