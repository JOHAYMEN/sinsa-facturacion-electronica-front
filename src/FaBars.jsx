import React, { forwardRef } from 'react';
import { FaBars as OriginalFaBars } from 'react-icons/fa';

const FaBars = forwardRef((props, ref) => {
    return <OriginalFaBars {...props} ref={ref} />;
});

export default FaBars;
