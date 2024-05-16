import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Input, Alert } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, KeyOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Wrapper } from '../styled-components/Wrapper';
import { authenticateUser } from '../services/AuthServices';
import { customNot } from '../utils/Notifications';
import { getUserIsLoggedIn } from '../utils/LocalData';

import bg from '../img/backgrounds/landscape.jpg';
import '../styles/loginStyle.css';

function Login() {
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userNameInput = document.getElementById('g-login-username-input');
    if (userNameInput !== null) userNameInput.focus();
  }, []);

  function loginAction() {
    setLoadingBtn(true);
    authenticateUser(username, password)
      .then(
        (response) => {
          localStorage.setItem('userData', JSON.stringify(response.data.userdata));
          localStorage.setItem('userToken', response.data.token);
          localStorage.setItem('isLoggedIn', true);

          axios.defaults.headers.common.authorization = response.data.token;
          axios.defaults.headers.common.idtoauth = response.data.userdata.id;

          setLoadingBtn(false);
          navigate('/main');
        }
      )
      .catch((error) => {
        customNot('error', 'Error de autenticación', 'Revise credenciales o conexión a la red');
        setLoadingBtn(false);
        document.getElementById('g-login-password-input').focus();
      });
  }

  return (
    getUserIsLoggedIn() ? <Navigate to="/main" replace /> :
      <Wrapper xCenter yCenter heightFitScreen className="loginContainer">
        <div className="containerLogin">
          <Row gutter={0}>
            <Col span={12} className="spaceImg">
            </Col>
            <Col span={12} className="loginForm">
              <p className='title'>Asados El Flaco</p>
              <p className='label'>Usuario:</p>
              <Input
                addonBefore={<UserOutlined />}
                placeholder="Juan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id={'g-login-username-input'}
                onKeyUp={
                  (e) => {
                    if (e.key === 'Enter')
                      document.getElementById('g-login-password-input').focus();
                  }
                }
              />
              <p className='label'>Contraseña:</p>
              <Input.Password
                addonBefore={<KeyOutlined />}
                placeholder="****"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={
                  (e) => {
                    if (e.key === 'Enter')
                      loginAction()
                  }
                }
                id={'g-login-password-input'}
              />
              <Button
                loading={loadingBtn}
                style={{ width: '100%', marginTop: 40, backgroundColor: '#4B81E1' }}
                onClick={() => loginAction()}
                type={'primary'}
              >
                Acceder
              </Button>
              <p className='copyright'>SigProCOM 2023</p>
            </Col>
          </Row>
        </div>
      </Wrapper>
  );
}

export default Login;