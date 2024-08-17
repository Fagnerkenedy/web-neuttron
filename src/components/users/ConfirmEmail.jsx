import { Button, Result } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import userApiURI from '../../Utility/userApiURI'
import Loading from '../utils/Loading';

function ConfirmedEmail() {
  const { uuid } = useParams();
  const [ loading, setLoading ] = useState(false);
  const [ msgRetorno, setMsgRetorno ] = useState("");

  useEffect(() => {
    const data = { uuid: uuid };
    setLoading(true);
    userApiURI.userConfirmation(data).then((response) => {
      if(response.status === 200 && response.data.success === true){
        setMsgRetorno(<Result status="success" title="E-mail confirmado com sucesso!" subTitle="A plataforma te espera! Seja bem vindo(a)!" extra={<Link to='/login'><Button type="primary">Login</Button></Link>} />)
        setLoading(false)
      }else if(response.status === 200 && response.data.success === false && response.data.message === 'user_already_confirmed'){
        setMsgRetorno(<Result status="error" title="Erro ao confirmar o Cadastro!" subTitle="Seu cadastro já foi confirmado anteriormente!" extra={<Link to='/login'><Button type="primary">Login</Button></Link>} />)
        setLoading(false)
      }else if(response.status === 200 && response.data.success === false && response.data.message === 'user_not_found'){
        setMsgRetorno(<Result status="error" title="Houve um erro ao confirmar o cadastro!" subTitle="O usuário não foi encontrado no sistema!" extra={<Link to='/cadastro'><Button type="primary">Cadastre-se</Button></Link>} />)
        setLoading(false)
      } else {
        setMsgRetorno(<Result status="error" title="Houve um erro ao confirmar o cadastro!" subTitle="Entre em contato com o Suporte!" extra={<Link to='/login'><Button type="primary">Login</Button></Link>} />)
        setLoading(false)
      }
    })
    
  }, [uuid])

  if(loading){
    return (<Loading />)
  }

  return (
    msgRetorno
  )
};

export default ConfirmedEmail;