
// import React from 'react';
// import { useGetUserQuery } from '../features/posts/postsApi';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';

// interface PostItemProps {
//   id: number;
//   title: string;
//   body: string;
//   userId: number;
//   tags: string[];
//   reactions: number;
// }

// const PostItem = ({ id, title, body, userId, tags, reactions }: PostItemProps) => {
//   const { data: user, isLoading: userLoading } = useGetUserQuery(userId);

//   return (
//     <Card className="mb-4 overflow-hidden transition-shadow hover:shadow-md">
//       <CardHeader className="pb-3 flex flex-row items-center space-x-4">
//         <Avatar className="h-10 w-10">
//           {user ? (
//             <AvatarImage src={user.image} alt={user.username} />
//           ) : (
//             <AvatarFallback className="bg-primary text-primary-foreground">
//               {userLoading ? "..." : "U"}
//             </AvatarFallback>
//           )}
//         </Avatar>
//         <div className="space-y-1">
//           <CardTitle className="text-lg">{title}</CardTitle>
//           <div className="text-sm text-muted-foreground">
//             {user ? `@${user.username}` : "Loading..."}
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <p className="text-sm text-left">{body}</p>
//       </CardContent>
//       <CardFooter className="flex flex-row justify-between border-t pt-4">
//         <div className="flex flex-wrap gap-1">
//           {tags.map((tag) => (
//             <Badge key={tag} variant="secondary" className="text-xs">
//               #{tag}
//             </Badge>
//           ))}
//         </div>
//         <div className="text-sm text-muted-foreground">
//           {reactions} {reactions === 1 ? "reaction" : "reactions"}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export default PostItem;

import React from 'react';
import { useGetUserQuery } from '../features/posts/postsApi';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Reactions {
  likes: number;
  dislikes: number;
}

interface PostItemProps {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: Reactions; // Changed from number to Reactions object
}

const PostItem = ({ id, title, body, userId, tags, reactions }: PostItemProps) => {
  const { data: user, isLoading: userLoading } = useGetUserQuery(userId);

  // Calculate total reactions
  const totalReactions = reactions.likes + reactions.dislikes;

  return (
    <Card className="mb-4 overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center space-x-4">
        <Avatar className="h-10 w-10">
          {user ? (
            <AvatarImage src={user.image} alt={user.username} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userLoading ? "..." : "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {user ? `@${user.username}` : "Loading..."}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-left">{body}</p>
      </CardContent>
      <CardFooter className="flex flex-row justify-between border-t pt-4">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>👍 {reactions.likes}</span>
          <span>👎 {reactions.dislikes}</span>
          <span>({totalReactions} total)</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostItem;