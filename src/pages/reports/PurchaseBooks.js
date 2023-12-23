import React, { useState, useEffect } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';

moment.updateLocale('es-mx', { week: { dow: 1 }});

function PurchaseBooks() {
  const navigate = useNavigate();

  const [fetching, setFeching] = useState();

  useEffect(() => {

  }, []);

  return (
    <Wrapper xCenter yCenter>
      
    </Wrapper>
  );
}

export default PurchaseBooks;
