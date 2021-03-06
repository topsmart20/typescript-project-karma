import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  background: rgba(32, 37, 46, 0.6);
  margin-top: 20px;
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0px 3px 20px #000000cc;

  display: flex;
  justify-content: space-between;
  align-items: center;

  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }

  &:nth-child(3) {
    margin-top: 30px;
  }

  strong {
    color: #fff;
    font-size: 18px;
    font-weight: 500;
  }

  span {
    color: #7b7c83;
    font-size: 16px;
    margin-top: 5px;
  }

  img {
    width: 81px;
    height: 81px;
    margin-right: 20px;
  }

  section {
    display: flex;
    align-items: center;
  }

  div,
  aside {
    display: flex;
    flex-direction: column;
  }

  div {
    align-items: flex-start;
  }

  aside {
    align-items: flex-end;
  }

  @media (max-width: 550px) {
    img {
      width: 65px;
      height: 65px;
      margin-right: 12px;
    }

    strong {
      font-size: 16px;
    }

    span {
      font-size: 14px;
    }
  }
`;

interface Props {
  icon: string;
  name: string;
  unitValue: string | number;
  totalValue: string | number;
  value: string | number;
}

const Token: React.FC<Props> = ({ icon, name, unitValue, totalValue, value }) => {
  return (
    <Container>
      <section>
        <img src={icon} alt={name} />

        <div>
          <strong>{name}</strong>
          <span>${unitValue}</span>
        </div>
      </section>

      <aside>
        <strong>${totalValue}</strong>
        <span>{value + ' ' + name} </span>
      </aside>
    </Container>
  );
};

export default Token;
