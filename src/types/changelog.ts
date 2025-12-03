
export interface ChangelogPost {
    id: string;
    userId: string;
    userDisplayName: string;
    userPhotoURL?: string;
    title: string;
    content: string;
    createdAt: number; // timestamp
}
