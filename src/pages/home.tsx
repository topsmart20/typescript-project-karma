import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NextPage, NextPageContext } from 'next';
import nextCookie from 'next-cookies';
import ApolloClient from 'apollo-client';
import { useQuery } from '@apollo/react-hooks';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import graphql from 'graphql-tag';

import { withAuthSync } from '../auth/WithAuthSync';
import { withApollo } from '../apollo/Apollo';
import { KARMA_AUTHOR } from '../common/config';

import { Title, PostCard, Space, InfinityScroll, Loading } from '../ui';
import { labels } from '../ui/layout';

import { actionRequest, actionSuccess } from '../store/ducks/action';
import { getWAXUSDPrice, getEOSPrice } from '../services/config';
import { fetchBalance } from '../services/Auth';

const GET_POSTS = graphql`
  query posts($accountname: String!, $page: Int, $pathBuilder: any, $postsStatus: String) {
    posts(accountname: $accountname, page: $page, postsStatus: $postsStatus)
      @rest(type: "Post", pathBuilder: $pathBuilder) {
      post_id
      author
      author_displayname
      author_profilehash
      description
      voteStatus(accountname: $accountname) @client
      created_at
      last_edited_at
      imagehashes
      videohashes
      category_ids
      upvote_count
      downvote_count
      comment_count
      tip_count
      view_count
      username
    }
  }
`;

interface Props {
  author: string;
}

const Home: NextPage<Props> = ({ author }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [usdPrice, setUsdPrice] = useState(0);
  const [eosPrice, setEosPrice] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);

  useEffect(() => {
    loadPrices();
  }, []);

  const { data, fetchMore, loading } = useQuery(GET_POSTS, {
    variables: {
      accountname: author,
      page: 1,
      postsStatus: 'home',
      pathBuilder: () => `posts/home/${author}?Page=${page}&Limit=12&domainId=${1}`,
    },
  });

  const loadMorePosts = () => {
    if (!fetchMore) return;

    fetchMore({
      variables: {
        page: page + 1,
        pathBuilder: () => `posts/home/${author}?Page=${page + 1}&Limit=12&domainId=${1}`,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }
        setPage(page + 1);
        return Object.assign({}, previousResult, {
          posts: [...previousResult.posts, ...fetchMoreResult.posts],
        });
      },
    });
  };

  const loadPrices = async () => {
    dispatch(actionRequest());
    const USDPrice = await getWAXUSDPrice();
    const EOSPrice = await getEOSPrice();
    const BalanceAmount = await fetchBalance(author);
    setUsdPrice(USDPrice);
    setEosPrice(EOSPrice);
    setBalanceAmount(BalanceAmount);
    dispatch(actionSuccess());
  };

  return (
    <div>
      <Title withDropDown>Feed</Title>

      {loading ? (
        <Loading withContainer size="big" />
      ) : (
        <>
          <Space height={20} />
          {data ? (
            <InfinityScroll length={data.posts.length} loadMore={loadMorePosts} hasMore={data.posts.length > 0}>
              {data.posts.map((post, index) => (
                <React.Fragment key={String(index)}>
                  {index > 0 && <Space height={40} />}
                  <PostCard post={post} usdPrice={usdPrice} eosPrice={eosPrice} balanceAmount={balanceAmount} withFollowButton={false} />
                </React.Fragment>
              ))}
            </InfinityScroll>
          ) : (
            <div />
          )}
        </>
      )}
    </div>
  );
};

interface Context extends NextPageContext {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

Home.getInitialProps = async (ctx: Context) => {
  const cookies = nextCookie(ctx);

  const author = cookies[encodeURIComponent(KARMA_AUTHOR)];

  ctx.apolloClient.writeData({
    data: {
      accountName: author,
    },
  });

  return {
    layoutConfig: { layout: labels.DEFAULT },
    meta: {
      title: 'Karma/Feed',
    },
    author,
  };
};

export default withAuthSync(withApollo({ ssr: true })(Home));
