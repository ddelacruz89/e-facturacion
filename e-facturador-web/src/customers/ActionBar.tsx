
import React, { ReactNode } from 'react';

interface MyComponentProps {
    title: string
    children?: ReactNode[]; // ReactNode represents any valid JSX
}

const ActionBar: React.FC<MyComponentProps> = ({ children, title }) => {
    return (
        <nav className='action-bar'>
            <ul >
                <li>Logo</li>
                <li>Seguridad</li>
                <li> &gt; </li>
                <li>{title}</li>
            </ul>
            <ul id="rigth">
                {children?.map((child, i) => <li key={i}>{child}</li>)}
            </ul>



        </nav>
    );
};

export default ActionBar;
