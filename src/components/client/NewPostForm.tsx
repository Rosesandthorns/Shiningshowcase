'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { type User } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { useState } from 'react';
import { addChangelogPost } from '@/lib/changelog';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters long.' }),
});


interface NewPostFormProps {
  user: User;
  firestore: Firestore;
  onPostCreated: () => void;
}

export function NewPostForm({ user, firestore, onPostCreated }: NewPostFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
        addChangelogPost(firestore, user, values);

        toast({
            title: 'Post Created!',
            description: 'Your changelog entry has been published.',
        });
        onPostCreated();
    } catch (error: any) {
        console.error("Error submitting post:", error);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error.message || 'Could not create the post. Please try again.',
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., v1.1.0 Release" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown supported)</FormLabel>
              <FormControl>
                <Textarea placeholder="* Added a new feature..." {...field} rows={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish Post'}
        </Button>
      </form>
    </Form>
  );
}
