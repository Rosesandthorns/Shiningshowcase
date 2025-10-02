
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type User } from 'firebase/auth';
import { useState } from 'react';
import { updateUserProfile } from '@/lib/user';
import { useFirestore } from '@/firebase';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters.' }).max(30, { message: 'Display name must not be longer than 30 characters.' }),
  photoFile: z.instanceof(File).optional(),
  bannerFile: z.instanceof(File).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileClientProps {
  user: User;
  profile: { displayName?: string; photoURL?: string; bannerURL?: string; } | null;
  onSave: () => void;
}

export function EditProfileClient({ user, profile, onSave }: EditProfileClientProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile?.displayName || user.displayName || '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    toast({
      title: 'Updating profile...',
      description: 'Please wait while we save your changes.',
    });

    try {
      await updateUserProfile(firestore, user, {
        displayName: data.displayName,
        photoFile: data.photoFile,
        bannerFile: data.bannerFile,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photoFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture (PNG, JPG, GIF)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bannerFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Banner (PNG, JPG, GIF)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  );
}
