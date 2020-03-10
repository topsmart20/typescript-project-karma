import React from 'react';
import styled from 'styled-components';

import karmaBg from '../assets/karma-bg.png';

import Logo from '../common/Logo';

import JoinBox from './JoinBox';

const Bg = styled.img`
  height: 1000px;
  width: 700px;

  position: absolute;
  top: 0;
  left: 0;

  @media (max-width: 1200px) {
    width: 100%;
    height: auto;
  }

  @media (max-width: 650px) {
    display: none;
  }
`;

const Container = styled.div`
  width: 50%;
  padding: 0 40px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  position: relative;
  overflow: hidden;

  @media (max-width: 1200px) {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 650px) {
    padding: 0;
  }
`;

const StyledLogo = styled(Logo)`
  position: absolute;
  top: 20px;
  right: 40px;

  img {
    width: 80px;
    height: 80px;
  }

  strong {
    font-size: 40px;
  }

  @media (max-width: 650px) {
    display: none;
  }
`;

const Sign: React.FC = () => {
  return (
    <Container>
      <Bg src={karmaBg} alt="Karma" />
      <StyledLogo />
      <JoinBox />
    </Container>
  );
};

export default Sign;