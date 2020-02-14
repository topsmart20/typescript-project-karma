import React from 'react';
import styled from 'styled-components';

import ProfileImage from '../ProfileImage';

const Container = styled.div`
  display: flex;
  align-items: center;

  > section {
    display: flex;
    flex-direction: row;

    p {
      margin-left: 60px;
      color: #fff;

      display: flex;
      flex-direction: column;
      align-items: center;

      strong {
        font-weight: 600;
        font-size: 25px;
      }

      span {
        font-size: 18px;
      }
    }
  }
`;

interface Props {
  avatar: string;
  posts: string | number;
  followers: string | number;
  following: string | number;
}

const ProfileHeader: React.FC<Props> = ({ avatar, posts, followers, following, ...props }) => {
  return (
    <Container {...props}>
      <ProfileImage size="big" path={avatar} online={false} alt="avatar" />

      <section>
        <p>
          <strong>{posts}</strong>
          <span>Posts</span>
        </p>

        <p>
          <strong>{followers}</strong>
          <span>Followers</span>
        </p>

        <p>
          <strong>{following}</strong>
          <span>Following</span>
        </p>
      </section>
    </Container>
  );
};

export default ProfileHeader;