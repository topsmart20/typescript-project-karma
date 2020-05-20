import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { NextPage, NextPageContext } from 'next';
import nextCookie from 'next-cookies';
import cookie from 'js-cookie';
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { useQuery } from '@apollo/react-hooks';
import graphql from 'graphql-tag';

import { withAuthSync } from '../../../auth/WithAuthSync';
import { withApollo } from '../../../apollo/Apollo';

import { Template, ProfileThoughts, Me, Profile, Loading } from '../../../ui';
import { labels } from '../../../ui/layout';
import { useS3PostsMedias } from '../../../hooks';

import validateTab from '../../../util/validateTab';
import { KARMA_AUTHOR } from '../../../common/config';
import { RootState } from '../../../store/ducks/rootReducer';

const GET_PROFILE = graphql`
  query profile($accountname: String!, $me: String!, $profilePath: any, $postsPath: any, $followersPath: any, $followingPath: any) {
    profile(accountname: $accountname) @rest(type: "Profile", pathBuilder: $profilePath) {
      displayname
      author
      bio
      hash
      url
      followers_count
      following_count
      followers(accountname: $accountname, page: $page) @rest(type: "Followers", pathBuilder: $followersPath) {
        username
        hash
        displayname
        author
      }
      following(accountname: $accountname, page: $page) @rest(type: "Followers", pathBuilder: $followingPath) {
        username
        hash
        displayname
        author
      }
      username
    }
    posts(accountname: $accountname) @rest(type: "Post", pathBuilder: $postsPath) {
      post_id
      imagehashes
      videohashes
    }
  }
`;

const GET_POSTS = graphql`
  query posts($accountname: String!, $upvoted: Array, $pathBuilder: any) {
    posts(accountname: $accountname) @rest(type: "Post", pathBuilder: $pathBuilder) {
      post_id
      author
      author_displayname
      author_profilehash
      description
      voteStatus(upvoted: $upvoted) @client
      created_at
      last_edited_at
      imagehashes
      videohashes
      category_ids
      upvote_count
      downvote_count
      comment_count
      tip_count
      video_count
      username
    }
  }
`;

interface Props {
  me: string;
  userData: any;
}

const ProfileWrapper: NextPage<Props> = ({ me, userData }) => {
  const router = useRouter();
  const imgRef = useRef();
  const { username, tab } = router.query;

  const cookies = cookie.get();
  const meUsername = cookies[KARMA_AUTHOR];

  const { profile } = useSelector((state: RootState) => state.user);

  const isMe = useMemo(() => {
    return username === meUsername;
  }, [meUsername, username]);

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (!userData || !userData.profile || !profile) {
      router.back();
    } else {
      setFollowers(
        userData.profile.followers.map((data: { author: string }) => ({
          ...data,
          isFollowing: !!profile.following.find(item => item == data.author),
        })),
      );
      setFollowing(
        userData.profile.following.map((data: { author: string }) => ({
          ...data,
          isFollowing: !!profile.following.find(item => item == data.author),
        })),
      );
    }
  }, [userData, profile]);

  const { fetchMore, loading } = useQuery(GET_POSTS, {
    variables: {
      accountname: username,
      upvoted: profile.upvoted,
      pathBuilder: () => `posts/account/${username}?Page=1&Limit=12&post_type=${tab == 'media' ? 1 : 2}&domainID=${1}`,
    },
    onCompleted: data => {
      const results = data.posts.filter((post, idx) => data.posts.indexOf(post) == idx);
      if (tab == 'media') setPosts(results);
      else setThoughts(results);
    },
  });

  const loadMorePosts = useCallback(() => {
    fetchMore({
      variables: {
        pathBuilder: () =>
          `posts/account/${username}?Page=${page + 1}&Limit=12&post_type=${tab == 'media' ? 1 : 2}&domainId=${1}`,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.posts.length == 0) {
          return Object.assign({}, previousResult, {
            posts: [
              ...previousResult.posts,
              { ...previousResult.posts[previousResult.posts.length - 1], post_id: '', imagehashes: [] },
            ],
          });
        }

        setPage(page + 1);
        return Object.assign({}, previousResult, {
          posts: [...previousResult.posts, ...fetchMoreResult.posts],
        });
      },
    });
  }, [username, fetchMore, page]);

  if (!posts && loading) return <Loading withContainer size="big" />;

  const medias = useS3PostsMedias(posts, 'thumbBig');

  const tabs = [
    {
      name: 'Media',
      render: () => Template({ medias: medias, loadMore: loadMorePosts, renderedRef: imgRef }),
    },
    {
      name: 'Thoughts',
      render: () => ProfileThoughts({ profile: profile, posts: thoughts, loadMore: loadMorePosts }),
    },
  ];

  if (isMe)
    return (
      <Me
        tabs={tabs}
        tab={tab as string}
        followersData={followers}
        followingData={following}
        profile={profile}
        postCount={userData.posts.length}
      />
    );

  return (
    <Profile
      tabs={tabs}
      tab={tab as string}
      profile={{ ...userData.profile, followers: followers, following: following }}
      postCount={userData.posts.length}
      myProfile={profile}
      me={me}
    />
  );
};

interface Context extends NextPageContext {
  query: {
    tab: string;
    username: string;
  };
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

ProfileWrapper.getInitialProps = async (ctx: Context) => {
  const cookies = nextCookie(ctx);
  const me = cookies[encodeURIComponent(KARMA_AUTHOR)];

  validateTab(ctx, me ? `/profile/${me}/media` : '/home', ['media', 'thoughts']);

  const username = ctx.query.username;
  const { data } = await ctx.apolloClient.query({
    query: GET_PROFILE,
    variables: {
      accountname: ctx.query.username,
      me,
      profilePath: () => `profile/${username}?domainID=${1}`,
      postsPath: () => `posts/account/${username}?domainID=${1}`,
      followersPath: () => `profile/${username}/followers/`,
      followingPath: () => `profile/${username}/following/`,
    },
  });

  return {
    meta: {
      title: `Karma/${ctx.query.username}`,
    },
    me,
    layoutConfig: { layout: labels.DEFAULT, shouldHideHeader: true },
    userData: data,
  };
};

export default withAuthSync(withApollo({ ssr: true })(ProfileWrapper));
