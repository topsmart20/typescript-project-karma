import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled, { FlattenSimpleInterpolation } from 'styled-components';

import Avatar from './Avatar';

const Image = styled.img<{ loaded: boolean; css?: FlattenSimpleInterpolation }>`
  display: ${p => (p.loaded ? 'inherit' : 'none')};
  ${p => p.css}
`;

const StyledAvatar = styled(Avatar)<{ loaded: boolean }>`
  display: ${p => (p.loaded ? 'inherit' : 'none')};
`;

interface ShimmerImageProps {
  src: string;
  alt: string;
  css?: FlattenSimpleInterpolation;
  height?: string | number;
  width?: string | number;
  avatar?: boolean;
  onClick?(): void;
  circle?: boolean;
  size?: 'default' | 'small' | 'big';
}

const ShimmerImage: React.FC<ShimmerImageProps> = ({ height, width, avatar, circle, size, ...props }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {avatar ? (
        <StyledAvatar {...props} onLoad={() => setLoaded(true)} loaded={loaded} size={size} />
      ) : (
        <Image {...props} height={height && height } width={width} onLoad={() => setLoaded(true)} loaded={loaded} />
      )}
      {!loaded && <Skeleton height={height || '100%'} width={width || '100%'} circle={circle} />}
    </>
  );
};

export default ShimmerImage;
