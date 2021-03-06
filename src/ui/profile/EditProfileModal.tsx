import React from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';

import { updateProfileRequest } from '../../store/ducks/user';

import Title from '../common/Title';
import Row from '../common/Row';
import { ModalProps } from '../common/ModalWrapper';

import closeIcon from '../assets/close.svg';

import ProfileModal from './ProfileModal';

const CloseButton = styled.button`
  background: none;

  img {
    width: 30px;
    height: 30px;
  }
`;

interface Props extends ModalProps {
  profile: {
    username: string;
    displayname: string;
    author: string;
    hash: string;
    bio: string;
    url: string;
  } | null;
}

const EditProfileModal: React.FC<Props> = ({ profile, ...props }) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    enableReinitialize: false,
    initialValues: {
      displayname: profile ? profile.displayname || '' : '',
      username: profile ? '@' + profile.username || '' : '',
      bio: profile ? profile.bio || '' : '',
      hash: profile ? profile.hash || '' : '',
      url: profile ? profile.url || '' : '',
    },
    validationSchema: Yup.object().shape({
      displayname: Yup.string().required('Name is required'),
      username: Yup.string().required('Username is required'),
      bio: Yup.string(),
      hash: Yup.string().required('User Image is required'),
      url: Yup.string(),
    }),
    validateOnMount: true,
    onSubmit: values => {
      const oldProfile = {
        displayname: profile ? profile.displayname : '',
        username: profile ? profile.username : '',
        bio: profile ? profile.bio : '',
        hash: profile ? profile.hash : '',
        url: profile ? profile.url : '',
      };

      const newProfile = {
        hash: values.hash || profile.hash,
        displayname: values.displayname || profile.displayname,
        username: values.username ? values.username.slice(1, values.username.length) : profile.username,
        bio: values.bio || profile.bio,
        url: values.url ? values.url : profile.url,
      };

      dispatch(updateProfileRequest(newProfile, oldProfile, props.close));
    },
  });

  const CustomHeader: React.FC = () => {
    return (
      <Row align="center" justify="space-between">
        <Title bordered={false} size="small">
          Edit Profile
        </Title>
        <CloseButton type="button" onClick={() => props.close()}>
          <img src={closeIcon} alt="close" />
        </CloseButton>
      </Row>
    );
  };

  return <ProfileModal {...props} formik={formik} customHeader={CustomHeader} author={profile.author} />;
};

export default EditProfileModal;
