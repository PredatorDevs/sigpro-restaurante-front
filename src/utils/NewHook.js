import React, { useState, useEffect } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';

function NewHook() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();

  useEffect(() => {

  }, []);

  return (
    <Wrapper xCenter yCenter>
      
    </Wrapper>
  );
}

export default NewHook;
