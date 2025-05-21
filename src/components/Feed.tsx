
import React, { useEffect, useRef, useState } from 'react';
import { useGetPostsQuery } from '../features/posts/postsApi';
import PostItem from './PostItem';
import { Skeleton } from './ui/skeleton';
import { Loader } from 'lucide-react';

const POSTS_PER_PAGE = 10;

const Feed = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, error } = useGetPostsQuery({
    skip: page * POSTS_PER_PAGE,
    limit: POSTS_PER_PAGE,
  });

  const observerRef = useRef<HTMLDivElement>(null);
  const hasMorePosts = data && data.total > (page + 1) * POSTS_PER_PAGE;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMorePosts && !isFetching) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasMorePosts, isFetching]);

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-16" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Failed to load posts.</div>;
  }

  return (
    <div className="space-y-6 feed-container min-h-screen">
      {data?.posts?.map((post) => (
        <PostItem
          key={post.id}
          id={post.id}
          title={post.title}
          body={post.body}
          userId={post.userId}
          tags={post.tags}
          reactions={post.reactions}
        />
      ))}
      
      {isFetching && (
        <div className="flex justify-center p-4">
          <Loader className="animate-spin text-primary h-6 w-6" />
        </div>
      )}
      
      {/* Sentinel element for infinite scrolling */}
      <div ref={observerRef} className="h-4" />
    </div>
  );
};

export default Feed;
