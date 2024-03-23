import React from 'react'
import { Button ,Result } from 'antd';

function PageNotFound() {
  return (
    <div>
      <Result status="404" title="404" subTitle="404 Página Não Encontrada" extra={<Button type="primary" href='/'>Back Home</Button>} />
    </div>
  )
}

export default PageNotFound