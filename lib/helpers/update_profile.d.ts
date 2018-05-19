declare const updateProfile: ({ name: displayName, imageUrl: photoURL, email }: Partial<{
    name: string;
    imageUrl: string;
    email: string;
}>) => Promise<{}>;
export default updateProfile;
