import React, { useMemo, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import cookie from 'js-cookie';

import { useS3PostMedias } from '../../hooks';
import Avatar from '../common/Avatar';
import FollowButton from '../common/FollowButton';
import Space from '../common/Space';
import Row from '../common/Row';
import Column from '../common/Column';
import Text from '../common/Text';
import FormattedText from '../common/FormattedText';
import { useFormatDistanceStrict, useS3Image } from '../../hooks';
import { RootState } from '../../store/ducks/rootReducer';
import { KARMA_AUTHOR } from '../../common/config';
import CreateComment from './CreateComment';
import PostActions from './PostActions';
import PostContent from './PostContent';
import remove from '../assets/trash.svg';

const Container = styled.ul`
  list-style: none;
  width: 100%;
  background: ${props => props.theme.dark};
  border-radius: 25px 25px 25px 25px;
  padding: 20px;
  max-width: 1105px;
`;

const BelowSection = styled.div<{ toogled: boolean }>`
  width: 100%;
  background: ${props => props.theme.dark};
  border-radius: 25px 25px 25px 25px;

  > div {
    padding: 20px 15px 0;
    border-radius: 25px 25px 0 0;

    header {
      display: flex;

      strong {
        font-size: 20px;
        font-weight: 900;
        color: #fff;
      }

      button {
        background: none;
        margin-left: 10px;

        img {
          width: 14px;
          transition: transform 0.2s;
          transform: ${props => props.toogled && 'rotate(-90deg)'};
        }
      }
    }
  }

  section {
    color: #6f767e;
  }
`;

const Button_one = styled.button`
  border-radius: 3px 3px 3px 3px;
  width: 11px;
  height: 11px;
  margin-top: -30px;
  margin-right: 5px;
  background: ${props => props.theme.white};
  float: right;
`;

const Button_two = styled.button`
  width: 149px;
  background: #20252E 0% 0% no-repeat padding-box;
  box-shadow: 0px 0px 20px #FFFFFF1A;
  border-radius: 10px;
  height: 44px;
  text-align: left;
  font: SemiBold 16px/19px Montserrat;
  letter-spacing: 0px;
  color: #EF3D52;
  font-size: 18px;
  opacity: 1;
`;

const usernameCSS = css`
  color: #6f767e;
  font-size: 16px;
`;

const backimgCSS = css`
  width: 12px;
  height: 16px;
  margin-right: 8px;
  margin-left: 10px;
`;

const Caption = styled.li`
  overflow: hidden;
  @media (max-width: 550px) {
    margin-left: 0;
    span {
      font-size: 18px;
    }
  }
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  position: absolute;
  background-color: none;
  min-width: 130px;
  max-width: 130px;
  z-index: 1;
  left: -95px;
  top: 60px;

  a {
    color: white !important;
    padding: 8px 0px;
    text-decoration: none;
    display: block;
    width: 130px !important;
    font-size: 12px;
    text-align: center;
  }

  a:hover {
    cursor: pointer;
    background-color: none;
  }
`;

const Clickable = styled.div`
  cursor: pointer;
`;

const sendButtonCss = css`
  margin-top: -70px;
`;

const copylinkbutton = css`
  border: 1px solid #ffffff4a;

  &:hover {
    background-color: #494f5ab3;
    border-color: #8c8f96bd;
  }
`;

const belowbutton = css`
  background: none;
  color: white;
  font-size: 30px;
`;

export interface PostInterface {
  post_id: number;
  author: string;
  author_displayname: string;
  author_profilehash: string;
  description: string;
  voteStatus: any;
  created_at: string;
  last_edited_at: any;
  imagehashes: [];
  videohashes: [];
  category_ids: [];
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  tip_count: number;
  video_count: any;
  username: string;
  __typename: string;
}

interface Props {
  post: PostInterface;
  me?: boolean;
  size?: 'default' | 'small';
  withFollowButton?: boolean;
  shouldHideFollowOnMobile?: boolean;
  wax?: number;
  eos?: number;
  liquidBalance?: number;
  upvoted?: Array<string>;
  isDetails: boolean;
  onCommentAdded?(text: string): void;
}

const PostCard: React.FC<Props> = ({
  post,
  me = false,
  size = 'default',
  withFollowButton = true,
  onCommentAdded,
  ...props
}) => {
  const [data, setData] = useState(post);
  const {
    author,
    author_displayname,
    username,
    created_at,
    description,
    imagehashes,
    videohashes,
    video_count,
    author_profilehash,
    post_id,
  } = data;

  const content = useMemo(() => {
    return { post_id, imagehashes, videohashes, video_count };
  }, [post_id, imagehashes, videohashes, video_count]);

  const router = useRouter();

  const copyLink = () => {
    const cookies = cookie.get();
    const author = cookies[KARMA_AUTHOR];
    const link = location.protocol + '//' + location.host + '/post/' + post_id + '/author/' + author;
    var textField = document.createElement('textarea');
    textField.innerText = link;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    setToogled(!toogled);
  };

  const formattedDateStrings = useFormatDistanceStrict(created_at).split(' ');
  const formattedDate = formattedDateStrings[0] + formattedDateStrings[1][0];
  const avatar = useS3Image(author_profilehash, 'thumbSmall');
  const { hash } = useSelector((state: RootState) => state.user.profile);
  const userAvatar = useS3Image(hash, 'thumbSmall');
  const [toogled, setToogled] = useState(false);
  useEffect(() => setData(post), [post]);

  const onSuccessAction = (action: string, value: number) => {
    switch (action) {
      case 'upVote':
        setData({ ...data, upvote_count: data.upvote_count + value, voteStatus: data.voteStatus + value });
        break;
      case 'comment':
        setData({ ...data, comment_count: data.comment_count + value });
        break;
      case 'tip':
        setData({ ...data, tip_count: data.tip_count + value });
        break;
      case 'boost':
        setData({ ...data, tip_count: data.tip_count + value });
        break;
      case 'playVideo':
        setData({ ...data, video_count: data.video_count + value });
        break;
    }
  };

  const cookies = cookie.get();
  const meUsername = cookies[KARMA_AUTHOR];
  const [focus, setFocus] = useState(false);
  
  return (
    <Container>
      <Row align="center" justify="space-between">
        <Row
          align="center"
          onClick={() => router.push('/profile/[username]/[tab]', `/profile/${author}/media`, { shallow: true })}
        >
          <Clickable>
            <Avatar src={avatar} alt={author_displayname} size="small" />
          </Clickable>
          <Space width={18} />

          <Clickable>
            <Text color="white" size={16} weight="900">
              {author_displayname}
            </Text>
            <Space height={5} />
            <Text css={usernameCSS}>
              @{username} - {formattedDate}
            </Text>
          </Clickable>
        </Row>
          {meUsername != undefined ? <Space width={38} /> : "" }
          {meUsername != undefined ? 
          <Row align="center" justify="center" css={sendButtonCss}>
            <BelowSection toogled={toogled}>
              <Dropdown>
                <button onClick={() => setToogled(!toogled)} css={belowbutton}>
                  ...
                </button>
                {toogled && <DropdownContent>
                  <a onClick={() => copyLink()} css={copylinkbutton}>Copy to link post</a>
                </DropdownContent>}
              </Dropdown>
            </BelowSection>
          </Row> : "" }
        {/* {!me && withFollowButton && <FollowButton following={false} shouldHideFollowOnMobile />}
        {meUsername === author && (focus === false ? <Button_one onClick={() => setFocus(true)} /> : <Button_two onClick={() => setFocus(false)}><img src={remove} css={backimgCSS} alt="Delete Post" />Delete Post</Button_two>)} */}
      </Row>
      <Space height={25} />
      <Caption>
        <FormattedText
          content={description}
          post_id={post_id}
          font={{ color: 'white', size: '19px', weight: 'normal' }}
        />
      </Caption>

      <PostContent
        isDetails={props.isDetails}
        content={content}
        size={size}
        onClick={() => {
          const media = useS3PostMedias(content, 'thumbBig');
          if (!props.isDetails && media[0].type != 'video')
            router.push('/post/[id]', `/post/${post_id}`, { shallow: true });
        }}
        onSuccessAction={onSuccessAction}
      />
      <PostActions
        postId={post_id}
        author={author}
        upvote_count={data.upvote_count}
        downvote_count={data.downvote_count}
        comments={data.comment_count}
        recycles={0}
        tips={data.tip_count}
        power={0}
        voteStatus={data.voteStatus}
        wax={props.wax}
        eos={props.eos}
        liquidBalance={props.liquidBalance}
        upvoted={props.upvoted}
        isDetails={props.isDetails}
        onSuccessAction={onSuccessAction}
      />
      <Space height={25} />
      <div>
        <CreateComment
          avatar={userAvatar}
          post_id={post_id}
          isDetailPage={props.isDetails}
          onSuccessAction={onSuccessAction}
          oncommandAddedAction={onCommentAdded}
        />
      </div>
    </Container>
  );
};

export default PostCard;
