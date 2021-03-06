import React from 'react';
import styled, { FlattenSimpleInterpolation, css } from 'styled-components';

const Container = styled.span<TextProps>`
  color: ${props => props.theme[props.color] || '#fff'};
  font-size: ${props => `${props.size}px` || '14px'};
  font-weight: ${props => props.weight || '500'};
  ${p =>
    p.lineHeight &&
    css`
      line-height: ${p.lineHeight};
    `}
  ${p =>
    p.cursor &&
    css`
      cursor: ${p.cursor};
    `}
`;

interface TextProps {
  color?: string;
  size?: number;
  weight?: string;
  css?: FlattenSimpleInterpolation;
  onClick?(): void;
  lineHeight?: string;
  cursor?: string;
}

const Text: React.FC<TextProps> = ({ children, ...props }) => {
  return <Container {...props}>{children}</Container>;
};

export default Text;
